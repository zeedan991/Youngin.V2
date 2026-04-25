"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTailorProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getTailorOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // When orders table is ready, this will query it.
  // For now return mock data that reflects the real schema shape.
  return [
    {
      id: "ord_001",
      client_name: "Aisha Patel",
      garment: "Bespoke Blazer",
      status: "in_progress",
      amount: 450,
      deadline: "2026-04-20",
      created_at: "2026-04-10",
    },
    {
      id: "ord_002",
      client_name: "Marcus Lee",
      garment: "Silk Evening Gown",
      status: "pending",
      amount: 820,
      deadline: "2026-04-25",
      created_at: "2026-04-09",
    },
    {
      id: "ord_003",
      client_name: "Sarah Kim",
      garment: "Denim Alteration",
      status: "completed",
      amount: 65,
      deadline: "2026-04-08",
      created_at: "2026-04-05",
    },
    {
      id: "ord_004",
      client_name: "James O.",
      garment: "Leather Jacket Restore",
      status: "pending",
      amount: 300,
      deadline: "2026-04-30",
      created_at: "2026-04-11",
    },
  ];
}

export async function getTailorTransactions() {
  return [
    {
      id: "txn_1092",
      client: "Elena Rostova",
      details: "Silk Evening Gown",
      date: "Apr 10, 2026",
      amount: 820,
      status: "released",
    },
    {
      id: "txn_1093",
      client: "Marcus Vance",
      details: "Bespoke Suit Jacket",
      date: "Apr 09, 2026",
      amount: 450,
      status: "escrow",
    },
    {
      id: "txn_1088",
      client: "Chris Hughes",
      details: "Denim Alteration",
      date: "Apr 08, 2026",
      amount: 65,
      status: "released",
    },
    {
      id: "txn_1085",
      client: "Sarah Jenkins",
      details: "Leather Jacket Restore",
      date: "Apr 05, 2026",
      amount: 300,
      status: "escrow",
    },
    {
      id: "txn_1081",
      client: "Stripe Payout",
      details: "Bank Transfer (*1234)",
      date: "Apr 01, 2026",
      amount: -1500,
      status: "payout",
    },
  ];
}

export async function getTailorDesigns() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}
