
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

function Home() {
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
    
    const slideDistance = 195;
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
    
    const slideDistance = 195;
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
    if (stage === STAGES.LANDING && headingRef.current) {
      const ctx = gsap.context(() => {
        // Set initial state
        gsap.set(headingRef.current, { 
          opacity: 0, 
          y: 40 
        });
        
        // Animate entrance
        gsap.to(headingRef.current, { 
          opacity: 1, 
          y: 0, 
          duration: 1.2,
          ease: 'power4.out'
        });
        
      });
      return () => ctx.revert();
    }
  }, [stage]);

  return (
    <div className="antialiased text-[#1A1B1C]">
      {/* Header */}
      <div className="flex flex-row h-[64px] w-full justify-between py-3 mb-3 relative z-[1000]">
        <div className="flex flex-row pt-1 scale-75 justify-center items-center">
          <button 
            onClick={goHome}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors h-9 px-4 py-2 font-semibold text-sm mr-2 line-clamp-4 leading-[16px] text-[#1A1B1C] z-1000"
          >
            SKINSTRIC
          </button>
          <img 
            alt="left-bracket" 
            width="5" 
            height="19" 
            className="w-[4px] h-[17px]" 
            src="/images/ui-elements/bracket-left.png"
          />
          <p className="text-[#1a1b1c83] text-opacity-70 font-semibold text-sm ml-1.5 mr-1.5">
            INTRO
          </p>
          <img 
            alt="right-bracket" 
            width="5" 
            height="19" 
            className="w-[4px] h-[17px]" 
            src="/images/ui-elements/bracket-right.png"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mx-4 scale-[0.8] text-[#FCFCFC] text-[10px] bg-[#1A1B1C] leading-[16px]">
          ENTER CODE
        </button>
      </div>

      {stage === STAGES.LANDING && (
        <div className="max-sm:scale-[0.75] max-sm:origin-center max-sm:p-6">
          <div className="flex flex-col items-center justify-center h-[71vh] md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            
            {/* Mobile dotted squares */}
            <div className="absolute inset-0 flex items-center justify-center lg:hidden">
              <div className="w-[350px] h-[350px] border border-dotted border-[#A0A4AB] rotate-45 absolute top-1/2 left-1/2 -translate-x-[52%] -translate-y-1/2"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center lg:hidden">
              <div className="w-[420px] h-[420px] border border-dotted border-[#A0A4AB] rotate-45 absolute top-1/2 left-1/2 -translate-x-[52%] -translate-y-1/2"></div>
            </div>

            {/* Main heading */}
            <div id="main-heading" className="relative z-10 text-center">
              <h1 
                ref={headingRef}
                className="text-[60px] text-[#1A1B1C] lg:text-[100px] font-inter font-normal tracking-tighter leading-none opacity-0"
              >
                Sophisticated
                <br />
                <span className="block text-[#1A1B1C]">skincare</span>
              </h1>
            </div>

            {/* Mobile description and button */}
            <p className="z-10 block lg:hidden w-[30ch] mt-4 text-[16px] font-semibold text-center text-muted-foreground text-[#1a1b1c83]">
              Skinstric developed an A.I. that creates a highly-personalized routine tailored to what your skin needs.
            </p>
            
            <div className="z-10 mt-4 lg:hidden">
              <button 
                onClick={goIntro}
                className="relative flex items-center gap-4 hover:scale-105 duration-300"
              >
                <span className="text-[12px] font-bold cursor-pointer">ENTER EXPERIENCE</span>
                <div className="w-[24px] h-[24px] border border-solid border-black rotate-45 cursor-pointer"></div>
                <span className="absolute left-[129px] scale-[0.5] hover:scale-60 duration-300">
                  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-black">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                </span>
              </button>
            </div>

            {/* Desktop bottom description */}
            <div className="hidden lg:block fixed bottom-[calc(-7vh)] left-[calc(-20vw)] xl:left-[calc(-27vw)] 2xl:left-[calc(-31vw)] font-normal text-sm text-[#1A1B1C] space-y-3 uppercase">
              <p>
                Skinstric developed an A.I. that creates a<br />
                highly-personalized routine tailored to<br />
                what your skin needs.
              </p>
            </div>

            {/* Left section - DISCOVER A.I. */}
            <div 
              id="left-section" 
              className="hidden lg:block fixed left-[calc(-53vw)] xl:left-[calc(-50vw)] top-1/2 -translate-y-1/2 w-[500px] h-[500px] transition-opacity duration-500 ease-in-out opacity-100"
            >
              <div className="relative w-full h-full">
                <div className="w-full h-full border border-dotted border-[#A0A4AB] rotate-45 fixed inset-0"></div>
                <button 
                  id="discover-button"
                  onMouseEnter={() => handleLeftHover(true)}
                  onMouseLeave={() => handleLeftHover(false)}
                  className="group inline-flex items-center justify-center gap-4 whitespace-nowrap rounded-md text-sm font-normal text-[#1A1B1C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:opacity-50 h-9 absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/5 xl:translate-x-1/6 px-3 py-1"
                >
                  <div className="w-[30px] h-[30px] border border-solid border-black rotate-45 cursor-pointer group-hover:scale-110 duration-300"></div>
                  <span className="absolute left-[18px] top-[8px] scale-[0.9] rotate-180 group-hover:scale-105 duration-300">▶</span>
                  <span>DISCOVER A.I.</span>
                </button>
              </div>
            </div>

            {/* Right section - TAKE TEST */}
            <div 
              id="right-section" 
              className="hidden lg:block fixed top-1/2 right-[calc(-53vw)] xl:right-[calc(-50vw)] -translate-y-1/2 w-[500px] h-[500px] transition-opacity duration-500 ease-in-out opacity-100"
            >
              <div className="relative w-full h-full">
                <div className="w-full h-full border border-dotted border-[#A0A4AB] rotate-45 absolute inset-0"></div>
                <button 
                  id="take-test-button"
                  onClick={goIntro}
                  onMouseEnter={() => handleRightHover(true)}
                  onMouseLeave={() => handleRightHover(false)}
                  className="group inline-flex items-center justify-center gap-4 whitespace-nowrap rounded-md text-sm font-normal text-[#1A1B1C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:opacity-50 h-9 absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/5 xl:-translate-x-1/6 px-3 py-1"
                >
                  TAKE TEST
                  <div className="w-[30px] h-[30px] border border-solid border-black rotate-45 group-hover:scale-110 duration-300"></div>
                  <span className="absolute left-[107px] top-[9px] scale-[0.9] cursor-pointer group-hover:scale-105 duration-300">▶</span>
                </button>
              </div>
            </div>

          </div>
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
        />
      )}

      {stage === STAGES.UPLOAD && (
        <ImageUpload 
          onBack={handleBack}
          onComplete={handleUploadComplete}
          userData={userData}
        />
      )}

      {stage === STAGES.SELFIE && (
        <SelfieCapture 
          onBack={handleBack}
          onComplete={handleSelfieComplete}
          userData={userData}
        />
      )}

      {stage === STAGES.RESULTS && (
        <FinalResults 
          onBack={handleBack}
          onNext={handleResultsComplete}
          onGoHome={handleGoHome}
          userData={userData}
        />
      )}

      {stage === STAGES.FORM && (
        <CustomerForm 
          onBack={handleBack}
          onProceed={handleFormComplete}
          initialName={userData?.name}
          initialLocation={userData?.location}
        />
      )}
    </div>
  );
}

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
            initialName={userData?.name || ''}
            initialLocation={userData?.location || ''}
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
    </div>
  );
}

export default Home;
