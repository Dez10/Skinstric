"use client";
import ImageUpload from '../components/ImageUpload';
import { useRequireIdentity } from '../components/guards';
import BackFloating from '../components/BackFloating';

export default function UploadPage(){
  useRequireIdentity();
  return (
    <>
      <ImageUpload />
      <BackFloating to="/select" />
    </>
  );
}
