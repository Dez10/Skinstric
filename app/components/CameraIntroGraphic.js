"use client";
import React from 'react';

/**
 * CameraIntroGraphic
 * Renders the provided SVG (camera + three dashed rotated diamonds) responsively.
 * Props:
 *  - size (number|string): bounding box size (defaults to 740 or 100%)
 *  - className: extra utility classes
 *  - showStatus/statusText: optional status message beneath camera icon inside SVG
 * Tailwind classes animate-spin-slow/ slower/ slowest assumed present; if not, define in globals.
 */
export default function CameraIntroGraphic({ size = undefined, className = "", showStatus = true, statusText = 'SETTING UP CAMERA...' }) {
  // Let CSS control sizing by default; only set explicit dimensions if a size is provided
  const style = { maxWidth: '100%', maxHeight: '100%' };
  if (size != null) {
    const dim = typeof size === 'number' ? `${size}px` : size;
    style.width = dim;
    style.height = dim;
  }
  return (
    <div
      className={"relative " + className}
      style={style}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 740 740"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Rotating diamond frames */}
        <g className="animate-spin-slowest will-change-transform" style={{ transformOrigin: '370px 370px' }}>
          <path opacity="0.3" d="M291.832 78.2752L661.724 291.833L448.167 661.725L78.2748 448.167L291.832 78.2752Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
        </g>
        <g className="animate-spin-slower will-change-transform" style={{ transformOrigin: '370px 370px' }}>
          <path opacity="0.6" d="M370 121L619 370L370 619L121 370L370 121Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
        </g>
        <g className="animate-spin-slow will-change-transform" style={{ transformOrigin: '370px 370px' }}>
          <path d="M422.434 174.312L565.687 422.434L317.565 565.687L174.312 317.565L422.434 174.312Z" stroke="#A0A4AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 8" />
        </g>

        {/* Camera icon (kept static above rotating frames) */}
        <circle cx="370" cy="369.999" r="64.6429" stroke="#1A1B1C" />
        <circle cx="370" cy="370" r="57" fill="#1A1B1C" />
        <path d="M406.51 333.578C397.174 324.219 384.263 318.428 369.999 318.428C366.698 318.428 363.47 318.738 360.341 319.331C365.678 328.159 385.176 359.108 388.932 364.613C389.662 365.683 390.958 363.558 398.81 348.421L406.51 333.578Z" fill="#FCFCFC" />
        <path d="M322.039 351.004C328.178 335.516 341.603 323.709 358.086 319.811C360.038 322.738 363.765 328.521 367.838 334.961L378.188 351.325H348.636C334.375 351.325 326.041 351.232 322.039 351.004Z" fill="#FCFCFC" />
        <path d="M329.618 402.08C322.613 393.274 318.428 382.126 318.428 370C318.428 364.189 319.389 358.603 321.16 353.392H337.773C357.204 353.392 357.646 353.422 356.952 354.721C355.576 357.297 335.155 392.646 329.618 402.08Z" fill="#FCFCFC" />
        <path d="M380.018 420.599C376.777 421.237 373.427 421.571 369.999 421.571C354.566 421.571 340.716 414.792 331.265 404.049C333.307 399.512 338.626 390.041 347.838 374.483C348.704 373.019 349.582 371.99 349.788 372.197C349.995 372.403 357.262 383.992 365.939 397.95L380.018 420.599Z" fill="#FCFCFC" />
        <path d="M418.649 387.154C412.885 403.499 399.117 416.069 382.052 420.155C377.351 412.906 361.742 387.834 361.742 387.446C361.742 387.285 375.231 387.154 391.718 387.154H418.649Z" fill="#FCFCFC" />
        <path d="M407.889 335.014C416.382 344.207 421.571 356.497 421.571 370C421.571 375.502 420.709 380.803 419.113 385.776H401.96C390.814 385.776 381.695 385.607 381.695 385.401C381.695 384.976 404.016 342.076 407.889 335.014Z" fill="#FCFCFC" />

        {showStatus && (
          <text
            x="370"
            y="455" /* moved slightly upward */
            textAnchor="middle"
            fontSize="13"
            fontFamily="inherit"
            letterSpacing="2"
            fill="#1A1B1C"
            style={{ textTransform: 'uppercase' }}
          >
            {statusText}
          </text>
        )}
      </svg>
    </div>
  );
}
