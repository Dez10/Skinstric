"use client";
import React, { useEffect, useState } from "react";

// Validation regex - only letters, spaces, apostrophes, and hyphens allowed
const nameRegex = /^[A-Za-z\s'-]+$/;
const locationRegex = /^[A-Za-z\s'-]+$/;

export default function CustomerForm({ onBack, onProceed }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Always start with blank fields when mounting the form
  useEffect(() => {
    setName("");
    setLocation("");
    setErrors({});
    setSuccess("");
  }, []);

  const validate = () => {
    const newErrors = {};
    
    // Check if name is provided and valid
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!nameRegex.test(name.trim())) {
      newErrors.name = "Please enter a valid name (letters only, no numbers).";
    }
    
    // Check if location is provided and valid
    if (!location.trim()) {
      newErrors.location = "Location is required.";
    } else if (!locationRegex.test(location.trim())) {
      newErrors.location = "Please enter a valid location (letters only, no numbers).";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    setSuccess("");
    
    try {
      const payload = { 
        name: name.trim(), 
        location: location.trim() 
      };
      
  // Do not store full form payload in localStorage (privacy requirement)
      
      console.log("Submitting payload:", payload);
      console.log("API URL:", "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne");
      
      // Submit to the provided API endpoint
      const response = await fetch("https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      // Check for various success indicators
      if (result.SUCCUSS || result.SUCCESS || result.success || result.status === 'success') {
        const message = result.SUCCUSS || result.SUCCESS || result.success || result.message || "Data submitted successfully!";
        setSuccess(message);
        // Call onProceed after successful submission
        setTimeout(() => {
          onProceed && onProceed(payload);
        }, 1500);
      } else if (result.error || result.ERROR) {
        throw new Error(result.error || result.ERROR);
      } else {
        // Log the actual response structure for debugging
        console.warn("Unexpected response structure:", result);
        setSuccess("Data submitted successfully!"); // Assume success if no error
        setTimeout(() => {
          onProceed && onProceed(payload);
        }, 1500);
      }
      
    } catch (err) {
      console.error("Form submission error:", err);
      setErrors({ api: "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Spinning diamonds from example site - for form pages */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[762px] md:h-[762px] animate-spin-slow rotate-190 pointer-events-none">
        <div className="w-full h-full border border-gray-300 rotate-45 opacity-20"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[682px] md:h-[682px] animate-spin-slower rotate-185 pointer-events-none">
        <div className="w-full h-full border border-gray-400 rotate-45 opacity-30"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[602px] md:h-[602px] animate-spin-slowest pointer-events-none">
        <div className="w-full h-full border border-gray-500 rotate-45 opacity-40"></div>
      </div>
      
  <form className="form-panel" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} aria-labelledby="formTitle" autoComplete="off">
      <h2 id="formTitle" className="form-title">Customer Information</h2>
      
      {/* Success Message */}
      {success && (
        <div className="success-message" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="nameInput" className="form-label">Name *</label>
        <input 
          id="nameInput" 
          type="text" 
          className={`form-input ${errors.name ? 'error' : ''}`}
          value={name} 
          onChange={e => setName(e.target.value)} 
          disabled={loading} 
          autoComplete="off"
          placeholder="Enter your full name"
          required
        />
        {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
      </div>
      
      <div className="form-group">
        <label htmlFor="locationInput" className="form-label">Location *</label>
        <input 
          id="locationInput" 
          type="text" 
          className={`form-input ${errors.location ? 'error' : ''}`}
          value={location} 
          onChange={e => setLocation(e.target.value)} 
          disabled={loading} 
          autoComplete="off"
          placeholder="Enter your city or location"
          required
        />
        {errors.location && <p className="error-text" role="alert">{errors.location}</p>}
      </div>
      
      {/* API Error Message */}
      {errors.api && (
        <div className="error-message" role="alert">
          <p>{errors.api}</p>
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onBack} 
          disabled={loading}
        >
          Back
        </button>
        {/* Proceed removed: Enter key submits */}
      </div>
    </form>
    </>
  );
}
