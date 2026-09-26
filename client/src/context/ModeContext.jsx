import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext({
  mode: 'DEMO',
  toggleMode: () => {},
  setMode: () => {},
});

export const ModeProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('aerostat_mode') || localStorage.getItem('vayusutra_mode');
    return (saved === 'LIVE' || saved === 'DEMO') ? saved : 'DEMO';
  });

  const toggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'LIVE' ? 'DEMO' : 'LIVE';
      localStorage.setItem('aerostat_mode', next);
      return next;
    });
  };

  const setMode = (newMode) => {
    localStorage.setItem('aerostat_mode', newMode);
    setModeState(newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(ModeContext);
