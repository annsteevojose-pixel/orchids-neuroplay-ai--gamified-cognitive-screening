"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { MemoryResult, SafariResult, Assessment } from "@/lib/assessment";
import { getAssessment } from "@/lib/assessment";

interface GameState {
  age: number;
  setAge: (age: number) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  memoryResult: MemoryResult | null;
  setMemoryResult: (result: MemoryResult) => void;
  safariResult: SafariResult | null;
  setSafariResult: (result: SafariResult) => void;
  assessment: Assessment | null;
  computeAssessment: () => Assessment | null;
  memoryCompleted: boolean;
  safariCompleted: boolean;
  reset: () => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [age, setAge] = useState(10);
  const [playerName, setPlayerName] = useState("");
  const [memoryResult, setMemoryResultState] = useState<MemoryResult | null>(null);
  const [safariResult, setSafariResultState] = useState<SafariResult | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  const setMemoryResult = (result: MemoryResult) => {
    setMemoryResultState(result);
  };

  const setSafariResult = (result: SafariResult) => {
    setSafariResultState(result);
  };

  const computeAssessment = () => {
    if (memoryResult && safariResult) {
      const a = getAssessment(age, memoryResult, safariResult);
      setAssessment(a);
      return a;
    }
    return null;
  };

  const reset = () => {
    setMemoryResultState(null);
    setSafariResultState(null);
    setAssessment(null);
  };

  return (
    <GameContext.Provider
      value={{
        age, setAge,
        playerName, setPlayerName,
        memoryResult, setMemoryResult,
        safariResult, setSafariResult,
        assessment, computeAssessment,
        memoryCompleted: memoryResult !== null,
        safariCompleted: safariResult !== null,
        reset,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
