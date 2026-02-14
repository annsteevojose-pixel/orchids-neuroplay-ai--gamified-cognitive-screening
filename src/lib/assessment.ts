// Age-stratified norms for cognitive assessment
// Based on clinical research with Fitts' Law adjustment for mouse/touch latency (+0.5s)

export interface AgeNorm {
  minAge: number;
  maxAge: number;
  memorySpan: number; // expected digit span
  reactionTimeLimit: number; // in ms, adjusted for Fitts' Law
  accuracyThreshold: number; // percentage
  icon: string;
  label: string;
}

export const AGE_NORMS: AgeNorm[] = [
  { minAge: 6, maxAge: 7, memorySpan: 3, reactionTimeLimit: 1200, accuracyThreshold: 60, icon: "🧱", label: "Building Blocks" },
  { minAge: 8, maxAge: 9, memorySpan: 4, reactionTimeLimit: 1050, accuracyThreshold: 65, icon: "🧩", label: "Puzzle Solver" },
  { minAge: 10, maxAge: 11, memorySpan: 5, reactionTimeLimit: 950, accuracyThreshold: 70, icon: "🚲", label: "Explorer" },
  { minAge: 12, maxAge: 13, memorySpan: 5, reactionTimeLimit: 850, accuracyThreshold: 75, icon: "🔭", label: "Scientist" },
  { minAge: 14, maxAge: 15, memorySpan: 6, reactionTimeLimit: 800, accuracyThreshold: 80, icon: "🧪", label: "Innovator" },
  { minAge: 16, maxAge: 18, memorySpan: 7, reactionTimeLimit: 750, accuracyThreshold: 85, icon: "🚀", label: "Ready to Launch" },
];

export function getNormForAge(age: number): AgeNorm {
  return AGE_NORMS.find(n => age >= n.minAge && age <= n.maxAge) || AGE_NORMS[0];
}

export interface MemoryResult {
  maxLevel: number;
  totalCorrect: number;
  totalAttempts: number;
}

export interface SafariResult {
  hits: number;
  misses: number;
  falseAlarms: number; // clicked on fruit (impulsivity)
  totalTargets: number;
  totalDistractors: number;
  reactionTimes: number[]; // in ms
}

export interface Assessment {
  badge: string;
  badgeIcon: string;
  status: "excellent" | "good" | "needs-support";
  memoryTips: string[];
  attentionTips: string[];
  memoryScore: number; // 0-100
  attentionScore: number; // 0-100
  avgReactionTime: number;
  accuracy: number;
  childMessage: string;
}

export function getAssessment(
  age: number,
  memoryResult: MemoryResult,
  safariResult: SafariResult
): Assessment {
  const norm = getNormForAge(age);

  // Memory score: how close to expected span
  const memoryRatio = memoryResult.maxLevel / norm.memorySpan;
  const memoryScore = Math.min(100, Math.round(memoryRatio * 100));

  // Attention score: accuracy + reaction time
  const totalSafari = safariResult.totalTargets + safariResult.totalDistractors;
  const correctActions = safariResult.hits + (safariResult.totalDistractors - safariResult.falseAlarms);
  const accuracy = totalSafari > 0 ? Math.round((correctActions / totalSafari) * 100) : 0;

  const avgRT = safariResult.reactionTimes.length > 0
    ? Math.round(safariResult.reactionTimes.reduce((a, b) => a + b, 0) / safariResult.reactionTimes.length)
    : 0;

  const rtScore = avgRT > 0 && avgRT <= norm.reactionTimeLimit ? 100 : avgRT > 0 ? Math.max(0, Math.round((norm.reactionTimeLimit / avgRT) * 100)) : 0;
  const attentionScore = Math.round((accuracy * 0.6 + rtScore * 0.4));

  // Overall status
  const overallScore = (memoryScore + attentionScore) / 2;

  let status: Assessment["status"];
  let badge: string;
  let badgeIcon: string;
  let childMessage: string;

  if (overallScore >= 80) {
    status = "excellent";
    badge = "Super Brain Champion";
    badgeIcon = "🏆";
    childMessage = "Awesome work! Your brain is super powerful! Keep being amazing!";
  } else if (overallScore >= 55) {
    status = "good";
    badge = "Rising Star";
    badgeIcon = "⭐";
    childMessage = "Great job! You're doing really well! Practice makes perfect!";
  } else {
    status = "needs-support";
    badge = "Focus Power Explorer";
    badgeIcon = "🌟";
    childMessage = "You did great trying! Every superhero trains their powers. Keep practicing!";
  }

  const memoryTips: string[] = [];
  const attentionTips: string[] = [];

  if (memoryScore < 70) {
    memoryTips.push("Try memory games like matching cards at home");
    memoryTips.push("Practice remembering short lists (like groceries)");
    memoryTips.push("Reading stories and retelling them helps build memory");
  } else {
    memoryTips.push("Your memory is strong! Challenge yourself with longer sequences");
  }

  if (attentionScore < 70) {
    attentionTips.push("Practice focusing on one task at a time");
    attentionTips.push("Try breathing exercises before tasks");
    attentionTips.push("Break big tasks into smaller fun steps");
  } else {
    attentionTips.push("Great focus skills! Keep up the good work");
  }

  return {
    badge,
    badgeIcon,
    status,
    memoryTips,
    attentionTips,
    memoryScore,
    attentionScore,
    avgReactionTime: avgRT,
    accuracy,
    childMessage,
  };
}
