import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PhaseContextType {
  phase: number;
  setPhase: (p: number) => void;
}

const PhaseContext = createContext<PhaseContextType>({ phase: 1, setPhase: () => {} });

export function PhaseProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<number>(() => {
    const saved = localStorage.getItem('knc_phase');
    return saved ? Number(saved) : 1;
  });

  const setPhase = (p: number) => {
    setPhaseState(p);
    localStorage.setItem('knc_phase', String(p));
  };

  return (
    <PhaseContext.Provider value={{ phase, setPhase }}>
      {children}
    </PhaseContext.Provider>
  );
}

export const usePhase = () => useContext(PhaseContext);
