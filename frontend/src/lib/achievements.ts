// ─────────────────────────────────────────────
//  YOUNGIN — Achievement Engine
//  All achievements are defined here.
//  The system checks these against the user's
//  profile data to compute unlocked badges.
// ─────────────────────────────────────────────

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;        // emoji or icon key
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "creative" | "social" | "milestone" | "explorer";
};

export const ACHIEVEMENTS: Achievement[] = [
  // ── MILESTONES ──────────────────────────────
  {
    id: "first_login",
    title: "The Beginning",
    description: "You joined YOUNGIN. Your creative journey starts now.",
    icon: "🌟",
    xpReward: 100,
    rarity: "common",
    category: "milestone",
  },
  {
    id: "profile_complete",
    title: "Fully Formed",
    description: "Completed your profile with a username.",
    icon: "✨",
    xpReward: 250,
    rarity: "common",
    category: "milestone",
  },

  // ── CREATIVE ────────────────────────────────
  {
    id: "first_design",
    title: "Creative Genesis",
    description: "Created your very first design in the studio.",
    icon: "🎨",
    xpReward: 500,
    rarity: "rare",
    category: "creative",
  },
  {
    id: "design_collector",
    title: "Design Collector",
    description: "Created 5 unique designs.",
    icon: "🖼️",
    xpReward: 1000,
    rarity: "rare",
    category: "creative",
  },
  {
    id: "design_master",
    title: "Design Master",
    description: "Created 25 designs. You are a true creator.",
    icon: "👑",
    xpReward: 3000,
    rarity: "epic",
    category: "creative",
  },
  {
    id: "ai_collaborator",
    title: "AI Collaborator",
    description: "Used the AI graphic generator to enhance a design.",
    icon: "🤖",
    xpReward: 750,
    rarity: "rare",
    category: "creative",
  },

  // ── EXPLORER ────────────────────────────────
  {
    id: "style_seeker",
    title: "Style Seeker",
    description: "Completed the Style Quiz to discover your aesthetic.",
    icon: "🔮",
    xpReward: 400,
    rarity: "common",
    category: "explorer",
  },
  {
    id: "dimension_mapped",
    title: "Dimension Mapped",
    description: "Used AI Sizing to map your body measurements.",
    icon: "📐",
    xpReward: 600,
    rarity: "rare",
    category: "explorer",
  },
  {
    id: "trend_hunter",
    title: "Trend Hunter",
    description: "Browsed the Brands marketplace.",
    icon: "🛍️",
    xpReward: 200,
    rarity: "common",
    category: "explorer",
  },

  // ── LEGENDARY ───────────────────────────────
  {
    id: "youngin_pioneer",
    title: "YOUNGIN Pioneer",
    description: "One of the first 1,000 members on the platform.",
    icon: "🏆",
    xpReward: 5000,
    rarity: "legendary",
    category: "milestone",
  },
];

/** Check which achievements a user has unlocked based on their profile data */
export function computeUnlockedAchievements(profile: {
  username?: string | null;
  designs_count?: number | null;
  created_at?: string | null;
}): string[] {
  const unlocked: string[] = [];

  unlocked.push("first_login"); // Everyone gets this
  unlocked.push("youngin_pioneer"); // First 1000 users (all current users qualify)

  if (profile.username) {
    unlocked.push("profile_complete");
  }

  const count = profile.designs_count || 0;
  if (count >= 1) unlocked.push("first_design");
  if (count >= 5) unlocked.push("design_collector");
  if (count >= 25) unlocked.push("design_master");

  return unlocked;
}

export const RARITY_COLORS: Record<Achievement["rarity"], string> = {
  common: "from-slate-500 to-slate-600",
  rare: "from-blue-500 to-blue-700",
  epic: "from-purple-500 to-purple-700",
  legendary: "from-[#FF4D94] to-[#B8005C]",
};

export const RARITY_LABELS: Record<Achievement["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
