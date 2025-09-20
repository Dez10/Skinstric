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
        style={{ position: 'relative', zIndex: 20, paddingLeft: '60px' }}
      >
        TO START ANALYSIS
      </div>
      <CameraGallerySelection />
      <BackFloating to="/intro" />
    </>
  );
}
