'use client';

import React from 'react';
import { Calendar, Clock, Sun, Sunset, Moon } from 'lucide-react';

interface TimeSlotPickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export default function TimeSlotPicker({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  // Generate next 5 days
  const dates = [
    { label: 'Today', date: '19 Aug', full: 'Wed, 19 Aug 2026' },
    { label: 'Tomorrow', date: '20 Aug', full: 'Thu, 20 Aug 2026' },
    { label: 'Fri', date: '21 Aug', full: 'Fri, 21 Aug 2026' },
    { label: 'Sat', date: '22 Aug', full: 'Sat, 22 Aug 2026' },
    { label: 'Sun', date: '23 Aug', full: 'Sun, 23 Aug 2026' },
  ];

  const slots = [
    {
      group: 'Morning',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      times: ['09:00 AM - 10:00 AM', '10:30 AM - 11:30 AM', '11:45 AM - 12:45 PM'],
    },
    {
      group: 'Afternoon',
      icon: <Sunset className="w-4 h-4 text-orange-500" />,
      times: ['02:00 PM - 03:00 PM', '03:30 PM - 04:30 PM', '05:00 PM - 06:00 PM'],
    },
    {
      group: 'Evening',
      icon: <Moon className="w-4 h-4 text-indigo-500" />,
      times: ['06:30 PM - 07:30 PM', '08:00 PM - 09:00 PM'],
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Date Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-[#091426]">
          <Calendar className="w-4 h-4 text-[#0051d5]" />
          <span>Select Date</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {dates.map((d) => (
            <button
              key={d.full}
              type="button"
              onClick={() => onSelectDate(d.full)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedDate === d.full
                  ? 'bg-[#091426] text-white border-[#091426] shadow-md'
                  : 'bg-[#ffffff] text-[#0d1c2e] border-[#e2e8f0] hover:border-[#0051d5] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="block text-[11px] font-medium opacity-80">{d.label}</span>
              <span className="block text-sm font-bold font-geist mt-0.5">{d.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-bold text-[#091426]">
          <Clock className="w-4 h-4 text-[#0051d5]" />
          <span>Select Arrival Window</span>
        </label>

        <div className="space-y-4">
          {slots.map((section) => (
            <div key={section.group} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b] font-geist">
                {section.icon}
                <span>{section.group}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {section.times.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelectTime(slot)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium font-geist text-center transition-all ${
                      selectedTime === slot
                        ? 'bg-[#0051d5] text-white border-[#0051d5] shadow-sm font-semibold'
                        : 'bg-[#ffffff] text-[#334155] border-[#e2e8f0] hover:border-[#0051d5] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
