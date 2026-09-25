import { FormValues } from '@/types/job/job';

export const COMMON_SKILLS = [
  'Electrician', 'Plumbing', 'Carpentry', 'AC Repair', 'Painting',
  'Appliance Fix', 'Masonry', 'Deep Cleaning', 'Tile Fitting', 'Wiring & Earthing',
] as const;

export const SERVICE_PRESETS = [
  { label: 'Electrical Repairs', category: 'Electrician' },
  { label: 'Pipe & Plumbing Work', category: 'Plumbing' },
  { label: 'Custom Carpentry & Woodwork', category: 'Carpentry' },
  { label: 'AC Maintenance & Servicing', category: 'AC Repair' },
  { label: 'Full Home Painting', category: 'Painting' },
  { label: 'Home Deep Cleaning', category: 'Deep Cleaning' },
] as const;

export const INITIAL_VALUES: FormValues = {
  title: '',
  serviceName: '',
  description: '',
  skills: ['Electrician'],
  minAmount: 499,
  maxAmount: 1499,
  currency: 'INR',
  preferredDate: '',
  preferredStartTime: '09:00',
  preferredEndTime: '13:00',
  applicationDeadline: '',
  workerRequirementType: 'PLATFORM_RECOMMENDED',
  requiredWorkers: 1,
  minimumWorkers: 1,
  maximumWorkers: 5,
  address: {
    address: '',
    city: 'Mohali',
    state: 'Punjab',
    country: 'India',
    latitude: 30.6996,
    longitude: 76.693,
  },
};