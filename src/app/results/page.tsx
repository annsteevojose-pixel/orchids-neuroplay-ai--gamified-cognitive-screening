"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { getNormForAge } from "@/lib/assessment";

export default function Results() {
  const router = useRouter();
  const {
    age, playerName, memoryResult, safariResult,
    assessment, computeAssessment, reset,
  } = useGame();
  const norm = getNormForAge(age);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    if (memoryResult && safariResult && !assessment) {
      computeAssessment();
    }
  }, [memoryResult, safariResult, assessment, computeAssessment]);

  if (!memoryResult || !safariResult || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white/90 rounded-3xl p-8 shadow-xl max-w-md">
          <span className="text-5xl block mb-4">🎮</span>
          <h2 className="text-xl font-black text-indigo-900 mb-2">Complete Both Games First!</h2>
          <p className="text-muted-foreground mb-6">Play both games to see your brain superpowers.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-2xl"
          >
            Go to Games
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    excellent: { bg: "from-emerald-400 to-green-500", ring: "ring-green-300", text: "text-green-700" },
    good: { bg: "from-blue-400 to-cyan-500", ring: "ring-blue-300", text: "text-blue-700" },
    "needs-support": { bg: "from-amber-400 to-orange-400", ring: "ring-amber-300", text: "text-amber-700" },
  };
  const colors = statusColors[assessment.status];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Confetti-like decorations for excellent */}
      {assessment.status === "excellent" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["🎉", "🎊", "⭐", "🌟", "✨", "🏆", "💫", "🎈"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              style={{
                left: `${5 + (i * 13) % 90}%`,
                top: `${3 + (i * 11) % 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.8, 1, 0.8],
                rotate: [0, 20, -20, 0],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-500 hover:text-indigo-700 font-semibold text-sm"
          >
            ← Dashboard
          </button>
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="text-sm px-4 py-2 bg-white rounded-xl border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50"
          >
            Play Again
          </button>
        </div>

        {/* Child-friendly results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-100 text-center mb-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ring-4 ${colors.ring} mb-4`}
          >
            <span className="text-5xl">{assessment.badgeIcon}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-black text-indigo-900 mb-1"
          >
            {assessment.badge}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-indigo-600 mb-4"
          >
            {playerName || "Player"}, {assessment.childMessage}
          </motion.p>

          {/* Score circles */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
            >
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#e0e7ff" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="35" fill="none" stroke="#3b82f6" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - assessment.memoryScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-blue-700">{assessment.memoryScore}%</span>
                </div>
              </div>
              <p className="font-bold text-blue-700 text-sm">Memory Power</p>
              <p className="text-xs text-blue-500">🧩 Level {memoryResult.maxLevel}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100"
            >
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="#fef3c7" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="35" fill="none" stroke="#f59e0b" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - assessment.attentionScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-amber-700">{assessment.attentionScore}%</span>
                </div>
              </div>
              <p className="font-bold text-amber-700 text-sm">Focus Power</p>
              <p className="text-xs text-amber-500">🦁 {assessment.accuracy}% accuracy</p>
            </motion.div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-left space-y-3"
          >
            {assessment.memoryTips.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="font-bold text-blue-700 text-sm mb-2">🧩 Memory Tips:</p>
                <ul className="space-y-1">
                  {assessment.memoryTips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {assessment.attentionTips.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4">
                <p className="font-bold text-amber-700 text-sm mb-2">🦁 Focus Tips:</p>
                <ul className="space-y-1">
                  {assessment.attentionTips.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-600 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Teacher/Examiner Technical Summary */}
        <div className="mb-8">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full text-left px-4 py-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100 text-sm font-semibold text-indigo-400 hover:text-indigo-600 hover:bg-white/80 transition-all flex items-center justify-between"
          >
            <span>🔬 Technical Summary (For Examiner)</span>
            <span className={`transform transition-transform ${showTechnical ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {showTechnical && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-indigo-100 text-left"
            >
              <h3 className="font-bold text-indigo-800 mb-3 text-sm">Clinical Data Report</h3>
              <div className="text-xs space-y-1 font-mono text-indigo-700 bg-indigo-50 rounded-xl p-4">
                <p><strong>Subject:</strong> {playerName || "Anonymous"} | Age: {age}</p>
                <p><strong>Age Group Norms:</strong> {norm.label} (ages {norm.minAge}-{norm.maxAge})</p>
                <hr className="border-indigo-200 my-2" />
                <p className="font-bold mt-2">DIGIT SPAN TEST (Working Memory)</p>
                <p>Max Span Achieved: {memoryResult.maxLevel} digits (norm: {norm.memorySpan})</p>
                <p>Correct Sequences: {memoryResult.totalCorrect}/{memoryResult.totalAttempts}</p>
                <p>Memory Score: {assessment.memoryScore}%</p>
                <hr className="border-indigo-200 my-2" />
                <p className="font-bold mt-2">GO/NO-GO TEST (Inhibitory Control)</p>
                <p>Hits: {safariResult.hits}/{safariResult.totalTargets} (targets caught)</p>
                <p>Misses: {safariResult.misses}/{safariResult.totalTargets}</p>
                <p>False Alarms: {safariResult.falseAlarms}/{safariResult.totalDistractors} (impulsivity indicator)</p>
                <p>Overall Accuracy: {assessment.accuracy}% (norm: {norm.accuracyThreshold}%)</p>
                <p>Avg Reaction Time: {assessment.avgReactionTime}ms (norm limit: {norm.reactionTimeLimit}ms, Fitts&apos; adjusted)</p>
                <p>Attention Score: {assessment.attentionScore}%</p>
                <hr className="border-indigo-200 my-2" />
                <p className="font-bold mt-2">OVERALL ASSESSMENT</p>
                <p>Status: {assessment.status.toUpperCase()}</p>
                <p>Badge: {assessment.badge}</p>
                <p className="text-indigo-400 mt-2 italic">
                  Note: Reaction times include +500ms Fitts&apos; Law adjustment for mouse/touch latency.
                  This is a screening tool, not a diagnostic instrument.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
