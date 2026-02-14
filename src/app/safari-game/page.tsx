"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { getNormForAge } from "@/lib/assessment";

type Phase = "instructions" | "countdown" | "playing" | "done";

const ANIMALS = ["🐶", "🐱", "🐰", "🦁", "🐸", "🐼", "🐵", "🐻", "🦊", "🐯"];
const FRUITS = ["🍎", "🍊", "🍇", "🍓", "🍋", "🍉", "🍌", "🍑", "🥝", "🍒"];

interface Stimulus {
  emoji: string;
  isTarget: boolean; // animal = target, fruit = distractor
  id: number;
}

function generateStimuli(count: number): Stimulus[] {
  const items: Stimulus[] = [];
  for (let i = 0; i < count; i++) {
    const isTarget = Math.random() > 0.35; // ~65% animals (targets), ~35% fruits (distractors)
    const pool = isTarget ? ANIMALS : FRUITS;
    items.push({
      emoji: pool[Math.floor(Math.random() * pool.length)],
      isTarget,
      id: i,
    });
  }
  return items;
}

const TOTAL_STIMULI = 20;
const STIMULUS_DURATION = 2000; // ms each item is shown

export default function SafariGame() {
  const router = useRouter();
  const { age, setSafariResult } = useGame();
  const norm = getNormForAge(age);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [countdown, setCountdown] = useState(3);
  const [stimuli, setStimuli] = useState<Stimulus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [totalDistractors, setTotalDistractors] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [clicked, setClicked] = useState(false);
  const [clickResult, setClickResult] = useState<"hit" | "false-alarm" | null>(null);
  const stimulusStart = useRef<number>(0);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      const stims = generateStimuli(TOTAL_STIMULI);
      setStimuli(stims);
      setTotalTargets(stims.filter(s => s.isTarget).length);
      setTotalDistractors(stims.filter(s => !s.isTarget).length);
      setCurrentIndex(0);
      setPhase("playing");
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Advance stimuli
  useEffect(() => {
    if (phase !== "playing") return;
    if (currentIndex >= stimuli.length) {
      setPhase("done");
      return;
    }
    stimulusStart.current = Date.now();
    setClicked(false);
    setClickResult(null);

    const t = setTimeout(() => {
      // If not clicked and it was a target, count as miss
      if (!clicked && stimuli[currentIndex]?.isTarget) {
        setMisses(m => m + 1);
      }
      setCurrentIndex(i => i + 1);
    }, STIMULUS_DURATION);

    return () => clearTimeout(t);
  }, [phase, currentIndex, stimuli.length]);

  const handleClick = useCallback(() => {
    if (phase !== "playing" || clicked || currentIndex >= stimuli.length) return;
    setClicked(true);
    const rt = Date.now() - stimulusStart.current;
    const current = stimuli[currentIndex];

    if (current.isTarget) {
      setHits(h => h + 1);
      setReactionTimes(prev => [...prev, rt]);
      setClickResult("hit");
    } else {
      setFalseAlarms(f => f + 1);
      setClickResult("false-alarm");
    }
  }, [phase, clicked, currentIndex, stimuli]);

  const finishGame = () => {
    setSafariResult({
      hits,
      misses,
      falseAlarms,
      totalTargets,
      totalDistractors,
      reactionTimes,
    });
    router.push("/dashboard");
  };

  const startGame = () => {
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setReactionTimes([]);
    setCountdown(3);
    setPhase("countdown");
  };

  const current = stimuli[currentIndex];
  const progress = stimuli.length > 0 ? (currentIndex / stimuli.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-500 hover:text-indigo-700 font-semibold text-sm"
          >
            ← Back
          </button>
          {phase === "playing" && (
            <span className="text-sm font-bold text-indigo-600">
              {currentIndex + 1}/{stimuli.length}
            </span>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🦁</span>
            <h1 className="text-2xl font-black text-indigo-900">Animal Safari</h1>
          </div>

          {/* Progress bar */}
          {phase === "playing" && (
            <div className="w-full h-2 bg-indigo-100 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Instructions */}
            {phase === "instructions" && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-amber-50 rounded-2xl p-6 mb-6">
                  <p className="text-lg font-bold text-amber-800 mb-3">How to Play:</p>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl">
                      <span className="text-2xl">🐶</span>
                      <div>
                        <p className="font-bold text-green-700">See an Animal?</p>
                        <p className="text-sm text-green-600">TAP or CLICK as fast as you can!</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-red-50 p-3 rounded-xl">
                      <span className="text-2xl">🍎</span>
                      <div>
                        <p className="font-bold text-red-700">See a Fruit?</p>
                        <p className="text-sm text-red-600">Do NOT click! Stay still!</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold">
                      🎯 Goal: Be fast AND accurate! Target: {norm.accuracyThreshold}% accuracy
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  Start Safari! 🦁
                </motion.button>
              </motion.div>
            )}

            {/* Countdown */}
            {phase === "countdown" && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="py-12"
              >
                <p className="text-muted-foreground font-semibold mb-4">Get Ready!</p>
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-black text-orange-500"
                >
                  {countdown || "Go!"}
                </motion.div>
              </motion.div>
            )}

            {/* Playing */}
            {phase === "playing" && current && (
              <motion.div
                key={`stimulus-${currentIndex}`}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="py-8"
              >
                <p className="text-sm font-bold text-muted-foreground mb-4">
                  {current.isTarget ? "🎯 Animal spotted!" : "🚫 Is this an animal?"}
                </p>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClick}
                  disabled={clicked}
                  className={`w-36 h-36 mx-auto rounded-3xl flex items-center justify-center text-7xl transition-all cursor-pointer ${
                    clicked
                      ? clickResult === "hit"
                        ? "bg-green-100 border-4 border-green-400 shadow-green-200"
                        : "bg-red-100 border-4 border-red-400 shadow-red-200"
                      : "bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-200 hover:border-purple-400 hover:shadow-lg active:scale-95"
                  } shadow-md`}
                >
                  {current.emoji}
                </motion.button>

                {clicked && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 font-bold text-lg ${
                      clickResult === "hit" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {clickResult === "hit" ? "Nice catch! ✅" : "Oops! That's a fruit! ❌"}
                  </motion.p>
                )}

                {!clicked && (
                  <p className="mt-4 text-sm text-muted-foreground animate-pulse font-semibold">
                    Tap if it&apos;s an animal!
                  </p>
                )}
              </motion.div>
            )}

            {/* Done */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8"
              >
                <span className="text-6xl block mb-4">🏅</span>
                <h2 className="text-2xl font-black text-indigo-900 mb-2">Safari Complete!</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-green-50 rounded-2xl p-3">
                    <p className="text-2xl font-black text-green-600">{hits}</p>
                    <p className="text-xs font-semibold text-green-500">Caught</p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-3">
                    <p className="text-2xl font-black text-amber-600">{misses}</p>
                    <p className="text-xs font-semibold text-amber-500">Missed</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-3">
                    <p className="text-2xl font-black text-red-500">{falseAlarms}</p>
                    <p className="text-xs font-semibold text-red-400">False Alarms</p>
                  </div>
                </div>
                {reactionTimes.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Avg. Speed: <span className="font-bold text-indigo-700">
                      {Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms
                    </span>
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={finishGame}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  Save & Continue! 🎯
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
