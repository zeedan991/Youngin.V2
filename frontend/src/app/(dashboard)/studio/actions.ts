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
  name: string;
  garment_type: string;
  garment_color: string;
  material: string;
  elements: DesignElement[];
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function saveDesignToDb(payload: {
  id?: string;
  name: string;
  garmentType: string;
  garmentColor: string;
  material: string;
  elements: DesignElement[];
}) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Not authenticated" };

  const row = {
    user_id:       user.id,
    name:          payload.name,
    garment_type:  payload.garmentType,
    garment_color: payload.garmentColor,
    material:      payload.material,
    elements:      payload.elements,
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
