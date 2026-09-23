// components/jobs/BudgetScheduleSection.tsx
'use client';

import { FormikProps } from 'formik';
import { DollarSign } from 'lucide-react';
import { FormField } from '@/components/ui/form/FormField';
import { FormValues } from '@/types/job/job';

type Props = { formik: FormikProps<FormValues> };

export function BudgetScheduleSection({ formik }: Props) {
  return (
    <section className="space-y-4 pt-4 border-t border-[#f1f5f9]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b] flex items-center gap-2">
        <DollarSign className="w-3.5 h-3.5 text-[#0051d5]" />
        3. Budget & Schedule (Job Model Specs)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          label="Min Estimated Budget (₹)"
          required
          error={formik.touched.minAmount && formik.errors.minAmount}
        >
          <input
            id="minAmount"
            name="minAmount"
            type="number"
            min={0}
            step={50}
            value={formik.values.minAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border rounded-xl focus:outline-none font-bold text-[#091426] ${
              formik.touched.minAmount && formik.errors.minAmount
                ? 'border-red-400'
                : 'border-[#e2e8f0] focus:border-[#0051d5]'
            }`}
          />
        </FormField>

        <FormField
          label="Max Estimated Budget (₹)"
          required
          error={formik.touched.maxAmount && formik.errors.maxAmount}
        >
          <input
            id="maxAmount"
            name="maxAmount"
            type="number"
            min={formik.values.minAmount}
            step={50}
            value={formik.values.maxAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border rounded-xl focus:outline-none font-bold text-[#091426] ${
              formik.touched.maxAmount && formik.errors.maxAmount
                ? 'border-red-400'
                : 'border-[#e2e8f0] focus:border-[#0051d5]'
            }`}
          />
        </FormField>

        <div>
          <label className="block text-xs font-semibold text-[#091426] mb-1.5">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formik.values.currency}
            onChange={formik.handleChange}
            className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426] font-medium"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#091426] mb-1.5">
            Preferred Execution Date
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            value={formik.values.preferredDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#091426] mb-1.5">Start Time</label>
            <input
              id="preferredStartTime"
              name="preferredStartTime"
              type="time"
              value={formik.values.preferredStartTime}
              onChange={formik.handleChange}
              className="w-full px-3 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#091426] mb-1.5">End Time</label>
            <input
              id="preferredEndTime"
              name="preferredEndTime"
              type="time"
              value={formik.values.preferredEndTime}
              onChange={formik.handleChange}
              className="w-full px-3 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#091426] mb-1.5">
            Application Deadline
          </label>
          <input
            id="applicationDeadline"
            name="applicationDeadline"
            type="date"
            value={formik.values.applicationDeadline}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-4 py-2.5 text-sm bg-[#f8f9ff] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#0051d5] text-[#091426]"
          />
        </div>
      </div>
    </section>
  );
}