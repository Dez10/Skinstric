"use client";
import SelfieCapture from '../../components/SelfieCapture';
import GlobalFooterGuidelines from '../../components/GlobalFooterGuidelines';
import { useRequireIdentity } from '../../components/guards';
import BackFloating from '../../components/BackFloating';

export default function CameraCapturePage() {
  useRequireIdentity();
  return (
    <div className="relative w-full h-full flex flex-col flex-1">
      <SelfieCapture autoStart fullScreen />
      <BackFloating to="/select" light />
      <div className="guidelines-fixed-pos">
        <GlobalFooterGuidelines light />
      </div>
    </div>
  );
}
