"use client";
import React, { useState } from 'react';

export default function FinalResults({ onBack, onComplete, onGoHome, userData }) {
  const [showFloatInfo, setShowFloatInfo] = useState(false);
  const handleAllowCamera = () => {
    setShowFloatInfo(false);
    window.location.href = '/camera';
  };
  const [selectedAttributes, setSelectedAttributes] = useState({
    race: null,
    age: null,
    gender: null
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [error, setError] = useState('');

  // Extract the API response data according to Phase 2 structure
  const analysisData = userData?.analysisResults?.data || {};
  const { race = {}, age = {}, gender = {} } = analysisData;

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
      const accountData = {
        name: userData.name,
        location: userData.location,
        analysisResults: userData.analysisResults,
        userSelectedAttributes: selectedAttributes,
        timestamp: new Date().toISOString()
      };

      // Simulate API call for account creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(accountData);

    } catch (error) {
      console.error('Account creation error:', error);
      setError('Failed to create account. Please try again.');
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
        
        {/* Camera Icon and Info Card Trigger */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px', gap: '64px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => setShowFloatInfo(true)}>
              <img src="/images/ui-elements/011.svg" alt="Camera Icon" style={{ width: '96px', height: '96px' }} />
            </div>
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '18px', letterSpacing: '1px' }}>ALLOW A.I.<br />TO SCAN YOUR FACE</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ cursor: 'pointer', display: 'inline-block' }}>
              <img src="/images/ui-elements/014.svg" alt="Gallery Icon" style={{ width: '96px', height: '96px' }} />
            </div>
            <div style={{ marginTop: '12px', fontWeight: 600, fontSize: '18px', letterSpacing: '1px' }}>ALLOW A.I.<br />ACCESS GALLERY</div>
          </div>
        </div>
        {/* Demographics Section */}
        <div className="demographics-section">
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

        {/* Navigation buttons matching example site */}
        <div className="results-navigation">
          <button 
            className="back-button" 
            onClick={onBack}
            disabled={isCreatingAccount}
          >
            ▶ BACK
          </button>
          
          <button 
            className="home-button" 
            onClick={onGoHome}
          >
            🏠 HOME
          </button>
          
          {hasAnalysisData && (
            <button 
              className="summary-button" 
              onClick={handleGetSummary}
              disabled={isCreatingAccount}
            >
              {isCreatingAccount ? 'PROCESSING...' : 'GET SUMMARY ▶'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
