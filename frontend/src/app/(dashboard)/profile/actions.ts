"use server";

import { createClient } from "@/utils/supabase/server";
import { computeLevel, XP_REWARDS, type XPRewardKey } from "@/lib/achievements";

export async function fetchLiveProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: userError?.message || "No authenticated user" };
  }

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";

  if (profileData) {
    const [followersRes, followingRes] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id)
    ]);

    return {
      success: true,
      data: {
        ...profileData,
        full_name: profileData.full_name || fallbackName,
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
      }
    };
  }

  return {
    success: true,
    data: {
      full_name: fallbackName,
      email: user.email,
      avatar_url: null,
      level: 1,
      xp: 0,
    }
  };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const fullName = formData.get('full_name') as string;
  const username = formData.get('username') as string;
  const bio = formData.get('bio') as string;
  const instagram = formData.get('instagram') as string;
  const website = formData.get('website') as string;
  const avatarUrl = formData.get('avatar_url') as string;
  const role = formData.get('role') as string;
  const tailorSpecialty = formData.get('tailor_specialty') as string;
  const tailorLocation = formData.get('tailor_location') as string;
  const tailorPriceFrom = formData.get('tailor_price_from') as string;

  const updatePayload: Record<string, any> = { id: user.id, email: user.email };
  if (fullName) updatePayload.full_name = fullName;
  if (username) updatePayload.username = username;
  if (bio !== null && bio !== undefined) updatePayload.bio = bio || null;
  if (instagram !== null && instagram !== undefined) updatePayload.instagram = instagram || null;
  if (website !== null && website !== undefined) updatePayload.website = website || null;
  if (avatarUrl) updatePayload.avatar_url = avatarUrl;
  if (role) updatePayload.role = role;
  if (tailorSpecialty) updatePayload.tailor_specialty = tailorSpecialty;
  if (tailorLocation) updatePayload.tailor_location = tailorLocation;
  if (tailorPriceFrom) updatePayload.tailor_price_from = parseFloat(tailorPriceFrom);

  if (Object.keys(updatePayload).length > 2) {
    const { error } = await supabase.from('profiles').upsert(updatePayload, { onConflict: 'id' });
    if (error) {
      if (error.code === '23505' && error.message.includes('username')) {
        return { success: false, error: "Username is already taken. Please choose another one." };
      }
      console.error("Profile Save Error:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

// ═══════════════════════════════════════════
//  XP SYSTEM — SERVER ACTIONS
// ═══════════════════════════════════════════

/**
 * Awards XP for a specific action. Automatically recomputes and saves the level.
 * Returns updated XP and level values.
 * Safe to call multiple times — caller is responsible for rate limiting / one-time checks.
 */
export async function awardXP(reason: XPRewardKey): Promise<{
  success: boolean;
  awarded?: number;
  newXP?: number;
  newLevel?: number;
  leveledUp?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const amount = XP_REWARDS[reason];

    // Fetch current XP
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    const currentXP = profile?.xp || 0;
    const currentLevel = profile?.level || 1;
    const newXP = currentXP + amount;
    const newLevel = computeLevel(newXP);
    const leveledUp = newLevel > currentLevel;

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ xp: newXP, level: newLevel })
      .eq('id', user.id);

    if (updateErr) return { success: false, error: updateErr.message };

    return { success: true, awarded: amount, newXP, newLevel, leveledUp };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Awards daily login XP (+50) once per calendar day.
 * Checks `last_login_date` to ensure idempotency.
 * Also increments login_streak if consecutive days.
 */
export async function awardDailyLoginXP(): Promise<{
  success: boolean;
  awarded: boolean;
  newXP?: number;
  newLevel?: number;
  leveledUp?: boolean;
  streak?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, awarded: false, error: "Not authenticated" };

    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('xp, level, last_login_date, login_streak')
      .eq('id', user.id)
      .single();

    if (fetchErr) {
      // Column might not exist yet — silently skip
      console.warn("Daily XP fetch failed (column may not exist yet):", fetchErr.message);
      return { success: true, awarded: false };
    }

    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const lastLoginStr = profile?.last_login_date;

    // Already awarded today — skip
    if (lastLoginStr === todayStr) {
      return { success: true, awarded: false };
    }

    const dailyAmount = XP_REWARDS.daily_login; // 50
    const currentXP = profile?.xp || 0;
    const currentLevel = profile?.level || 1;
    const newXP = currentXP + dailyAmount;
    const newLevel = computeLevel(newXP);
    const leveledUp = newLevel > currentLevel;

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const currentStreak = profile?.login_streak || 0;
    const newStreak = lastLoginStr === yesterdayStr ? currentStreak + 1 : 1;

    const updatePayload: Record<string, any> = {
      xp: newXP,
      level: newLevel,
      last_login_date: todayStr,
    };

    // login_streak column might not exist — try to update, fail gracefully
    try {
      updatePayload.login_streak = newStreak;
    } catch {}

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateErr) {
      // If streak column missing, retry without it
      const { error: retryErr } = await supabase
        .from('profiles')
        .update({ xp: newXP, level: newLevel, last_login_date: todayStr })
        .eq('id', user.id);
      if (retryErr) return { success: false, awarded: false, error: retryErr.message };
    }

    return {
      success: true,
      awarded: true,
      newXP,
      newLevel,
      leveledUp,
      streak: newStreak,
    };
  } catch (err: any) {
    // Never crash the page over XP
    console.error("awardDailyLoginXP error:", err);
    return { success: true, awarded: false };
  }
}
