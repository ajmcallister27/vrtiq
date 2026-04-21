import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeRatingMode } from './ratingMode';

const STORAGE_KEY = 'vrtIQ_rating_mode';

const RatingModeContext = createContext(null);

function getInitialRatingMode() {
  if (typeof window === 'undefined') {
    return 'ski';
  }

  return normalizeRatingMode(window.localStorage.getItem(STORAGE_KEY));
}

export function RatingModeProvider({ children }) {
  const [ratingMode, setRatingModeState] = useState(getInitialRatingMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, ratingMode);
  }, [ratingMode]);

  const setRatingMode = (nextMode) => {
    setRatingModeState(normalizeRatingMode(nextMode));
  };

  const value = useMemo(() => ({
    ratingMode,
    setRatingMode,
  }), [ratingMode]);

  return (
    <RatingModeContext.Provider value={value}>
      {children}
    </RatingModeContext.Provider>
  );
}

export function useRatingMode() {
  const context = useContext(RatingModeContext);
  if (!context) {
    throw new Error('useRatingMode must be used within a RatingModeProvider');
  }

  return context;
}
