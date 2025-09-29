"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';
import { analyzeImage } from '../../utils/analyzeImage.js';

export default function CameraGallerySelection() {
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();
  const { setAcquisition, setDemographicsRaw, setSelectedAttributes } = useJourney();
  
  // States for gallery image processing
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // mark as mounted to trigger CSS label reveal
    if (rootRef.current) rootRef.current.classList.add('mounted');
    return () => { if (rootRef.current) rootRef.current.classList.remove('mounted'); };
  }, []);

  // Effect to analyze image automatically when a file is selected
  useEffect(() => {
    if (selectedFile && imagePreview) {
      analyzeSelectedImage();
    }
  }, [selectedFile, imagePreview]);

  const proceedCamera = () => {
    setAcquisition({ type: 'selfie' });
    router.push('/camera');
  };

  // Create a hidden file input element
  const fileInputRef = useRef(null);

  // Updated proceedGallery to directly open file manager
  const proceedGallery = () => {
    setAcquisition({ type: 'upload' });
    // Trigger the hidden file input click event to open file manager
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection from the file manager
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }

      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setError('');

      // Store the selected file in the journey context
      setAcquisition({ 
        type: 'upload', 
        file: file 
      });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to analyze the selected image
  const analyzeSelectedImage = async () => {
    if (!selectedFile || !imagePreview) return;
    
    setIsAnalyzing(true);
    
    try {
      // Convert to base64
      const base64 = imagePreview;
      
      // Send to analysis API
      const demographics = await analyzeImage(base64);
      
      // Store demographics data in context
      setDemographicsRaw(demographics);
      
      // Initialize selected attributes with highest confidence scores
      const pickTop = (obj) => {
        const arr = Object.entries(obj || {}).sort((a,b)=>b[1]-a[1]);
        return arr.length ? arr[0][0] : '';
      };
      
      const selectedAttrs = {
        race: pickTop(demographics.race),
        age: pickTop(demographics.age),
        gender: pickTop(demographics.gender)
      };
      setSelectedAttributes(selectedAttrs);
      setDemographicsRaw(demographics);
      setAcquisition({ 
        type: 'upload', 
        imageDataUrl: base64, 
        fileName: selectedFile.name 
      });
      
      // Navigate to the results page
      router.push('/result');
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="camera-gallery-container" ref={rootRef}>
      {/* Hidden file input for direct file selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <div className="camera-gallery-content" role="group" aria-label="Choose image source">
        {isAnalyzing ? (
          <div className="analysis-in-progress">
            <div className="analyzing-layout">
              <div className="rotating-svg-container analyzing-rotate">
                <div className="rot-set">
                  <div className="rot-sq outer" />
                  <div className="rot-sq mid" />
                  <div className="rot-sq inner" />
                </div>
                <span className="analyzing-text">ANALYZING</span>
              </div>
              
              {imagePreview && (
                <div className="preview-container">
                  <img src={imagePreview} alt="Selected" className="gallery-preview-image" />
                  {selectedFile && (
                    <div className="file-name">{selectedFile.name}</div>
                  )}
                </div>
              )}
            </div>
            
            {error && <div className="error-message"><p>{error}</p></div>}
          </div>
        ) : showFloatInfo && typeof window !== 'undefined'
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
              <button
                type="button"
                className="selection-option"
                aria-label="Use camera"
                onClick={() => setShowFloatInfo(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowFloatInfo(true); } }}
              >
                <div className="rotating-svg-container camera-rotate relative">
                  <div className="rot-set">
                    <div className="rot-sq outer" />
                    <div className="rot-sq mid" />
                    <div className="rot-sq inner" />
                  </div>
                  <svg className="main-svg-icon relative z-10" width="136" height="136" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Camera">
                    <circle cx="67.9996" cy="67.9997" r="57.7857" stroke="#1A1B1C"/>
                    <circle cx="68" cy="68" r="51" fill="#1A1B1C"/>
                    <path d="M100.668 35.412C92.3149 27.0382 80.7627 21.8569 68.0003 21.8569C65.0469 21.8569 62.1583 22.1344 59.3592 22.6647C64.1338 30.5633 81.5795 58.2549 84.9406 63.1803C85.5932 64.1371 86.753 62.2365 93.7783 48.6929L100.668 35.412Z" fill="#FCFCFC"/>
                    <path d="M25.0882 51.004C30.5815 37.1459 42.5936 26.5816 57.3413 23.0942C59.0872 25.713 62.4221 30.8872 66.0668 36.6493L75.3267 51.2908H48.8858C36.1263 51.2908 28.6691 51.2077 25.0882 51.004Z" fill="#FCFCFC"/>
                    <path d="M31.8694 96.7032C25.602 88.8246 21.8574 78.8495 21.8574 67.9998C21.8574 62.801 22.7172 57.803 24.3023 53.1402H39.1666C56.552 53.1402 56.9478 53.1674 56.3267 54.3294C55.0953 56.6338 36.8239 88.2621 31.8694 96.7032Z" fill="#FCFCFC"/>
                    <path d="M76.9643 113.273C74.0646 113.843 71.0674 114.143 68.0003 114.143C54.1917 114.143 41.7998 108.077 33.3436 98.465C35.1707 94.4055 39.9295 85.9319 48.1717 72.0115C48.9468 70.7014 49.7323 69.781 49.917 69.966C50.1016 70.1503 56.6037 80.5196 64.3671 93.0077L76.9643 113.273Z" fill="#FCFCFC"/>
                    <path d="M111.529 83.348C106.372 97.9733 94.0533 109.22 78.7841 112.876C74.5785 106.389 60.6125 83.9565 60.6125 83.6094C60.6125 83.4658 72.6814 83.348 87.4326 83.348H111.529Z" fill="#FCFCFC"/>
                    <path d="M101.902 36.6966C109.5 44.922 114.143 55.9187 114.143 67.9998C114.143 72.923 113.372 77.6662 111.944 82.115H96.5965C86.6243 82.115 78.4651 81.9646 78.4651 81.7803C78.4651 81.3997 98.4368 43.0157 101.902 36.6966Z" fill="#FCFCFC"/>
                  </svg>
                  {/* Camera Label - Figma styled */}
                  <div className="camera-label-figma">
                    <div className="label-text-figma">ALLOW A.I.<br/>TO SCAN YOUR FACE</div>
                    <div className="label-line-figma"></div>
                  </div>
                </div>
              </button>
              {/* Gallery Option */}
              <button
                type="button"
                className="selection-option"
                aria-label="Choose from gallery"
                onClick={proceedGallery}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); proceedGallery(); } }}
              >
                <div className="rotating-svg-container gallery-rotate relative">
                  <div className="rot-set">
                    <div className="rot-sq outer" />
                    <div className="rot-sq mid" />
                    <div className="rot-sq inner" />
                  </div>
                  <svg className="main-svg-icon relative z-10" width="136" height="136" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gallery">
                    <circle cx="67.9996" cy="67.9997" r="57.7857" stroke="#1A1B1C" />
                    <circle cx="68" cy="68" r="50" fill="#FCFCFC" stroke="#1A1B1C" strokeWidth="2" />
                    <path d="M78.3214 68C85.3631 68 91.0714 62.2916 91.0714 55.25C91.0714 48.2084 85.3631 42.5 78.3214 42.5C71.2798 42.5 65.5714 48.2084 65.5714 55.25C65.5714 62.2916 71.2798 68 78.3214 68Z" fill="#1A1B1C" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M17 68C17 71.9604 17.4514 75.8154 18.3056 79.5163C23.5265 102.136 43.7939 119 68 119C94.8673 119 116.882 98.2244 118.856 71.862C118.951 70.5872 119 69.2993 119 68C119 39.8335 96.1665 17 68 17C39.8335 17 17 39.8335 17 68ZM35.3365 67.7257L19.3825 78.7708C18.6175 75.3024 18.2143 71.6983 18.2143 68C18.2143 40.5041 40.5041 18.2143 68 18.2143C95.4959 18.2143 117.786 40.5041 117.786 68C117.786 69.5412 117.716 71.0661 117.579 72.5716L82.9447 91.8127C80.4324 93.2084 77.3343 92.9968 75.0351 91.2724L43.855 67.8874C41.3462 66.0058 37.9149 65.9406 35.3365 67.7257Z" fill="#1A1B1C" />
                  </svg>
                  {/* Gallery Label - Figma styled */}
                  <div className="gallery-label-figma">
                    <div className="label-text-figma">ALLOW A.I.<br/>ACCESS GALLERY</div>
                    <div className="label-line-figma gallery-line"></div>
                  </div>
                </div>
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
