"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  MapPin,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  Briefcase,
  User,
  Phone,
  Search,
  CheckCircle2,
  DollarSign,
  Globe,
  ShieldCheck,
} from "lucide-react";
import PriceTag from "@/components/ui/PriceTag";
import {
  getToken,
  updateSessionUser,
} from "@/lib/auth-client";
import type { InteractiveMapLocation } from "@/components/map/InteractiveMap";

// Dynamic import with SSR disabled to prevent Leaflet window errors
const InteractiveMap = dynamic(
  () => import("@/components/map/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-[380px] w-full bg-slate-50 border border-slate-200/80 rounded-2xl animate-pulse">
        <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Interactive Map...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing Leaflet & GeoSearch</p>
      </div>
    ),
  }
);

interface SystemSkill {
  id: string;
  name: string;
  key?: string;
  isCustom?: boolean;
}

export default function WorkerSkillsOnboardingPage() {
  const router = useRouter();

  // Loading & initialization states
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Worker Profile fields (Backend Schema: Worker + User)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("Professional Electrical & Maintenance Specialist");
  const [bio, setBio] = useState(
    "Experienced professional delivering top-quality installation, repair, and troubleshooting services with focus on safety and customer satisfaction."
  );
  const [hourlyRate, setHourlyRate] = useState<number>(350);
  const [portfolio, setPortfolio] = useState("");

  // Skills state (Backend Schema: WorkerSkill + Skill)
  const [systemSkills, setSystemSkills] = useState<SystemSkill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [addingCustomSkill, setAddingCustomSkill] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [customSkillMsg, setCustomSkillMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address & Location state (Backend Schema: Address -> worker.addressId)
  const [addressLine, setAddressLine] = useState("Sector 62, Phase 8");
  const [city, setCity] = useState("Mohali");
  const [stateName, setStateName] = useState("Punjab");
  const [country, setCountry] = useState("India");
  const [latitude, setLatitude] = useState<number | null>(30.6996);
  const [longitude, setLongitude] = useState<number | null>(76.693);
  const [addressHighlight, setAddressHighlight] = useState(false);

  // 1. Fetch initial profile & skills on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const token = getToken();

      try {
        // Fetch skills from backend
        const skillsRes = await fetch("/api/skills");
        if (skillsRes.ok) {
          const skillsJson = await skillsRes.json();
          const list: SystemSkill[] =
            skillsJson?.data?.data || skillsJson?.data || skillsJson?.skills || [];
          if (Array.isArray(list) && isMounted) {
            setSystemSkills(list);
          }
        }

        // Fetch current worker profile if logged in
        if (token) {
          const profileRes = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            const user = profileJson?.user;

            if (user && isMounted) {
              if (user.name) setName(user.name);
              if (user.phone) setPhone(user.phone);

              if (user.worker) {
                if (user.worker.headline) setHeadline(user.worker.headline);
                if (user.worker.bio) setBio(user.worker.bio);
                if (user.worker.hourlyRate) setHourlyRate(Number(user.worker.hourlyRate));
                if (user.worker.portfolio) setPortfolio(user.worker.portfolio);
                if (user.worker.skills && Array.isArray(user.worker.skills)) {
                  const existingSkillNames = user.worker.skills.map((s: { name: string }) => s.name);
                  if (existingSkillNames.length > 0) {
                    setSelectedSkills(existingSkillNames);
                  }
                }
              }

              if (user.address) {
                if (user.address.address) setAddressLine(user.address.address);
                if (user.address.city) setCity(user.address.city);
                if (user.address.state) setStateName(user.address.state);
                if (user.address.country) setCountry(user.address.country);
                if (user.address.latitude) setLatitude(Number(user.address.latitude));
                if (user.address.longitude) setLongitude(Number(user.address.longitude));
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading onboarding data:", err);
      } finally {
        if (isMounted) setPageLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map location selection handler
  const handleMapLocationSelect = (loc: InteractiveMapLocation) => {
    setAddressLine(loc.address);
    if (loc.city) setCity(loc.city);
    if (loc.state) setStateName(loc.state);
    if (loc.country) setCountry(loc.country);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);

    setAddressHighlight(true);
    setTimeout(() => setAddressHighlight(false), 1200);
  };

  // Toggle selection for a skill
  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  // Add custom skill to backend with isCustom: true
  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;

    setAddingCustomSkill(true);
    setCustomSkillMsg(null);

    try {
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/skills", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: trimmed }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to add custom skill");
      }

      const createdSkill: SystemSkill = resData.data;

      // Add to systemSkills if not already present
      setSystemSkills((prev) => {
        const alreadyInList = prev.some(
          (s) => s.name.toLowerCase() === createdSkill.name.toLowerCase()
        );
        return alreadyInList ? prev : [createdSkill, ...prev];
      });

      // Auto-select this custom skill
      setSelectedSkills((prev) => {
        const alreadySelected = prev.some(
          (s) => s.toLowerCase() === createdSkill.name.toLowerCase()
        );
        return alreadySelected ? prev : [...prev, createdSkill.name];
      });

      setCustomSkillInput("");
      setCustomSkillMsg({
        type: "success",
        text: `Custom skill "${createdSkill.name}" added and selected!`,
      });
      setTimeout(() => setCustomSkillMsg(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding custom skill";
      setCustomSkillMsg({ type: "error", text: msg });
    } finally {
      setAddingCustomSkill(false);
    }
  };

  // Handle final submission of onboarding form
  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 1. Mandatory validation: At least one skill is required
    if (selectedSkills.length === 0) {
      setSubmitError("At least one skill is mandatory. Please select or add at least one skill.");
      // Scroll to skills section
      const el = document.getElementById("skills-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!headline.trim()) {
      setSubmitError("Please provide a professional headline describing your services.");
      return;
    }

    if (!hourlyRate || hourlyRate < 50) {
      setSubmitError("Please enter a valid base rate (minimum ₹50).");
      return;
    }

    if (!addressLine.trim() || !city.trim()) {
      setSubmitError("Please provide your service locality and city so customers nearby can find you.");
      return;
    }

    setSubmitting(true);
    const token = getToken();

    try {
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) authHeaders["Authorization"] = `Bearer ${token}`;

      // 1. Save Address to Backend
      const addressRes = await fetch("/api/user/address", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          address: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          country: country.trim() || "India",
          latitude: latitude !== null ? Number(latitude) : 0,
          longitude: longitude !== null ? Number(longitude) : 0,
        }),
      });

      if (!addressRes.ok) {
        const addrErr = await addressRes.json();
        console.warn("Address save warning:", addrErr);
      }

      // 2. Save Worker Profile Details & Skills to Backend
      const profileRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          headline: headline.trim(),
          bio: bio.trim(),
          hourlyRate: Number(hourlyRate),
          portfolio: portfolio.trim() || undefined,
          skills: selectedSkills,
        }),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileData.error || "Failed to update worker profile details.");
      }

      // 3. Update session user cache
      if (profileData.user) {
        updateSessionUser({
          name: profileData.user.name,
          phone: profileData.user.phone,
          profileImage: profileData.user.profileImage,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/worker/dashboard");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to finish onboarding.";
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  // Filter skills based on search query
  const filteredSkills = systemSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  if (pageLoading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#0051d5] animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Setting up your onboarding...</h2>
        <p className="text-xs text-slate-500">Fetching available skills and profile details</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner / Stepper Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Email Verified • Pro Profile Setup</span>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight"
          style={{ fontFamily: "var(--gesso-font-display)" }}
        >
          Complete Your Specialist Profile & Skills
        </h1>
        <p className="text-xs sm:text-sm text-[#64748b] max-w-xl mx-auto">
          We match you with nearby customer job requests based on your verified skills and service location.
          You can modify all these details anytime from your profile settings.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Profile Setup Completed!</h4>
            <p className="text-xs text-emerald-700">Redirecting to your worker dashboard...</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-semibold">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleFinishOnboarding} className="space-y-8">
        {/* =================================================================== */}
        {/* SECTION 1: Personal & Professional Essentials                       */}
        {/* =================================================================== */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Professional Headline & Contact
                </h3>
                <p className="text-xs text-[#64748b]">
                  Backend Worker Profile Essentials
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#0051d5] bg-[#eff6ff] px-2.5 py-1 rounded-full border border-[#bfdbfe]">
              Editable in Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amit Sharma"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Contact Phone</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Professional Headline</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Master Electrician & Smart Automation Specialist"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
            />
            <p className="text-[11px] text-[#64748b]">
              Appears on your public specialist card and customer search results.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#334155]">
              Short Bio / Experience
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your expertise, certifications, and years in the trade..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Hourly Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#334155] flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>Base Visit / Hourly Rate (₹)</span> <span className="text-red-500">*</span>
                </label>
                <PriceTag amount={hourlyRate} size="sm" />
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
              />
              <div className="flex justify-between text-[10px] text-[#64748b]">
                <span>₹100 (Standard)</span>
                <span>₹350 (Popular)</span>
                <span>₹1,500+ (Master)</span>
              </div>
            </div>

            {/* Portfolio Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#334155] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Portfolio / Work Link (Optional)</span>
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://instagram.com/mywork or portfolio link"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 2: Skills Matrix & Custom Skills (Mandatory At Least 1)     */}
        {/* =================================================================== */}
        <div
          id="skills-section"
          className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Skills & Specializations
                </h3>
                <p className="text-xs text-[#64748b]">
                  Loaded from backend • At least 1 skill is mandatory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  selectedSkills.length > 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200 animate-pulse"
                }`}
              >
                {selectedSkills.length > 0 ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{selectedSkills.length} Selected (Ready)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>0 Selected (At least 1 required)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Search Skills */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search available skills from backend..."
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
            />
          </div>

          {/* Available Skills Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#334155] block">
              Choose your skills:
            </label>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 py-1">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.name);
                return (
                  <button
                    key={skill.id || skill.name}
                    type="button"
                    onClick={() => toggleSkill(skill.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#091426] text-white border border-[#091426] shadow-xs"
                        : "bg-[#f8f9ff] text-[#334155] border border-[#e2e8f0] hover:border-[#0051d5] hover:bg-[#eff6ff]"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#38bdf8] stroke-[3]" />
                    )}
                    <span>{skill.name}</span>
                    {skill.isCustom && (
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        Custom
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredSkills.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">
                  No skills matched &quot;{skillSearchQuery}&quot;. You can add it as a custom skill below!
                </p>
              )}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <label className="text-xs font-bold text-[#091426]">
                Don&apos;t see your skill? Add Custom Skill to Backend:
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Solar Panel Inverter Setup, Foam Jet Deep AC Service"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSkill(e);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5]"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                disabled={addingCustomSkill || !customSkillInput.trim()}
                className="px-4 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {addingCustomSkill ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Add Skill</span>
              </button>
            </div>

            {customSkillMsg && (
              <p
                className={`text-xs p-2 rounded-lg ${
                  customSkillMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {customSkillMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 3: Service Location & Interactive Map                       */}
        {/* =================================================================== */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#0051d5] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Service Location & Pinpoint Map
                </h3>
                <p className="text-xs text-[#64748b]">
                  Customers within your radius will see you when booking
                </p>
              </div>
            </div>

            {latitude && longitude && (
              <div className="text-[11px] font-mono text-[#0051d5] bg-[#eff6ff] px-2.5 py-1 rounded-full border border-[#bfdbfe] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0051d5]" />
                <span>
                  {Number(latitude).toFixed(4)}°, {Number(longitude).toFixed(4)}°
                </span>
              </div>
            )}
          </div>

          {/* Interactive Map Component */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Search your locality, click anywhere on the map, or click <strong>&quot;Find GPS&quot;</strong> to pinpoint your service headquarters:
            </p>
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
              <InteractiveMap
                initialLat={latitude ?? 30.6996}
                initialLng={longitude ?? 76.693}
                initialAddress={addressLine || "Mohali, Punjab, India"}
                onLocationSelect={handleMapLocationSelect}
                height="400px"
              />
            </div>
          </div>

          {/* Address Inputs (Auto-Filled + Editable) */}
          <div
            className={`p-4 rounded-2xl bg-[#f8f9ff] border transition-all duration-300 space-y-4 ${
              addressHighlight ? "border-[#0051d5] ring-2 ring-[#0051d5]/20" : "border-[#e2e8f0]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#091426] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                <span>Confirmed Address Fields</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Synced from Map
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#475569]">
                  Street Address / Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. SCO 45, Phase 7 or Sector 62"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#475569]">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mohali / Chandigarh"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#475569]">
                  State / Region
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Punjab / UT"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#0051d5]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 4: Submit & Launch                                          */}
        {/* =================================================================== */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#091426]">Ready to launch your Pro Profile</h4>
              <p className="text-xs text-[#64748b]">
                Clicking complete will save your skills and location, making you visible to customers in Chandigarh, Mohali & Panchkula.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || selectedSkills.length === 0}
            className="w-full py-4 px-6 bg-[#0051d5] hover:bg-[#0042b0] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile & Skills to Backend...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Go to Worker Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-[#64748b]">
            Need to update something later? All details can be modified at any time in{" "}
            <span className="font-semibold text-[#0051d5]">Worker Profile & Settings</span>.
          </p>
        </div>
      </form>
    </div>
  );
}
