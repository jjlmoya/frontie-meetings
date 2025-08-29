'use client';

import Image from 'next/image';

export const WatermarkOverlay = () => {
  return (
    <div className="fixed bottom-8 right-8 z-40 pointer-events-none">
      <div className="bg-gradient-to-br from-black/50 to-black/30 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10">
        <Image
          src="/favicon.png"
          alt="FRONT-LINE"
          width={96}
          height={96}
          className="opacity-95 drop-shadow-xl"
          priority
        />
      </div>
    </div>
  );
};