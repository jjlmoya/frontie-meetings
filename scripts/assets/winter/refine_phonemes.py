#!/usr/bin/env python3
"""Refine lyric pronunciations with phone probabilities from the isolated voice."""

from collections import Counter
import json
from pathlib import Path

import numpy as np

# Alternate labels account for short/long vowels and English pronunciation.
IPA = {
    "AA": "ɑ ɑː a ɐ", "AE": "æ a", "AH": "ʌ ə ɐ", "AO": "ɔ ɔː ɑ",
    "AW": "aʊ ɑʊ", "AY": "aɪ ɑɪ", "B": "b", "CH": "tʃ", "D": "d ɾ",
    "DH": "ð", "EH": "ɛ e ɛː", "ER": "ɚ ɝ ɜː əɹ", "EY": "eɪ e eː",
    "F": "f", "G": "ɡ g", "HH": "h", "IH": "ɪ ᵻ", "IY": "i iː ɪ",
    "JH": "dʒ", "K": "k", "L": "l ɫ", "M": "m mʲ", "N": "n nʲ",
    "NG": "ŋ", "OW": "oʊ o oː", "OY": "ɔɪ oɪ", "P": "p", "R": "ɹ r",
    "S": "s", "SH": "ʃ", "T": "t ɾ", "TH": "θ", "UH": "ʊ", "UW": "u uː",
    "V": "v", "W": "w", "Y": "j", "Z": "z", "ZH": "ʒ",
}
STEP = .02
CENTER = .0125


class AcousticAlignment:
    def __init__(self, emissions: Path, vocabulary: Path):
        logits = np.load(emissions)
        logits -= np.max(logits, axis=1, keepdims=True)
        probability = np.exp(logits)
        self.probability = probability / np.sum(probability, axis=1, keepdims=True)
        labels = json.loads(vocabulary.read_text())
        self.phones = {sound: [labels[label] for label in aliases.split() if label in labels]
                       for sound, aliases in IPA.items()}
        self.refined = Counter()

    def boundaries(self, phones, weights, begin, end):
        """Match an ordered set of phone peaks within a recognized word."""
        start = max(0, int((begin - CENTER) / STEP))
        stop = min(len(self.probability), int((end - CENTER) / STEP) + 1)
        frames = np.arange(start, stop) * STEP + CENTER
        total = sum(weights)
        centers = begin + (np.cumsum(weights) - np.asarray(weights) / 2) * (end - begin) / total
        prior = begin + np.cumsum(weights)[:-1] * (end - begin) / total
        if len(phones) < 2 or len(frames) < len(phones) + 1:
            return prior
        likelihood = []
        for phone in phones:
            indices = self.phones[phone]
            if not indices:
                return prior
            likelihood.append(self.probability[start:stop, indices].sum(axis=1))
        likelihood = np.array(likelihood)
        # Encourage evidence near the expected order. Blank regions in sung
        # notes are common, so look for local peaks rather than frame labels.
        width = max(.065, (end - begin) * .24)
        values = np.log(np.maximum(likelihood, .0001)) - .5 * ((frames - centers[:, None]) / width) ** 2
        # Reverse traversal of a monotonic best path with at least one frame
        # between peaks lets long held vowels keep their full duration.
        best = np.full_like(values, -np.inf)
        links = np.zeros(values.shape, dtype=np.int32)
        best[0] = values[0]
        for phone in range(1, len(phones)):
            leader = 0
            for frame in range(1, len(frames)):
                if best[phone-1, frame-1] > best[phone-1, leader]:
                    leader = frame-1
                best[phone, frame] = values[phone, frame] + best[phone-1, leader]
                links[phone, frame] = leader
        index = int(np.argmax(best[-1]))
        peaks = [index]
        for phone in range(len(phones)-1, 0, -1):
            index = links[phone, index]
            peaks.append(index)
        peaks.reverse()
        result = []
        for i, (left, right) in enumerate(zip(peaks, peaks[1:])):
            support = likelihood[i+1, right]
            estimate = prior[i]
            if support >= .12:
                # A CTC spike usually occurs late in an articulated sound.
                # Lead into the next vowel and close before a stop release.
                detected = frames[right] - min(.054, (frames[right] - frames[left]) * .28)
                if phones[i+1] in {"P", "B", "M"}:
                    detected = frames[right] - .040
                limit = min(.22, (end - begin) * .34)
                movement = max(-limit, min(limit, detected - estimate))
                estimate += movement * min(.88, .42 + support * .55)
                self.refined[phones[i+1]] += 1
            low = begin if not result else result[-1]
            result.append(min(end, max(low, estimate)))
        return result
