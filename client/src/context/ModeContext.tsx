import React, { createContext, useContext, useState, useEffect } from 'react';

type SystemMode = 'LIVE' | 'DEMO';

interface ModeContextType {
  mode: SystemMode;
  toggleMode: () => void;
  setMode: (mode: SystemMode) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: 'DEMO',
  toggleMode: () => {},
  setMode: () => {},
});

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SystemMode>(() => {
    const saved = localStorage.getItem('vayusutra_mode');
    return (saved === 'LIVE' || saved === 'DEMO') ? saved : 'DEMO';
  });

  const toggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'LIVE' ? 'DEMO' : 'LIVE';
      localStorage.setItem('vayusutra_mode', next);
      return next;
    });
  };

  const setMode = (newMode: SystemMode) => {
    localStorage.setItem('vayusutra_mode', newMode);
    setModeState(newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useSystemMode = () => useContext(ModeContext);
