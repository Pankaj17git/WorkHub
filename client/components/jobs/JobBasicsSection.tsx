// components/jobs/JobBasicsSection.tsx
'use client';

import { FormikProps } from 'formik';
import { Briefcase } from 'lucide-react';
import { SERVICE_PRESETS } from '@/lib/job/job-form-constants';
import { FormField } from '@/components/ui/form/FormField';
import { FormValues } from '@/types/job/job';

type Props = { formik: FormikProps<FormValues>; onAddSkill: (skill: string) => void };

export function JobBasicsSection({ formik, onAddSkill }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
        <Briefcase className="w-3.5 h-3.5 text-[#0051d5]" />
        1. Job Overview & Description
      </h3>

      <FormField label="Job Title" required error={formik.touched.title && formik.errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Master Bedroom Wiring & Switchboard Replacement"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border rounded-xl focus:outline-none ${
            formik.touched.title && formik.errors.title
              ? 'border-red-400 ring-1 ring-red-100'
              : 'border-[#e2e8f0] focus:border-[#0051d5]'
          }`}
        />
      </FormField>

      <div>
        <label className="block text-xs font-semibold text-[#091426] mb-1.5">Service Category Preset</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SERVICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                formik.setFieldValue('serviceName', preset.label);
                onAddSkill(preset.category);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                formik.values.serviceName === preset.label
                  ? 'border-[#0051d5] bg-[#eff6ff] text-[#0051d5]'
                  : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <FormField
        label="Detailed Description"
        required
        error={formik.touched.description && formik.errors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Provide details about the issue, required tools, materials on site..."
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border rounded-xl focus:outline-none ${
            formik.touched.description && formik.errors.description
              ? 'border-red-400 ring-1 ring-red-100'
              : 'border-[#e2e8f0] focus:border-[#0051d5]'
          }`}
        />
      </FormField>
    </section>
  );
}