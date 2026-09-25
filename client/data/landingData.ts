import React from 'react';
import {
  Droplet,
  Zap,
  Snowflake,
  Hammer,
  PaintRoller,
  Package,
  LayoutGrid,
  Brush,
  Users,
  Briefcase,
  Star,
  ShieldCheck,
  LucideIcon,
  MapPin,
  Clock
} from 'lucide-react';

export interface PopularService {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  bg: string;
  image?: string;
  isCollage?: boolean;
  collageImages?: string[];
  subServices: string[];
  rating: string;
  reviews: string;
  href: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  color: string;
}

export interface TrustStat {
  value: string;
  label: string;
  icon: LucideIcon;
  bg: string;
}

export interface UserTestimonial {
  name: string;
  avatar: string;
  quote: string;
  rating: number;
}

// 8 Popular Services matching reference design with Lucide icons
export const POPULAR_SERVICES: PopularService[] = [
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Fix leaks, install & more',
    icon: Droplet,
    bg: 'bg-blue-50 text-blue-600',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    subServices: ['Leak Repair', 'Installation', 'Pipe Fitting', 'Drain Cleaning'],
    rating: '4.8',
    reviews: '2.5k+ reviews',
    href: '/search?category=plumbers',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    description: 'Wiring, repairs & installs',
    icon: Zap,
    bg: 'bg-amber-50 text-amber-500',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    subServices: ['Switches & Outlets', 'Panel Upgrades', 'Lighting Installation', 'Fault Fixing'],
    rating: '4.7',
    reviews: '1.8k+ reviews',
    href: '/search?category=electricians',
  },
  {
    id: 'ac-repair',
    title: 'AC Repair & Service',
    description: 'Stay cool, always',
    icon: Snowflake,
    bg: 'bg-sky-50 text-sky-500',
    image: '/images/ac-technician.jpg',
    subServices: ['AC Installation', 'Gas Refilling', 'Regular Maintenance', 'Emergency Service'],
    rating: '4.9',
    reviews: '3.2k+ reviews',
    href: '/search?category=appliance-repair',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    description: 'Custom work & repairs',
    icon: Hammer,
    bg: 'bg-orange-50 text-orange-500',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
    subServices: ['Furniture Repair', 'Custom Furniture', 'Wooden Installations', 'Door & Window Fitting'],
    rating: '4.6',
    reviews: '1.4k+ reviews',
    href: '/search?category=carpenters',
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    description: 'Home & office cleaning',
    icon: Brush,
    bg: 'bg-purple-50 text-purple-600',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    subServices: ['Regular Cleaning', 'Deep Cleaning', 'Move-in / Move-out', 'Office Cleaning'],
    rating: '4.8',
    reviews: '2.1k+ reviews',
    href: '/search?category=cleaning',
  },
  {
    id: 'painting',
    title: 'Painting',
    description: 'Interior & exterior',
    icon: PaintRoller,
    bg: 'bg-teal-50 text-teal-600',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    subServices: ['Wall Painting', 'Texture & Finishing', 'Wood Painting', 'Color Consultation'],
    rating: '4.7',
    reviews: '1.6k+ reviews',
    href: '/search?category=painters',
  },
  {
    id: 'moving',
    title: 'Moving',
    description: 'Safe & secure moving',
    icon: Package,
    bg: 'bg-amber-50 text-amber-600',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&auto=format&fit=crop&q=80',
    subServices: ['Home Moving', 'Office Relocation', 'Packing & Unpacking', 'Loading & Unloading'],
    rating: '4.9',
    reviews: '2.8k+ reviews',
    href: '/search?category=moving',
  },
  {
    id: 'more',
    title: 'More Services',
    description: 'And many more...',
    icon: LayoutGrid,
    bg: 'bg-purple-50 text-purple-600',
    isCollage: true,
    collageImages: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=240&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=240&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=240&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=240&auto=format&fit=crop&q=80',
    ],
    subServices: ['Gardening', 'Pest Control', 'Appliance Repair', 'Pet Care', 'Handyman Services', '& More'],
    rating: '4.5',
    reviews: '1.2k+ reviews',
    href: '/search',
  },
];

// How it works steps
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: '1',
    title: 'Post a Job',
    description: 'Tell us what you need and where.',
    color: 'bg-[#0066f5]',
  },
  {
    number: '2',
    title: 'Get Matched',
    description: 'Verified professionals apply for your job.',
    color: 'bg-[#8b5cf6]',
  },
  {
    number: '3',
    title: 'Choose & Book',
    description: 'Compare profiles, reviews and prices.',
    color: 'bg-[#10b981]',
  },
  {
    number: '4',
    title: 'Get It Done',
    description: 'Track progress and leave a review.',
    color: 'bg-[#f59e0b]',
  },
];

// Trust statistics
export const TRUST_STATS: TrustStat[] = [
  {
    value: '10,000+',
    label: 'Active Workers',
    icon: Users,
    bg: 'bg-blue-50 text-[#0066f5]',
  },
  {
    value: '50,000+',
    label: 'Jobs Completed',
    icon: Briefcase,
    bg: 'bg-sky-50 text-sky-600',
  },
  {
    value: '4.8/5',
    label: 'Average Rating',
    icon: Star,
    bg: 'bg-purple-50 text-purple-600',
  },
  {
    value: '100%',
    label: 'Verified Professionals',
    icon: ShieldCheck,
    bg: 'bg-indigo-50 text-indigo-600',
  },
];

// User testimonials
export const USER_TESTIMONIALS: UserTestimonial[] = [
  {
    name: 'Sarah Ahmed',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    quote:
      'WorkHub made it so easy to find a reliable plumber. The worker was on time, professional and did a great job!',
    rating: 5,
  },
  {
    name: 'Mohammed Ali',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    quote:
      'I get consistent work through WorkHub. The platform is easy to use and the support team is very helpful.',
    rating: 5,
  },
  {
    name: 'Ayesha Khan',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    quote:
      'As a customer, I feel safe and confident using WorkHub. The reviews and verification process really make a difference.',
    rating: 5,
  },
];

export const TRUSTED_BADGES = [
  {
    label: `Verified  Professionals`,
    icon: ShieldCheck,
  },
  {
    label: `Real Reviews  & Ratings`,
    icon: Star,
  },{
    label: `Local & Nearby`,
    icon: MapPin,
  },{
    label: `Fast & Easy Booking`,
    icon: Clock,
  },
]
  

