"use client";
import { useRequireDemographics } from '../components/guards';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResultPage() {
  useRequireDemographics();
  const router = useRouter();
  const [hoverRing, setHoverRing] = useState(null); // 0=inner, 1=middle, 2=outer, null=hidden
  // Analysis layout canvas with exact-positioned subhead per spec
  return (
    <div className="viewport-frame">
      <div className="ar-2-1">
        <div className="analysis-canvas" aria-label="Results layout">
      <div className="analysis-subhead">A. I. Analysis</div>
  <div className="analysis-caption">A. I. has estimated the following. Fix&nbsp;estimated information if needed.</div>
      {/* Future: dotted rings and diamond cluster will be placed here */}
      {/* Dotted diamond rings background (reveals on tile hover) */}
      <svg
        className={`analysis-rombuses${hoverRing !== null ? ' is-active' : ''}`}
        data-ring={hoverRing !== null ? hoverRing : undefined}
        width="100%"
        height="100%"
        viewBox="0 0 762 762"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Smallest: 602x602 at inset 80px */}
        <path className="ring-small" d="M381 80L682 381L381 682L80 381L381 80Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
        {/* Medium: 682x682 at inset 40px */}
        <path className="ring-medium" d="M381 40L722 381L381 722L40 381L381 40Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
        {/* Largest: 762x762 at inset 0px */}
        <path className="ring-large" d="M381 0L762 381L381 762L0 381L381 0Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
      </svg>
  {/* Background group diamond (decorative) */}
  <div className="analysis-diamond--group" aria-hidden="true" />
      {/* Primary top diamond (Demographics) */}
      <div
        className="analysis-diamond analysis-diamond--primary analysis-diamond--top analysis-diamond--clickable"
        role="button"
        aria-label="Open Demographics"
        tabIndex={0}
        onClick={() => router.push('/summary')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/summary')}
        onFocus={() => setHoverRing(0)}
        onBlur={() => setHoverRing(null)}
        onMouseEnter={() => setHoverRing(0)}
        onMouseLeave={() => setHoverRing(null)}
      >
        <div className="analysis-diamond__inner">
          <div className="analysis-diamond__label">Demographics</div>
        </div>
      </div>

      {/* Left diamond */}
      <div
        className="analysis-diamond analysis-diamond--secondary analysis-diamond--left"
        onMouseEnter={() => setHoverRing(1)}
        onMouseLeave={() => setHoverRing(null)}
      >
        <div className="analysis-diamond__inner">
          <div className="analysis-diamond__label">Skin Type Details</div>
        </div>
      </div>

      {/* Right diamond */}
      <div
        className="analysis-diamond analysis-diamond--secondary analysis-diamond--right"
        onMouseEnter={() => setHoverRing(1)}
        onMouseLeave={() => setHoverRing(null)}
      >
        <div className="analysis-diamond__inner">
          <div className="analysis-diamond__label">Cosmetic concerns</div>
        </div>
      </div>

      {/* Bottom diamond */}
      <div
        className="analysis-diamond analysis-diamond--secondary analysis-diamond--bottom"
        onMouseEnter={() => setHoverRing(2)}
        onMouseLeave={() => setHoverRing(null)}
      >
        <div className="analysis-diamond__inner">
          <div className="analysis-diamond__label">weather</div>
        </div>
      </div>

      {/* Floating navigation controls */}
      <div
        className="back-floating"
        role="button"
        aria-label="Go back"
        tabIndex={0}
        onClick={() => router.back()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.back()}
      >
        <div className="diamond-button">
          <div className="diamond">
            <span className="diamond-arrow left" />
          </div>
        </div>
        <span>Back</span>
      </div>

      <div
        className="proceed-floating"
        role="button"
        aria-label="Get Summary"
        tabIndex={0}
        onClick={() => router.push('/summary')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && router.push('/summary')}
      >
        <span>GET SUMMARY</span>
        <div className="diamond-button">
          <div className="diamond">
            <span className="diamond-arrow right" />
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
