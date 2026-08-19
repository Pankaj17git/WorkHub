import { WorkerJobRequest, WorkerMetric, ServiceItem } from '../types';

export const MOCK_WORKER_METRICS: WorkerMetric = {
  todayEarnings: 2450,
  todayCompletedJobs: 4,
  weeklyEarnings: 16800,
  acceptanceRate: 98,
  rating: 4.94,
  walletBalance: 8420,
  totalReviews: 184,
};

export const MOCK_WORKER_SERVICES: ServiceItem[] = [
  { id: 'ws-1', name: 'Complete Switchboard & Wiring Inspection', description: 'Comprehensive diagnostics of voltage drops and safety earthing.', price: 499, durationMinutes: 45, enabled: true, popular: true },
  { id: 'ws-2', name: 'MCB / Fuse Box Repair & Replacement', description: 'Installation of single/double pole MCB distribution box changeover.', price: 650, durationMinutes: 60, enabled: true, popular: true },
  { id: 'ws-3', name: 'Ceiling Fan & Decorative Light Fitting', description: 'Heavy ceiling fan, decorative chandelier or track lighting assembly.', price: 299, durationMinutes: 30, enabled: true },
  { id: 'ws-4', name: 'Inverter & Battery Setup / Health Check', description: 'Dual battery wiring setup, inverter load calculation.', price: 550, durationMinutes: 50, enabled: true },
  { id: 'ws-5', name: 'Emergency Short Circuit Diagnostics', description: 'Immediate tripping detection and burnt line bypass under 30 mins.', price: 850, durationMinutes: 40, enabled: false },
];

export const MOCK_INCOMING_REQUESTS: WorkerJobRequest[] = [
  {
    id: 'job-101',
    customerName: 'Amit Verma',
    customerPhone: '+91 98765 43210',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    serviceName: 'Complete Switchboard & Wiring Inspection',
    serviceCategory: 'Electricians',
    location: 'House # 1422, Sector 35-C, Chandigarh',
    distanceKm: 1.2,
    date: 'Today, 19 Aug',
    timeWindow: '10:30 AM - 11:30 AM',
    earningsAmount: 499,
    status: 'PENDING',
    otp: '4829',
    notes: 'Main MCB trips when AC turns on, please bring spare 32A breaker.',
    expiresInSeconds: 45,
  },
  {
    id: 'job-102',
    customerName: 'Sunita Mehra',
    customerPhone: '+91 98112 34567',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    serviceName: 'Ceiling Fan & Decorative Light Fitting',
    serviceCategory: 'Electricians',
    location: 'Flat 401, Silver Oaks, Sector 22-B, Chandigarh',
    distanceKm: 2.8,
    date: 'Today, 19 Aug',
    timeWindow: '02:00 PM - 03:00 PM',
    earningsAmount: 299,
    status: 'PENDING',
    otp: '3192',
    notes: 'Need to install 2 Havells high speed ceiling fans in bedrooms.',
    expiresInSeconds: 58,
  },
  {
    id: 'job-103',
    customerName: 'Gurpreet Singh',
    customerPhone: '+91 99887 76655',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    serviceName: 'Inverter & Battery Setup / Health Check',
    serviceCategory: 'Electricians',
    location: 'SCO 45, Phase 7, Mohali',
    distanceKm: 4.5,
    date: 'Tomorrow, 20 Aug',
    timeWindow: '11:00 AM - 12:00 PM',
    earningsAmount: 550,
    status: 'ACCEPTED',
    otp: '9134',
    notes: 'New Luminous inverter installation with tubular battery setup.',
  },
];

export const MOCK_EARNINGS_HISTORY = [
  { day: 'Mon', amount: 1850, jobs: 3 },
  { day: 'Tue', amount: 2600, jobs: 4 },
  { day: 'Wed (Today)', amount: 2450, jobs: 4 },
  { day: 'Thu', amount: 2100, jobs: 3 },
  { day: 'Fri', amount: 2900, jobs: 5 },
  { day: 'Sat', amount: 3400, jobs: 6 },
  { day: 'Sun', amount: 1500, jobs: 2 },
];
