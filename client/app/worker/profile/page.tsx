"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  ExternalLink,
  Calendar,
  Lock,
  Plus,
  X,
  Globe,
  Tag,
  Wrench,
  DollarSign,
  Sparkles,
} from "lucide-react";
import {
  getToken,
  getSessionSnapshot,
  subscribeToSession,
  updateSessionUser,
} from "@/lib/auth-client";
import AddressSection, { AddressData } from "@/components/profile/AddressSection";

interface WorkerSkillItem {
  id: string;
  name: string;
  key?: string;
}

interface WorkerProfileData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profileImage: string | null;
  role: string;
  status: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  address: AddressData | null;
  worker?: {
    id: string;
    headline?: string | null;
    bio?: string | null;
    portfolio?: string | null;
    hourlyRate?: number | null;
    isVerified?: boolean;
    skills?: WorkerSkillItem[];
  } | null;
}

interface SystemSkill {
  id: string;
  name: string;
  key: string;
}

const POPULAR_SKILL_SUGGESTIONS = [
  "Electrical Repair",
  "Plumbing",
  "Carpentry",
  "AC Installation & Repair",
  "Painting",
  "Appliance Repair",
  "Masonry",
  "Welding",
  "Tile & Flooring",
  "Home Automation",
];

export default function WorkerManageProfilePage() {
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [activeTab, setActiveTab] = useState<"details" | "address">("details");
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states: Personal & Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states: Worker specifics
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Skills system
  const [systemSkills, setSystemSkills] = useState<SystemSkill[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [selectedDropdownSkill, setSelectedDropdownSkill] = useState("");

  // Saving states
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch worker profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const u: WorkerProfileData = data.user;
          setProfile(u);
          setName(u.name || "");
          setPhone(u.phone || "");
          setAvatarPreview(u.profileImage || null);

          if (u.worker) {
            setHeadline(u.worker.headline || "");
            setBio(u.worker.bio || "");
            setHourlyRate(
              u.worker.hourlyRate !== null && u.worker.hourlyRate !== undefined
                ? String(u.worker.hourlyRate)
                : ""
            );
            setPortfolio(u.worker.portfolio || "");
            if (u.worker.skills && Array.isArray(u.worker.skills)) {
              setSelectedSkills(u.worker.skills.map((s) => s.name));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load worker profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Fetch system skills list
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("/api/skills");
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.data || json?.data || json?.skills || [];
          if (Array.isArray(list)) {
            setSystemSkills(list);
          }
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };

    fetchSkills();
  }, []);

  // Avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "error", text: "Please select a valid image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image size must be under 5MB." });
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Skill management helpers
  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const exists = selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillInput("");
    setSelectedDropdownSkill("");
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setSelectedSkills((prev) =>
      prev.filter((s) => s.toLowerCase() !== skillNameToRemove.toLowerCase())
    );
  };

  // Save profile changes handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);

    const token = getToken();
    if (!token) {
      setProfileMsg({ type: "error", text: "Session expired. Please log in again." });
      setSaving(false);
      return;
    }

    try {
      let res: Response;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("profileImage", avatarFile);
        formData.append("name", name.trim());
        formData.append("phone", phone.trim());
        formData.append("headline", headline.trim());
        formData.append("bio", bio.trim());
        formData.append("hourlyRate", hourlyRate.trim());
        formData.append("portfolio", portfolio.trim());
        formData.append("skills", JSON.stringify(selectedSkills));

        res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            headline: headline.trim(),
            bio: bio.trim(),
            hourlyRate: hourlyRate.trim() ? Number(hourlyRate.trim()) : null,
            portfolio: portfolio.trim() || undefined,
            skills: selectedSkills,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser: WorkerProfileData = data.user;
      setProfile((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));

      updateSessionUser({
        name: updatedUser.name,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
      });

      setAvatarFile(null);
      setProfileMsg({ type: "success", text: "Worker profile details updated successfully!" });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving profile.";
      setProfileMsg({ type: "error", text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  // Unauthenticated screen
  if (!loading && !session && !profile) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-[#f8f9ff] to-[#eef2ff] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#e2e8f0] p-8 text-center shadow-lg space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#091426] tracking-tight">
              Authentication Required
            </h1>
            <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
              Please sign in to access your WorkHub Worker profile, edit your skills, hourly rate, and service address.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/worker/profile"
              className="w-full py-3 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Log In to Worker Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Modern Top Header (Clean replacement without the old banner card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/worker/dashboard"
              className="text-xs font-semibold text-[#64748b] hover:text-[#0051d5] transition-colors"
            >
              Worker Portal
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#0051d5] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
              Profile & Professional Settings
            </span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
              Worker Profile
            </h1>
            {profile?.worker?.isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Govt. Verified Pro
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Award className="w-3.5 h-3.5" />
                Standard Pro
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Manage your trade skills, hourly rate, portfolio, personal credentials, and base service location.
          </p>
        </div>

        {profile?.worker?.id && (
          <Link
            href={`/pro/${profile.worker.id}`}
            target="_blank"
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-[#f8f9ff] text-[#0051d5] border border-[#e2e8f0] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>View Public Customer Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#0051d5]/5 to-[#0d9488]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar with Upload trigger */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#091426] to-[#0051d5] p-0.5 shadow-md overflow-hidden flex items-center justify-center text-white">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt={name || "Worker Avatar"}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl bg-slate-100 text-[#0051d5]">
                    {(name || profile?.email || "W").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#0051d5] hover:bg-[#0042b0] text-white rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                title="Upload profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name, Headline, Address preview */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#091426] tracking-tight">
                  {name || profile?.name || "Professional Worker"}
                </h2>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#0051d5]/10 text-[#0051d5] border border-[#0051d5]/20 font-geist">
                  WORKER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] font-medium">
                {headline || "Specialist Tradesperson"}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#64748b] pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.email || session?.email}
                </span>
                {profile?.address && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                      {profile.address.city}, {profile.address.state}
                    </span>
                  </>
                )}
                {hourlyRate && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-[#0d9488]">
                      ₹{hourlyRate}/hr
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-xs text-slate-600 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#0051d5]" />
              <span><strong>{selectedSkills.length}</strong> Skills Listed</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "details"
                ? "bg-[#0051d5] text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Professional Details & Skills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("address")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "address"
                ? "bg-[#0051d5] text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Service Base & Address</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Professional Details & Skills */}
      {activeTab === "details" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Notification Alert */}
          {profileMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs transition-all ${
                profileMsg.type === "success"
                  ? "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Section 1: Basic Identity Information */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Personal Credentials & Contact Info
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Update your contact phone, display name, and avatar picture.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Email Address</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#0d9488] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <input
                  type="email"
                  value={profile?.email || session?.email || ""}
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-slate-500 cursor-not-allowed font-geist"
                />
              </div>

              {/* Member Since */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Member Since</span>
                </label>
                <input
                  type="text"
                  value={
                    profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Active Member"
                  }
                  disabled
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-slate-500 cursor-not-allowed font-geist"
                />
              </div>
            </div>

            {avatarFile && (
              <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-xs text-[#0051d5] flex items-center justify-between">
                <span>New photo ready: <strong>{avatarFile.name}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(profile?.profileImage || null);
                  }}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Worker Professional Data (Headline, Rate, Bio, Portfolio) */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Trade Details & Rates
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Set your professional headline, hourly billing rate, and project portfolio.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Professional Headline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155]">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Master Electrician & Certified Residential Wiring Specialist"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hourly Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Hourly Rate (₹ / hr)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 299"
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Portfolio / Website Link</span>
                  </label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.com or Instagram profile"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
              </div>

              {/* Bio & Trade Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155]">
                  Trade Bio & Experience Description
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your background, years of experience in the trade, specializations, past projects, warranties, and working philosophy..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] leading-relaxed text-[#091426]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills Management & Editing */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#091426]">
                    Trade Skills & Competencies
                  </h3>
                  <span className="text-[11px] font-bold text-[#0051d5] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                    {selectedSkills.length} Selected
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Customers and search filters match you using your skills. Add all your trade expertise below.
                </p>
              </div>
            </div>

            {/* Currently Selected Skills Display */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#334155] block">
                Active Skills
              </label>

              {selectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e2e8f0]">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#091426] border border-[#cbd5e1] shadow-2xs group hover:border-red-300 transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 text-[#0051d5]" />
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-red-500 rounded-full p-0.5 hover:bg-red-50 transition-colors cursor-pointer"
                        title={`Remove ${skill}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No skills listed yet. Choose from popular trade skills or type custom ones below.
                </div>
              )}
            </div>

            {/* Add Skill Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: Select from Platform Skills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Choose from System Skills</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedDropdownSkill}
                    onChange={(e) => setSelectedDropdownSkill(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  >
                    <option value="">-- Select a skill --</option>
                    {systemSkills.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedDropdownSkill}
                    onClick={() => handleAddSkill(selectedDropdownSkill)}
                    className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] disabled:opacity-50 text-[#091426] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Option B: Type Custom Skill */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Type Custom Skill</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    placeholder="e.g. CCTV Installation, Inverter Wiring"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                  <button
                    type="button"
                    disabled={!newSkillInput.trim()}
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="px-4 py-2 bg-[#0051d5] hover:bg-[#0042b0] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick-Add Popular Suggestions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-geist">
                Popular Quick-Add Suggestions
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddSkill(skill)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-[#334155] border-[#e2e8f0] hover:border-[#0051d5] hover:text-[#0051d5] shadow-2xs"
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#0051d5] hover:bg-[#0042b0] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Service Base Location & Address (Using common AddressSection) */}
      {activeTab === "address" && (
        <AddressSection
          initialAddress={profile?.address}
          onAddressSaved={(saved) => {
            setProfile((prev) => (prev ? { ...prev, address: saved } : null));
          }}
          title="Service Base & Operating Address"
          description="Pinpoint your working base or dispatch address on the map. Nearby customers will be matched to you based on this radius."
          badgeLabel="Work Base Location"
        />
      )}
    </div>
  );
}
