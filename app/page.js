"use client";
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CustomerForm from './components/CustomerForm';

const STAGES = { LANDING: 'landing', INTRO: 'intro', FORM: 'form' };

export default function Home() {
  const [stage, setStage] = useState(STAGES.LANDING);
  const [introName, setIntroName] = useState('');
  const landingRef = useRef(null);
  const headingRef = useRef(null);
  const leftChevronRef = useRef(null);
  const rightChevronRef = useRef(null);
  const introWrapperRef = useRef(null);
  const handleBack = () => {
    if (stage === STAGES.FORM) setStage(STAGES.INTRO);
    else if (stage === STAGES.INTRO) setStage(STAGES.LANDING);
  };
  const handleProceed = () => { setStage(STAGES.LANDING); };
  const goIntro = () => setStage(STAGES.INTRO);
  const openForm = () => setStage(STAGES.FORM);

  useEffect(() => {
    if (stage === STAGES.FORM) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [stage]);

  useEffect(() => {
    if (stage === STAGES.LANDING && landingRef.current) {
      const ctx = gsap.context(() => {
        gsap.set([headingRef.current, leftChevronRef.current, rightChevronRef.current], { autoAlpha:0, y:40 });
        gsap.timeline({ defaults:{ ease:'power3.out' }})
          .to(headingRef.current, { autoAlpha:1, y:0, duration:0.8 })
          .to([leftChevronRef.current, rightChevronRef.current], { autoAlpha:1, y:0, duration:0.6, stagger:0.1 }, '-=0.4');
      }, landingRef);
      return () => ctx.revert();
    }
  }, [stage]);

  useEffect(() => {
    if (stage === STAGES.INTRO && introWrapperRef.current) {
      const ctx = gsap.context(() => {
        const squares = gsap.utils.toArray('.intro-square');
        gsap.set(squares, { autoAlpha:0, rotate:(i)=> gsap.getProperty(squares[i], 'rotate') });
        gsap.to(squares, { autoAlpha:0.6, duration:0.8, stagger:0.08, ease:'power2.out' });
      }, introWrapperRef);
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
          <h1 className="logo">sKINsTRIC</h1>
          <span className="intro-text">[ INTRO ]</span>
        </div>
        <button className="enter-code-btn">ENTER CODE</button>
      </header>

      {stage === STAGES.LANDING && (
        <div className="main-content" ref={landingRef}>
          <div className="sidebar sidebar-left" ref={leftChevronRef}>
            <div className="diamond-button">
              <div className="diamond"><span className="diamond-arrow left" /></div>
            </div>
            <span className="sidebar-text">DISCOVER A.I.</span>
          </div>
          <div className="center-text" ref={headingRef}>
            <h2 className="main-heading">Sophisticated<br />skincare</h2>
          </div>
          <div className="sidebar sidebar-right" ref={rightChevronRef} onClick={goIntro} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'){goIntro();}}}>
            <span className="sidebar-text">TAKE TEST</span>
            <div className="diamond-button"><div className="diamond"><span className="diamond-arrow right" /></div></div>
          </div>
        </div>
      )}

      {stage === STAGES.INTRO && (
        <div className="intro-wrapper" ref={introWrapperRef}>
          <div className="intro-stack">
            <div className="intro-square s1" />
            <div className="intro-square s2" />
            <div className="intro-square s3" />
            <div className="intro-square s4" />
          </div>
          <div className="intro-heading">
            <div className="intro-mini">CLICK TO TYPE</div>
            <input
              placeholder="Introduce Yourself"
              value={introName}
              onChange={(e)=> setIntroName(e.target.value)}
              onKeyDown={(e)=> { if(e.key==='Enter' && introName.trim()) openForm(); }}
            />
          </div>
          <div className="back-floating" onClick={handleBack} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'){handleBack();}}}>
            <div className="diamond-button"><div className="diamond"><span className="diamond-arrow left" /></div></div>
            <span className="sidebar-text">BACK</span>
          </div>
        </div>
      )}

      <div className="bottom-description">
        <p className="description-text">SKINSTRIC DEVELOPED AN A.I. THAT CREATES A<br />HIGHLY-PERSONALIZED ROUTINE TAILORED TO<br />WHAT YOUR SKIN NEEDS.</p>
      </div>

      {stage === STAGES.FORM && (
        <div className="form-overlay" role="dialog" aria-modal="true">
          <CustomerForm onBack={handleBack} onProceed={handleProceed} initialName={introName} />
        </div>
      )}
    </div>
  );
}
