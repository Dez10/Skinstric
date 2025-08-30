
import React, { useEffect, useRef } from 'react';
import { useState } from 'react';

export default function CameraGallerySelection({ onBack, onCameraSelect, onGallerySelect, userData }) {
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    // mark as mounted to trigger CSS label reveal
    if (rootRef.current) rootRef.current.classList.add('mounted');
    return () => { if (rootRef.current) rootRef.current.classList.remove('mounted'); };
  }, []);
  return (
    <div className="camera-gallery-container" ref={rootRef}>
      <div className="camera-gallery-content">
        <div className="selection-options">
          {/* Camera Option */}
          <div className="selection-option" onClick={() => setShowFloatInfo(true)}>
            <div className="rotating-svg-container camera-rotate">
              <img src="/images/icons/camera (1).svg" alt="Camera" className="main-svg-icon" />
            </div>
            <div className="svg-label camera-label">
              <span>ALLOW A.I.</span>
              <br />
              <span>TO SCAN YOUR FACE</span>
            </div>
          </div>
          {/* Gallery Option */}
          <div className="selection-option" onClick={onGallerySelect}>
            <div className="rotating-svg-container gallery-rotate">
              <img src="/images/icons/gallery.svg" alt="Gallery" className="main-svg-icon" />
            </div>
            <div className="svg-label gallery-label">
              <span>ALLOW A.I.</span>
              <br />
              <span>ACCESS GALLERY</span>
            </div>
          </div>
        </div>
        {/* Float Info Overlay with Allow/Deny buttons */}
        {showFloatInfo && (
          <div 
            className="float-info-overlay" 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(255,255,255,0.96)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <img src="/images/ui-elements/float-info.svg" alt="Info" style={{ maxWidth: '480px', width: '80%', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', borderRadius: '16px', marginBottom: '32px' }} />
            <div style={{ display: 'flex', gap: '24px' }}>
              <button 
                style={{ padding: '12px 32px', fontSize: '18px', borderRadius: '8px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setShowFloatInfo(false); onCameraSelect && onCameraSelect(); }}
              >Allow</button>
              <button 
                style={{ padding: '12px 32px', fontSize: '18px', borderRadius: '8px', background: '#eee', color: '#222', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowFloatInfo(false)}
              >Deny</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
