"use client";
import React from 'react';

// Re-usable footer guideline line used across camera pages.
export default function GlobalFooterGuidelines({ light = false }) {
  const textColor = light ? 'text-white/80' : 'text-[#1A1B1C]/80';
  const bulletColor = light ? 'diamond-bullet--light' : 'diamond-bullet--dark';
  return (
    <div className="w-full flex justify-center pointer-events-none select-none mt-4">
      <div className={`guidelines-wrap ${textColor}`}>
        <span className="guidelines-leadin">TO GET BETTER RESULTS MAKE SURE TO HAVE</span>
        <p className="guidelines-line"> 
          <span className="guidelines-item"><span className={`diamond-bullet ${bulletColor}`} aria-hidden="true" /> Neutral Expression</span>
          <span className="guidelines-item"><span className={`diamond-bullet ${bulletColor}`} aria-hidden="true" /> Frontal Pose</span>
          <span className="guidelines-item"><span className={`diamond-bullet ${bulletColor}`} aria-hidden="true" /> Adequate Lighting</span>
        </p>
      </div>
    </div>
  );
}
