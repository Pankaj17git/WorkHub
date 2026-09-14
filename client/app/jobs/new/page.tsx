'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  X,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Wrench
} from 'lucide-react';
import { getToken, getSessionSnapshot, subscribeToSession } from '@/lib/auth-client';

const COMMON_SKILLS = [
  'Electrician',
  'Plumbing',
  'Carpentry',
  'AC Repair',
  'Painting',
  'Appliance Fix',
  'Masonry',
  'Deep Cleaning',
  'Tile Fitting',
  'Wiring & Earthing',
];

const SERVICE_PRESETS = [
  { label: 'Electrical Repairs', category: 'Electrician' },
  { label: 'Pipe & Plumbing Work', category: 'Plumbing' },
  { label: 'Custom Carpentry & Woodwork', category: 'Carpentry' },
  { label: 'AC Maintenance & Servicing', category: 'AC Repair' },
  { label: 'Full Home Painting', category: 'Painting' },
  { label: 'Home Deep Cleaning', category: 'Deep Cleaning' },
];

export default function PostNewJobPage() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [title, setTitle] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Electrician']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [minAmount, setMinAmount] = useState<number>(499);
  const [maxAmount, setMaxAmount] = useState<number>(1499);
  const [currency, setCurrency] = useState('INR');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredStartTime, setPreferredStartTime] = useState('09:00');
  const [preferredEndTime, setPreferredEndTime] = useState('13:00');
  const [requiredWorkers, setRequiredWorkers] = useState<number>(1);
  const [workerRequirementType, setWorkerRequirementType] = useState<'CUSTOMER_DEFINED' | 'PLATFORM_RECOMMENDED'>('PLATFORM_RECOMMENDED');

  // Address
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Chandigarh');
  const [stateName, setStateName] = useState('Punjab');
  const [country, setCountry] = useState('India');
  const [latitude, setLatitude] = useState<number>(30.7333);
  const [longitude, setLongitude] = useState<number>(76.7794);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated staffing suggestion
  const getStaffingSuggestion = () => {
    const text = `${title} ${serviceName} ${description}`.toLowerCase();
    if (text.includes('full house') || text.includes('shifting') || text.includes('moving') || text.includes('renovation')) {
      return { count: 3, note: 'Heavy multi-area tasks typically require a 3+ worker team.' };
    }
    if (text.includes('painting') || text.includes('deep clean') || text.includes('construction')) {
      return { count: 2, note: 'Multi-room work benefits from a 2-person team.' };
    }
    return { count: 1, note: 'Standard single specialist recommended.' };
  };

  const suggestion = getStaffingSuggestion();

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    if (selectedSkills.length > 1) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      setError('Please log in with your customer account to post a job.');
      router.push('/login?role=CUSTOMER&redirect=/jobs/new');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please specify at least one required skill.');
      return;
    }

    if (!addressLine.trim()) {
      setError('Please enter the job site street address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        serviceName: serviceName || selectedSkills[0],
        description,
        minAmount: Number(minAmount),
        maxAmount: Number(maxAmount),
        currency,
        skills: selectedSkills,
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
        preferredStartTime,
        preferredEndTime,
        requiredWorkers: Number(requiredWorkers),
        workerRequirementType,
        address: {
          address: addressLine,
          city,
          state: stateName,
          country,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to publish job. Please check all fields.');
        setIsSubmitting(false);
        return;
      }

      // Success -> navigate to job details or my-jobs
      const createdJobId = data.job?.id || data.data?.job?.id;
      if (createdJobId) {
        router.push(`/jobs/${createdJobId}`);
      } else {
        router.push('/jobs/my-jobs');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred while posting your job. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Back & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <span className="text-xs font-semibold text-[#0d9488] bg-[#f0fdfa] border border-[#ccfbf1] px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Customer Job Posting</span>
        </span>
      </div>

      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
            Post a New Job Request
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Describe your requirements, location, and budget. Nearby certified professionals can apply and be hired.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Section 1: Job Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>1. Job Overview & Description</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Wiring & Switchboard Replacement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Service Category Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => {
                        setServiceName(preset.label);
                        handleAddSkill(preset.category);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                        serviceName === preset.label
                          ? 'border-[#0051d5] bg-[#eff6ff] text-[#0051d5]'
                          : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details about the issue, required tools, materials on site, and specific instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Skills & Staffing */}
          <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>2. Required Skills & Crew Headcount</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Select Required Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() =>
                          isSelected ? handleRemoveSkill(skill) : handleAddSkill(skill)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#0051d5] text-white shadow-xs'
                            : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                        }`}
                      >
                        {skill} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom trade skill..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    className="flex-1 px-4 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2 bg-[#091426] text-white rounded-xl text-xs font-semibold hover:bg-[#1e293b] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Staffing Recommendation Card */}
              <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0051d5]" />
                    <span className="text-xs font-bold text-[#091426]">Recommended Crew Size</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0051d5] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                    {suggestion.count} Worker{suggestion.count > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b]">{suggestion.note}</p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Workers Needed
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={requiredWorkers}
                      onChange={(e) => {
                        setRequiredWorkers(Number(e.target.value));
                        setWorkerRequirementType('CUSTOMER_DEFINED');
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] font-geist font-bold text-[#091426]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Requirement Source
                    </label>
                    <select
                      value={workerRequirementType}
                      onChange={(e) => setWorkerRequirementType(e.target.value as 'CUSTOMER_DEFINED' | 'PLATFORM_RECOMMENDED')}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] text-[#475569]"
                    >
                      <option value="PLATFORM_RECOMMENDED">Platform Recommended</option>
                      <option value="CUSTOMER_DEFINED">Custom Defined</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Timing */}
          <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>3. Budget & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Min Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist font-bold text-[#091426]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Max Estimated Budget (₹)
                </label>
                <input
                  type="number"
                  min={minAmount}
                  step={50}
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] font-geist font-bold text-[#091426]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferredStartTime}
                    onChange={(e) => setPreferredStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferredEndTime}
                    onChange={(e) => setPreferredEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Job Location Address */}
          <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>4. Service Location</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#091426] mb-1.5">
                  Site Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat No., Street, Sector, Landmark"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#091426] mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#091426] mb-1.5">State</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#091426] mb-1.5">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-[#e2e8f0] flex items-center justify-between gap-4">
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#475569] hover:bg-[#f8f9ff] transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Job...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Job to Marketplace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
