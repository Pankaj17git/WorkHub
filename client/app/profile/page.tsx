"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Briefcase,
  ExternalLink,
  Navigation,
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Lock,
} from "lucide-react";
import {
  getToken,
  getSessionSnapshot,
  subscribeToSession,
  updateSessionUser,
} from "@/lib/auth-client";
import type { InteractiveMapLocation } from "@/components/map/InteractiveMap";

// Dynamic import with SSR disabled to prevent Leaflet window errors
const InteractiveMap = dynamic(
  () => import("@/components/map/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-[420px] w-full bg-slate-50 border border-slate-200/80 rounded-2xl animate-pulse">
        <div className="w-10 h-10 border-4 border-[#0051d5] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Interactive Map...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing Leaflet & GeoSearch</p>
      </div>
    ),
  }
);

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profileImage: string | null;
  role: string;
  status: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  address: {
    id: string;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  customer?: {
    companyName?: string | null;
    phone?: string | null;
  } | null;
  worker?: {
    headline?: string | null;
    bio?: string | null;
    skills?: Array<{ id: string; name: string }>;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [activeTab, setActiveTab] = useState<"personal" | "address">("personal");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State: Personal Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State: Address
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const [latitude, setLatitude] = useState<number | null>(30.6996);
  const [longitude, setLongitude] = useState<number | null>(76.693);
  const [addressHighlight, setAddressHighlight] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch full user profile
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
          const u: ProfileData = data.user;
          setProfile(u);
          setName(u.name || "");
          setPhone(u.phone || "");
          setAvatarPreview(u.profileImage || null);
          if (u.customer?.companyName) setCompanyName(u.customer.companyName);
          if (u.worker?.headline) setHeadline(u.worker.headline);
          if (u.worker?.bio) setBio(u.worker.bio);

          if (u.address) {
            setAddressLine(u.address.address || "");
            setCity(u.address.city || "");
            setStateName(u.address.state || "");
            setCountry(u.address.country || "India");
            if (u.address.latitude) setLatitude(u.address.latitude);
            if (u.address.longitude) setLongitude(u.address.longitude);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  // Save personal details + avatar
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const token = getToken();
    if (!token) {
      setProfileMsg({ type: "error", text: "Session expired. Please log in again." });
      setSavingProfile(false);
      return;
    }

    try {
      let res: Response;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("profileImage", avatarFile);
        formData.append("name", name.trim());
        formData.append("phone", phone.trim());
        if (companyName) formData.append("companyName", companyName.trim());
        if (headline) formData.append("headline", headline.trim());
        if (bio) formData.append("bio", bio.trim());

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
            companyName: companyName.trim() || undefined,
            headline: headline.trim() || undefined,
            bio: bio.trim() || undefined,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile((prev) => (prev ? { ...prev, ...data.user } : data.user));
      updateSessionUser({
        name: data.user.name,
        phone: data.user.phone,
        profileImage: data.user.profileImage,
      });

      setAvatarFile(null);
      setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving profile.";
      setProfileMsg({ type: "error", text: errorMsg });
    } finally {
      setSavingProfile(false);
    }
  };

  // Map coordinate/address selection callback
  const handleMapLocationSelect = (loc: InteractiveMapLocation) => {
    setAddressLine(loc.address);
    if (loc.city) setCity(loc.city);
    if (loc.state) setStateName(loc.state);
    if (loc.country) setCountry(loc.country);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);

    // Flash feedback
    setAddressHighlight(true);
    setTimeout(() => setAddressHighlight(false), 1500);
  };

  // Save address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMsg(null);

    const token = getToken();
    if (!token) {
      setAddressMsg({ type: "error", text: "Session expired. Please log in again." });
      setSavingAddress(false);
      return;
    }

    if (!addressLine.trim() || !city.trim() || !stateName.trim() || !country.trim()) {
      setAddressMsg({ type: "error", text: "Please fill in all required address fields." });
      setSavingAddress(false);
      return;
    }

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          country: country.trim(),
          latitude: latitude !== null ? Number(latitude) : 0,
          longitude: longitude !== null ? Number(longitude) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to save address");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              address: {
                id: data.data?.address?.id || prev.address?.id || "1",
                address: addressLine.trim(),
                city: city.trim(),
                state: stateName.trim(),
                country: country.trim(),
                latitude: latitude,
                longitude: longitude,
              },
            }
          : null
      );

      setAddressMsg({ type: "success", text: "Address saved and linked to your profile successfully!" });
      setTimeout(() => setAddressMsg(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving address.";
      setAddressMsg({ type: "error", text: errorMsg });
    } finally {
      setSavingAddress(false);
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
              Please sign in to access your WorkHub profile, edit personal details, and configure your service address.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/profile"
              className="w-full py-3 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Log In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="w-full py-2.5 px-4 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#091426] text-xs font-semibold rounded-xl transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#f1f5f9] to-[#ffffff] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/"
                className="text-xs font-semibold text-[#64748b] hover:text-[#0051d5] transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-[#0051d5] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                Account Settings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
              Profile & Service Address
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
              Manage your personal credentials, contact info, and pinpoint your default address on the live map.
            </p>
          </div>

          {profile?.role === "WORKER" && (
            <Link
              href="/worker/dashboard"
              className="self-start sm:self-auto px-4 py-2 bg-[#f0fdfa] hover:bg-[#ccfbf1] text-[#0d9488] border border-[#a7f3d0] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Go to Worker Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Hero Card: User Overview & Avatar */}
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
                      alt={name || "User Avatar"}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl bg-slate-100 text-[#0051d5]">
                      {(name || profile?.email || "U").charAt(0).toUpperCase()}
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

              {/* Name, Email, Badges */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#091426] tracking-tight">
                    {name || profile?.name || "WorkHub User"}
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      profile?.role === "WORKER"
                        ? "bg-[#ecfdf5] text-[#0d9488] border border-[#a7f3d0]"
                        : "bg-[#eff6ff] text-[#0051d5] border border-[#bfdbfe]"
                    }`}
                  >
                    {profile?.role === "WORKER" ? "Verified Pro" : "Verified Customer"}
                  </span>
                </div>

                <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#0051d5]" />
                  <span>{profile?.email || session?.email}</span>
                </p>

                {profile?.phone && (
                  <p className="text-xs text-[#64748b] flex items-center gap-1.5 font-geist">
                    <Phone className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>{profile.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs border-t sm:border-t-0 border-[#f1f5f9] pt-4 sm:pt-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                <span>Account Status: </span>
                <strong className="text-[#091426] font-bold">
                  {profile?.status || "ACTIVE"}
                </strong>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-[#0051d5]" />
                <span>Address: </span>
                <strong className="text-[#091426] font-bold">
                  {profile?.address ? `${profile.address.city || "Configured"}` : "Not Set"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-1">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "personal"
                ? "bg-[#0051d5] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#091426] hover:bg-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab("address")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "address"
                ? "bg-[#0051d5] text-white shadow-sm"
                : "text-[#64748b] hover:text-[#091426] hover:bg-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Address & Map</span>
            {profile?.address && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "address" ? "bg-white/20 text-white" : "bg-[#ecfdf5] text-[#0d9488]"
                }`}
              >
                Active
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Personal Details */}
        {activeTab === "personal" && (
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-base font-bold text-[#091426]">
                  Personal Information & Credentials
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Update your contact details visible on service bookings and invoices.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#0d9488] bg-[#f0fdfa] border border-[#a7f3d0] px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Cloud Sync
              </span>
            </div>

            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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

            <form onSubmit={handleSaveProfile} className="space-y-5">
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] focus:bg-white text-[#091426] transition-all"
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
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] focus:bg-white text-[#091426] font-geist transition-all"
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
                  <p className="text-[10px] text-slate-400">
                    Email address is tied to your login credentials and OTP verification.
                  </p>
                </div>

                {/* Account Role & Created At */}
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

              {/* Role-Specific Fields */}
              {profile?.role === "WORKER" ? (
                <div className="space-y-4 pt-2 border-t border-[#f1f5f9]">
                  <h4 className="text-xs font-bold text-[#091426] uppercase tracking-wider font-geist">
                    Professional Pro Details
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155]">Professional Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Master Electrician & Certified Home Wiring Specialist"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155]">Profile Bio & Experience</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your years of trade experience, specializations, and guarantees..."
                      className="w-full p-3 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 pt-2 border-t border-[#f1f5f9]">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Company / Business Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Residencies or Sharma Electronics"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
              )}

              {/* Avatar File Notice */}
              {avatarFile && (
                <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-xs text-[#0051d5] flex items-center justify-between">
                  <span>New avatar selected: <strong>{avatarFile.name}</strong></span>
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

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
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
          </div>
        )}

        {/* Tab 2: Saved Address & Interactive Map */}
        {activeTab === "address" && (
          <div className="space-y-6">
            
            {/* Current Address Summary Box */}
            {profile?.address ? (
              <div className="bg-white border border-[#a7f3d0] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-[#f0fdfa]">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-[#ecfdf5] text-[#0d9488] shrink-0 border border-[#a7f3d0]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#091426]">
                        Current Primary Service Address
                      </h3>
                      <span className="text-[10px] font-extrabold text-[#0d9488] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] font-medium mt-1 leading-relaxed">
                      {profile.address.address}, {profile.address.city}, {profile.address.state} — {profile.address.country}
                    </p>
                    {profile.address.latitude && profile.address.longitude && (
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        GPS: {Number(profile.address.latitude).toFixed(4)}°, {Number(profile.address.longitude).toFixed(4)}°
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-[#0d9488] bg-white px-3 py-1.5 rounded-xl border border-[#a7f3d0] self-start sm:self-auto shadow-2xs">
                  Active & Verified
                </span>
              </div>
            ) : (
              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-3xl p-5 text-xs text-[#92400e] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#d97706] shrink-0" />
                <span>
                  No default address linked to your account yet. Use the interactive map below or enter your details manually to set your address.
                </span>
              </div>
            )}

            {/* Live Interactive Map Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#091426]">
                      Pinpoint Address on Map
                    </h3>
                    <span className="text-[11px] font-bold text-[#0051d5] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Auto-Fill Enabled
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Click anywhere on the map, use the search bar, or click &apos;Find GPS&apos; to automatically fill the address form.
                  </p>
                </div>
              </div>

              {/* Interactive Map Component */}
              <div className="w-full">
                <InteractiveMap
                  initialLat={latitude ?? 30.6996}
                  initialLng={longitude ?? 76.693}
                  initialAddress={addressLine || "Mohali, Punjab, India"}
                  onLocationSelect={handleMapLocationSelect}
                  height="460px"
                />
              </div>
            </div>

            {/* Address Input Form */}
            <div
              className={`bg-white border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-all duration-500 ${
                addressHighlight
                  ? "border-[#0051d5] ring-4 ring-[#0051d5]/15"
                  : "border-[#e2e8f0]"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h3 className="text-base font-bold text-[#091426]">
                    Address Details & Coordinates
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Review and fine-tune your street address, apartment number, and city.
                  </p>
                </div>
              </div>

              {addressMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    addressMsg.type === "success"
                      ? "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {addressMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{addressMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-4">
                {/* Street / House Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#0051d5]" />
                    <span>Street Address / House / Flat No.</span>
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Flat 402, GR Tower, Sector 75"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] focus:bg-white text-[#091426] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155]">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mohali / Chandigarh"
                      required
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155]">State / Province</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Punjab"
                      required
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#334155]">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      required
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                    />
                  </div>
                </div>

                {/* GPS Coordinates Display & Edit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1 font-geist">
                      <Compass className="w-3.5 h-3.5 text-[#0051d5]" />
                      <span>Latitude</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={latitude !== null ? latitude : ""}
                      onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="30.6996"
                      className="w-full px-3.5 py-2 text-xs bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl font-mono text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1 font-geist">
                      <Compass className="w-3.5 h-3.5 text-[#0051d5]" />
                      <span>Longitude</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={longitude !== null ? longitude : ""}
                      onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="76.6930"
                      className="w-full px-3.5 py-2 text-xs bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl font-mono text-slate-700"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-6 py-2.5 bg-[#0051d5] hover:bg-[#0042b0] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {savingAddress ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Address...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Link Address</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
