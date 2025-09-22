"use client";
import SelfieCapture from '../../components/SelfieCapture';
import GlobalFooterGuidelines from '../../components/GlobalFooterGuidelines';
import { useRequireIdentity } from '../../components/guards';
import BackFloating from '../../components/BackFloating';

export default function CameraCapturePage() {
  useRequireIdentity();
  return (
  <div className="viewport-frame camera-capture">
      <div className="ar-2-1">
        <div className="analysis-canvas">
          <SelfieCapture autoStart fullScreen />
          <BackFloating to="/select" light />
          <div className="guidelines-fixed-pos">
            <GlobalFooterGuidelines light />
          </div>
        </div>
      </div>
    </div>
  );
}
