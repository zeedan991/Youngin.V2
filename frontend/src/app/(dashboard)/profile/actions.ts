"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchLiveProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: userError?.message || "No authenticated user" };
  }

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
  const fallbackAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  if (profileData) {
    return {
      success: true,
      data: {
        ...profileData,
        full_name: profileData.full_name || fallbackName,
        avatar_url: profileData.avatar_url || fallbackAvatar,
      }
    };
  }

  return {
    success: true,
    data: {
      full_name: fallbackName,
      email: user.email,
      avatar_url: fallbackAvatar,
      level: 1
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
  
  if (fullName || username) {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username: username,
      email: user.email,
      bio: bio || null,
      instagram: instagram || null,
      website: website || null
    }, { onConflict: 'id' });
    
    if (error) {
      console.error("Profile Save Error:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
