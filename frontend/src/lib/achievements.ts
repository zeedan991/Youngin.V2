// ═══════════════════════════════════════════════════════════
//  YOUNGIN ✦ Achievement Engine
//  Source of truth for all achievements and XP logic.
//  Any new XP event or achievement must be defined here.
// ═══════════════════════════════════════════════════════════

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementCategory = "creative" | "social" | "milestone" | "explorer" | "loyalty";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;        // emoji
  xpReward: number;
  rarity: AchievementRarity;
  category: AchievementCategory;
  hidden?: boolean;    // hidden achievements only reveal after unlock
};

// ─── XP ECONOMY ────────────────────────────────────────────
// Every XP-earning action and its reward amount.
// This is the single source of truth referenced by server actions.
export const XP_REWARDS = {
  // Daily
  daily_login: 50,

  // Creative
  create_design: 100,
  export_design: 50,
  use_ai_graphic: 75,
  complete_style_quiz: 100,
  use_ai_sizing: 75,
  use_ai_stylist: 25,
  use_virtual_tryon: 50,

  // Social
  follow_creator: 20,
  gain_follower: 10,

  // One-time achievement bonuses
  achievement_common: 0,    // built into xpReward on the achievement itself
  achievement_rare: 0,
  achievement_epic: 0,
  achievement_legendary: 0,
} as const;

export type XPRewardKey = keyof typeof XP_REWARDS;

// ─── LEVEL FORMULA ─────────────────────────────────────────
// 500 XP = 1 level. Simple, motivating for new users.
export const XP_PER_LEVEL = 500;

export function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * XP_PER_LEVEL;
}

export function xpIntoCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpProgressPercent(xp: number): number {
  return Math.min((xpIntoCurrentLevel(xp) / XP_PER_LEVEL) * 100, 100);
}

// ─── ACHIEVEMENTS REGISTRY ─────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [

  // ══ MILESTONE ══════════════════════════════════════════
  {
    id: "first_login",
    title: "The Beginning",
    description: "You joined YOUNGIN. Your creative journey starts now.",
    icon: "🌱",
    xpReward: 100,
    rarity: "common",
    category: "milestone",
  },
  {
    id: "profile_complete",
    title: "Fully Formed",
    description: "Completed your profile with a username.",
    icon: "🪪",
    xpReward: 250,
    rarity: "common",
    category: "milestone",
  },
  {
    id: "youngin_pioneer",
    title: "YOUNGIN Pioneer",
    description: "One of the founding generation on the platform.",
    icon: "🚀",
    xpReward: 2000,
    rarity: "legendary",
    category: "milestone",
  },
  {
    id: "level_5",
    title: "Rising Star",
    description: "Reached Level 5. You're just getting started.",
    icon: "⭐",
    xpReward: 500,
    rarity: "rare",
    category: "milestone",
  },
  {
    id: "level_10",
    title: "Seasoned Creator",
    description: "Reached Level 10. Real commitment to the craft.",
    icon: "🌟",
    xpReward: 1000,
    rarity: "epic",
    category: "milestone",
  },
  {
    id: "level_25",
    title: "Fashion Heavyweight",
    description: "Reached Level 25. You are YOUNGIN royalty.",
    icon: "👑",
    xpReward: 3000,
    rarity: "legendary",
    category: "milestone",
  },
  {
    id: "level_50",
    title: "Eternal Creator",
    description: "Reached Level 50. The platform bows to you.",
    icon: "💎",
    xpReward: 10000,
    rarity: "legendary",
    category: "milestone",
    hidden: true,
  },
  {
    id: "xp_1000",
    title: "XP Grinder",
    description: "Accumulated 1,000 total XP.",
    icon: "⚡",
    xpReward: 100,
    rarity: "common",
    category: "milestone",
  },
  {
    id: "xp_5000",
    title: "XP Warlord",
    description: "Accumulated 5,000 total XP. Absolute dedication.",
    icon: "🔥",
    xpReward: 500,
    rarity: "rare",
    category: "milestone",
  },

  // ══ CREATIVE ══════════════════════════════════════════════
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
    icon: "🗂️",
    xpReward: 750,
    rarity: "rare",
    category: "creative",
  },
  {
    id: "design_master",
    title: "Design Master",
    description: "Created 25 designs. You are a true creator.",
    icon: "🏆",
    xpReward: 2000,
    rarity: "epic",
    category: "creative",
  },
  {
    id: "design_legend",
    title: "Design Legend",
    description: "Created 50 designs. Legendary output.",
    icon: "🌌",
    xpReward: 5000,
    rarity: "legendary",
    category: "creative",
    hidden: true,
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
  {
    id: "studio_exporter",
    title: "Production Ready",
    description: "Exported a design from the studio.",
    icon: "📦",
    xpReward: 300,
    rarity: "common",
    category: "creative",
  },

  // ══ EXPLORER ══════════════════════════════════════════════
  {
    id: "style_seeker",
    title: "Style Seeker",
    description: "Completed the Style Quiz to discover your aesthetic.",
    icon: "🎯",
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
  {
    id: "thrift_scout",
    title: "Thrift Scout",
    description: "Explored the Thrift Store.",
    icon: "♻️",
    xpReward: 200,
    rarity: "common",
    category: "explorer",
  },
  {
    id: "virtual_dresser",
    title: "Virtual Dresser",
    description: "Used the Virtual Try-On feature.",
    icon: "👗",
    xpReward: 400,
    rarity: "rare",
    category: "explorer",
  },
  {
    id: "ai_style_consult",
    title: "AI Style Consultation",
    description: "Had a conversation with the AI Stylist.",
    icon: "💬",
    xpReward: 150,
    rarity: "common",
    category: "explorer",
  },
  {
    id: "platform_explorer",
    title: "Platform Explorer",
    description: "Visited every major section of YOUNGIN.",
    icon: "🗺️",
    xpReward: 1000,
    rarity: "epic",
    category: "explorer",
  },

  // ══ SOCIAL ════════════════════════════════════════════════
  {
    id: "first_follow",
    title: "Connected",
    description: "Followed your first creator.",
    icon: "🤝",
    xpReward: 100,
    rarity: "common",
    category: "social",
  },
  {
    id: "first_follower",
    title: "Noticed",
    description: "Someone followed you for the first time.",
    icon: "👀",
    xpReward: 200,
    rarity: "common",
    category: "social",
  },
  {
    id: "ten_followers",
    title: "Community Builder",
    description: "Gained 10 followers. People are watching.",
    icon: "🏘️",
    xpReward: 500,
    rarity: "rare",
    category: "social",
  },
  {
    id: "fifty_followers",
    title: "Influencer",
    description: "Gained 50 followers. You are building your empire.",
    icon: "📣",
    xpReward: 1500,
    rarity: "epic",
    category: "social",
  },

  // ══ LOYALTY ═══════════════════════════════════════════════
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Logged in 7 days in a row.",
    icon: "🗓️",
    xpReward: 350,
    rarity: "rare",
    category: "loyalty",
  },
  {
    id: "streak_30",
    title: "Monthly Devotee",
    description: "Logged in 30 days in a row. Absolute consistency.",
    icon: "🏅",
    xpReward: 1500,
    rarity: "epic",
    category: "loyalty",
  },
  {
    id: "streak_100",
    title: "Eternal Presence",
    description: "100 consecutive login days. Legendary.",
    icon: "🌠",
    xpReward: 5000,
    rarity: "legendary",
    category: "loyalty",
    hidden: true,
  },
];

