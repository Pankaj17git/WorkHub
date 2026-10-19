'use client';

import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  HardHat,
  Database,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';

interface SkillItem {
  id: string;
  name: string;
  key: string;
  isCustom: boolean;
  createdBy: string | null;
  workersCount: number;
  createdAt: string;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'STANDARD' | 'CUSTOM'>('ALL');

  // Modal / Form state for Adding Skill
  const [modalOpen, setModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillKey, setNewSkillKey] = useState('');
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await api.get(`/api/admin/skills?${params.toString()}`);
      if (res.data.success) {
        setSkills(res.data.skills);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch platform skills'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Auto-slug key when name changes
  const handleNameChange = (val: string) => {
    setNewSkillName(val);
    if (autoSlug) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      setNewSkillKey(slug);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await api.post('/api/admin/skills', {
        name: newSkillName.trim(),
        key: newSkillKey.trim() || undefined,
        isCustom: isCustomSkill,
      });

      if (res.data.success) {
        setFormSuccess(`Skill "${res.data.skill.name}" has been added to the database!`);
        setNewSkillName('');
        setNewSkillKey('');
        fetchSkills();
        setTimeout(() => {
          setModalOpen(false);
          setFormSuccess(null);
        }, 1200);
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to add skill to database'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skill: SkillItem) => {
    if (skill.workersCount > 0) {
      alert(`Cannot delete "${skill.name}" because it is currently linked to ${skill.workersCount} worker profile(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete the skill "${skill.name}" from the database?`)) {
      return;
    }

    setDeletingId(skill.id);
    try {
      const res = await api.delete(`/api/admin/skills?id=${skill.id}`);
      if (res.data.success) {
        setSkills((prev) => prev.filter((s) => s.id !== skill.id));
      }
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete skill'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (filterType === 'STANDARD') return !s.isCustom;
    if (filterType === 'CUSTOM') return s.isCustom;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Skills Database Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Define, review, and add trades and specialized service skills to the WorkHub catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill to Database</span>
          </button>

          <button
            onClick={fetchSkills}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Total Skills in DB
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {skills.length} Trades
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Active Skill Assignments
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {skills.reduce((acc, s) => acc + s.workersCount, 0)} Profiles
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Custom Added Trades
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {skills.filter((s) => s.isCustom).length} Custom
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills by name or database key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({skills.length})
          </button>
          <button
            onClick={() => setFilterType('STANDARD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'STANDARD'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Standard ({skills.filter((s) => !s.isCustom).length})
          </button>
          <button
            onClick={() => setFilterType('CUSTOM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'CUSTOM'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom ({skills.filter((s) => s.isCustom).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Skills Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Skill / Trade Name</th>
                <th className="px-6 py-4">Database Key</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Active Workers</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading skills from database...</span>
                  </td>
                </tr>
              ) : filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-slate-700">No matching skills found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different term or add a new skill</p>
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Skill Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {skill.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Database Key */}
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {skill.key}
                      </code>
                    </td>

                    {/* Classification */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          skill.isCustom
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {skill.isCustom ? 'Custom Added' : 'Standard Trade'}
                      </span>
                    </td>

                    {/* Active Workers */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
                        <HardHat className="w-3.5 h-3.5 text-teal-600" />
                        <span>{skill.workersCount} {skill.workersCount === 1 ? 'Worker' : 'Workers'}</span>
                      </span>
                    </td>

                    {/* Date Added */}
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(skill.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteSkill(skill)}
                        disabled={deletingId === skill.id || skill.workersCount > 0}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
                          skill.workersCount > 0 ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title={
                          skill.workersCount > 0
                            ? 'Cannot delete: assigned to active workers'
                            : 'Delete skill from database'
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Skill to Database</h3>
                  <p className="text-[11px] text-slate-500">Insert new trade into MySQL</p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Skill / Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Home Security Installer"
                  value={newSkillName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Database Unique Key</label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold"
                  >
                    {autoSlug ? 'Edit Key Manually' : 'Auto-Generate Slug'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  disabled={autoSlug}
                  placeholder="e.g. smart_home_security_installer"
                  value={newSkillKey}
                  onChange={(e) => setNewSkillKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:border-indigo-600 disabled:opacity-60"
                />
                <p className="text-[10px] text-slate-400">
                  Unique identifier stored in the database `key` column.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomSkill}
                    onChange={(e) => setIsCustomSkill(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Mark as Custom Skill (Community / User Requested)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newSkillName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-60 transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
