// app/jobs/new/page.tsx  (or wherever this lives)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { getToken } from '@/lib/auth-client';
import { INITIAL_VALUES } from '@/lib/job/job-form-constants';
import { jobValidationSchema } from '@/lib/job/job-form-validation';
import { JobBasicsSection } from '@/components/jobs/JobBasicsSection';
import { SkillsStaffingSection } from '@/components/jobs/SkillsStaffingSection';
import { BudgetScheduleSection } from '@/components/jobs/BudgetScheduleSection';
import { LocationSection } from '@/components/jobs/LocationSection';
import { FormValues } from '@/types/job/job';


export default function PostNewJobPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: jobValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      const token = getToken();
      if (!token) {
        setServerError('Please log in with your customer account to post a job.');
        router.push('/login?role=CUSTOMER&redirect=/jobs/new');
        setSubmitting(false);
        return;
      }

      try {
        const payload = {
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          serviceName: values.serviceName || values.skills[0],
          minAmount: Number(values.minAmount),
          maxAmount: Number(values.maxAmount),
          requiredWorkers: Number(values.requiredWorkers),
          minimumWorkers: Number(values.minimumWorkers),
          maximumWorkers: Number(values.maximumWorkers),
          preferredDate: values.preferredDate || undefined,
          preferredStartTime: values.preferredStartTime || undefined,
          preferredEndTime: values.preferredEndTime || undefined,
          applicationDeadline: values.applicationDeadline || undefined,
          address: {
            ...values.address,
            address: values.address.address.trim(),
            city: values.address.city.trim(),
            state: values.address.state.trim(),
            country: values.address.country.trim(),
            latitude: Number(values.address.latitude),
            longitude: Number(values.address.longitude),
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
          setServerError(data.error || 'Failed to publish job.');
          setSubmitting(false);
          return;
        }

        const id = data.job?.id || data.data?.job?.id;
        router.push(id ? `/jobs/${id}` : '/jobs/my-jobs');
      } catch {
        setServerError('A network error occurred. Please try again.');
        setSubmitting(false);
      }
    },
  });

  const handleAddSkill = (skill: string) => {
    if (!formik.values.skills.includes(skill)) {
      formik.setFieldValue('skills', [...formik.values.skills, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    if (formik.values.skills.length > 1) {
      formik.setFieldValue(
        'skills',
        formik.values.skills.filter((s) => s !== skill)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#091426]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <span className="text-xs font-semibold text-[#0d9488] bg-[#f0fdfa] border border-[#ccfbf1] px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Customer Job Posting
        </span>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
            Post a New Job Request
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Specify your requirements, required trades, service location, and budget.
          </p>
        </div>

        {serverError && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {serverError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-8" noValidate>
          <JobBasicsSection formik={formik} onAddSkill={handleAddSkill} />
          <SkillsStaffingSection
            formik={formik}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
          <BudgetScheduleSection formik={formik} />
          <LocationSection formik={formik} />

          {/* Submit */}
          <div className="pt-6 border-t border-[#e2e8f0] flex items-center justify-between gap-4">
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#475569] hover:bg-[#f8f9ff]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#0051d5] hover:bg-[#0042b0] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {formik.isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing Job...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publish Job to Marketplace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}