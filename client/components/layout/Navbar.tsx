'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  Search,
  Briefcase,
  MessageSquare,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { clearSession, getSessionSnapshot, subscribeToSession, getToken } from '@/lib/auth-client';
import WorkHubLogo from '@/components/ui/WorkHubLogo';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const isCustomer = session?.role === 'CUSTOMER';
  const isWorker = session?.role === 'WORKER';

  // Fetch unread notifications for logged-in user
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    fetch('/api/notifications?unread=true', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) {
          setUnreadCount(data.notifications.length);
        }
      })
      .catch(() => {});
  }, [session]);

  // Close dropdowns on route changes
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click-outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Role-based search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (isWorker) {
      // Workers search for available jobs
      router.push(`/jobs?q=${encodeURIComponent(query)}`);
    } else if (isCustomer) {
      // Customers search for workers / pros
      router.push(`/search?mode=workers&q=${encodeURIComponent(query)}`);
    } else {
      // Guests search workers / services
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Search input placeholder based on role
  const searchPlaceholder = isWorker
    ? 'Search jobs (wiring, plumbing, repairs)...'
    : isCustomer
    ? 'Search workers (electrician, carpenter, AC)...'
    : 'Search workers or services...';

  // Helper to determine active tab style
  const isHomeActive = pathname === '/';
  const isFindWorkersActive =
    pathname === '/search' && searchParams?.get('mode') !== 'jobs';
  const isFindJobsActive =
    pathname.startsWith('/jobs') && pathname !== '/jobs/new' ||
    (pathname === '/search' && searchParams?.get('mode') === 'jobs');
  const isMessagesActive = pathname.startsWith('/messages');
  const isNotificationsActive = pathname.startsWith('/notifications');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left: Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <WorkHubLogo size={34} />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0f172a] leading-none group-hover:text-[#0066f5] transition-colors">
                Work<span className="text-[#0066f5]">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                Skilled People, Real Work.
              </span>
            </div>
          </Link>

          {/* 2. Center: Navigation Items with Icons & Active Indicator */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full">
            {/* Home */}
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-semibold h-full border-b-2 transition-colors px-1 ${
                isHomeActive
                  ? 'text-[#0066f5] border-[#0066f5]'
                  : 'text-slate-600 hover:text-[#0066f5] border-transparent'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* Find Workers (Only Customer & Guest) */}
            {(!session || isCustomer) && (
              <Link
                href="/search?mode=workers"
                className={`flex items-center gap-2 text-sm font-semibold h-full border-b-2 transition-colors px-1 ${
                  isFindWorkersActive
                    ? 'text-[#0066f5] border-[#0066f5]'
                    : 'text-slate-600 hover:text-[#0066f5] border-transparent'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Find Workers</span>
              </Link>
            )}

            {/* Find Jobs (Only Worker & Guest) */}
            {(!session || isWorker) && (
              <Link
                href="/jobs"
                className={`flex items-center gap-2 text-sm font-semibold h-full border-b-2 transition-colors px-1 ${
                  isFindJobsActive
                    ? 'text-[#0066f5] border-[#0066f5]'
                    : 'text-slate-600 hover:text-[#0066f5] border-transparent'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Find Jobs</span>
              </Link>
            )}

            {/* Messages (Authenticated only) */}
            {session && (
              <Link
                href="/messages"
                className={`flex items-center gap-2 text-sm font-semibold h-full border-b-2 transition-colors px-1 ${
                  isMessagesActive
                    ? 'text-[#0066f5] border-[#0066f5]'
                    : 'text-slate-600 hover:text-[#0066f5] border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </Link>
            )}

            {/* Notifications (Authenticated only) */}
            {session && (
              <Link
                href="/notifications"
                className={`flex items-center gap-2 text-sm font-semibold h-full border-b-2 transition-colors px-1 relative ${
                  isNotificationsActive
                    ? 'text-[#0066f5] border-[#0066f5]'
                    : 'text-slate-600 hover:text-[#0066f5] border-transparent'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* 3. Role-Aware Search Box (Shown to both roles + guests) */}
          {/* <div className="hidden md:flex items-center flex-1 max-w-xs xl:max-w-sm">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066f5] focus:bg-white focus:ring-2 focus:ring-[#0066f5]/15 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div> */}

          {/* 4. Right Actions: Post Job, Profile Chip or Login/Sign Up */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            
            {/* Post Job Option (Customer or Unregistered Guest) */}
            {isCustomer && (
              <Link
                href="/jobs/new"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0066f5] hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post a Job</span>
              </Link>
            )}

            {!session && (
              <Link
                href="/login?redirect=/jobs/new"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0066f5] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                title="Post a job (sign in required)"
              >
                <Plus className="w-3.5 h-3.5 text-[#0066f5]" />
                <span>Post a Job</span>
              </Link>
            )}

            {/* Authenticated User Profile Chip with Dropdown */}
            {session ? (
              <div className="flex items-center gap-2">
                {/* Standalone Bell with notification badge */}
                <Link
                  href="/notifications"
                  className="p-2 text-slate-500 hover:text-[#0066f5] hover:bg-slate-50 rounded-xl transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </Link>

                {/* Profile Pill & Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                    aria-expanded={profileDropdownOpen}
                  >
                    {/* User Avatar */}
                    {session.profileImage ? (
                      <img
                        src={session.profileImage}
                        alt={session.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066f5] to-blue-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {(session.name || session.email || 'U')[0].toUpperCase()}
                      </div>
                    )}

                    {/* Name & Role Subtitle */}
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                        {session.name || session.email}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {isWorker ? 'Worker' : 'Customer'}
                      </span>
                    </div>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                        profileDropdownOpen ? 'rotate-180 text-[#0066f5]' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {session.name || 'WorkHub Member'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{session.email}</div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-[#0066f5] border border-blue-100">
                          <Sparkles className="w-3 h-3" />
                          {isWorker ? 'Verified Worker' : 'Customer Account'}
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0066f5] transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Settings</span>
                        </Link>

                        {isCustomer && (
                          <>
                            <Link
                              href="/jobs/my-jobs"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0066f5] transition-colors"
                            >
                              <Layers className="w-4 h-4 text-slate-400" />
                              <span>My Posted Jobs</span>
                            </Link>
                            <Link
                              href="/bookings"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0066f5] transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>My Bookings</span>
                            </Link>
                          </>
                        )}

                        {isWorker && (
                          <Link
                            href="/worker/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#0d9488] hover:bg-emerald-50 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-[#0d9488]" />
                            <span>Worker Dashboard</span>
                          </Link>
                        )}

                        <Link
                          href="/messages"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0066f5] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>Messages</span>
                        </Link>

                        <Link
                          href="/notifications"
                          className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0066f5] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <span>Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            clearSession();
                            router.push('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated: Login & Sign Up */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#0066f5] hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0066f5] hover:bg-blue-700 rounded-xl shadow-xs transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* 5. Mobile Hamburger Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {session && (
              <Link
                href="/notifications"
                className="p-2 text-slate-500 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 6. Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066f5]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <div className="flex flex-col gap-1 pt-2">
              <Link
                href="/"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isHomeActive ? 'text-[#0066f5] bg-blue-50/70' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {(!session || isCustomer) && (
                <Link
                  href="/search?mode=workers"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isFindWorkersActive
                      ? 'text-[#0066f5] bg-blue-50/70'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Find Workers</span>
                </Link>
              )}

              {(!session || isWorker) && (
                <Link
                  href="/jobs"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isFindJobsActive
                      ? 'text-[#0066f5] bg-blue-50/70'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Find Jobs</span>
                </Link>
              )}

              {/* Post a Job for Customer or Unregistered */}
              {isCustomer && (
                <Link
                  href="/jobs/new"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-[#0066f5] bg-blue-50 hover:bg-blue-100/70 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Job</span>
                </Link>
              )}

              {!session && (
                <Link
                  href="/login?redirect=/jobs/new"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-[#0066f5] bg-blue-50 hover:bg-blue-100/70 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Job</span>
                </Link>
              )}

              {session && (
                <>
                  <Link
                    href="/messages"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isMessagesActive
                        ? 'text-[#0066f5] bg-blue-50/70'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    href="/notifications"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isNotificationsActive
                        ? 'text-[#0066f5] bg-blue-50/70'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isWorker && (
                <Link
                  href="/worker/dashboard"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold mt-1"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Worker Dashboard</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Mobile Auth footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 mt-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                      {session.profileImage ? (
                        <img
                          src={session.profileImage}
                          alt={session.name || 'User'}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#0066f5] text-white flex items-center justify-center font-bold text-xs">
                          {(session.name || session.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          {session.name || session.email}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {isWorker ? 'Worker' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        clearSession();
                        router.push('/login');
                      }}
                      className="w-full py-2.5 text-xs font-bold text-red-600 bg-red-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="text-center py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="text-center py-2 text-xs font-bold text-white bg-[#0066f5] rounded-xl shadow-xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
