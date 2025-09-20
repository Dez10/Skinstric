"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';

export default function CameraGallerySelection() {
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();
  const { setAcquisition } = useJourney();
  useEffect(() => {
    // mark as mounted to trigger CSS label reveal
    if (rootRef.current) rootRef.current.classList.add('mounted');
    return () => { if (rootRef.current) rootRef.current.classList.remove('mounted'); };
  }, []);
  const proceedCamera = () => {
    setAcquisition({ type: 'selfie' });
    router.push('/camera');
  };
  const proceedGallery = () => {
    setAcquisition({ type: 'upload' });
    router.push('/upload');
  };
  return (
    <div className="camera-gallery-container" ref={rootRef}>
      <div className="camera-gallery-content">
        {showFloatInfo && typeof window !== 'undefined'
          ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="camera-access-title"
              className="float-info-overlay"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '32px'
              }}
              onKeyDown={(e)=>{ if(e.key==='Escape') setShowFloatInfo(false); }}
            >
              <div style={{
                width: '100%',
                maxWidth: 600,
                background: '#141414',
                border: '1px solid #2a2a2a',
                borderRadius: 14,
                boxShadow: '0 10px 50px -5px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                color: '#f5f5f5',
                fontFamily: 'inherit'
              }}>
                <div style={{padding: '28px 32px 20px'}}>
                  <h2 id="camera-access-title" style={{margin:0,fontSize:22,letterSpacing:'.05em',fontWeight:700}}>ALLOW A.I. TO ACCESS YOUR CAMERA</h2>
                </div>
                <div style={{height:1,background:'rgba(255,255,255,0.16)'}} />
                <div style={{display:'flex',justifyContent:'flex-end',gap:20,padding:'14px 28px'}}>
                  <button
                    type="button"
                    onClick={() => setShowFloatInfo(false)}
                    autoFocus
                    className="permission-btn deny"
                    style={{
                      background:'transparent',
                      border:'none',
                      color:'#b5b5b5',
                      fontSize:14,
                      fontWeight:600,
                      letterSpacing:'.05em',
                      cursor:'pointer'
                    }}
                  >DENY</button>
                  <button
                    type="button"
                    onClick={() => { setShowFloatInfo(false); proceedCamera(); }}
                    className="permission-btn allow"
                    style={{
                      background:'transparent',
                      border:'none',
                      color:'#ffffff',
                      fontSize:14,
                      fontWeight:700,
                      letterSpacing:'.05em',
                      cursor:'pointer'
                    }}
                  >ALLOW</button>
                </div>
              </div>
            </div>,
            document.body
          ) : !showFloatInfo && (
            <div className="selection-options">
              {/* Camera Option */}
              <div className="selection-option" onClick={() => setShowFloatInfo(true)}>
                <div className="rotating-svg-container camera-rotate relative">
                  {/* Rotating dotted squares (overlay) */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 border border-dotted border-gray-300 animate-spin-slow opacity-40" />
                    <div className="absolute inset-0 scale-75 border border-dotted border-gray-400 animate-spin-slower opacity-50" />
                    <div className="absolute inset-0 scale-55 border border-dotted border-gray-500 animate-spin-slowest opacity-60" />
                  </div>
                  <img src="/images/icons/camera (1).svg" alt="Camera" className="main-svg-icon relative z-10" />
                </div>
              </div>
              {/* Gallery Option */}
              <div className="selection-option" onClick={proceedGallery}>
                <div className="rotating-svg-container gallery-rotate relative">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 border border-dotted border-gray-300 animate-spin-slow opacity-40" />
                    <div className="absolute inset-0 scale-75 border border-dotted border-gray-400 animate-spin-slower opacity-50" />
                    <div className="absolute inset-0 scale-55 border border-dotted border-gray-500 animate-spin-slowest opacity-60" />
                  </div>
                  <img src="/images/icons/gallery.svg" alt="Gallery" className="main-svg-icon relative z-10" />
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
