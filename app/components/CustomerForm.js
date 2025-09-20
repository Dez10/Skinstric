"use client";
import React from "react";
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';

export default function CustomerForm() {
  const { identity } = useJourney();
  const router = useRouter();

  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[762px] md:h-[762px] animate-spin-slow rotate-190 pointer-events-none">
        <div className="w-full h-full border border-gray-300 rotate-45 opacity-20"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[682px] md:h-[682px] animate-spin-slower rotate-185 pointer-events-none">
        <div className="w-full h-full border border-gray-400 rotate-45 opacity-30"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[602px] md:h-[602px] animate-spin-slowest pointer-events-none">
        <div className="w-full h-full border border-gray-500 rotate-45 opacity-40"></div>
      </div>
      <div className="form-panel" aria-labelledby="confirmTitle">
        <h2 id="confirmTitle" className="form-title">Confirm Your Information</h2>
  <p style={{marginBottom:24}}>We&#39;ve already captured this info. If it looks correct, continue. If not, you can go back and edit.</p>
        <div className="form-group">
          <label className="form-label">Name</label>
          <div className="form-static-value">{identity.name || '—'}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <div className="form-static-value">{identity.location || '—'}</div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/intro')}>Edit</button>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/select')}>Continue</button>
        </div>
      </div>
    </>
  );
}
