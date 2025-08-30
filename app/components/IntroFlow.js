"use client";
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const IntroFlow = ({ onComplete }) => {
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  // Dummy camera start function for modal gating
  const { push } = require('next/navigation');
  const handleAllowCamera = () => {
    setShowFloatInfo(false);
    push('/camera');
  };
  const [step, setStep] = useState(1); // 1: name, 2: location, 3: processing, 4: thank you
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const stepRef = useRef(null);
  const backgroundRef = useRef(null);

  // Reset fields on mount; don't prefill from storage
  useEffect(() => {
    setName('');
    setLocation('');
    setErrors({});
    setStep(1);
  }, []);

  // Animate on mount and step changes
  useEffect(() => {
    if (stepRef.current && backgroundRef.current) {
      const ctx = gsap.context(() => {
        // Animate background squares
        gsap.fromTo('.rotating-square', 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 0.4, duration: 1, stagger: 0.2, ease: 'power3.out' }
        );
        
        // Start continuous rotation for each square at different speeds
        gsap.to('.square-1', { rotation: 360, duration: 40, repeat: -1, ease: 'none' });
        gsap.to('.square-2', { rotation: 360, duration: 30, repeat: -1, ease: 'none' });
        gsap.to('.square-3', { rotation: 360, duration: 50, repeat: -1, ease: 'none' });
        
        // Animate step content
        gsap.fromTo('.intro-step > *', 
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
      }, stepRef);
      
      return () => ctx.revert();
    }
  }, [step]);

  // Validation function
  const validateField = (value, fieldName) => {
    // Check if it's empty
    if (!value || !value.trim()) {
      return `${fieldName} is required`;
    }
    
    // Check if it contains numbers or special characters (only allow letters, spaces, hyphens, apostrophes)
    const validPattern = /^[a-zA-Z\s'-]+$/;
    if (!validPattern.test(value.trim())) {
      return `${fieldName} should only contain letters, spaces, hyphens, and apostrophes`;
    }
    
    // Check minimum length
    if (value.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    
    return null;
  };

  const animateStepTransition = (nextStep) => {
    const ctx = gsap.context(() => {
      gsap.to('.intro-step > *', {
        y: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => {
          setStep(nextStep);
        }
      });
    }, stepRef);
  };

  const handleNameSubmit = () => {
    const error = validateField(name, 'Name');
    if (error) {
      setErrors({ name: error });
      // Shake animation for error
      gsap.to('.intro-input', { x: [-10, 10, -10, 10, 0], duration: 0.4 });
      return;
    }
    
    setErrors({});
    localStorage.setItem('skinstric_user_name', name.trim());
    animateStepTransition(2);
  };

  const handleLocationSubmit = async () => {
    const error = validateField(location, 'Location');
    if (error) {
      setErrors({ location: error });
      // Shake animation for error
      gsap.to('.intro-input', { x: [-10, 10, -10, 10, 0], duration: 0.4 });
      return;
    }
    
    setErrors({});
    localStorage.setItem('skinstric_user_location', location.trim());
    
    // Go to processing step
    animateStepTransition(3);
    
    // Start API submission
    setIsSubmitting(true);
    const userData = {
      name: name.trim(),
      location: location.trim()
    };
    
    try {
      await fetch('https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (err) {
      console.log('API call failed:', err);
    }
    
    // After 2 seconds, show thank you step
    setTimeout(() => {
      setIsSubmitting(false);
      animateStepTransition(4);
    }, 2000);
  };

  const handleProceed = () => {
    const userData = {
      name: name.trim(),
      location: location.trim()
    };
    
    // Animate out before completing
    const ctx = gsap.context(() => {
      gsap.to('.intro-flow', {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => onComplete(userData)
      });
    }, stepRef);
  };

  // Allow Enter key to proceed from the final step (no visible button)
  useEffect(() => {
    if (step !== 4) return;
    const onKey = (e) => {
      if (e.key === 'Enter') {
        handleProceed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, name, location]);

  const handleBack = () => {
    if (step === 2) {
      animateStepTransition(1);
    } else if (step === 4) {
      animateStepTransition(2); // Go back to location from thank you
    }
    // Note: step 3 (processing) cannot be interrupted
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="intro-flow" ref={stepRef}>
      {/* Info Card Modal for Camera Permission */}
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
              onClick={handleAllowCamera}
            >Allow</button>
            <button 
              style={{ padding: '12px 32px', fontSize: '18px', borderRadius: '8px', background: '#eee', color: '#222', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setShowFloatInfo(false)}
            >Deny</button>
          </div>
        </div>
      )}
      <div className="intro-background" ref={backgroundRef}>
        <div className="rotating-square square-1"></div>
        <div className="rotating-square square-2"></div>
        <div className="rotating-square square-3"></div>
      </div>

      {/* Step 1: Name Input */}
      {step === 1 && (
        <div className="intro-step">
          <div className="intro-mini">CLICK TO TYPE</div>
          <div className="intro-heading">Introduce Yourself</div>
          <div className="intro-input-container">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              onKeyDown={(e) => handleKeyDown(e, handleNameSubmit)}
              placeholder=""
              className={`intro-input ${errors.name ? 'error' : ''}`}
              autoFocus
              autoComplete="off"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          {/* Enter only to proceed - no visible submit button */}
        </div>
      )}

      {/* Step 2: Location Input */}
      {step === 2 && (
        <div className="intro-step">
          <div className="intro-mini">CLICK TO TYPE</div>
          <div className="intro-heading">your city name</div>
          <div className="intro-input-container">
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors({});
              }}
              onKeyDown={(e) => handleKeyDown(e, handleLocationSubmit)}
              placeholder=""
              className={`intro-input ${errors.location ? 'error' : ''}`}
              autoFocus
              autoComplete="off"
            />
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>
          {/* Enter only to proceed - no visible submit button */}
        </div>
      )}

      {/* Step 3: Processing Submission */}
      {step === 3 && (
        <div className="intro-step">
          <div className="intro-heading">Processing Submission</div>
          <div className="loading-dots" role="status" aria-label="Loading">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      )}

      {/* Step 4: Thank You */}
      {step === 4 && (
        <div className="intro-step">
          <div className="intro-heading">Thank you!</div>
          <div className="intro-subtext">Proceed for the next step</div>
        </div>
      )}

      {/* Proceed Button - Fixed Position on Thank You step */}
      {step === 4 && (
        <div className="proceed-floating">
          <span>PROCEED</span>
          <div className="diamond-button" onClick={handleProceed}>
            <div className="diamond">
              <span className="diamond-arrow right"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  // Camera icon click handler for info card/modal
  // Place this where the camera icon is rendered in your intro UI
  // Example:
  // <div className="camera-icon" onClick={() => setShowFloatInfo(true)}></div>
  // ...existing code...
};

export default IntroFlow;
