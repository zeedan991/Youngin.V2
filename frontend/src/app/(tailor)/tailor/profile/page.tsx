"use client";

import { useEffect, useState } from "react";
import { fetchLiveProfile, updateProfile } from "@/app/(dashboard)/profile/actions";
import { Scissors, MapPin, DollarSign, Save, Check, Link2 } from "lucide-react";

export default function TailorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    instagram: "",
    website: "",
    tailor_specialty: "",
    tailor_location: "",
    tailor_price_from: "",
  });

  useEffect(() => {
    fetchLiveProfile().then((r) => {
      if (r.success && r.data) {
        const d = r.data as any;
        setProfile(d);
        setForm({
          full_name: d.full_name || "",
          bio: d.bio || "",
          instagram: d.instagram || "",
          website: d.website || "",
          tailor_specialty: d.tailor_specialty || "",
          tailor_location: d.tailor_location || "",
          tailor_price_from: d.tailor_price_from || "",
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
    await updateProfile(fd);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div>
      <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{label}</label>
      {editing ? (
        <input
          type={type}
          value={form[field]}
          onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F0EBE3] font-bold text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF4D94] transition-colors"
        />
      ) : (
        <p className="text-[#F0EBE3] font-bold text-sm py-3 border-b border-white/5">{(form[field] as string) || <span className="text-white/20 italic">Not set</span>}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen" style={{ background: "#0D0D12" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
          <h1 className="text-3xl font-black text-[#F0EBE3]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Business Profile</h1>
          <p className="text-white/40 text-sm mt-1">How clients discover and trust you.</p>
        </div>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 border border-white/10 hover:border-white/20 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}>
                {saving ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white border border-white/15 hover:border-white/30 transition-all">
              Edit Profile
            </button>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-green-400 bg-green-500/10 border border-green-500/20">
              <Check className="w-3.5 h-3.5" /> Saved
            </div>
          )}
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="rounded-2xl overflow-hidden border border-white/5" style={{ background: "#111118" }}>
        <div className="h-32 bg-gradient-to-br from-[#FF4D94]/20 via-[#B8005C]/10 to-transparent" />
        <div className="px-6 pb-6 -mt-10 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center text-3xl border-4 border-[#111118] font-black text-white shadow-xl">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
            ) : (
              profile?.full_name?.[0]?.toUpperCase() || "T"
            )}
          </div>
          <div className="mb-1">
            <h2 className="text-[#F0EBE3] font-black text-xl">{profile?.full_name || "Your Name"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-[#FF4D94] bg-[#FF4D94]/10 px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                <Scissors className="w-2.5 h-2.5" /> Tailor
              </span>
              {profile?.tailor_location && (
                <span className="text-white/30 text-xs font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.tailor_location}
                </span>
              )}
              {profile?.tailor_price_from && (
                <span className="text-white/30 text-xs font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> From ${profile.tailor_price_from}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 p-6 space-y-5" style={{ background: "#111118" }}>
          <h3 className="text-[#F0EBE3] font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3">Personal Info</h3>
          <Field label="Full Name" field="full_name" placeholder="Your full name" />
          <Field label="Bio" field="bio" placeholder="Describe your craft and experience..." />
        </div>

        <div className="rounded-2xl border border-white/5 p-6 space-y-5" style={{ background: "#111118" }}>
          <h3 className="text-[#F0EBE3] font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3">Business Info</h3>
          <Field label="Specialty (e.g. Bespoke Suits, Alterations)" field="tailor_specialty" placeholder="Your tailoring specialty" />
          <Field label="Location / City" field="tailor_location" placeholder="e.g. Lagos, London, New York" />
          <Field label="Starting Price ($)" field="tailor_price_from" placeholder="50" type="number" />
        </div>

        <div className="rounded-2xl border border-white/5 p-6 space-y-5" style={{ background: "#111118" }}>
          <h3 className="text-[#F0EBE3] font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3">Social Links</h3>
          <Field label="Instagram Handle" field="instagram" placeholder="@yourhandle" />
          <Field label="Website" field="website" placeholder="https://yourwebsite.com" />
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-white/5 p-6" style={{ background: "#111118" }}>
          <h3 className="text-[#F0EBE3] font-black text-xs uppercase tracking-widest border-b border-white/5 pb-3 mb-5">Profile Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Followers", value: profile?.followers || 0 },
              { label: "Following", value: profile?.following || 0 },
              { label: "Level", value: `LV. ${profile?.level || 1}` },
              { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).getFullYear() : "2026" },
            ].map((s) => (
              <div key={s.label} className="text-center py-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[#F0EBE3] font-black text-2xl">{s.value}</p>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
