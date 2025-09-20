"use client";
import IntroFlow from '../components/IntroFlow';
import BackFloating from '../components/BackFloating';

export default function IntroPage() {
  return (
    <>
      <div className="h-[72px]" aria-hidden="true" />
      <div
        className="analysis-text"
        style={{ position: 'relative', zIndex: 20, paddingLeft: '60px' }}
      >
        TO START ANALYSIS
      </div>
      <IntroFlow />
      <BackFloating to="/" />
    </>
  );
}
