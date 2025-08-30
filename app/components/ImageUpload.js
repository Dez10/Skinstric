"use client";
import React, { useState, useRef } from 'react';

export default function ImageUpload({ onBack, onComplete, userData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demographics, setDemographics] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data:image/jpeg;base64, prefix to get just the base64 string
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(selectedFile);
      console.log('Base64 length:', base64Image.length);
      console.log('Base64 sample:', base64Image.substring(0, 100) + '...');

      let result;
      
      // Try first format: lowercase 'image'
      try {
        const payload1 = {
          image: base64Image
        };
        console.log('Trying payload with lowercase "image" key');

        const response1 = await fetch('https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload1)
        });

        if (response1.ok) {
          result = await response1.json();
          console.log('Success with lowercase "image" key:', result);
        } else {
          const errorText1 = await response1.text();
          console.log('First attempt failed:', response1.status, errorText1);
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
            console.log('Success with uppercase "Image" key:', result);
          } else {
            const errorText2 = await response2.text();
            console.log('Second attempt failed:', response2.status, errorText2);
            throw new Error('Try next format');
          }
        } catch (secondAttemptError) {
          console.log('Trying third format: full data URL');
          
          // Try third format: full data URL
          const payload3 = {
            Image: `data:${selectedFile.type};base64,${base64Image}`
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
            console.error('All attempts failed. Final error:', response3.status, errorText3);
            throw new Error(`Analysis failed: ${response3.status} ${response3.statusText} - ${errorText3}`);
          }

          result = await response3.json();
          console.log('Success with data URL format:', result);
        }
      }

      // Process the result
      processApiResult(result);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to process API result
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

  // Sort and format scores to 2 decimal places
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
    onComplete({
      ...userData,
      imageFile: selectedFile,
      imagePreview: imagePreview,
      demographics: demographics,
      selectedAttributes: selectedAttributes
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-content">
        <h2 className="upload-heading">Upload Your Image</h2>
        
        {/* Image Upload Section */}
        <div className="upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!imagePreview ? (
            <div className="upload-area" onClick={triggerFileInput}>
              <div className="upload-icon">📁</div>
              <p>Click to select an image</p>
              <p className="upload-hint">Supports JPG, PNG, GIF (max 10MB)</p>
            </div>
          ) : (
            <div className="image-preview-section">
              <img src={imagePreview} alt="Selected" className="image-preview" />
              <button 
                className="btn btn-secondary" 
                onClick={triggerFileInput}
                disabled={isAnalyzing}
              >
                Change Image
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message"><p>{error}</p></div>}

        {/* Analyze Button */}
        {selectedFile && !demographics && (
          <div className="analyze-section">
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}

        {/* Demographics Results */}
        {demographics && (
          <div className="demographics-section">
            <h3>Demographics Analysis</h3>
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
        )}

        {/* Navigation */}
        <div className="upload-actions">
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          {demographics && (
            <button className="btn btn-primary" onClick={handleProceed}>
              Proceed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
