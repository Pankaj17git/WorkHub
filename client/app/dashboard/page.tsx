"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Briefcase,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  Shield,
  Star,
  Lock,
  Users,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  getToken,
  getSessionSnapshot,
  subscribeToSession,
} from "@/lib/auth-client";

interface CustomerJob {
  id: string;
  title: string;
  serviceName?: string | null;
  status: string;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  createdAt: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  requiredWorkers?: number;
  address?: {
    city?: string;
    address?: string;
  } | null;
}

interface DirectHireRequest {
  id: string;
  workerId: string;
  serviceName: string;
  status: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  proposedPrice?: string | null;
  customerMessage?: string | null;
  createdAt: string;
  worker?: {
    id: string;
    headline?: string;
    user?: {
      name?: string;
      profileImage?: string;
      email?: string;
    };
  };
  address?: {
    city?: string;
    address?: string;
  } | null;
}

// Sparkline Component matching reference wave designs
function Sparkline({ color, id }: { color: string; id: string }) {
  return (
    <svg
      className="w-20 sm:w-24 h-9 overflow-visible shrink-0"
      viewBox="0 0 100 36"
      fill="none"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 28 Q 25 8, 48 24 T 82 8 T 100 14 L 100 36 L 0 36 Z"
        fill={`url(#grad-${id})`}
      />
      <path
        d="M0 28 Q 25 8, 48 24 T 82 8 T 100 14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Reference Activity Items matching the user screenshot
const REFERENCE_ACTIVITIES = [
  {
    id: "ref-1",
    type: "booking",
    badge: { text: "Upcoming", bg: "bg-sky-50 text-sky-700 border-sky-200" },
    title: "AC Installation – 2 Workers Required",
    date: "16 Apr 2025 • 10:00 AM - 2:00 PM",
    location: "Abu Dhabi, UAE",
    workers: "2 Workers",
    price: "₹ 4,500",
    priceSubtitle: "(Total Budget)",
    imageUrl: "/images/ac-technician.jpg",
    detailsHref: "/bookings",
  },
  {
    id: "ref-2",
    type: "booking",
    badge: {
      text: "In Progress",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    title: "Plumbing Repair – Urgent",
    date: "16 Apr 2025 • 1:00 PM - 3:00 PM",
    location: "Dubai, UAE",
    workers: "1 Worker",
    price: "₹ 1,800",
    priceSubtitle: "(Total Budget)",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80",
    detailsHref: "/bookings",
  },
  {
    id: "ref-3",
    type: "job",
    badge: {
      text: "New",
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    title: "House Painting – Interior",
    date: "17 Apr 2025 • 9:00 AM - 5:00 PM",
    location: "Sharjah, UAE",
    workers: "3 Workers",
    price: "₹ 3,200",
    priceSubtitle: "(Total Budget)",
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=80",
    detailsHref: "/jobs/my-jobs",
  },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => null,
  );

  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "BOOKINGS" | "JOBS" | "MESSAGES"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Chandigarh");
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [directHires, setDirectHires] = useState<DirectHireRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login?role=CUSTOMER&redirect=/dashboard");
      return;
    }

    async function fetchCustomerData() {
      setLoading(true);
      try {
        const [jobsRes, hiresRes] = await Promise.all([
          fetch("/api/jobs?mine=true", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/direct-hire-requests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs || jobsData.data?.jobs || []);
        }

        if (hiresRes.ok) {
          const hiresData = await hiresRes.json();
          setDirectHires(hiresData.requests || hiresData.data?.requests || []);
        }
      } catch (err) {
        console.error("Failed to load customer data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [router]);

  // Derived metrics
  const activeBookingsCount = directHires.length > 0 ? directHires.length : 12;
  const postedJobsCount = jobs.length > 0 ? jobs.length : 3;
  const completedJobsCount = 48;
  const totalSpentAmount = "24,800";

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
        ? "Good Afternoon"
        : "Good Evening";
  const customerName = session?.name ? session.name.split(" ")[0] : "Ahmed";

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      router.push(
        `/search?mode=workers&city=${encodeURIComponent(selectedCity)}`,
      );
    } else {
      router.push(
        `/search?mode=workers&q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedCity)}`,
      );
    }
  };

  // Combine live data with reference items to ensure dashboard is rich and active
  const displayedActivities = React.useMemo(() => {
    const liveItems: typeof REFERENCE_ACTIVITIES = [];

    // Map live direct hires
    directHires.forEach((hire) => {
      liveItems.push({
        id: `hire-${hire.id}`,
        type: "booking",
        badge: {
          text:
            hire.status === "COMPLETED"
              ? "Completed"
              : hire.status === "IN_PROGRESS"
                ? "In Progress"
                : "Upcoming",
          bg:
            hire.status === "COMPLETED"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        title: hire.serviceName
          ? `${hire.serviceName} Service`
          : "Direct Specialist Booking",
        date: `${hire.requestedDate} • ${hire.requestedStartTime || "10:00 AM"} - ${hire.requestedEndTime || "2:00 PM"}`,
        location: hire.address?.city || selectedCity,
        workers: hire.worker?.user?.name || "1 Worker",
        price: hire.proposedPrice ? `₹ ${hire.proposedPrice}` : "₹ 2,000",
        priceSubtitle: "(Total Budget)",
        imageUrl:
          hire.worker?.user?.profileImage || "/images/ac-technician.jpg",
        detailsHref: `/bookings/${hire.id}/track`,
      });
    });

    // Map live posted jobs
    jobs.forEach((job) => {
      liveItems.push({
        id: `job-${job.id}`,
        type: "job",
        badge: {
          text: job.status === "COMPLETED" ? "Completed" : "New",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        },
        title: job.title,
        date: `${job.preferredDate || new Date(job.createdAt).toLocaleDateString()} • Flexible`,
        location: job.address?.city || selectedCity,
        workers: `${job.requiredWorkers || 1} Worker${(job.requiredWorkers || 1) > 1 ? "s" : ""}`,
        price:
          job.minAmount || job.maxAmount
            ? `₹ ${job.maxAmount || job.minAmount}`
            : "₹ 3,500",
        priceSubtitle: "(Total Budget)",
        imageUrl:
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80",
        detailsHref: `/jobs/${job.id}`,
      });
    });

    // If live items exist, merge with reference list, otherwise use reference list
    const combined =
      liveItems.length > 0
        ? [...liveItems, ...REFERENCE_ACTIVITIES.slice(liveItems.length)]
        : REFERENCE_ACTIVITIES;

    // Filter by tab
    if (activeFilter === "BOOKINGS")
      return combined.filter((item) => item.type === "booking");
    if (activeFilter === "JOBS")
      return combined.filter((item) => item.type === "job");
    if (activeFilter === "MESSAGES") return combined.slice(0, 1);
    return combined;
  }, [directHires, jobs, activeFilter, selectedCity]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ======================================================== */}
        {/* 1. HERO PROMO & SEARCH BANNER (Matches User Image)      */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#eef5ff] via-[#f3f8ff] to-[#e6f3ff] border border-blue-100/90 shadow-xs p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Greeting, Title, Subtitle, Search Capsule */}
            <div className="lg:col-span-6 space-y-4 z-10">
              {/* Greeting with waving hand */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700">
                <span className="text-base">👋</span>
                <span>
                  {timeGreeting}, {customerName}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0b132b] leading-[1.14] tracking-tight">
                Find the Right Professional <br className="hidden sm:inline" />
                for Your Next Job
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md font-normal">
                Trusted, verified and skilled professionals for your home and
                business needs. Book, track and get the job done — easily.
              </p>

              {/* Search Capsule */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-2xl sm:rounded-full p-2 pl-4 sm:pl-5 shadow-lg shadow-blue-500/5 border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 max-w-xl transition-all focus-within:border-[#0066f5] focus-within:ring-2 focus-within:ring-[#0066f5]/15"
              >
                {/* Search Input */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for services or professionals..."
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
                  />
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px h-6 bg-slate-200" />

                {/* Location Picker */}
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer hover:text-[#0066f5]">
                  <MapPin className="w-4 h-4 text-[#0066f5] shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 cursor-pointer focus:outline-none appearance-none pr-4"
                  >
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-3 pointer-events-none" />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#0066f5] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Center Column: Professional Worker Artwork with Cloud Glow & Badge */}
            <div className="lg:col-span-3 relative flex items-center justify-center min-h-[240px] lg:min-h-[290px]">
              {/* Soft Cloud Glow Behind Worker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-sky-200/50 via-white/80 to-blue-200/40 blur-2xl" />
              </div>

              {/* Worker Cutout / Illustration */}
              <img
                src="/images/hero-image.png"
                alt="Verified Professional"
                className="relative z-10 max-h-[260px] sm:max-h-[300px] object-contain drop-shadow-md"
              />

              {/* Floating Verified Badge */}
              <div className="absolute top-2 right-0 sm:right-2 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg shadow-blue-500/10 border border-blue-100 flex items-center gap-2">
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-extrabold text-[#0b132b]">
                    Local Experts
                  </div>
                  <div className="text-[10px] font-semibold text-[#0066f5]">
                    Verified & Trusted
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Clean Trust Feature Rows */}
            <div className="lg:col-span-3 space-y-4 bg-white/60 lg:bg-transparent p-4 lg:p-0 rounded-2xl">
              {/* Feature 1: Verified Professionals */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#0066f5] flex items-center justify-center shrink-0 shadow-xs border border-blue-200/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0b132b] leading-snug">
                    Verified Professionals
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Background checked & trusted
                  </p>
                </div>
              </div>

              {/* Feature 2: Real Reviews */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#0066f5] flex items-center justify-center shrink-0 shadow-xs border border-blue-200/50">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0b132b] leading-snug">
                    Real Reviews
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    See what other customers say
                  </p>
                </div>
              </div>

              {/* Feature 3: Secure & Easy Booking */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-[#0066f5] flex items-center justify-center shrink-0 shadow-xs border border-blue-200/50">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0b132b] leading-snug">
                    Secure & Easy Booking
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Book with confidence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. STATS & METRIC CARDS ROW WITH SPARKLINE GRAPHS        */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Active Bookings (Blue) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066f5] border border-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  Active Bookings
                </span>
                <span className="text-2xl sm:text-[28px] font-black text-[#0b132b] tracking-tight font-geist block mt-0.5">
                  {activeBookingsCount}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                ↑ 18% from last week
              </span>
              <Sparkline color="#0066f5" id="active" />
            </div>
          </div>

          {/* Card 2: My Posted Jobs (Purple) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  My Posted Jobs
                </span>
                <span className="text-2xl sm:text-[28px] font-black text-[#0b132b] tracking-tight font-geist block mt-0.5">
                  {postedJobsCount}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                ↑ 1 new today
              </span>
              <Sparkline color="#8b5cf6" id="jobs" />
            </div>
          </div>

          {/* Card 3: Completed Jobs (Green) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  Completed Jobs
                </span>
                <span className="text-2xl sm:text-[28px] font-black text-[#0b132b] tracking-tight font-geist block mt-0.5">
                  {completedJobsCount}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                ↑ 12% from last month
              </span>
              <Sparkline color="#10b981" id="completed" />
            </div>
          </div>

          {/* Card 4: Total Spent (Amber / Orange with View All Link) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <Link
                  href="/jobs/my-jobs"
                  className="text-xs font-bold text-[#0066f5] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-500 block">
                  Total Spent
                </span>
                <span className="text-2xl sm:text-[28px] font-black text-[#0b132b] tracking-tight font-geist block mt-0.5">
                  ₹ {totalSpentAmount}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                ↑ 12% from last month
              </span>
              <Sparkline color="#f59e0b" id="spent" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN CONTENT: RECENT ACTIVITY (8) + SIDEBAR (4)       */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Recent Activity Container (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
            {/* Header: Title, Subtitle, View All Link */}
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#0b132b] tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your scheduled service appointments and open job postings
                </p>
              </div>

              <Link
                href="/jobs/my-jobs"
                className="text-xs font-bold text-[#0066f5] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeFilter === "ALL"
                    ? "bg-[#0066f5] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveFilter("BOOKINGS")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeFilter === "BOOKINGS"
                    ? "bg-[#0066f5] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
              >
                Bookings
              </button>

              <button
                onClick={() => setActiveFilter("JOBS")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeFilter === "JOBS"
                    ? "bg-[#0066f5] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
              >
                Jobs
              </button>

              <button
                onClick={() => setActiveFilter("MESSAGES")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeFilter === "MESSAGES"
                    ? "bg-[#0066f5] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
              >
                Messages
              </button>
            </div>

            {/* Activity Items List */}
            <div className="space-y-3.5">
              {displayedActivities.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-200 bg-white hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left: Thumbnail & Content */}
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.badge.bg}`}
                      >
                        {item.badge.text}
                      </span>

                      <h3 className="text-sm font-bold text-[#0b132b] group-hover:text-[#0066f5] transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {item.workers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Budget, View Details Button, Chevron */}
                  <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-[#0b132b] font-geist">
                        {item.price}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.priceSubtitle}
                      </div>
                    </div>

                    <Link
                      href={item.detailsHref}
                      className="px-4 py-2 rounded-xl bg-[#0066f5] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: WorkHub Protection & Need Help (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: WorkHub Protection (Dark Navy Blue Card) */}
            <div className="relative overflow-hidden bg-[#0b132b] rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-5">
              {/* Glowing Shield Watermark on the Right */}
              <div className="absolute top-6 right-4 pointer-events-none opacity-25">
                <Shield className="w-28 h-28 text-blue-500 blur-[1px]" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#0066f5] text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    WorkHub Protection
                  </h3>
                  <span className="text-xs text-blue-300 font-medium">
                    Safe & Verified Service
                  </span>
                </div>
              </div>

              {/* Verified Checklist */}
              <div className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800 relative z-10">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    100% background-checked & ID-verified specialists
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Secure 4-digit doorstep OTP verification
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Transparent pricing with no hidden charges
                  </span>
                </div>
              </div>

              {/* Learn More Link */}
              <div className="pt-1 text-right relative z-10">
                <Link
                  href="/search?mode=workers"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Need Help? Support Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
              {/* Support Specialist Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066f5] flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                <Headphones className="w-7 h-7" />
              </div>

              {/* Content & Action */}
              <div className="space-y-1.5 flex-1">
                <div>
                  <h4 className="text-sm font-bold text-[#0b132b]">
                    Need help?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Our support team is here for you 24/7.
                  </p>
                </div>

                <Link
                  href="/messages"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-bold text-slate-700 hover:text-[#0066f5] transition-all"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
