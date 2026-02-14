"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { getNormForAge, AGE_NORMS } from "@/lib/assessment";

const SLIDER_ICONS: { minAge: number; maxAge: number; icon: string; bg: string }[] = [
  { minAge: 6, maxAge: 7, icon: "🧱", bg: "from-orange-400 to-red-400" },
  { minAge: 8, maxAge: 9, icon: "🧩", bg: "from-blue-400 to-cyan-400" },
  { minAge: 10, maxAge: 11, icon: "🚲", bg: "from-green-400 to-emerald-400" },
  { minAge: 12, maxAge: 13, icon: "🔭", bg: "from-purple-400 to-violet-400" },
  { minAge: 14, maxAge: 15, icon: "🧪", bg: "from-pink-400 to-rose-400" },
  { minAge: 16, maxAge: 18, icon: "🚀", bg: "from-indigo-400 to-blue-500" },
];

function getSliderData(age: number) {
  return SLIDER_ICONS.find(s => age >= s.minAge && age <= s.maxAge) || SLIDER_ICONS[0];
}

export default function Home() {
  const router = useRouter();
  const { age, setAge, playerName, setPlayerName } = useGame();
  const [step, setStep] = useState<"welcome" | "setup">("welcome");
  const norm = getNormForAge(age);
  const sliderData = getSliderData(age);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["🌟", "🎮", "🧠", "💫", "🎯", "🎪", "🌈", "✨"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl md:text-4xl opacity-20"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${5 + (i * 17) % 80}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center max-w-2xl mx-auto z-10"
          >
            {/* Logo */}
            <motion.div
              className="text-7xl md:text-8xl mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🧠
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text rainbow-bg mb-4 leading-tight pb-2">
              NeuroPlay AI
            </h1>
            <p className="text-lg md:text-xl text-indigo-600 font-semibold mb-2">
              Brain Games That Feel Like Magic!
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Play fun games while we discover your amazing brain superpowers
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep("setup")}
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-300 hover:shadow-xl hover:shadow-purple-400 transition-shadow"
            >
              Let&apos;s Play! 🎮
            </motion.button>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                { icon: "🧩", label: "Memory Challenge" },
                { icon: "🦁", label: "Animal Safari" },
                { icon: "🏆", label: "Win Badges" },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-sm"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm font-semibold text-indigo-700">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg mx-auto z-10"
          >
            <button
              onClick={() => setStep("welcome")}
              className="mb-6 text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-100">
              <h2 className="text-2xl md:text-3xl font-black text-center text-indigo-900 mb-2">
                Tell Us About You!
              </h2>
              <p className="text-center text-muted-foreground text-sm mb-6">
                So we can make the games just right for you
              </p>

              {/* Name input */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-indigo-700 mb-2">
                  What&apos;s your name, hero? 🦸
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Type your name..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-lg font-semibold bg-indigo-50/50 transition-all"
                />
              </div>

              {/* Age slider */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-indigo-700 mb-4">
                  How old are you? 🎂
                </label>

                {/* Icon display */}
                <div className="text-center mb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sliderData.icon}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-block"
                    >
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${sliderData.bg} flex items-center justify-center shadow-lg`}>
                        <span className="text-5xl">{sliderData.icon}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <motion.p
                    key={norm.label}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm font-bold text-indigo-600"
                  >
                    {norm.label} Stage
                  </motion.p>
                </div>

                {/* Slider */}
                <div className="relative px-2">
                  <input
                    type="range"
                    min={6}
                    max={18}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-orange-300 via-purple-400 to-indigo-500"
                    style={{
                      accentColor: "#7c3aed",
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs font-bold text-indigo-400">
                    <span>6</span>
                    <span>10</span>
                    <span>14</span>
                    <span>18</span>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <span className="inline-block px-4 py-1 bg-purple-100 rounded-full text-purple-700 font-black text-2xl">
                    {age} years
                  </span>
                </div>
              </div>

              {/* Start button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!playerName.trim()) {
                    setPlayerName("Player");
                  }
                  router.push("/dashboard");
                }}
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-300 hover:shadow-xl transition-shadow"
              >
                Start My Adventure! 🚀
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
