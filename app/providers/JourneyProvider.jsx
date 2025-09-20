"use client";
import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';

// Shape reference (aligns with technical requirements phases 1-3)
// identity: { name, location }
// acquisition: { type: 'upload'|'selfie'|null, imageDataUrl?, fileName? }
// demographics: { raw: { race, age, gender }, selected: { race, age, gender } }
// meta: { startedAt, lastUpdated }

const JourneyContext = createContext(null);
const STORAGE_KEY = 'skinstric_journey_v1';

function loadStored() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

export function JourneyProvider({ children }) {
  const [identity, setIdentity] = useState({ name: '', location: '' });
  const [acquisition, setAcquisition] = useState({ type: null, imageDataUrl: null, fileName: null });
  const [demographics, setDemographics] = useState({ raw: null, selected: { race: null, age: null, gender: null } });
  const [meta, setMeta] = useState({ startedAt: Date.now(), lastUpdated: Date.now() });
  const hydrated = useRef(false);

  // hydrate once
  useEffect(() => {
    if (hydrated.current) return;
    const stored = loadStored();
    if (stored) {
      if (stored.identity) setIdentity(stored.identity);
      if (stored.acquisition) setAcquisition(stored.acquisition);
      if (stored.demographics) setDemographics(stored.demographics);
      if (stored.meta) setMeta(stored.meta);
    }
    hydrated.current = true;
  }, []);

  const persist = useCallback((next) => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const updateMeta = useCallback(() => setMeta(m => ({ ...m, lastUpdated: Date.now() })), []);

  const setIdentitySafe = useCallback((data) => {
    setIdentity(prev => ({ ...prev, ...data }));
    updateMeta();
  }, [updateMeta]);

  const setAcquisitionSafe = useCallback((data) => {
    setAcquisition(prev => ({ ...prev, ...data }));
    updateMeta();
  }, [updateMeta]);

  const setDemographicsRaw = useCallback((raw) => {
    setDemographics(prev => ({ ...prev, raw }));
    updateMeta();
  }, [updateMeta]);

  const setSelectedAttributes = useCallback((selected) => {
    setDemographics(prev => ({ ...prev, selected: { ...prev.selected, ...selected } }));
    updateMeta();
  }, [updateMeta]);

  const resetJourney = useCallback(() => {
    const fresh = { name: '', location: '' };
    setIdentity(fresh);
    setAcquisition({ type: null, imageDataUrl: null, fileName: null });
    setDemographics({ raw: null, selected: { race: null, age: null, gender: null } });
    setMeta({ startedAt: Date.now(), lastUpdated: Date.now() });
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // persist on changes
  useEffect(() => {
    if (!hydrated.current) return; // avoid overwriting during hydrate
    const snapshot = { identity, acquisition, demographics, meta };
    persist(snapshot);
  }, [identity, acquisition, demographics, meta, persist]);

  const value = {
    identity,
    acquisition,
    demographics,
    meta,
    setIdentity: setIdentitySafe,
    setAcquisition: setAcquisitionSafe,
    setDemographicsRaw,
    setSelectedAttributes,
    resetJourney
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}
