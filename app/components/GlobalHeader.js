"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Simple global header: shows SKINSTRIC logo (always navigates home) and back button on all pages except landing '/'
// Light mode styling can be triggered by passing light prop (used on camera capture fullscreen)
export default function GlobalHeader() {
  // Keep the header consistent across all pages and preserve original styling
  // Light variant on camera pages to overlay on top of live video
  const pathname = usePathname();
  const isCameraSurface = pathname?.startsWith('/camera');
  const isAnalysisSurface = pathname?.startsWith('/result');
  const stageLabel = (() => {
    if (!pathname || pathname === '/') return 'INTRO';
    if (pathname.startsWith('/camera') || pathname.startsWith('/intro')) return 'INTRO';
    if (pathname.startsWith('/result')) return 'ANALYSIS';
    if (pathname.startsWith('/summary')) return 'SUMMARY';
    return 'INTRO';
  })();
  return (
    <header className={`header ${isCameraSurface ? 'header--transparent header--light' : ''} ${isAnalysisSurface ? 'header--analysis' : ''}`}>
      <div className="header-left">
        <Link
          href="/"
          aria-label="Go to homepage"
          className={`logo inline-block focus:outline-none ${isCameraSurface ? 'focus-visible:ring-white/40' : 'focus-visible:ring-black/40'}`}
        >
          SKINSTRIC
        </Link>
        <div className="intro-bracket-container">
          <span className="bracket-left" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>[</span>
          <span className="intro-text" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>{stageLabel}</span>
          <span className="bracket-right" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>] </span>
        </div>
      </div>
      {/* Hide on camera capture surfaces to match spec */}
      {!isCameraSurface && <button className="enter-code-btn">ENTER CODE</button>}
    </header>
  );
}
