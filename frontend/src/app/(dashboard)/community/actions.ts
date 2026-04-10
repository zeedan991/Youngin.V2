"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserProfile(username: string) {
  const supabase = await createClient();

  // 1. Fetch the user profile by username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Creator not found" };
  }

  // 2. Fetch their public designs
  const { data: designs } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // 3. Get follow stats
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: 'exact', head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: 'exact', head: true })
    .eq("follower_id", profile.id);

  // 4. Check if current user is following them
  const { data: { user } } = await supabase.auth.getUser();
  let isFollowing = false;
  
  if (user && user.id !== profile.id) {
    const { data: followRecord } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .single();
      
    if (followRecord) {
      isFollowing = true;
    }
  }

  return { 
    success: true, 
    data: {
      profile,
      designs: designs || [],
      followers: followersCount || 0,
      following: followingCount || 0,
      isFollowing,
      isSelf: user?.id === profile.id
    }
  };
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };
  if (user.id === targetUserId) return { success: false, error: "Cannot follow yourself" };

  // Check if following
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  if (existing) {
    // Unfollow
    await supabase.from("follows").delete().eq("id", existing.id);
    return { success: true, isFollowing: false };
  } else {
    // Follow
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
    return { success: true, isFollowing: true };
  }
}

export async function searchCreators(query: string) {
  const cleanQuery = query.replace('@', '');
  
  if (!cleanQuery || cleanQuery.length < 2) return { success: true, data: [] };
  
  const supabase = await createClient();
  
  // Search for matching usernames or full names
  // REMOVED 'level' column to fix DB validation crash
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
    .limit(5);
    
  if (error) {
    console.error("Search error:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}
