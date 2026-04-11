# YOUNGIN — XP & Achievements System

> **Source of truth** for all XP logic, level thresholds, and achievement definitions.
> Last updated: April 2026

---

## 🧮 Level Formula

```
Level = floor(Total XP / 500) + 1
```

Every **500 XP** earned increases your level by 1. This is intentionally simple and rewarding for new users.

| Level | Total XP Required |
|-------|------------------|
| 1     | 0 XP             |
| 2     | 500 XP           |
| 5     | 2,000 XP         |
| 10    | 4,500 XP         |
| 25    | 12,000 XP        |
| 50    | 24,500 XP        |
| 100   | 49,500 XP        |

---

## ⚡ Ways to Earn XP

### Daily Actions
| Action | XP Reward | Limit |
|--------|-----------|-------|
| Daily login | +50 XP | Once per calendar day |

### Creative Actions
| Action | XP Reward | Notes |
|--------|-----------|-------|
| Create a design in Studio | +100 XP | Per design |
| Export a design | +50 XP | Per export |
| Use AI graphic generator | +75 XP | Per use |

### Exploration Actions
| Action | XP Reward | Notes |
|--------|-----------|-------|
| Complete Style Quiz | +100 XP | Once |
| Use AI Sizing tool | +75 XP | Once |
| Use AI Stylist (chat) | +25 XP | Per session |
| Use Virtual Try-On | +50 XP | Per try-on |

### Social Actions
| Action | XP Reward | Notes |
|--------|-----------|-------|
| Follow a creator | +20 XP | Per follow |
| Gain a follower | +10 XP | Per new follower |

### Achievement Bonuses
Unlocking achievements gives a **one-time XP bonus** ranging from 100 to 10,000 XP depending on rarity.

---

## 🏆 Achievements (30 Total)

### 📍 Milestone
| ID | Title | Description | XP | Rarity |
|----|-------|-------------|-----|--------|
| `first_login` | The Beginning | Joined YOUNGIN | 100 | Common |
| `profile_complete` | Fully Formed | Set a username | 250 | Common |
| `youngin_pioneer` | YOUNGIN Pioneer | Founding generation | 2,000 | Legendary |
| `xp_1000` | XP Grinder | 1,000 total XP | 100 | Common |
| `xp_5000` | XP Warlord | 5,000 total XP | 500 | Rare |
| `level_5` | Rising Star | Reached Level 5 | 500 | Rare |
| `level_10` | Seasoned Creator | Reached Level 10 | 1,000 | Epic |
| `level_25` | Fashion Heavyweight | Reached Level 25 | 3,000 | Legendary |
| `level_50` | Eternal Creator | Reached Level 50 | 10,000 | Legendary ⚠️ Hidden |

### 🎨 Creative
| ID | Title | Description | XP | Rarity |
|----|-------|-------------|-----|--------|
| `first_design` | Creative Genesis | First design created | 500 | Rare |
| `design_collector` | Design Collector | 5 designs | 750 | Rare |
| `design_master` | Design Master | 25 designs | 2,000 | Epic |
| `design_legend` | Design Legend | 50 designs | 5,000 | Legendary ⚠️ Hidden |
| `ai_collaborator` | AI Collaborator | Used AI graphic generator | 750 | Rare |
| `studio_exporter` | Production Ready | Exported a design | 300 | Common |

### 🗺️ Explorer
| ID | Title | Description | XP | Rarity |
|----|-------|-------------|-----|--------|
| `style_seeker` | Style Seeker | Completed Style Quiz | 400 | Common |
| `dimension_mapped` | Dimension Mapped | Used AI Sizing | 600 | Rare |
| `trend_hunter` | Trend Hunter | Browsed Brands marketplace | 200 | Common |
| `thrift_scout` | Thrift Scout | Explored Thrift Store | 200 | Common |
| `virtual_dresser` | Virtual Dresser | Used Virtual Try-On | 400 | Rare |
| `ai_style_consult` | AI Style Consultation | Chatted with AI Stylist | 150 | Common |
| `platform_explorer` | Platform Explorer | Visited every section | 1,000 | Epic |

### 👥 Social
| ID | Title | Description | XP | Rarity |
|----|-------|-------------|-----|--------|
| `first_follow` | Connected | Followed someone | 100 | Common |
| `first_follower` | Noticed | Got your first follower | 200 | Common |
| `ten_followers` | Community Builder | 10 followers | 500 | Rare |
| `fifty_followers` | Influencer | 50 followers | 1,500 | Epic |

### 🗓️ Loyalty (Login Streaks)
| ID | Title | Description | XP | Rarity |
|----|-------|-------------|-----|--------|
| `streak_7` | Week Warrior | 7-day login streak | 350 | Rare |
| `streak_30` | Monthly Devotee | 30-day streak | 1,500 | Epic |
| `streak_100` | Eternal Presence | 100-day streak | 5,000 | Legendary ⚠️ Hidden |

---

## 🏅 Rarity Tiers

| Rarity | Color | XP Range |
|--------|-------|----------|
| Common | Gray | 100–400 XP |
| Rare | Blue | 200–750 XP |
| Epic | Purple | 1,000–3,000 XP |
| Legendary | Indigo | 2,000–10,000 XP |

---

## 🗃️ Database Requirements

The `profiles` table must have:

```sql
-- Level (integer, computed from XP)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Total XP accumulated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

-- Date of last daily XP award (for idempotency)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date date;

-- Login streak counter
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_streak integer DEFAULT 0;

-- Persisted unlocked achievement IDs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements text[] DEFAULT '{}';
```

---

## 🔧 Implementation Notes

- **Level** is always computed from XP (`floor(xp / 500) + 1`) and stored for query convenience. Never manually set level — always derive it.
- **Daily login XP** is awarded server-side in `profile/actions.ts → awardDailyLoginXP()`. It checks `last_login_date` before awarding. Safe to call on every page load — it's idempotent.
- **Achievement unlocks** are currently computed client-side in `computeUnlockedAchievements()` using profile data. The DB `achievements` array is used as the persistent source of truth.
- **Public profiles** display Level badge + total XP at `/creator/[username]`.
