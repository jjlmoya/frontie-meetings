#!/usr/bin/env python3
"""Build Frontie's mouth cues from timestamped vocal words and a pronunciation dictionary.

Pass a Whisper JSON with word timestamps. Lyric text remains in winterLyrics.ts.
Use cmudict in the offline authoring environment; the browser needs only the JSON.
"""

import argparse
from difflib import SequenceMatcher
import json
from pathlib import Path
import re
from importlib import import_module

import cmudict

ROOT = Path(__file__).resolve().parents[3]
LYRICS = ROOT / "src/data/winterLyrics.ts"
OUTPUT = ROOT / "public/assets/winter/articulation.json"

PRONUNCIATIONS = {
    "frontie": "F R AH1 N T IY0",
    "front-line": "F R AH1 N T L AY1 N",
    "m-f-e": "EH1 M EH1 F IY1",
    "mfe": "EH1 M EH1 F IY1",
}
CLOSED = {"M", "B", "P"}
ROUNDED = {"W", "UW", "UH", "OW", "OY", "AO", "R"}
SPREAD = {"IY", "IH", "EY", "S", "Z", "SH", "CH", "JH", "F", "V"}
OPEN = {"AA", "AE", "AH", "AW", "AY", "EH", "ER"}
WORD_PATTERN = re.compile(r"[A-Za-z]+(?:[-'][A-Za-z]+)*")
MATCH_MIN = .76

# The transcription sometimes spells these recurring names phonetically.
ALIASES = {"fronttea": "frontie", "frontsea": "frontie", "frontt": "frontie",
           "fancy": "frontie", "mfv": "mfe", "amity": "mfe",
           "eyes": "ice", "door": "dark", "amber": "ember",
           "on": "one", "stern": "stubborn", "marks": "mocks"}
# Refine the windows where sung syllables were split into several unrelated
# tokens. Each override was checked against the alternate decode and envelope.
ANCHORS = {
    5: {"night": (38.24, 40.44)},
    8: {"through": (46.22, 46.39), "night": (48.68, 49.22)},
    9: {"we": (49.35, 49.47), "keep": (49.47, 49.76),
        "stubborn": (50.14, 52.06), "alive": (53.65, 56.0)},
    11: {"mfe": (59.96, 60.59), "burns": (60.59, 60.88)},
    15: {"the": (80.84, 81.0), "passage": (81.0, 81.52)},
    19: {"night": (89.46, 91.82)},
    25: {"stubborn": (112.02, 113.82), "alive": (116.64, 118.19)},
    # The second chorus matches the first lead phrase at +62.01 s.
    29: {"and": (127.37, 127.63), "the": (127.63, 127.83)},
    35: {"thaw": (153.02, 153.58), "to": (153.58, 154.18)},
}


def spelling(word):
    return re.sub(r"[^a-z]", "", word.lower().replace("’", "'"))


def word_times(lyrics, heard):
    """Yield recognized word anchors in order, including duplicate choruses."""
    candidates = [word for segment in heard["segments"] for word in segment.get("words", [])]
    for line, (start, end, text) in enumerate(lyrics):
        words = WORD_PATTERN.findall(text)
        local = [word for word in candidates if start - 1.1 <= word["start"] <= end + .35]
        joined = []
        for word in local:
            if joined and spelling(joined[-1]["word"]) == "front" and spelling(word["word"]) in {"tea", "sea", "t"}:
                joined[-1] = {**joined[-1], "word": "frontie", "end": word["end"]}
            else:
                joined.append(word)
        local = joined
        targets = [spelling(word) for word in words]
        recognized = [spelling(word["word"]) for word in local]
        recognized = [ALIASES.get(word, word) if ALIASES.get(word) in targets and word not in targets else word
                      for word in recognized]
        matcher = SequenceMatcher(None, targets, recognized, autojunk=False)
        labels = {}
        for tag, left, stop, first, last in matcher.get_opcodes():
            if tag == "equal":
                labels.update(zip(range(left, stop), local[first:last]))
            elif tag == "replace" and stop - left == last - first:
                for index, guess in zip(range(left, stop), local[first:last]):
                    similarity = SequenceMatcher(None, spelling(words[index]), spelling(guess["word"])).ratio()
                    if similarity >= MATCH_MIN:
                        labels[index] = guess
        for word, (begin, finish) in ANCHORS.get(line, {}).items():
            index = targets.index(word)
            labels[index] = {"word": words[index], "start": begin, "end": finish}
        yield words, labels


