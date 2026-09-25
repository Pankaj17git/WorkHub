// lib/job-form-validation.ts
import * as Yup from 'yup';

export const jobValidationSchema = Yup.object({
  title: Yup.string().trim().min(5).max(255).required('Job title is required'),
  serviceName: Yup.string().optional(),
  description: Yup.string().trim().min(15).required('Job description is required'),
  skills: Yup.array().of(Yup.string().required()).min(1).required(),
  minAmount: Yup.number().typeError('Must be a number').min(0).required(),
  maxAmount: Yup.number()
    .typeError('Must be a number')
    .min(Yup.ref('minAmount'), 'Must be ≥ min budget')
    .required(),
  currency: Yup.string().default('INR').required(),
  preferredDate: Yup.string().optional(),
  preferredStartTime: Yup.string().optional(),
  preferredEndTime: Yup.string().optional(),
  applicationDeadline: Yup.string().optional(),
  workerRequirementType: Yup.string()
    .oneOf(['CUSTOMER_DEFINED', 'PLATFORM_RECOMMENDED'])
    .default('PLATFORM_RECOMMENDED'),
  requiredWorkers: Yup.number().integer().min(1).max(10).required(),
  minimumWorkers: Yup.number()
    .integer()
    .min(1)
    .max(Yup.ref('requiredWorkers'))
    .required(),
  maximumWorkers: Yup.number()
    .integer()
    .min(Yup.ref('requiredWorkers'))
    .max(20)
    .required(),
  address: Yup.object({
    address: Yup.string().trim().min(3).required(),
    city: Yup.string().trim().required(),
    state: Yup.string().trim().required(),
    country: Yup.string().trim().required(),
    latitude: Yup.number().required(),
    longitude: Yup.number().required(),
  }),
});