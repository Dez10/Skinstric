
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
gsap.registerPlugin(MotionPathPlugin, ScrollToPlugin, TextPlugin);
import CustomerForm from './components/CustomerForm';
import IntroFlow from './components/IntroFlow';
import CameraGallerySelection from './components/CameraGallerySelection';
import ImageUpload from './components/ImageUpload';
import SelfieCapture from './components/SelfieCapture';
import FinalResults from './components/FinalResults';

const STAGES = { 
  LANDING: 'landing', 
  INTRO: 'intro', 
  SELECTION: 'selection',
  UPLOAD: 'upload', 
  SELFIE: 'selfie',
  RESULTS: 'results', 
  FORM: 'form' 
};

export default function Home() {
  const [stage, setStage] = useState(STAGES.LANDING);
  const [userData, setUserData] = useState(null);
  const landingRef = useRef(null);
  const headingRef = useRef(null);
  const leftChevronRef = useRef(null);
  const rightChevronRef = useRef(null);
  const centerTextRef = useRef(null);
  const leftDiamondRef = useRef(null);
  const rightDiamondRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const hoverAnims = useRef({ left: null, right: null });
  
  // Set debug flag only on client-side and clear form data on page refresh
  useEffect(() => {
    // Enable GSAP debugging in browser console
    window.gsapDebug = true;
    
    // Clear all form data from localStorage on page refresh
    localStorage.removeItem('skinstric_user_name');
    localStorage.removeItem('skinstric_user_location');
    localStorage.removeItem('customerData');
  }, []);

  const handleBack = () => {
    if (stage === STAGES.FORM) setStage(STAGES.RESULTS);
    else if (stage === STAGES.RESULTS) setStage(STAGES.SELFIE);
    else if (stage === STAGES.SELFIE) setStage(STAGES.SELECTION);
    else if (stage === STAGES.UPLOAD) setStage(STAGES.SELECTION);
    else if (stage === STAGES.SELECTION) setStage(STAGES.INTRO);
    else if (stage === STAGES.INTRO) setStage(STAGES.LANDING);
  };

  const handleIntroComplete = (data) => {
    setUserData(data);
    setStage(STAGES.SELECTION);
  };

  const handleCameraSelect = () => {
    setStage(STAGES.SELFIE);
  };

  const handleGallerySelect = () => {
    setStage(STAGES.UPLOAD);
  };

  const handleUploadComplete = (data) => {
    setUserData(data);
    setStage(STAGES.RESULTS);
  };

  const handleSelfieComplete = (data) => {
    setUserData(data);
    setStage(STAGES.RESULTS);
  };

  const handleResultsComplete = (data) => {
    setUserData(data);
    setStage(STAGES.FORM);
  };

  const handleFormComplete = () => {
    // Reset to landing or show success
    setStage(STAGES.LANDING);
  };

  const goIntro = () => setStage(STAGES.INTRO);
  
  const goHome = () => setStage(STAGES.LANDING);
  
  const handleGoHome = () => {
    // Clear all user data and localStorage
    setUserData(null);
    localStorage.removeItem('skinstric_user_name');
    localStorage.removeItem('skinstric_user_location');
    localStorage.removeItem('customerData');
    setStage(STAGES.LANDING);
  };
  
  // Hover handlers for landing page animations
  const handleLeftHover = (isHovering) => {
    // COMPLETE REWRITE - Hovering LEFT button, both words slide RIGHT
    if (!centerTextRef.current || !line1Ref.current || !line2Ref.current || !rightChevronRef.current) return;
    
    // Get the actual DOM elements
    const line1El = document.querySelector('.line1');
    const line2El = document.querySelector('.line2');
    
    if (!line1El || !line2El) {
      console.error("Could not find line elements!");
      return;
    }
    
    console.log("LEFT hover handler", isHovering ? "ENTER" : "LEAVE");
    
    // Kill any existing animations
    if (hoverAnims.current.left) {
      hoverAnims.current.left.kill();
      hoverAnims.current.left = null;
    }
    
    gsap.killTweensOf([line1El, line2El]);
    
  const slideDistance = 170;
    const lastDelta = parseFloat(getComputedStyle(centerTextRef.current).getPropertyValue('--line2-last-delta') || "0");
    
    if (isHovering) {
      rightChevronRef.current.classList.add('hovered');
      if (rightDiamondRef.current) rightDiamondRef.current.classList.add('fade');
      
      // EXPLICITLY SET INITIAL POSITIONS
      line1El.style.transform = 'translateX(0px)';
      line2El.style.transform = 'translateX(0px)';
      
      // Directly apply transformations
      const moveLine1 = () => {
        console.log("Moving line1 to RIGHT");
        gsap.to(line1El, {
          duration: 0.35,
          x: slideDistance,
          ease: "power1.out",
          onStart: () => console.log("Line1 animation started"),
          onComplete: () => console.log("Line1 animation completed")
        });
      };
      
      const moveLine2 = () => {
        console.log("Moving line2 to RIGHT + alignment");
        gsap.to(line2El, {
          duration: 0.3,
          x: slideDistance + lastDelta,
          ease: "power1.out",
          onStart: () => console.log("Line2 animation started"),
          onComplete: () => console.log("Line2 animation completed") 
        });
      };
      
      // Execute with delay
      moveLine1();
      setTimeout(moveLine2, 70); // 70ms delay
    } else {
      rightChevronRef.current.classList.remove('hovered');
      if (rightDiamondRef.current) rightDiamondRef.current.classList.remove('fade');
      
      // Return animations - direct DOM manipulation
      const line1El = document.querySelector('.line1');
      const line2El = document.querySelector('.line2');
      
      if (!line1El || !line2El) return;
      
      const resetLine1 = () => {
        console.log("Resetting line1 to center");
        gsap.to(line1El, {
          duration: 0.28,
          x: 0,
          ease: "power1.inOut",
          onComplete: () => line1El.style.transform = ''
        });
      };
      
      const resetLine2 = () => {
        console.log("Resetting line2 to center");
        gsap.to(line2El, {
          duration: 0.21,
          x: 0,
          ease: "power1.inOut", 
          onComplete: () => line2El.style.transform = ''
        });
      };
      
      // Execute with minimal delay
      resetLine1();
      setTimeout(resetLine2, 30);
    }
  };

  const handleRightHover = (isHovering) => {
    // COMPLETE REWRITE - Hovering RIGHT button, both words slide LEFT
    if (!centerTextRef.current || !line1Ref.current || !line2Ref.current || !leftChevronRef.current) return;
    
    // Get the actual DOM elements
    const line1El = document.querySelector('.line1');
    const line2El = document.querySelector('.line2');
    
    if (!line1El || !line2El) {
      console.error("Could not find line elements!");
      return;
    }
    
    console.log("RIGHT hover handler", isHovering ? "ENTER" : "LEAVE");
    
    // Kill any existing animations
    if (hoverAnims.current.right) {
      hoverAnims.current.right.kill();
      hoverAnims.current.right = null;
    }
    
    gsap.killTweensOf([line1El, line2El]);
    
  const slideDistance = 170;
    const firstDelta = parseFloat(getComputedStyle(centerTextRef.current).getPropertyValue('--line2-first-delta') || "0");
    
    if (isHovering) {
      leftChevronRef.current.classList.add('hovered');
      if (leftDiamondRef.current) leftDiamondRef.current.classList.add('fade');
      
      // EXPLICITLY SET INITIAL POSITIONS
      line1El.style.transform = 'translateX(0px)';
      line2El.style.transform = 'translateX(0px)';
      
      // Directly apply transformations
      const moveLine1 = () => {
        console.log("Moving line1 to LEFT");
        gsap.to(line1El, {
          duration: 0.35,
          x: -slideDistance,
          ease: "power1.out",
          onStart: () => console.log("Line1 animation started"),
          onComplete: () => console.log("Line1 animation completed")
        });
      };
      
      const moveLine2 = () => {
        console.log("Moving line2 to LEFT + alignment");
        gsap.to(line2El, {
          duration: 0.3,
          x: -slideDistance + firstDelta,
          ease: "power1.out",
          onStart: () => console.log("Line2 animation started"),
          onComplete: () => console.log("Line2 animation completed") 
        });
      };
      
      // Execute with delay
      moveLine1();
      setTimeout(moveLine2, 70); // 70ms delay
    } else {
      leftChevronRef.current.classList.remove('hovered');
      if (leftDiamondRef.current) leftDiamondRef.current.classList.remove('fade');
      
      // Return animations - direct DOM manipulation
      const line1El = document.querySelector('.line1');
      const line2El = document.querySelector('.line2');
      
      if (!line1El || !line2El) return;
      
      const resetLine1 = () => {
        console.log("Resetting line1 to center");
        gsap.to(line1El, {
          duration: 0.28,
          x: 0,
          ease: "power1.inOut",
          onComplete: () => line1El.style.transform = ''
        });
      };
      
      const resetLine2 = () => {
        console.log("Resetting line2 to center");
        gsap.to(line2El, {
          duration: 0.21,
          x: 0,
          ease: "power1.inOut",
          onComplete: () => line2El.style.transform = ''
        });
      };
      
      // Execute with minimal delay
      resetLine1();
      setTimeout(resetLine2, 30);
    }
  };

  // Compute horizontal shift so second line right-aligns under first line
  useEffect(() => {
    const computeShift = () => {
      if (!line1Ref.current || !line2Ref.current || !centerTextRef.current) return;
  const line1 = line1Ref.current;
  const line2 = line2Ref.current;
  const f1 = line1.querySelector('.first-letter');
  const f2 = line2.querySelector('.first-letter');
  const l1 = line1.querySelector('.last-letter');
  const l2 = line2.querySelector('.last-letter');
  if (!(f1 && f2 && l1 && l2)) return;
  const f1Box = f1.getBoundingClientRect();
  const f2Box = f2.getBoundingClientRect();
  const l1Box = l1.getBoundingClientRect();
  const l2Box = l2.getBoundingClientRect();
  // distance needed to align first letters (move line2 so its first letter x matches line1 first letter x)
  let firstAlignDelta = f1Box.x - f2Box.x;
  // distance needed to align last letters
  let lastAlignDelta = l1Box.right - l2Box.right;
  firstAlignDelta = Math.round(firstAlignDelta * 2) / 2;
  lastAlignDelta = Math.round(lastAlignDelta * 2) / 2;
  centerTextRef.current.style.setProperty('--line2-first-delta', firstAlignDelta + 'px');
  centerTextRef.current.style.setProperty('--line2-last-delta', lastAlignDelta + 'px');
    };
    computeShift();
    // Recompute after fonts load (if supported)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(computeShift).catch(()=>{});
    } else {
      // Fallback: slight delay
      setTimeout(computeShift, 500);
    }
    window.addEventListener('resize', computeShift);
    return () => window.removeEventListener('resize', computeShift);
  }, []);

  useEffect(() => {
    if (stage === STAGES.LANDING && landingRef.current) {
      console.log('DEBUG: line1Ref', line1Ref.current);
      console.log('DEBUG: line2Ref', line2Ref.current);
      const ctx = gsap.context(() => {
        // Set initial states with enhanced positioning from example site
        gsap.set([headingRef.current, leftChevronRef.current, rightChevronRef.current], { 
          autoAlpha: 0, 
          y: "-10%",
          x: "-200%"
        });
        
        // Create timeline with enhanced animations from example site
        const tl = gsap.timeline();
        
        // Animate entrance with power4.out easing (from example site)
        tl.to([leftChevronRef.current, rightChevronRef.current], {
          x: 0,
          autoAlpha: 1,
          duration: 1.5,
          ease: "power4.out",
          stagger: 0.1
        })
        .to([leftChevronRef.current, rightChevronRef.current], {
          y: "0%",
          duration: 1,
          ease: "elastic.out(1,0.3)",
          stagger: 0.05
        }, "-=0.8")
        .to(headingRef.current, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          duration: 1.2,
          ease: "power4.out"
        }, "-=1.2")
        .fromTo(line1Ref.current, {
          opacity: 0,
          x: -80
        }, {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: "power4.out"
        }, "-=0.8")
        .fromTo(line2Ref.current, {
          opacity: 0,
          x: 80
        }, {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: "power4.out"
        }, "-=1.0");
        
      }, landingRef);
      return () => ctx.revert();
    }
  }, [stage]);

  return (
    <div className="app">
      <div className="background-pattern">
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <defs>
            <pattern id="leftDiagonal" patternUnits="userSpaceOnUse" width="30" height="30">
              <path d="M0,30 L30,0" stroke="#e0e0e0" strokeWidth="1" opacity="0.3" />
            </pattern>
            <pattern id="rightDiagonal" patternUnits="userSpaceOnUse" width="30" height="30">
              <path d="M0,0 L30,30" stroke="#e0e0e0" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="50%" height="100%" fill="url(#leftDiagonal)" />
          <rect x="50%" y="0" width="50%" height="100%" fill="url(#rightDiagonal)" />
        </svg>
      </div>

      <header className="header">
        <div className="header-left">
          <h1 className="logo" onClick={goHome} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'){goHome();}}}>SKINSTRIC</h1>
          <div className="intro-bracket-container">
            <span className="bracket-left" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>[</span>
            <span className="intro-text" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>INTRO</span>
            <span className="bracket-right" style={{fontFamily: 'Roobert TRIAL, Inter, sans-serif'}}>] </span>
          </div>
        </div>
        <button className="enter-code-btn">ENTER CODE</button>
      </header>

      {stage === STAGES.INTRO && (
        <div className="analysis-text">TO START ANALYSIS</div>
      )}

      {(stage === STAGES.UPLOAD || stage === STAGES.SELFIE || stage === STAGES.RESULTS || stage === STAGES.SELECTION) && (
        <div className="analysis-text">ANALYSIS IN PROGRESS</div>
      )}

      {stage === STAGES.LANDING && (
        <>
          {/* Hidden SVG paths for motion */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <path id="slidePathRight" d="M0 0 C 60 -10, 135 -10, 195 0" fill="none" />
            <path id="slidePathLeft" d="M0 0 C -60 -10, -135 -10, -195 0" fill="none" />
          </svg>
          
          {/* Original diamond shapes - completely independent */}
          <img src="/images/ui-elements/Rectangle 2779.svg" alt="" className="diamond-shape-left" ref={leftDiamondRef} />
          <img src="/images/ui-elements/Rectangle 2778.svg" alt="" className="diamond-shape-right" ref={rightDiamondRef} />
          
          <div className="main-content" ref={landingRef}>
            <div 
              className="sidebar sidebar-left" 
              ref={leftChevronRef}
              onMouseEnter={() => handleLeftHover(true)}
              onMouseLeave={() => handleLeftHover(false)}
            >
              <div className="diamond-button">
                <div className="diamond"><span className="diamond-arrow left" /></div>
              </div>
              <span className="sidebar-text">DISCOVER A.I.</span>
            </div>
            <div className="center-text" ref={centerTextRef}>
              <h2 className="main-heading" ref={headingRef}>
                <span className="line line1" ref={line1Ref}>
                  <span className="first-letter">S</span>ophisticate<span className="last-letter">d</span>
                </span>
                <span className="line-break"><br /></span>
                <span className="line line2" ref={line2Ref}>
                  <span className="first-letter">s</span>kincar<span className="last-letter">e</span>
                </span>
              </h2>
            </div>
            <div 
              className="sidebar sidebar-right" 
              ref={rightChevronRef} 
              onClick={goIntro} 
              role="button" 
              tabIndex={0} 
              onKeyDown={(e)=>{if(e.key==='Enter'){goIntro();}}}
              onMouseEnter={() => handleRightHover(true)}
              onMouseLeave={() => handleRightHover(false)}
            >
              <span className="sidebar-text">TAKE TEST</span>
              <div className="diamond-button"><div className="diamond"><span className="diamond-arrow right" /></div></div>
            </div>
          </div>
        </>
      )}

      {stage === STAGES.LANDING && (
        <div className="bottom-description">
          <p className="description-text">SKINSTRIC DEVELOPED AN A.I. THAT CREATES A<br />HIGHLY-PERSONALIZED ROUTINE TAILORED TO<br />WHAT YOUR SKIN NEEDS.</p>
        </div>
      )}

      {stage === STAGES.INTRO && (
        <IntroFlow 
          onComplete={handleIntroComplete}
        />
      )}

      {stage === STAGES.SELECTION && (
        <CameraGallerySelection 
          onBack={handleBack}
          onCameraSelect={handleCameraSelect}
          onGallerySelect={handleGallerySelect}
          userData={userData}
        />
      )}

      {stage === STAGES.UPLOAD && (
        <ImageUpload 
          onComplete={handleUploadComplete}
          onBack={handleBack}
          userData={userData}
        />
      )}

      {stage === STAGES.SELFIE && (
        <SelfieCapture 
          onComplete={handleSelfieComplete}
          onBack={handleBack}
          userData={userData}
        />
      )}

      {stage === STAGES.RESULTS && (
        <FinalResults 
          onComplete={handleResultsComplete}
          onBack={handleBack}
          onGoHome={handleGoHome}
          userData={userData}
        />
      )}

      {stage === STAGES.FORM && (
        <div className="form-overlay" role="dialog" aria-modal="true">
          <CustomerForm 
            onBack={handleBack} 
            onProceed={handleFormComplete} 
          />
        </div>
      )}

      {/* Floating Back Button for Intro Stage */}
      {stage === STAGES.INTRO && (
        <div className="back-floating">
          <div className="diamond-button" onClick={handleBack}>
            <div className="diamond">
              <span className="diamond-arrow left"></span>
            </div>
          </div>
          <span>BACK</span>
        </div>
      )}

      {/* Floating Back Button for Selection Stage */}
      {stage === STAGES.SELECTION && (
        <div className="back-floating">
          <div className="diamond-button" onClick={handleBack}>
            <div className="diamond">
              <span className="diamond-arrow left"></span>
            </div>
          </div>
          <span>BACK</span>
        </div>
      )}
    </div>
  );
}
