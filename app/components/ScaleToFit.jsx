"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * ScaleToFit
 * Wraps children in a fixed-size stage (designWidth x designHeight) and scales the stage
 * down to fit the current viewport, preserving aspect ratio. It centers the stage with
 * letterboxing when needed. No upscaling by default.
 */
export default function ScaleToFit({
  children,
  designWidth = 1920,
  designHeight = 960,
  allowUpscale = false,
  className = "",
}) {
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scale = useMemo(() => {
    if (!vw || !vh) return 1;
    const sx = vw / designWidth;
    const sy = vh / designHeight;
    const s = Math.min(sx, sy);
    return allowUpscale ? s : Math.min(1, s);
  }, [vw, vh, designWidth, designHeight, allowUpscale]);

  // Compute the stage pixel size after scale to center it (letterbox)
  const stageW = Math.round(designWidth * scale);
  const stageH = Math.round(designHeight * scale);

  return (
    <div className={`fitscale-root ${className}`}> 
      <div className="fitscale-viewport">
        <div
          className="fitscale-stage fitscale"
          style={{
            width: designWidth,
            height: designHeight,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
