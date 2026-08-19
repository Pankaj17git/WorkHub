'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  FileText,
  Upload,
  Camera,
  ExternalLink
} from 'lucide-react';
import { MOCK_PROS } from '@/data/mockData';
import Badge from '@/components/ui/Badge';

export default function WorkerManageProfilePage() {
  const pro = MOCK_PROS[0]; // Rahul Sharma

  const [aboutBio, setAboutBio] = useState(pro.about);
  const [workingHours, setWorkingHours] = useState('08:00 AM - 08:00 PM (Mon-Sun)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#091426] tracking-tight">
              Manage Professional Profile
            </h1>
            <Badge variant="verified">Govt. Verified</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Update your public profile, trade bio, working hours, and verified government documents.
          </p>
        </div>

        <Link
          href={`/pro/${pro.id}`}
          target="_blank"
          className="px-4 py-2.5 bg-[#f8f9ff] hover:bg-[#e2e8f0] text-[#0051d5] text-xs font-bold rounded-xl border border-[#e2e8f0] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Public Customer Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card & Avatar */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] font-geist">
            Public Information
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#e2e8f0] shadow-sm"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-1.5 bg-[#0051d5] text-white rounded-lg shadow-sm"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold text-[#091426]">{pro.name}</h2>
              <p className="text-xs text-[#475569]">{pro.title}</p>
              <div className="flex items-center gap-3 text-xs text-[#64748b] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                  {pro.location}
                </span>
                <span>•</span>
                <span className="font-geist text-[#0d9488] font-semibold">
                  ★ {pro.rating} Rating ({pro.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#334155]">Public Profile Bio</label>
            <textarea
              rows={4}
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] leading-relaxed text-[#0d1c2e]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#334155]">Working Hours & Availability Schedule</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist"
            />
          </div>
        </div>

        {/* KYC & Document Status */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] font-geist">
              Verified Documents & KYC Audit
            </h3>
            <span className="text-xs font-bold font-geist text-[#0d9488] bg-[#ecfdf5] px-3 py-1 rounded-full border border-[#a7f3d0]">
              100% Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0051d5]" />
                <div>
                  <strong className="text-xs text-[#091426] block">Aadhaar Card</strong>
                  <span className="text-[11px] text-[#64748b] font-geist">•••• •••• 8821</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist">VERIFIED</span>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#0051d5]" />
                <div>
                  <strong className="text-xs text-[#091426] block">Master Electrician License</strong>
                  <span className="text-[11px] text-[#64748b] font-geist">Govt. Certified #PB-4820</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist">VERIFIED</span>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0d9488]" />
                <div>
                  <strong className="text-xs text-[#091426] block">Police Clearance Record</strong>
                  <span className="text-[11px] text-[#64748b] font-geist">Chandigarh Police Cleared</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist">CLEARED</span>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0d9488]" />
                <div>
                  <strong className="text-xs text-[#091426] block">₹10K Damage Insurance</strong>
                  <span className="text-[11px] text-[#64748b] font-geist">Active Policy #WH-9921</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0d9488] font-geist">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {savedSuccess ? (
            <div className="text-xs font-bold text-[#0d9488] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updates saved successfully!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Save Profile Changes
          </button>
        </div>

      </form>

    </div>
  );
}
