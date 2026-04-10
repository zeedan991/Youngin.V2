"use server";

import { createClient } from "@/utils/supabase/server";

export interface DesignElement {
  id: string;
  type: "text" | "shape";
  content: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  x: number;
  y: number;
}

export interface Design {
  id: string;
  user_id: string;
  title: string;
  type: string;
  storage_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function saveDesignToDb(payload: {
  id?: string;
  name: string;
  garmentType: string;
  storage_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Not authenticated" };

  const row = {
    user_id:     user.id,
    title:       payload.name,
    type:        payload.garmentType,
    storage_url: payload.storage_url || null,
  };

  if (payload.id) {
    // Update existing
    const { error } = await supabase
      .from("designs")
      .update(row)
      .eq("id", payload.id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, id: payload.id };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("designs")
      .insert(row)
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
  }
}

export async function loadUserDesigns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, designs: [] };

  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { success: false, designs: [] };
  return { success: true, designs: data as Design[] };
}

export async function deleteDesign(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return { success: !error };
}

export async function loadDesignById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("designs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return data as Design | null;
}

export async function uploadSnapshotBase64(base64Str: string, timestampId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Upload to 'designs' bucket
    const filePath = `${user.id}/${timestampId}_snapshot.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from("designs")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true
      });
      
    if (uploadError) return { success: false, error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage.from("designs").getPublicUrl(filePath);
    
    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function uploadDesignConfig(configData: any, timestampId: string): Promise<{ success: boolean; url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };
  
  try {
    const buffer = Buffer.from(JSON.stringify(configData), "utf-8");
    const filePath = `${user.id}/${timestampId}_config.json`;
    await supabase.storage.from("designs").upload(filePath, buffer, { contentType: "application/json", upsert: true });
    
    const { data: { publicUrl } } = supabase.storage.from("designs").getPublicUrl(filePath);
    return { success: true, url: publicUrl };
  } catch { return { success: false }; }
}

export async function fetchDesignConfig(storageUrl: string): Promise<any> {
    try {
        const configUrl = storageUrl.replace("_snapshot.jpg", "_config.json");
        const res = await fetch(configUrl);
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}
