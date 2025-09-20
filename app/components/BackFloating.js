"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackFloating({ to, light = false }) {
  const router = useRouter();
  const handleBack = () => {
    if (to) router.push(to);
    else if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/');
  };
  return (
    <div className={`back-floating ${light ? 'back-floating--light' : ''}`}>
      <div className="diamond-button" onClick={handleBack}>
        <div className="diamond">
          <span className="diamond-arrow left"></span>
        </div>
      </div>
      <span>BACK</span>
    </div>
  );
}
