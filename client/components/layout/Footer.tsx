import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#091426] text-[#ffffff] border-t border-[#1e293b] mt-20">
      {/* Top trust highlights */}
      <div className="border-b border-[#1e293b] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f172a]/60 border border-[#1e293b]">
              <div className="w-12 h-12 rounded-lg bg-[#0051d5]/20 flex items-center justify-center text-[#38bdf8] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">100% Verified Experts</h4>
                <p className="text-xs text-[#94a3b8] mt-0.5">Strict background checks & criminal verification</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f172a]/60 border border-[#1e293b]">
              <div className="w-12 h-12 rounded-lg bg-[#0d9488]/20 flex items-center justify-center text-[#2dd4bf] shrink-0">
                <span className="text-lg font-bold font-geist">₹</span>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Transparent Fixed Pricing</h4>
                <p className="text-xs text-[#94a3b8] mt-0.5">No hidden charges or unexpected surprise fees</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f172a]/60 border border-[#1e293b]">
              <div className="w-12 h-12 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">24/7 Dedicated Support</h4>
                <p className="text-xs text-[#94a3b8] mt-0.5">Direct helpline and instant in-app dispute resolution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0051d5] flex items-center justify-center text-white font-bold text-lg">
                W<span className="text-[#38bdf8]">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Work<span className="text-[#38bdf8]">Hub</span>
              </span>
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Chandigarh’s premier on-demand platform connecting certified local tradespeople with households and businesses.
            </p>
            <div className="text-xs text-[#64748b] font-geist">
              Serving: Chandigarh, Mohali, Panchkula, Zirakpur
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-geist">
              Popular Services
            </h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li><Link href="/search?category=electricians" className="hover:text-white transition-colors">Electricians in Chandigarh</Link></li>
              <li><Link href="/search?category=plumbers" className="hover:text-white transition-colors">Emergency Plumber Near Me</Link></li>
              <li><Link href="/search?category=appliance-repair" className="hover:text-white transition-colors">Inverter AC Deep Jet Wash</Link></li>
              <li><Link href="/search?category=carpenters" className="hover:text-white transition-colors">Carpentry & Lock Installation</Link></li>
              <li><Link href="/search?category=cleaning" className="hover:text-white transition-colors">Full Home Deep Cleaning</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-geist">
              Customer Trust
            </h4>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li><a href="#" className="hover:text-white transition-colors">WorkHub Safety Guarantee</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Damage Protection Cover</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Verified Pro Criteria</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-geist">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm text-[#94a3b8]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#38bdf8]" />
                <span>+91 172 800 2400</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#38bdf8]" />
                <span>help@workhub.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#38bdf8]" />
                <span>IT Park, Phase II, Chandigarh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e293b] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b]">
          <p>© {new Date().getFullYear()} WorkHub Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted for hyper-precision & reliability
          </p>
        </div>
      </div>
    </footer>
  );
}
