"use client";
import CameraGallerySelection from '../components/CameraGallerySelection';
import { useRequireIdentity } from '../components/guards';
import BackFloating from '../components/BackFloating';

export default function SelectPage() {
  useRequireIdentity();
  return (
    <>
      <div className="h-[72px]" aria-hidden="true" />
      <h1
        className="analysis-text"
        style={{ position: 'relative', zIndex: 20, paddingLeft: '60px' }}
      >
        TO START ANALYSIS
      </h1>
      <CameraGallerySelection />
      <BackFloating to="/intro" />
    </>
  );
}
