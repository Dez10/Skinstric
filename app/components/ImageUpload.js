"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';
import { analyzeImage } from '../../utils/analyzeImage.js';

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demographics, setDemographics] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { setAcquisition, setDemographicsRaw, setSelectedAttributes: setSelectedContext, acquisition } = useJourney();

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
      const base64Image = await convertToBase64(selectedFile);
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
      setAcquisition({ type: 'upload', imageDataUrl: imagePreview, fileName: selectedFile.name });
      setDemographicsRaw(normalized);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
    router.push('/result');
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
          <button className="btn btn-secondary" onClick={() => router.push('/select')} disabled={isAnalyzing}>Back</button>
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
