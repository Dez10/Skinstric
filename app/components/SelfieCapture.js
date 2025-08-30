"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function SelfieCapture({ onBack, onComplete, userData }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demographics, setDemographics] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check camera permissions on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' });
          setCameraPermission(permission.state);
          
          permission.onchange = () => {
            setCameraPermission(permission.state);
          };
        }
      } catch (err) {
        console.log('Permission API not supported:', err);
      }
    };
    
    checkCameraPermission();
  }, []);

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

  // Analyze the captured selfie
  const analyzeSelfie = async () => {
    if (!capturedImage) {
      setError('No image captured.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const base64Image = getBase64FromDataUrl(capturedImage);
      console.log('Analyzing selfie, base64 length:', base64Image.length);

      let result;
      
      // Try first format: lowercase 'image'
      try {
        const payload1 = {
          image: base64Image
        };
        console.log('Trying selfie analysis with lowercase "image" key');

        const response1 = await fetch('https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload1)
        });

        if (response1.ok) {
          result = await response1.json();
          console.log('Selfie analysis success with lowercase "image" key:', result);
        } else {
          const errorText1 = await response1.text();
          console.log('First selfie attempt failed:', response1.status, errorText1);
          throw new Error('Try next format');
        }
      } catch (firstAttemptError) {
        console.log('Trying second format: uppercase "Image"');
        
        // Try second format: uppercase 'Image'
        try {
          const payload2 = {
            Image: base64Image
          };

          const response2 = await fetch('https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload2)
          });

          if (response2.ok) {
            result = await response2.json();
            console.log('Selfie analysis success with uppercase "Image" key:', result);
          } else {
            const errorText2 = await response2.text();
            console.log('Second selfie attempt failed:', response2.status, errorText2);
            throw new Error('Try next format');
          }
        } catch (secondAttemptError) {
          console.log('Trying third format: full data URL');
          
          // Try third format: full data URL
          const payload3 = {
            Image: capturedImage // Full data URL
          };

          const response3 = await fetch('https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload3)
          });

          if (!response3.ok) {
            const errorText3 = await response3.text();
            console.error('All selfie analysis attempts failed. Final error:', response3.status, errorText3);
            throw new Error(`Analysis failed: ${response3.status} ${response3.statusText} - ${errorText3}`);
          }

          result = await response3.json();
          console.log('Selfie analysis success with data URL format:', result);
        }
      }
      
      // Process the result and show demographics
      processApiResult(result);

    } catch (error) {
      console.error('Selfie analysis error:', error);
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
    // Combine with previous data and pass to next phase
    onComplete({
      ...userData,
      selfieImage: capturedImage,
      demographics: demographics,
      selectedAttributes: selectedAttributes
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const retakeSelfie = () => {
  setCapturedImage(null);
  setShowFloatInfo(true);
  };

  return (
    <div className="selfie-capture-container">
      <div className="selfie-capture-content">
        <div className="camera-section">
          {!isCapturing && !capturedImage && (
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
            <div className="camera-view">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{ 
                  transform: 'scaleX(-1)', // Mirror effect for selfie
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto'
                }}
                onCanPlay={() => console.log('Video can play')}
                onError={(e) => {
                  console.error('Video error:', e);
                  setError('Video playback error. Please try again.');
                }}
              />
              <div className="camera-controls">
                <button className="capture-btn" onClick={capturePhoto}>
                  📸 Capture
                </button>
                <button className="cancel-btn" onClick={stopCamera}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {capturedImage && !demographics && (
            <div className="image-preview-section">
              <img src={capturedImage} alt="Captured selfie" className="captured-selfie" />
              <div className="preview-controls">
                <button className="retake-btn" onClick={retakeSelfie}>
                  Retake
                </button>
                <button 
                  className="analyze-selfie-btn" 
                  onClick={analyzeSelfie}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Selfie'}
                </button>
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

        <div className="selfie-actions">
          <button 
            className="back-btn" 
            onClick={onBack}
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
      </div>
    </div>
  );
}
