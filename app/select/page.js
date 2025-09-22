"use client";
import CameraGallerySelection from '../components/CameraGallerySelection';
import { useRequireIdentity } from '../components/guards';
import BackFloating from '../components/BackFloating';

export default function SelectPage() {
  useRequireIdentity();
  return (
    <>
      <div className="h-[72px]" aria-hidden="true" />
      <div
        className="analysis-text"
        style={{ position: 'fixed', top: '72px', left: '60px', zIndex: 20 }}
      >
        TO START ANALYSIS
      </div>
      <CameraGallerySelection />
      <BackFloating to="/intro" />
    </>
  );
}
