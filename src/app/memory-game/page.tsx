"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { getNormForAge } from "@/lib/assessment";

type Phase = "instructions" | "countdown" | "showing" | "input" | "feedback" | "done";

function generateSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
}

export default function MemoryGame() {
  const router = useRouter();
  const { age, playerName, setMemoryResult } = useGame();
  const norm = getNormForAge(age);

  const [phase, setPhase] = useState<Phase>("instructions");
  const [level, setLevel] = useState(2);
  const [maxLevel, setMaxLevel] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [userInput, setUserInput] = useState("");
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [lives, setLives] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      startShowing();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const startShowing = useCallback(() => {
    const seq = generateSequence(level);
    setSequence(seq);
    setShowIndex(0);
    setPhase("showing");
  }, [level]);

  // Show digits one by one
  useEffect(() => {
    if (phase !== "showing") return;
    if (showIndex >= sequence.length) {
      setPhase("input");
      setUserInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    const t = setTimeout(() => setShowIndex(i => i + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, showIndex, sequence.length]);

  const handleSubmit = () => {
    const correct = userInput === sequence.join("");
    setTotalAttempts(a => a + 1);

    if (correct) {
      setTotalCorrect(c => c + 1);
      setMaxLevel(Math.max(maxLevel, level));
      setFeedbackCorrect(true);
      setPhase("feedback");
      setTimeout(() => {
        setLevel(l => l + 1);
        setCountdown(3);
        setPhase("countdown");
      }, 1500);
    } else {
      setFeedbackCorrect(false);
      setLives(l => l - 1);
      setPhase("feedback");
      setTimeout(() => {
        if (lives <= 1) {
          setPhase("done");
        } else {
          setCountdown(3);
          setPhase("countdown");
        }
      }, 1500);
    }
  };

  const finishGame = () => {
    setMemoryResult({
      maxLevel: Math.max(maxLevel, level - 1),
      totalCorrect,
      totalAttempts,
    });
    router.push("/dashboard");
  };

  const startGame = () => {
    setLevel(2);
    setMaxLevel(0);
    setLives(3);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setCountdown(3);
    setPhase("countdown");
  };

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
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-xl ${i < lives ? "" : "opacity-20"}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-100 text-center">
          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🧩</span>
            <h1 className="text-2xl font-black text-indigo-900">Memory Challenge</h1>
          </div>

          {phase !== "instructions" && phase !== "done" && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-100 rounded-full text-purple-700 font-bold text-sm">
                Level {level} &middot; {level} digits
              </span>
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
                <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
                  <p className="text-lg font-bold text-indigo-800 mb-3">How to Play:</p>
                  <div className="space-y-2 text-left text-indigo-700">
                    <p>1. Watch the numbers appear on screen 👀</p>
                    <p>2. Remember the sequence! 🧠</p>
                    <p>3. Type them back in order ⌨️</p>
                    <p>4. Get it right to level up! ⬆️</p>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-700 font-semibold">
                      🎯 Goal for age {age}: Remember {norm.memorySpan}+ digits!
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  I&apos;m Ready! 🎮
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
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-7xl font-black text-purple-600"
                >
                  {countdown || "Go!"}
                </motion.div>
              </motion.div>
            )}

            {/* Showing digits */}
            {phase === "showing" && (
              <motion.div
                key="showing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <p className="text-muted-foreground font-semibold mb-6">Watch carefully! 👀</p>
                <AnimatePresence mode="wait">
                  {showIndex < sequence.length && (
                    <motion.div
                      key={`digit-${showIndex}`}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      className="w-28 h-28 mx-auto bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg"
                    >
                      <span className="text-5xl font-black text-white">
                        {sequence[showIndex]}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-center gap-2 mt-6">
                  {sequence.map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all ${
                        i <= showIndex ? "bg-purple-500 scale-110" : "bg-purple-200"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input */}
            {phase === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <p className="text-lg font-bold text-indigo-800 mb-4">
                  Now type the numbers! 🎯
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userInput.length === sequence.length) handleSubmit();
                  }}
                  placeholder="Type the numbers..."
                  maxLength={sequence.length}
                  className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 px-4 rounded-2xl border-3 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none bg-purple-50/50"
                  autoFocus
                />
                <div className="flex justify-center gap-2 my-4">
                  {sequence.map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < userInput.length ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={userInput.length !== sequence.length}
                  onClick={handleSubmit}
                  className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-2xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Check! ✓
                </motion.button>
              </motion.div>
            )}

            {/* Feedback */}
            {phase === "feedback" && (
              <motion.div
                key="feedback"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="py-12"
              >
                {feedbackCorrect ? (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-7xl block mb-4"
                    >
                      🎉
                    </motion.span>
                    <p className="text-2xl font-black text-green-600">Awesome!</p>
                    <p className="text-muted-foreground">Level up! ⬆️</p>
                  </>
                ) : (
                  <>
                    <span className="text-7xl block mb-4">😅</span>
                    <p className="text-2xl font-black text-amber-600">Almost!</p>
                    <p className="text-muted-foreground">
                      The answer was: <span className="font-bold">{sequence.join(" ")}</span>
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* Done */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <span className="text-6xl block mb-4">🏅</span>
                <h2 className="text-2xl font-black text-indigo-900 mb-2">Game Over!</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <p className="text-3xl font-black text-blue-600">{Math.max(maxLevel, level - 1)}</p>
                    <p className="text-xs font-semibold text-blue-500">Max Digits</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    <p className="text-3xl font-black text-green-600">{totalCorrect}</p>
                    <p className="text-xs font-semibold text-green-500">Correct</p>
                  </div>
                </div>
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
