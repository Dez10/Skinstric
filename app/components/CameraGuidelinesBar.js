"use client";
import React from 'react';

// Simple component for the guideline bar under the graphic
// Uses semantic grouping and accessible text instead of raw SVG text glyphs.
export default function CameraGuidelinesBar({ className = "" }) {
  const items = [
    'Neutral Expression',
    'Frontal Pose',
    'Adequate Lighting'
  ];
  return (
    <div className={"flex flex-col items-center gap-3 " + className}>
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#1A1B1C] text-center font-normal">
        To get better results make sure to have
      </p>
      <ul className="flex flex-row items-center justify-center gap-6 text-[#1A1B1C]">
        {items.map(label => (
          <li key={label} className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase font-normal whitespace-nowrap">
            <span className="w-2 h-2 border border-[#1A1B1C] rotate-45 inline-block" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
