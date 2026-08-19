export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  popular?: boolean;
  enabled?: boolean;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  serviceUsed: string;
  verified: boolean;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  category: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  experienceYears: number;
  hourlyRate: number;
  verified: boolean;
  online: boolean;
  responseTimeMinutes: number;
  about: string;
  skills: string[];
  services: ServiceItem[];
  reviews: Review[];
  badges: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  proCount: number;
  startingPrice: number;
  popular?: boolean;
}

export interface BookingState {
  id: string;
  proId: string;
  selectedServices: ServiceItem[];
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  contactNumber: string;
  specialInstructions?: string;
  status: 'CONFIRMED' | 'PRO_ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED';
  otp: string;
  baseAmount: number;
  serviceFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
  paymentStatus: 'PAID' | 'PAY_AFTER_SERVICE';
  createdAt: string;
}

/* Worker / Professional Portal Models */

export interface WorkerJobRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  serviceName: string;
  serviceCategory: string;
  location: string;
  distanceKm: number;
  date: string;
  timeWindow: string;
  earningsAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED';
  otp?: string;
  notes?: string;
  expiresInSeconds?: number;
}

export interface WorkerMetric {
  todayEarnings: number;
  todayCompletedJobs: number;
  weeklyEarnings: number;
  acceptanceRate: number;
  rating: number;
  walletBalance: number;
  totalReviews: number;
}
