"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { getNormForAge } from "@/lib/assessment";

export default function Dashboard() {
  const router = useRouter();
  const { age, playerName, memoryCompleted, safariCompleted } = useGame();
  const norm = getNormForAge(age);
  const bothDone = memoryCompleted && safariCompleted;

  const games = [
    {
      id: "memory",
      title: "Memory Challenge",
      icon: "🧩",
      description: "Remember the number sequence! How far can you go?",
      color: "from-blue-400 to-cyan-400",
      shadow: "shadow-blue-200",
      completed: memoryCompleted,
      href: "/memory-game",
    },
    {
      id: "safari",
      title: "Animal Safari",
      icon: "🦁",
      description: "Click the animals, ignore the fruits! Be fast and careful!",
      color: "from-amber-400 to-orange-400",
      shadow: "shadow-orange-200",
      completed: safariCompleted,
      href: "/safari-game",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-900">
              Hey {playerName || "Player"}! {norm.icon}
            </h1>
            <p className="text-muted-foreground font-semibold">
              Age {age} &middot; {norm.label} Stage
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white rounded-xl border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors text-sm"
          >
            ← Home
          </button>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📊</span>
            <span className="font-bold text-indigo-800">Mission Progress</span>
          </div>
          <div className="flex gap-2">
            {games.map(g => (
              <div
                key={g.id}
                className={`flex-1 h-3 rounded-full transition-all ${
                  g.completed
                    ? "bg-gradient-to-r from-green-400 to-emerald-400"
                    : "bg-indigo-100"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-semibold">
            {memoryCompleted && safariCompleted
              ? "All missions complete! View your results!"
              : `${[memoryCompleted, safariCompleted].filter(Boolean).length}/2 missions complete`}
          </p>
        </div>
      </div>

      {/* Game Cards */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <button
              onClick={() => router.push(game.href)}
              className="game-card w-full text-left bg-white rounded-3xl p-6 border border-indigo-100 shadow-md hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} ${game.shadow} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{game.icon}</span>
              </div>
              <h3 className="text-xl font-black text-indigo-900 mb-1">{game.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
              {game.completed ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  ✅ Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  ▶ Play Now
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Results button */}
      {bothDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/results")}
            className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-300 hover:shadow-xl transition-shadow"
          >
            See My Superpowers! 🏆
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
