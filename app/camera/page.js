"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireIdentity } from '../components/guards';
import CameraIntroGraphic from '../components/CameraIntroGraphic';
import BackFloating from '../components/BackFloating';

// Simple intro screen before actual capture (now at /camera/capture)
export default function CameraIntroPage() {
  useRequireIdentity();
  const router = useRouter();

  // Auto-redirect after short delay to capture page
  const DELAY = 3000; // 3 seconds
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (ts) => {
      const ratio = Math.min(1, (ts - start) / DELAY);
      setProgress(ratio);
      if (ratio < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    const timeout = setTimeout(() => router.push('/camera/capture'), DELAY);
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [router]);

  return (
  <div className="flex flex-col items-center text-center px-4 sm:px-6 py-14 sm:py-16 gap-10 sm:gap-12">
      <CameraIntroGraphic className="w-full max-w-[740px] aspect-square" />
      <div className="mt-[-40px]" aria-label="To get better results make sure to have: Neutral expression, Frontal pose, Adequate lighting">
        <img
          src="/images/ui-elements/Group 39763.svg"
          alt="Guidelines: neutral expression, frontal pose, adequate lighting"
          className="mx-auto w-[492px] max-w-full select-none"
          draggable="false"
        />
      </div>
      {/* Live region for screen readers to announce transition */}
      <div className="sr-only" role="status" aria-live="polite">
        Setting up camera, redirecting to capture.
      </div>
      {/* Loading bar */}
      <div className="w-full max-w-md h-1 bg-neutral-200 overflow-hidden rounded mt-4">
        <div className="h-full bg-black transition-[width] duration-75" style={{ width: `${Math.round(progress*100)}%` }} />
      </div>
      <BackFloating to="/select" />
    </div>
  );
}
