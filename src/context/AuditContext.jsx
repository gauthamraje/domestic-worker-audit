import React, { createContext, useContext, useState, useEffect } from 'react';

const AuditContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'domestic_worker_audit_v3';

export const AuditProvider = ({ children }) => {
  const loadState = () => {
    const defaults = {
      spots: [],
      currentSpot: null,
      isComplete: false,
      language: 'EN',
      userProfile: { name: "", phone: "" },
      phase: 'onboarding', // 'onboarding', 'profile', 'observation', 'audit', 'reflection'
      observationCount: 0,
      auditCount: 0,
      deviceId: `Ninja-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      sessionSavedDate: null,
      reflections: { r1: "", r2: "", r3: "" }
    };
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (e) { }
    return defaults;
  };

  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setLanguage = (lang) => setState(prev => ({ ...prev, language: lang }));
  const setPhase = (phase) => setState(prev => ({ ...prev, phase }));
  const updateProfile = (updates) => setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...updates } }));

  const startNewSpot = (phase, stopType = null) => {
    // Attempt to get location automatically
    const spotId = Date.now();
    setState(prev => ({
      ...prev,
      currentSpot: {
        id: spotId,
        phase,
        stopType,
        timestamp: new Date().toISOString(),
        answers: {},
        photo: null,
        location: null
      }
    }));

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setState(prev => {
          if (prev.currentSpot?.id === spotId) {
            return { ...prev, currentSpot: { ...prev.currentSpot, location: loc } };
          }
          return prev;
        });
      }, (error) => {
        console.error("Location error:", error);
      });
    }
  };

  const updateCurrentSpot = (updates) => {
    setState(prev => ({
      ...prev,
      currentSpot: { ...prev.currentSpot, ...updates }
    }));
  };

  const completeSpot = () => {
    setState(prev => {
      if (!prev.currentSpot) return prev; // Safety check
      const newSpots = [...prev.spots, prev.currentSpot];
      const isObservation = prev.currentSpot.phase === 'observation';
      return {
        ...prev,
        spots: newSpots,
        currentSpot: null,
        observationCount: (isObservation ? (prev.observationCount || 0) + 1 : (prev.observationCount || 0)),
        auditCount: (!isObservation ? (prev.auditCount || 0) + 1 : (prev.auditCount || 0))
      };
    });
  };

  const resetAudit = () => {
    setState(prev => ({
      ...prev,
      spots: [],
      currentSpot: null,
      isComplete: false,
      phase: 'onboarding',
      observationCount: 0,
      auditCount: 0,
      reflections: { r1: "", r2: "", r3: "" }
    }));
  };

  const submitToSheet = async (data, type = 'SPOT') => {
    const url = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!url) return { success: false };
    try {
      const payload = { 
        ...data, 
        type, 
        deviceId: state.deviceId, 
        userProfile: state.userProfile, 
        language: state.language 
      };
      await fetch(url, { method: 'POST', body: JSON.stringify([payload]) });
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  };

  return (
    <AuditContext.Provider value={{
      state,
      setLanguage,
      setPhase,
      updateProfile,
      startNewSpot,
      updateCurrentSpot,
      completeSpot,
      resetAudit,
      submitToSheet
    }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => useContext(AuditContext);
