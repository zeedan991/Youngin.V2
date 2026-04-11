"use client";

import { useEffect, useState } from "react";
import { fetchLiveProfile, updateProfile } from "@/app/(dashboard)/profile/actions";
import {
  Scissors, MapPin, DollarSign, Save, Check,
  Phone, Mail, MessageCircle, Globe, Clock,
  Star, Languages, Briefcase, User,
} from "lucide-react";

const SPECIALTIES = [
  "Bespoke Suits", "Alterations", "Wedding Gowns", "Traditional Wear",
  "Streetwear", "Denim", "Leather", "Formal Wear", "Children's Clothing", "Embroidery",
];

const AVAILABILITY = ["Full-Time", "Part-Time", "Weekends Only", "By Appointment"];
const EXPERIENCE = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];

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
    contact_phone: "",
    contact_email: "",
    contact_whatsapp: "",
    availability: "",
    experience: "",
    languages: "",
  });

  useEffect(() => {
    fetchLiveProfile().then((r) => {
      if (r.success && r.data) {
        const d = r.data as any;
        setProfile(d);

        let extended: any = {};
        try {
          const parsed = JSON.parse(d.bio || "{}");
          if (parsed.__tailor_extended) extended = parsed;
        } catch {}

        setForm({
          full_name: d.full_name || "",
          bio: extended.bio || (typeof d.bio === "string" && !d.bio.startsWith("{") ? d.bio : "") || "",
          instagram: d.instagram || "",
          website: d.website || "",
          tailor_specialty: d.tailor_specialty || "",
          tailor_location: d.tailor_location || "",
          tailor_price_from: d.tailor_price_from?.toString() || "",
          contact_phone: extended.contact_phone || "",
          contact_email: extended.contact_email || d.email || "",
          contact_whatsapp: extended.contact_whatsapp || "",
          availability: extended.availability || "",
          experience: extended.experience || "",
          languages: extended.languages || "",
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("full_name", form.full_name);
    fd.append("instagram", form.instagram);
    fd.append("website", form.website);
    fd.append("tailor_specialty", form.tailor_specialty);
    fd.append("tailor_location", form.tailor_location);
    fd.append("tailor_price_from", form.tailor_price_from);
    fd.append("bio", JSON.stringify({
      __tailor_extended: true,
      bio: form.bio,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      contact_whatsapp: form.contact_whatsapp,
      availability: form.availability,
      experience: form.experience,
      languages: form.languages,
    }));
    await updateProfile(fd);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // ─── Reusable field renderers ─────────────────────────────
  const TextInput = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      {editing ? (
        <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#4F46E5] transition-colors" />
      ) : (
        <p className="text-slate-900 font-bold text-sm py-2.5 border-b border-slate-100 min-h-[40px]">
          {(form[field] as string) || <span className="text-slate-300 italic text-xs">Not set</span>}
        </p>
      )}
    </div>
  );

  const TextArea = ({ label, field, placeholder }: { label: string; field: keyof typeof form; placeholder: string }) => (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      {editing ? (
        <textarea value={form[field]} onChange={set(field) as any} placeholder={placeholder} rows={3}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#4F46E5] transition-colors resize-none" />
      ) : (
        <p className="text-slate-900 text-sm py-2.5 border-b border-slate-100 min-h-[40px] leading-relaxed">
          {(form[field] as string) || <span className="text-slate-300 italic text-xs">Not set</span>}
        </p>
      )}
    </div>
  );

  const SelectInput = ({ label, field, options }: { label: string; field: keyof typeof form; options: string[] }) => (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      {editing ? (
        <select value={form[field]} onChange={set(field) as any}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#4F46E5] transition-colors">
          <option value="">Select...</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <p className="text-slate-900 font-bold text-sm py-2.5 border-b border-slate-100 min-h-[40px]">
          {(form[field] as string) || <span className="text-slate-300 italic text-xs">Not set</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
          <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Business Profile</h1>
          <p className="text-slate-500 text-sm mt-1">How clients discover, trust, and contact you.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-green-600 bg-green-50 border border-green-200 shadow-sm">
              <Check className="w-3.5 h-3.5" /> Saved!
            </div>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-sm bg-white">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 shadow-xl shadow-indigo-600/20" style={{ background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>
                {saving ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-sm bg-white">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Cover + Avatar banner */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="h-28 bg-gradient-to-br from-[#4F46E5]/10 via-[#7B2FBE]/10 to-slate-100" />
        <div className="px-6 pb-6 -mt-10 flex items-end gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] flex items-center justify-center text-3xl border-4 border-white font-black text-white shadow-xl overflow-hidden shrink-0">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : profile?.full_name?.[0]?.toUpperCase() || "T"}
          </div>
          <div className="flex-1 min-w-0 mb-1">
            <h2 className="text-slate-900 font-black text-xl truncate">{form.full_name || "Your Name"}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[9px] font-black text-[#4F46E5] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                <Scissors className="w-2.5 h-2.5" /> Tailor
              </span>
              {form.tailor_specialty && <span className="text-slate-500 text-[10px] font-bold">{form.tailor_specialty}</span>}
              {form.tailor_location && (
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1"><MapPin className="w-3 h-3" />{form.tailor_location}</span>
              )}
              {form.tailor_price_from && (
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1"><DollarSign className="w-3 h-3" />From ${form.tailor_price_from}</span>
              )}
              {form.availability && (
                <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3" />{form.availability}</span>
              )}
            </div>
          </div>
          {/* Quick‐contact pills */}
          <div className="flex gap-2 mb-1 flex-wrap">
            {form.contact_whatsapp && (
              <a href={`https://wa.me/${form.contact_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 text-green-600 bg-green-50 text-[10px] font-black hover:bg-green-100 transition-all shadow-sm">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
            )}
            {form.contact_email && (
              <a href={`mailto:${form.contact_email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 bg-blue-50 text-[10px] font-black hover:bg-blue-100 transition-all shadow-sm">
                <Mail className="w-3 h-3" /> Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Field sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Col 1: Personal */}
        <div className="rounded-2xl border border-slate-200 p-6 space-y-5 bg-white shadow-xl shadow-slate-200/50">
          <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-3.5 h-3.5 text-[#4F46E5]" /> Personal Info
          </h3>
          <TextInput label="Full Name" field="full_name" placeholder="Your full name" />
          <TextArea label="Bio / About" field="bio" placeholder="Tell clients about your craft, style, and experience..." />
          <SelectInput label="Years of Experience" field="experience" options={EXPERIENCE} />
          <TextInput label="Languages Spoken" field="languages" placeholder="e.g. English, Arabic, French" />
        </div>

        {/* Col 2: Business */}
        <div className="rounded-2xl border border-slate-200 p-6 space-y-5 bg-white shadow-xl shadow-slate-200/50">
          <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-3.5 h-3.5 text-[#4F46E5]" /> Business Info
          </h3>
          <SelectInput label="Primary Specialty" field="tailor_specialty" options={SPECIALTIES} />
          <TextInput label="Location / City" field="tailor_location" placeholder="e.g. Lagos, London, New York" />
          <TextInput label="Starting Price ($)" field="tailor_price_from" placeholder="50" type="number" />
          <SelectInput label="Availability" field="availability" options={AVAILABILITY} />
        </div>

        {/* Col 3: Contact */}
        <div className="rounded-2xl border border-slate-200 p-6 space-y-5 bg-white shadow-xl shadow-slate-200/50">
          <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-3.5 h-3.5 text-[#4F46E5]" /> Contact Details
          </h3>
          <TextInput label="Email Address" field="contact_email" placeholder="your@email.com" type="email" />
          <TextInput label="Phone Number" field="contact_phone" placeholder="+1 234 567 8900" type="tel" />
          <TextInput label="WhatsApp Number" field="contact_whatsapp" placeholder="+1 234 567 8900" type="tel" />
          <TextInput label="Instagram Handle" field="instagram" placeholder="@yourhandle" />
          <TextInput label="Website / Portfolio" field="website" placeholder="https://yourwebsite.com" />
        </div>
      </div>

      {/* Stats row */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xl shadow-slate-200/50">
        <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <Star className="w-3.5 h-3.5 text-[#4F46E5]" /> Profile Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Followers", value: profile?.followers ?? "—" },
            { label: "Following", value: profile?.following ?? "—" },
            { label: "Level", value: `LV. ${profile?.level || 1}` },
            { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).getFullYear() : "2026" },
          ].map((s) => (
            <div key={s.label} className="text-center py-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
              <p className="text-slate-900 font-black text-2xl">{s.value}</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
