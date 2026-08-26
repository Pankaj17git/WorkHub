import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, Home } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f4eee4] text-[#2a2a2a] border-t border-black/5 mt-20">
      {/* Top trust highlights */}
      <div className="border-b border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-lg bg-[#eae4db] flex items-center justify-center text-[#875b13] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="whl-h3 text-sm">100% Verified Experts</h4>
                <p className="text-xs text-[#606060] mt-0.5">Strict background checks & criminal verification</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-lg bg-[#eae4db] flex items-center justify-center text-[#875b13] shrink-0">
                <span className="text-lg font-bold">₹</span>
              </div>
              <div>
                <h4 className="whl-h3 text-sm">Transparent Fixed Pricing</h4>
                <p className="text-xs text-[#606060] mt-0.5">No hidden charges or unexpected surprise fees</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-lg bg-[#eae4db] flex items-center justify-center text-[#875b13] shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="whl-h3 text-sm">24/7 Dedicated Support</h4>
                <p className="text-xs text-[#606060] mt-0.5">Direct helpline and instant in-app dispute resolution</p>
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
              <div className="w-9 h-9 rounded-lg bg-[#f5a623] flex items-center justify-center text-[#000000]">
                <Home size={18} strokeWidth={2.25} />
              </div>
              <span className="whl-h3 text-xl">WorkHub</span>
            </div>
            <p className="text-sm text-[#606060] leading-relaxed">
              Chandigarh’s premier on-demand platform connecting certified local tradespeople with households and businesses.
            </p>
            <div className="text-xs text-[#9c9c9c] font-semibold uppercase tracking-wider">
              Serving: Chandigarh, Mohali, Panchkula, Zirakpur
            </div>
          </div>

          <div>
            <h4 className="whl-h3 text-xs uppercase tracking-[0.04em] text-[#606060] mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2 text-sm text-[#606060]">
              <li><Link href="/search?category=electricians" className="hover:text-[#2f68c5] transition-colors">Electricians in Chandigarh</Link></li>
              <li><Link href="/search?category=plumbers" className="hover:text-[#2f68c5] transition-colors">Emergency Plumber Near Me</Link></li>
              <li><Link href="/search?category=appliance-repair" className="hover:text-[#2f68c5] transition-colors">Inverter AC Deep Jet Wash</Link></li>
              <li><Link href="/search?category=carpenters" className="hover:text-[#2f68c5] transition-colors">Carpentry & Lock Installation</Link></li>
              <li><Link href="/search?category=cleaning" className="hover:text-[#2f68c5] transition-colors">Full Home Deep Cleaning</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="whl-h3 text-xs uppercase tracking-[0.04em] text-[#606060] mb-4">
              Customer Trust
            </h4>
            <ul className="space-y-2 text-sm text-[#606060]">
              <li><a href="#" className="hover:text-[#2a2a2a] transition-colors">WorkHub Safety Guarantee</a></li>
              <li><a href="#" className="hover:text-[#2a2a2a] transition-colors">Damage Protection Cover</a></li>
              <li><a href="#" className="hover:text-[#2a2a2a] transition-colors">Verified Pro Criteria</a></li>
              <li><a href="#" className="hover:text-[#2a2a2a] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#2a2a2a] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="whl-h3 text-xs uppercase tracking-[0.04em] text-[#606060] mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm text-[#606060]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#875b13]" />
                <span>+91 172 800 2400</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#875b13]" />
                <span>help@workhub.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#875b13]" />
                <span>IT Park, Phase II, Chandigarh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9c9c9c]">
          <p>© {new Date().getFullYear()} WorkHub Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Made for local workers, everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
