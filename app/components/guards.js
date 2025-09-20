"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJourney } from '../providers/JourneyProvider.jsx';

// Require identity (name + location) before continuing
export function useRequireIdentity() {
  const { identity } = useJourney();
  const router = useRouter();
  useEffect(() => {
    if (!identity?.name || !identity?.location) {
      router.replace('/intro');
    }
  }, [identity, router]);
}

// Require demographics (after image analysis) before continuing
export function useRequireDemographics() {
  const { identity, demographics } = useJourney();
  const router = useRouter();
  useEffect(() => {
    if (!identity?.name || !identity?.location) {
      router.replace('/intro');
      return;
    }
    if (!demographics?.raw) {
      router.replace('/select');
    }
  }, [identity, demographics, router]);
}
