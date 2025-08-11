"use client";
import React, { useState } from "react";

const nameRegex = /^[A-Za-z\s'-]+$/;
const locationRegex = /^[A-Za-z\s'-]+$/;

export default function CustomerForm({ onBack, onProceed, initialName }) {
  const [name, setName] = useState(initialName || "");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name || !nameRegex.test(name)) newErrors.name = "Please enter a valid name (letters only).";
    if (!location || !locationRegex.test(location)) newErrors.location = "Please enter a valid location (letters only).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name, location };
      localStorage.setItem("customerData", JSON.stringify(payload));
      await fetch("https://us-central-api-skinstric-ai.cloudfunctions.net/skinstricPhaseOne", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onProceed && onProceed();
    } catch (err) {
      setErrors({ api: "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit} aria-labelledby="formTitle">
      <h2 id="formTitle" className="form-title">Customer Information</h2>
      <div className="form-group">
        <label htmlFor="nameInput" className="form-label">Name</label>
        <input id="nameInput" type="text" className="form-input" value={name} onChange={e=>setName(e.target.value)} disabled={loading} autoComplete="name" />
        {errors.name && <p className="error-text" role="alert">{errors.name}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="locationInput" className="form-label">Location</label>
        <input id="locationInput" type="text" className="form-input" value={location} onChange={e=>setLocation(e.target.value)} disabled={loading} autoComplete="address-level1" />
        {errors.location && <p className="error-text" role="alert">{errors.location}</p>}
      </div>
      {errors.api && <p className="error-text" role="alert">{errors.api}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={loading}>Back</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Submitting..." : "Proceed"}</button>
      </div>
    </form>
  );
}
