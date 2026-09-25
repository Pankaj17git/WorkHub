// components/jobs/SkillsStaffingSection.tsx
'use client';

import { useState } from 'react';
import { FormikProps } from 'formik';
import { Wrench, Users, Plus } from 'lucide-react';
import { COMMON_SKILLS } from '@/lib/job/job-form-constants';
import { FormField } from '@/components/ui/form/FormField';
import { FormValues } from '@/types/job/job';

type Props = {
  formik: FormikProps<FormValues>;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
};

function getStaffingSuggestion(title: string, serviceName: string, description: string) {
  const text = `${title} ${serviceName} ${description}`.toLowerCase();
  if (
    text.includes('full house') ||
    text.includes('shifting') ||
    text.includes('moving') ||
    text.includes('renovation')
  ) {
    return { count: 3, note: 'Heavy multi-area tasks typically require a 3+ worker team.' };
  }
  if (text.includes('painting') || text.includes('deep clean') || text.includes('construction')) {
    return { count: 2, note: 'Multi-room work benefits from a 2-person team.' };
  }
  return { count: 1, note: 'Standard single specialist recommended.' };
}

export function SkillsStaffingSection({ formik, onAddSkill, onRemoveSkill }: Props) {
  const [customSkillInput, setCustomSkillInput] = useState('');
  const suggestion = getStaffingSuggestion(
    formik.values.title,
    formik.values.serviceName,
    formik.values.description
  );

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !formik.values.skills.includes(trimmed)) {
      onAddSkill(trimmed);
      setCustomSkillInput('');
    }
  };

  return (
    <section className="space-y-4 pt-4 border-t border-[#f1f5f9]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
        <Wrench className="w-3.5 h-3.5 text-[#0051d5]" />
        2. Required Skills & Crew Headcount
      </h3>

      {/* Skills */}
      <div>
        <label className="block text-xs font-semibold text-[#091426] mb-1.5">
          Select Required Skills <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_SKILLS.map((skill) => {
            const isSelected = formik.values.skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => (isSelected ? onRemoveSkill(skill) : onAddSkill(skill))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className="px-4 py-2 bg-[#091426] text-white rounded-xl text-xs font-semibold hover:bg-[#1e293b] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {formik.touched.skills && formik.errors.skills && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">
            {typeof formik.errors.skills === 'string'
              ? formik.errors.skills
              : 'Please select at least one skill'}
          </p>
        )}
      </div>

      {/* Staffing Card */}
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <FormField
            label="Required Workers"
            required
            error={formik.touched.requiredWorkers && formik.errors.requiredWorkers}
          >
            <input
              id="requiredWorkers"
              name="requiredWorkers"
              type="number"
              min={1}
              max={10}
              value={formik.values.requiredWorkers}
              onChange={(e) => {
                const val = Number(e.target.value);
                formik.setFieldValue('requiredWorkers', val);
                if (formik.values.minimumWorkers > val) {
                  formik.setFieldValue('minimumWorkers', val);
                }
                if (formik.values.maximumWorkers < val) {
                  formik.setFieldValue('maximumWorkers', val);
                }
                formik.setFieldValue('workerRequirementType', 'CUSTOMER_DEFINED');
              }}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] font-bold text-[#091426]"
            />
          </FormField>

          <FormField
            label="Min Workers"
            error={formik.touched.minimumWorkers && formik.errors.minimumWorkers}
          >
            <input
              id="minimumWorkers"
              name="minimumWorkers"
              type="number"
              min={1}
              max={formik.values.requiredWorkers}
              value={formik.values.minimumWorkers}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] font-bold text-[#091426]"
            />
          </FormField>

          <FormField
            label="Max Workers"
            error={formik.touched.maximumWorkers && formik.errors.maximumWorkers}
          >
            <input
              id="maximumWorkers"
              name="maximumWorkers"
              type="number"
              min={formik.values.requiredWorkers}
              max={20}
              value={formik.values.maximumWorkers}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] font-bold text-[#091426]"
            />
          </FormField>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Requirement Source
            </label>
            <select
              id="workerRequirementType"
              name="workerRequirementType"
              value={formik.values.workerRequirementType}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 text-xs bg-white border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] text-[#475569]"
            >
              <option value="PLATFORM_RECOMMENDED">Platform Recommended</option>
              <option value="CUSTOMER_DEFINED">Customer Defined</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}