// ─── COMPUTE UNLOCKED ACHIEVEMENTS ─────────────────────────
// This runs client-side based on profile data.
// Server-side awarding is done in profile/actions.ts
export function computeUnlockedAchievements(profile: {
  username?: string | null;
  designs_count?: number | null;
  created_at?: string | null;
  xp?: number | null;
  level?: number | null;
  followers?: number | null;
  following?: number | null;
  login_streak?: number | null;
  achievements?: string[] | null; // persisted unlocked IDs from DB
}): string[] {
  // Start from persisted DB achievements so we never lose earned ones
  const unlocked = new Set<string>(profile.achievements || []);

  // Everyone gets these on first load
  unlocked.add("first_login");
  unlocked.add("youngin_pioneer"); // all founding users qualify

  if (profile.username) unlocked.add("profile_complete");

  // Creative — designs
  const count = profile.designs_count || 0;
  if (count >= 1) unlocked.add("first_design");
  if (count >= 5) unlocked.add("design_collector");
  if (count >= 25) unlocked.add("design_master");
  if (count >= 50) unlocked.add("design_legend");

  // Milestone — XP thresholds
  const xp = profile.xp || 0;
  if (xp >= 1000) unlocked.add("xp_1000");
  if (xp >= 5000) unlocked.add("xp_5000");

  // Milestone — level thresholds
  const level = profile.level || computeLevel(xp);
  if (level >= 5) unlocked.add("level_5");
  if (level >= 10) unlocked.add("level_10");
  if (level >= 25) unlocked.add("level_25");
  if (level >= 50) unlocked.add("level_50");

  // Social
  const followers = profile.followers || 0;
  const following = profile.following || 0;
  if (following >= 1) unlocked.add("first_follow");
  if (followers >= 1) unlocked.add("first_follower");
  if (followers >= 10) unlocked.add("ten_followers");
  if (followers >= 50) unlocked.add("fifty_followers");

  // Loyalty — streaks
  const streak = profile.login_streak || 0;
  if (streak >= 7) unlocked.add("streak_7");
  if (streak >= 30) unlocked.add("streak_30");
  if (streak >= 100) unlocked.add("streak_100");

  return Array.from(unlocked);
}

// ─── STYLING MAPS ────────────────────────────────────────────
export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: "from-slate-500 to-slate-600",
  rare: "from-blue-500 to-blue-700",
  epic: "from-purple-500 to-purple-700",
  legendary: "from-[#4F46E5] to-[#3730A3]",
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const RARITY_BADGE_COLORS: Record<AchievementRarity, string> = {
  common: "bg-slate-100 text-slate-600 border-slate-200",
  rare: "bg-blue-50 text-blue-600 border-blue-200",
  epic: "bg-purple-50 text-purple-600 border-purple-200",
  legendary: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  creative: "Creative",
  social: "Social",
  milestone: "Milestone",
  explorer: "Explorer",
  loyalty: "Loyalty",
};
