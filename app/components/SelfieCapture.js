"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';
import { analyzeImage } from '../../utils/analyzeImage.js';

export default function SelfieCapture({ autoStart = false, fullScreen = false }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demographics, setDemographics] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();
  const { setAcquisition, setDemographicsRaw, setSelectedAttributes: setSelectedContext } = useJourney();

  // Check camera permissions on mount and optionally auto start
  useEffect(() => {
    const setup = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(permission.state);
          permission.onchange = () => setCameraPermission(permission.state);
          if (autoStart && permission.state !== 'denied') {
            startCamera();
          }
        } else if (autoStart) {
          // Fallback: attempt start if Permissions API not present
          startCamera();
        }
      } catch (err) {
        if (autoStart) startCamera();
      }
    };
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Start camera
  const startCamera = async () => {
  setShowFloatInfo(false); // Hide info overlay when camera actually starts
    try {
      setError('');
      setIsCapturing(true); // Set this first to render the video element
      
      // Wait a brief moment for the video element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use Chrome, Firefox, or Safari.');
      }

      console.log('Requesting camera access...');
      console.log('Browser:', navigator.userAgent);
      console.log('Protocol:', window.location.protocol);
      
      // Check if we're on HTTPS or localhost (required for camera access)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        throw new Error('Camera access requires HTTPS or localhost. Please access the site via https:// or localhost');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user' // Front-facing camera
        } 
      });
      
      console.log('Camera access granted:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      console.log('Video ref current:', videoRef.current);
      
      setStream(mediaStream);
      
      // Try multiple times to ensure video element is available
      let attempts = 0;
      const maxAttempts = 10;
      
      const setupVideo = () => {
        if (videoRef.current) {
          console.log('Video element found, setting up stream');
          videoRef.current.srcObject = mediaStream;
          console.log('Video srcObject set');
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            videoRef.current.play().then(() => {
              console.log('Video started playing successfully');
            }).catch(err => {
              console.error('Video play error:', err);
              setError('Failed to start video playback');
            });
          };
          
          videoRef.current.onerror = (err) => {
            console.error('Video element error:', err);
            setError('Video display error');
          };
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Video ref not ready, attempt ${attempts}/${maxAttempts}, retrying...`);
            setTimeout(setupVideo, 100);
          } else {
            console.error('Video element never became available');
            setError('Video element not found after multiple attempts');
          }
        }
      };
      
      setupVideo();
    } catch (err) {
      console.error('Camera access error:', err);
      
      // More specific error messages
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser. Try using Chrome, Firefox, or Safari.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera resolution not supported. Trying with lower quality...');
        // Fallback with lower constraints
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setIsCapturing(true);
        } catch (fallbackErr) {
          setError('Unable to access camera with any settings.');
        }
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video not ready. Please wait a moment and try again.');
      return;
    }
    
    console.log('Capturing photo with dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Flip the image horizontally for selfie (mirror effect)
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image captured successfully');
    
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  // Convert to base64 for API
  const getBase64FromDataUrl = (dataUrl) => {
    return dataUrl.split(',')[1];
  };

  // Analyze the captured selfie using shared util
  const analyzeSelfie = async () => {
    if (!capturedImage) {
      setError('No image captured.');
      return;
    }
    setIsAnalyzing(true);
    setError('');
    try {
      const base64Image = getBase64FromDataUrl(capturedImage);
      const normalized = await analyzeImage(base64Image);
      setDemographics(normalized);
      const pickTop = (obj) => {
        const arr = Object.entries(obj || {}).sort((a,b)=>b[1]-a[1]);
        return arr.length ? arr[0][0] : '';
      };
      const initialSelected = {
        race: pickTop(normalized.race),
        age: pickTop(normalized.age),
        gender: pickTop(normalized.gender)
      };
      setSelectedAttributes(initialSelected);
      setSelectedContext(initialSelected);
      setAcquisition({ type: 'selfie', imageDataUrl: capturedImage });
      setDemographicsRaw(normalized);
      // Navigate to results so URL reflects the new page (instead of staying on /camera/capture)
      router.push('/result');
    } catch (err) {
      console.error('Selfie analysis error:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to process API result (same as ImageUpload)
  const processApiResult = (result) => {
    // Check for different possible response structures
    if (result.data) {
      setDemographics(result.data);
      // Initialize with top predictions
      const topRace = Object.entries(result.data.race || {}).sort((a, b) => b[1] - a[1])[0];
      const topAge = Object.entries(result.data.age || {}).sort((a, b) => b[1] - a[1])[0];
      const topGender = Object.entries(result.data.gender || {}).sort((a, b) => b[1] - a[1])[0];
      
      setSelectedAttributes({
        race: topRace ? topRace[0] : '',
        age: topAge ? topAge[0] : '',
        gender: topGender ? topGender[0] : ''
      });
    } else if (result.race || result.age || result.gender) {
      // Direct format without 'data' wrapper
      setDemographics(result);
      const topRace = Object.entries(result.race || {}).sort((a, b) => b[1] - a[1])[0];
      const topAge = Object.entries(result.age || {}).sort((a, b) => b[1] - a[1])[0];
      const topGender = Object.entries(result.gender || {}).sort((a, b) => b[1] - a[1])[0];
      
      setSelectedAttributes({
        race: topRace ? topRace[0] : '',
        age: topAge ? topAge[0] : '',
        gender: topGender ? topGender[0] : ''
      });
    } else {
      console.warn('Unexpected response structure:', result);
      throw new Error('Invalid response format - no demographics data found');
    }
  };

  // Sort and format scores to 2 decimal places (same as ImageUpload)
  const getSortedScores = (category) => {
    if (!demographics || !demographics[category]) return [];
    return Object.entries(demographics[category])
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: key,
        score: (value * 100).toFixed(2)
      }));
  };

  const handleAttributeSelect = (category, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleProceed = () => {
    router.push('/result');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const retakeSelfie = () => {
    // Clear previous results and errors
    setCapturedImage(null);
    setDemographics(null);
    setSelectedAttributes({});
    setError('');
    // Ensure any previous stream is stopped, then restart camera
    stopCamera();
    setShowFloatInfo(false);
    startCamera();
  };

  return (
    <div className={fullScreen ? "w-full h-screen flex flex-col" : "selfie-capture-container"}>
      <div className={fullScreen ? "flex-1 flex flex-col" : "selfie-capture-content"}>
        <div className={fullScreen ? "flex-1 flex flex-col items-center justify-center" : "camera-section"}>
          {/* In fullScreen mode we skip the initial placeholder UI entirely. */}
          {!fullScreen && !isCapturing && !capturedImage && (
            <div className="camera-start">
              <div className="camera-icon" onClick={startCamera} style={{ cursor: 'pointer' }}>📷</div>
              <p>Ready to take your selfie?</p>
              {cameraPermission === 'denied' && (
                <div className="permission-warning">
                  <p style={{ color: 'red' }}>
                    Camera access is blocked. Please enable camera permissions in your browser settings and refresh the page.
                  </p>
                </div>
              )}
            </div>
          )}

          {isCapturing && (
            <>
              <VideoWithFaceBlur
                videoRef={videoRef}
                fullScreen={fullScreen}
                onVideoError={(e) => {
                  console.error('Video error:', e);
                  setError('Video playback error. Please try again.');
                }}
              />
              {/* Fullscreen overlay controls (right side) */}
              {fullScreen ? (
                <>
                  {/* Fixed viewport-positioned capture CTA on right-center */}
                  <div className="capture-cta-pos pointer-events-none">
                    <span className="capture-cta__label select-none">TAKE PICTURE</span>
                    <button
                      type="button"
                      aria-label="Take picture"
                      className="capture-cta__button pointer-events-auto"
                      onClick={capturePhoto}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ position:'relative', zIndex:1 }}>
                        <path d="M4 9h3l1.2-2.4A2 2 0 0 1 10 5h4a2 2 0 0 1 1.8 1.1L17 9h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" stroke="#A0A4AB" strokeWidth="1.5"/>
                        <circle cx="12" cy="14" r="3.5" stroke="#A0A4AB" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="camera-controls">
                  <button className="capture-btn" onClick={capturePhoto}>📸 Capture</button>
                  <button className="cancel-btn" onClick={stopCamera}>Cancel</button>
                </div>
              )}
            </>
          )}

          {capturedImage && !demographics && (
            <div className="preview-overlay" aria-live="polite">
              {/* Full-bleed captured frame */}
              <img src={capturedImage} alt="Captured selfie preview" className="preview-image" />

              {/* Center toast */}
              <div className="preview-toast">GREAT SHOT!</div>

              {/* Bottom panel */}
              <div className="preview-panel">
                <div className="preview-heading">Preview</div>
                <div className="preview-actions">
                  <button type="button" className="btn-retake" onClick={retakeSelfie}>Retake</button>
                  <button
                    type="button"
                    className="btn-use"
                    onClick={analyzeSelfie}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing…' : 'Use This Photo'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Demographics Results */}
          {demographics && (
            <div className="demographics-section">
              <h3>Selfie Demographics Analysis</h3>
              
              <div className="selfie-and-results">
                <div className="selfie-preview">
                  <img src={capturedImage} alt="Captured selfie" className="captured-selfie-small" />
                </div>
                
                <div className="demographics-grid">
                  
                  {/* Race */}
                  <div className="demographic-category">
                    <h4>Race</h4>
                    <div className="scores-list">
                      {getSortedScores('race').map((item, index) => (
                        <div 
                          key={item.label}
                          className={`score-item ${selectedAttributes.race === item.label ? 'selected' : ''}`}
                          onClick={() => handleAttributeSelect('race', item.label)}
                        >
                          <span className="score-label">{item.label}</span>
                          <span className="score-value">{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="demographic-category">
                    <h4>Age</h4>
                    <div className="scores-list">
                      {getSortedScores('age').map((item, index) => (
                        <div 
                          key={item.label}
                          className={`score-item ${selectedAttributes.age === item.label ? 'selected' : ''}`}
                          onClick={() => handleAttributeSelect('age', item.label)}
                        >
                          <span className="score-label">{item.label}</span>
                          <span className="score-value">{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="demographic-category">
                    <h4>Gender</h4>
                    <div className="scores-list">
                      {getSortedScores('gender').map((item, index) => (
                        <div 
                          key={item.label}
                          className={`score-item ${selectedAttributes.gender === item.label ? 'selected' : ''}`}
                          onClick={() => handleAttributeSelect('gender', item.label)}
                        >
                          <span className="score-label">{item.label}</span>
                          <span className="score-value">{item.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Attributes Summary */}
                <div className="selected-summary">
                  <h4>Selected Attributes</h4>
                  <p><strong>Race:</strong> {selectedAttributes.race}</p>
                  <p><strong>Age:</strong> {selectedAttributes.age}</p>
                  <p><strong>Gender:</strong> {selectedAttributes.gender}</p>
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!fullScreen && (
          <div className="selfie-actions">
            <button 
              className="back-btn" 
              onClick={() => router.push('/select')}
              disabled={isAnalyzing}
            >
              ← Back
            </button>
            {demographics && (
              <button 
                className="proceed-btn"
                onClick={handleProceed}
              >
                Proceed →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Lightweight video + face blur overlay using FaceDetector API
function VideoWithFaceBlur({ videoRef, fullScreen, onVideoError }) {
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const facesRef = useRef([]);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const offscreenRef = useRef(null);

  useEffect(() => {
    const hasFaceDetector = typeof window !== 'undefined' && 'FaceDetector' in window;
    if (hasFaceDetector && !detectorRef.current) {
      try {
        // eslint-disable-next-line no-undef
        detectorRef.current = new FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
      } catch (e) {
        detectorRef.current = null;
      }
    }

    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    const off = document.createElement('canvas');
    offscreenRef.current = off;

    let lastDetect = 0;
    const DETECT_INTERVAL = 150; // ms

    const loop = () => {
      const video = videoRef.current;
      const ctx = overlay.getContext('2d');
      if (!video || !ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const cw = container.clientWidth || 0;
      const ch = container.clientHeight || 0;
      if (cw === 0 || ch === 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Size canvases to container display size
      if (overlay.width !== cw || overlay.height !== ch) {
        overlay.width = cw; overlay.height = ch;
      }
      if (off.width !== cw || off.height !== ch) {
        off.width = cw; off.height = ch;
      }

      const vW = video.videoWidth || 0;
      const vH = video.videoHeight || 0;
      // Clear overlay first
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (vW > 0 && vH > 0) {
        // Draw video frame into offscreen using CSS object-cover math
        const s = Math.max(cw / vW, ch / vH);
        const dW = vW * s;
        const dH = vH * s;
        const dx = (cw - dW) / 2;
        const dy = (ch - dH) / 2;

        const offCtx = off.getContext('2d');
        offCtx.clearRect(0, 0, cw, ch);
        offCtx.drawImage(video, dx, dy, dW, dH);

        // Throttled face detection
        const now = performance.now();
        if (detectorRef.current && (now - lastDetect) > DETECT_INTERVAL) {
          lastDetect = now;
          detectorRef.current.detect(video).then(results => {
            facesRef.current = (results || []).map(r => r.boundingBox || r); // normalize
          }).catch(() => { /* ignore */ });
        }

        const faces = facesRef.current || [];
        if (faces.length === 0 && !detectorRef.current) {
          // Fallback: approximate center region when no detector support
          const approx = [{
            x: cw * 0.35, y: ch * 0.25, width: cw * 0.3, height: ch * 0.45
          }];
          drawBlurRegions(ctx, off, approx);
        } else if (faces.length > 0) {
          // Map detector rectangles (video space) to display space
          const mapped = faces.map(bb => ({
            x: bb.x * s + dx,
            y: bb.y * s + dy,
            width: bb.width * s,
            height: bb.height * s
          }));
          drawBlurRegions(ctx, off, mapped);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [videoRef]);

  // Helper: draw blurred frame clipped to regions
  const drawBlurRegions = (ctx, offCanvas, rects) => {
    rects.forEach(r => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.width, r.height);
      ctx.clip();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();
    });
  };

  return (
    <div ref={containerRef} className={fullScreen ? 'relative w-full h-full' : 'camera-view relative'}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={fullScreen ? 'object-cover w-full h-full' : 'camera-video'}
        style={fullScreen ? { transform: 'scaleX(-1)' } : { transform: 'scaleX(-1)', width: '100%', maxWidth: '600px', height: 'auto' }}
        onCanPlay={() => {/* no-op */}}
        onError={onVideoError}
      />
      <canvas
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={fullScreen ? { transform: 'scaleX(-1)' } : { transform: 'scaleX(-1)' }}
      />
    </div>
  );
}
