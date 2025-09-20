"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';

export default function FinalResults() {
  const router = useRouter();
  const { demographics, setSelectedAttributes: setSelectedContext, acquisition, identity } = useJourney();
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({ race: null, age: null, gender: null });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState('demographics');
  const showDemographics = activePanel === 'demographics';

  const analysisData = demographics.raw || {};
  const { race = {}, age = {}, gender = {} } = analysisData;

  // hydrate local selection from context if present
  useEffect(() => {
    if (demographics.selected) {
      setSelectedAttributes(demographics.selected);
    }
  }, [demographics.selected]);

  // Sort and format demographic data in descending order to 2 decimal places
  const sortedRace = Object.entries(race)
    .sort(([,a], [,b]) => b - a)
    .map(([key, value]) => ({ 
      key, 
      value, 
      percentage: (value * 100).toFixed(2) 
    }));

  const sortedAge = Object.entries(age)
    .sort(([,a], [,b]) => b - a)
    .map(([key, value]) => ({ 
      key, 
      value, 
      percentage: (value * 100).toFixed(2) 
    }));

  const sortedGender = Object.entries(gender)
    .sort(([,a], [,b]) => b - a)
    .map(([key, value]) => ({ 
      key, 
      value, 
      percentage: (value * 100).toFixed(2) 
    }));

  // Handle clicking on a score to update user's actual attribute
  const handleAttributeSelect = (category, attribute) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [category]: attribute
    }));
  };

  const handleGetSummary = async () => {
    setIsCreatingAccount(true);
    setError('');
    try {
      // Placeholder future summary generation or navigation
      await new Promise(r => setTimeout(r, 800));
      router.push('/summary');
    } catch (err) {
      console.error('Summary generation error:', err);
      setError('Failed to generate summary.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const hasAnalysisData = sortedRace.length > 0 || sortedAge.length > 0 || sortedGender.length > 0;

  return (
    <div className="results-page">
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="camera-permission-title"
            style={{
              width: '480px',
              maxWidth: '90vw',
              background: '#0f0f0f',
              color: '#fff',
              borderRadius: '4px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
              overflow: 'hidden'
            }}
          >
            <div id="camera-permission-title" style={{
              padding: '18px 24px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              ALLOW A.I. TO ACCESS YOUR CAMERA
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)' }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px'
            }}>
              <button
                type="button"
                onClick={() => setShowFloatInfo(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9aa0a6',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '10px 12px'
                }}
              >
                Deny
              </button>

              <button
                type="button"
                onClick={handleAllowCamera}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '10px 12px'
                }}
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Spinning diamonds from example site - for processing/results page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[762px] md:h-[762px] animate-spin-slow rotate-190 pointer-events-none">
        <div className="w-full h-full border border-gray-300 rotate-45 opacity-20"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[682px] md:h-[682px] animate-spin-slower rotate-185 pointer-events-none">
        <div className="w-full h-full border border-gray-400 rotate-45 opacity-30"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[602px] md:h-[602px] animate-spin-slowest pointer-events-none">
        <div className="w-full h-full border border-gray-500 rotate-45 opacity-40"></div>
      </div>
      
      <div className="results-content">
        
        {/* Header matching example site */}
        <h1 className="results-title">A.I. ANALYSIS</h1>
        
        {/* Subheading and diamond grid */}
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'left', padding: '0 20px' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, letterSpacing: '0.08em', fontWeight: 700 }}>A.I. HAS ESTIMATED THE FOLLOWING.</div>
            <div style={{ fontSize: 14, letterSpacing: '0.08em', fontWeight: 700 }}>FIX ESTIMATED INFORMATION IF NEEDED.</div>
          </div>

          {/* Diamond Grid */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '40px 0 20px' }}>
            <div style={{ position: 'relative', width: 360, height: 360 }}>
              {/* Top (Demographics) */}
              <button
                onClick={() => setActivePanel('demographics')}
                style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, 0) rotate(45deg)',
                  width: 160, height: 160, background: '#eef1f5', border: 'none', cursor: 'pointer',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
                }}
              >
                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', fontWeight: 700, letterSpacing: '0.06em' }}>
                  DEMOGRAPHICS
                </span>
              </button>

              {/* Left (Cosmetic Concerns) */}
              <button
                disabled
                style={{
                  position: 'absolute', top: '50%', left: 0, transform: 'translate(0, -50%) rotate(45deg)',
                  width: 160, height: 160, background: '#eef1f5', border: 'none', cursor: 'not-allowed',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
                }}
                title="Coming soon"
              >
                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', fontWeight: 700, letterSpacing: '0.06em' }}>
                  COSMETIC<br/>CONCERNS
                </span>
              </button>

              {/* Right (Skin Type Details) */}
              <button
                disabled
                style={{
                  position: 'absolute', top: '50%', right: 0, transform: 'translate(0, -50%) rotate(45deg)',
                  width: 160, height: 160, background: '#eef1f5', border: 'none', cursor: 'not-allowed',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
                }}
                title="Coming soon"
              >
                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', fontWeight: 700, letterSpacing: '0.06em' }}>
                  SKIN TYPE<br/>DETAILS
                </span>
              </button>

              {/* Bottom (Weather) */}
              <button
                disabled
                style={{
                  position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 0) rotate(45deg)',
                  width: 160, height: 160, background: '#eef1f5', border: 'none', cursor: 'not-allowed',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
                }}
                title="Coming soon"
              >
                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', fontWeight: 700, letterSpacing: '0.06em' }}>
                  WEATHER
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* Demographics Section */}
        <div className="demographics-section" style={{ display: showDemographics ? 'block' : 'none' }}>
          <h2 className="demographics-title">DEMOGRAPHICS</h2>
          <h3 className="demographics-subtitle">PREDICTED RACE & AGE</h3>

          {!hasAnalysisData ? (
            <div className="no-data-message">
              <p>No analysis data found. Please upload an image first.</p>
              <p>Go to Upload Page or take a Picture with your device</p>
            </div>
          ) : (
            <div className="demographics-results">
              {/* Race Results */}
              {sortedRace.length > 0 && (
                <div className="demographic-group">
                  <h4 className="group-title">Race</h4>
                  <div className="scores-container">
                    {sortedRace.map(({ key, percentage }) => (
                      <div 
                        key={key}
                        className={`score-row ${selectedAttributes.race === key ? 'selected' : ''}`}
                        onClick={() => handleAttributeSelect('race', key)}
                      >
                        <span className="score-name">{key}</span>
                        <span className="score-percent">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age Results */}
              {sortedAge.length > 0 && (
                <div className="demographic-group">
                  <h4 className="group-title">Age</h4>
                  <div className="scores-container">
                    {sortedAge.map(({ key, percentage }) => (
                      <div 
                        key={key}
                        className={`score-row ${selectedAttributes.age === key ? 'selected' : ''}`}
                        onClick={() => handleAttributeSelect('age', key)}
                      >
                        <span className="score-name">{key}</span>
                        <span className="score-percent">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender Results */}
              {sortedGender.length > 0 && (
                <div className="demographic-group">
                  <h4 className="group-title">Gender</h4>
                  <div className="scores-container">
                    {sortedGender.map(({ key, percentage }) => (
                      <div 
                        key={key}
                        className={`score-row ${selectedAttributes.gender === key ? 'selected' : ''}`}
                        onClick={() => handleAttributeSelect('gender', key)}
                      >
                        <span className="score-name">{key}</span>
                        <span className="score-percent">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Corner navigation to match example */}
        <div>
          <div style={{ position: 'fixed', left: 24, bottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.back()}
              disabled={isCreatingAccount}
              style={{
                width: 34, height: 34, transform: 'rotate(45deg)', border: '1px solid #111',
                background: '#fff', cursor: 'pointer'
              }}
              aria-label="Back"
            >
              <span style={{ display: 'inline-block', transform: 'rotate(-45deg)', fontSize: 14 }}>◄</span>
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>BACK</span>
          </div>

          {hasAnalysisData && (
            <div style={{ position: 'fixed', right: 24, bottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>
                {isCreatingAccount ? 'PROCESSING...' : 'GET SUMMARY'}
              </span>
              <button
                onClick={handleGetSummary}
                disabled={isCreatingAccount}
                style={{
                  width: 34, height: 34, transform: 'rotate(45deg)', border: '1px solid #111',
                  background: '#fff', cursor: 'pointer'
                }}
                aria-label="Get summary"
              >
                <span style={{ display: 'inline-block', transform: 'rotate(-45deg)', fontSize: 14 }}>►</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
