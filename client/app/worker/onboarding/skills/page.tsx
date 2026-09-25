"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Wrench, Wind, Hammer, Check } from "lucide-react";
import PriceTag from "@/components/ui/PriceTag";

export default function WorkerSkillsOnboardingPage() {
  const router = useRouter();

  const [selectedTrade, setSelectedTrade] = useState("Electrician");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "MCB & Distribution Boards",
    "Smart Home Wiring",
    "Inverter & UPS",
  ]);
  const [baseHourlyRate, setBaseHourlyRate] = useState(350);

  const availableTrades = [
    { name: "Electrician", icon: Zap },
    { name: "Plumber", icon: Wrench },
    { name: "AC & Appliances", icon: Wind },
    { name: "Carpenter", icon: Hammer },
  ];

  const skillOptions: Record<string, string[]> = {
    Electrician: [
      "MCB & Distribution Boards",
      "Smart Home Wiring",
      "Inverter & UPS",
      "Fan & Chandelier Installation",
      "Appliance Tripping Diagnostics",
      "Industrial 3-Phase Wiring",
      "Earthing & Surge Protection",
    ],
    Plumber: [
      "Concealed Leak Detection",
      "Sanitary & Faucet Fitting",
      "Overhead Tank Cleaning",
      "Motor & Pressure Pump",
      "Drain Clog Removal",
    ],
    "AC & Appliances": [
      "Foam Jet Deep AC Service",
      "Inverter PCB Repair",
      "Precision Gas Refill",
      "Compressor Replacement",
    ],
    Carpenter: [
      "Modular Kitchen Adjustments",
      "Hydraulic Hinges",
      "Door Lock Installation",
      "Furniture Restoration",
    ],
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleFinishOnboarding = () => {
    router.push("/worker/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-[#875b13]">
          One last step to go live
        </span>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#2a2a2a] tracking-tight"
          style={{ fontFamily: "var(--gesso-font-display)" }}
        >
          Set up your trade and base rates
        </h1>
        <p className="text-xs sm:text-sm text-[#606060] max-w-md mx-auto">
          We match you with nearby customer job requests based on the skills you
          pick here.
        </p>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* 1. Primary Trade */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#091426] block">
            1. Select Your Primary Trade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableTrades.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTrade === t.name;

              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTrade(t.name)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? "border-[#0051d5] bg-[#eff6ff] text-[#0051d5] font-bold shadow-xs"
                      : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8f9ff]"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sub-Skills Matrix */}
        <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#091426] block">
              2. Choose Specialized Skills ({selectedSkills.length} Selected)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(skillOptions[selectedTrade] || []).map((skill) => {
              const isSelected = selectedSkills.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#091426] text-white border border-[#091426] shadow-xs"
                      : "bg-[#f8f9ff] text-[#334155] border border-[#e2e8f0] hover:border-[#cbd5e1]"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#38bdf8] stroke-[3]" />
                  )}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Base Hourly / Visit Rate */}
        <div className="space-y-3 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#091426] block">
              3. Default Base Visit Rate (₹)
            </label>
            <PriceTag amount={baseHourlyRate} size="lg" />
          </div>

          <input
            type="range"
            min="199"
            max="1200"
            step="50"
            value={baseHourlyRate}
            onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
            className="w-full h-2 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
          />
          <div className="flex justify-between text-[11px] text-[#64748b] font-geist">
            <span>₹199 (Entry)</span>
            <span>₹500 (Standard)</span>
            <span>₹1,200+ (Master)</span>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handleFinishOnboarding}
            className="w-full py-3.5 px-4 bg-[#0051d5] hover:bg-[#0042b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Complete setup and go to dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