def articulation(word, start, end, dictionary, acoustics):
    special = PRONUNCIATIONS.get(word.lower())
    alternatives = dictionary.get(word.lower())
    phones = special.split() if special else alternatives[0] if alternatives else []
    if not phones or end - start < .055:
        return []
    shapes = []
    sounds = []
    weights = []
    for phone in phones:
        sound = phone.rstrip("012")
        shape, weight = "soft", .75
        if sound in CLOSED:
            shape, weight = "closed", .55
        elif sound in ROUNDED:
            shape, weight = "round", 1.8 if phone[-1].isdigit() else .7
        elif sound in SPREAD:
            shape, weight = "spread", 1.65 if phone[-1].isdigit() else .75
        elif sound in OPEN:
            shape, weight = "belt", 2.15 if phone.endswith(("1", "2")) else 1.55
        shapes.append(shape)
        sounds.append(sound)
        weights.append(weight)
    if acoustics and all(sound in acoustics.phones for sound in sounds):
        boundaries = list(acoustics.boundaries(sounds, weights, start, end))
    else:
        total = sum(weights)
        boundaries = [start + sum(weights[:i]) * (end - start) / total
                      for i in range(1, len(weights))]
    cues = []
    starts = [start, *boundaries]
    for shape, cursor, boundary in zip(shapes, starts, [*boundaries, end]):
        if cues and cues[-1][2] == shape:
            cues[-1][1] = round(boundary, 3)
        elif boundary > cursor:
            cues.append([round(cursor, 3), round(boundary, 3), shape])
    return [cue for cue in cues if cue[1] - cue[0] >= .035]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("transcript", type=Path, nargs="?", default=Path(__file__).with_name("vocal-words.json"))
    parser.add_argument("--emissions", type=Path)
    parser.add_argument("--vocabulary", type=Path)
    args = parser.parse_args()
    if bool(args.emissions) != bool(args.vocabulary):
        parser.error("--emissions and --vocabulary must be passed together")
    acoustics = (import_module("refine_phonemes").AcousticAlignment(args.emissions, args.vocabulary)
                 if args.emissions else None)
    heard = json.loads(args.transcript.read_text())
    lyrics = [(float(a), float(b), text) for a, b, text in re.findall(
        r"start: ([\d.]+), end: ([\d.]+), text: '([^']+)'", LYRICS.read_text()
    )]
    dictionary = cmudict.dict()
    lines = []
    poses = []
    for (start, end, _), (words, matches) in zip(lyrics, word_times(lyrics, heard)):
        stamps = [None] * len(words)
        for index, word in matches.items():
            if word.get("probability", 1) < .24:
                continue
            begin = max(start, word["start"])
            finish = min(end, word["end"])
            if finish - begin < .045:
                continue
            stamps[index] = [round(begin, 3), round(finish, 3)]
        for index in range(len(stamps) - 1):
            if stamps[index] and stamps[index + 1]:
                stamps[index][1] = min(stamps[index][1], stamps[index + 1][0])
                if stamps[index][1] - stamps[index][0] < .035:
                    stamps[index] = None
        for word, stamp in zip(words, stamps):
            if stamp:
                poses.extend(articulation(word, *stamp, dictionary, acoustics))
        lines.append(stamps)
    poses.sort(key=lambda cue: cue[0])
    OUTPUT.write_text(json.dumps({"words": lines, "poses": poses}, separators=(",", ":")) + "\n")
    aligned = sum(sum(word is not None for word in line) for line in lines)
    if acoustics:
        print(f"{sum(acoustics.refined.values())} phone boundaries refined with vocal audio")
    print(f"{aligned}/{sum(map(len, lines))} word anchors, {len(poses)} mouth cues")


if __name__ == "__main__":
    main()
