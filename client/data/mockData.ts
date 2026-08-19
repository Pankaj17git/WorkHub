import { Professional, Category } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electricians', slug: 'electricians', iconName: 'Zap', proCount: 142, startingPrice: 299, popular: true },
  { id: '2', name: 'Plumbers', slug: 'plumbers', iconName: 'Wrench', proCount: 98, startingPrice: 249, popular: true },
  { id: '3', name: 'AC & Appliance Repair', slug: 'appliance-repair', iconName: 'Wind', proCount: 84, startingPrice: 399, popular: true },
  { id: '4', name: 'Carpenters', slug: 'carpenters', iconName: 'Hammer', proCount: 65, startingPrice: 349 },
  { id: '5', name: 'Painters', slug: 'painters', iconName: 'Paintbrush', proCount: 52, startingPrice: 499 },
  { id: '6', name: 'Deep Cleaning', slug: 'cleaning', iconName: 'Sparkles', proCount: 110, startingPrice: 599, popular: true },
  { id: '7', name: 'Pest Control', slug: 'pest-control', iconName: 'ShieldAlert', proCount: 41, startingPrice: 699 },
  { id: '8', name: 'Home Automation', slug: 'home-automation', iconName: 'Cpu', proCount: 29, startingPrice: 799 },
];

export const MOCK_PROS: Professional[] = [
  {
    id: 'pro-1',
    name: 'Rahul Sharma',
    title: 'Master Electrician & Smart Home Specialist',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    category: 'Electricians',
    location: 'Sector 35-C, Chandigarh',
    distanceKm: 2.4,
    rating: 4.94,
    reviewCount: 184,
    completedJobs: 520,
    experienceYears: 8,
    hourlyRate: 350,
    verified: true,
    online: true,
    responseTimeMinutes: 15,
    about: 'Government-certified master electrician with 8+ years of hands-on experience in residential rewiring, smart home automation, high-voltage panel maintenance, and inverter setups. Committed to 100% electrical safety standards with guaranteed warranty on workmanship.',
    skills: ['MCB & Distribution Boards', 'Smart Home Wiring', 'Inverter & UPS', 'Fan & Chandelier Installation', 'Appliance Tripping Diagnostics'],
    services: [
      { id: 'srv-101', name: 'Complete Switchboard & Wiring Inspection', description: 'Comprehensive diagnostics of voltage drops, burnt lines, and safety earthing.', price: 499, durationMinutes: 45, popular: true },
      { id: 'srv-102', name: 'MCB / Fuse Box Repair & Replacement', description: 'Installation of single/double pole MCB or complete distribution box changeover.', price: 650, durationMinutes: 60, popular: true },
      { id: 'srv-103', name: 'Ceiling Fan & Decorative Light Fitting', description: 'Heavy ceiling fan, decorative chandelier or track lighting assembly & mounting.', price: 299, durationMinutes: 30 },
      { id: 'srv-104', name: 'Inverter & Battery Setup / Health Check', description: 'Dual battery wiring setup, inverter load calculation and terminal cleaning.', price: 550, durationMinutes: 50 },
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Amit Verma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '14 Aug 2026',
        serviceUsed: 'Complete Switchboard & Wiring Inspection',
        verified: true,
        comment: 'Rahul arrived within 20 minutes! He quickly pinpointed a neutral wire short that had been tripping our main breaker for two days. Clean work and very polite demeanor.'
      },
      {
        id: 'rev-2',
        author: 'Pooja Kulkarni',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '02 Aug 2026',
        serviceUsed: 'Inverter & Battery Setup',
        verified: true,
        comment: 'Highly skilled professional. Installed our Luminous inverter and tested all heavy appliances systematically. Provided genuine advice and transparent pricing.'
      },
      {
        id: 'rev-3',
        author: 'Deepak Singhania',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        rating: 4.8,
        date: '28 Jul 2026',
        serviceUsed: 'MCB / Fuse Box Repair',
        verified: true,
        comment: 'Very professional, neat wiring layout with proper tags. Great attention to safety.'
      }
    ],
    badges: ['Govt. Certified', 'Top Rated 2026', 'Quick Responder', 'Verified Identity']
  },
  {
    id: 'pro-2',
    name: 'Sukhwinder Singh',
    title: 'Senior Plumber & Pipeline Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    category: 'Plumbers',
    location: 'Sector 22-B, Chandigarh',
    distanceKm: 3.8,
    rating: 4.88,
    reviewCount: 146,
    completedJobs: 410,
    experienceYears: 10,
    hourlyRate: 300,
    verified: true,
    online: true,
    responseTimeMinutes: 20,
    about: 'Expert plumbing contractor specializing in concealed leakage detection, bathroom sanitary fittings, pressure pump installations, and drainage unblocking.',
    skills: ['Concealed Leak Detection', 'Sanitary & Faucet Fitting', 'Overhead Tank Cleaning', 'Motor & Pressure Pump', 'Drain Clog Removal'],
    services: [
      { id: 'srv-201', name: 'Concealed Water Leakage Acoustic Detection', description: 'Non-invasive acoustic sensor detection to locate hidden pipe bursts.', price: 799, durationMinutes: 60, popular: true },
      { id: 'srv-202', name: 'Bath & Kitchen Faucet / Mixer Replacement', description: 'Removal of corroded fittings and precision seal installation.', price: 349, durationMinutes: 30, popular: true },
      { id: 'srv-203', name: 'Motor & Water Pressure Pump Repair', description: 'Impeller cleaning, capacitor replacement and pressure valve adjustment.', price: 499, durationMinutes: 45 },
    ],
    reviews: [
      {
        id: 'rev-4',
        author: 'Manpreet Kaur',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '10 Aug 2026',
        serviceUsed: 'Concealed Water Leakage Detection',
        verified: true,
        comment: 'Sukhwinder saved our newly painted wall by finding the exact spot of leakage without tearing down tiles. Excellent equipment.'
      }
    ],
    badges: ['Master Plumber', 'Top Rated 2026', 'Verified Identity']
  },
  {
    id: 'pro-3',
    name: 'Vikram Joshi',
    title: 'HVAC & Inverter AC Specialist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&auto=format&fit=crop&q=80',
    category: 'AC & Appliance Repair',
    location: 'Sector 43, Chandigarh',
    distanceKm: 5.1,
    rating: 4.91,
    reviewCount: 215,
    completedJobs: 670,
    experienceYears: 7,
    hourlyRate: 400,
    verified: true,
    online: false,
    responseTimeMinutes: 30,
    about: 'Specialized in multi-brand Inverter Split & Window AC deep foam jet service, PCB diagnostic troubleshooting, and pure R32/R410A gas refilling with digital gauges.',
    skills: ['Foam Jet Deep AC Service', 'Inverter PCB Repair', 'Precision Gas Refill', 'Compressor Replacement', 'Uninstallation & Mounting'],
    services: [
      { id: 'srv-301', name: 'High-Pressure Foam Jet AC Deep Service', description: 'Full indoor & outdoor unit high-pressure wash with antibacterial coil foam.', price: 599, durationMinutes: 60, popular: true },
      { id: 'srv-302', name: 'AC Gas Charging with Leak Test (R32 / R410A)', description: 'Nitrogen pressure testing, vacuuming and precision refrigerant recharge.', price: 1850, durationMinutes: 90, popular: true },
      { id: 'srv-303', name: 'Split AC Installation & Copper Piping', description: 'Level-balanced mounting with heavy duty brackets and flare tightening.', price: 1199, durationMinutes: 75 },
    ],
    reviews: [
      {
        id: 'rev-5',
        author: 'Karan Mehra',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '08 Aug 2026',
        serviceUsed: 'High-Pressure Foam Jet AC Deep Service',
        verified: true,
        comment: 'My Daikin AC cools like day one now. Vikram took exceptional care with the surroundings and left no water stains.'
      }
    ],
    badges: ['HVAC Certified', '500+ Jobs Done', 'Verified Identity']
  },
  {
    id: 'pro-4',
    name: 'Harpreet Singh',
    title: 'Custom Furniture & Woodwork Specialist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop&q=80',
    category: 'Carpenters',
    location: 'Sector 19, Chandigarh',
    distanceKm: 1.9,
    rating: 4.85,
    reviewCount: 92,
    completedJobs: 280,
    experienceYears: 12,
    hourlyRate: 350,
    verified: true,
    online: true,
    responseTimeMinutes: 25,
    about: 'Third-generation carpenter adept at bespoke modular kitchen repair, hydraulic hinge alignment, sofa framework strengthening, and precision lock installations.',
    skills: ['Modular Kitchen Adjustments', 'Hydraulic Hinges', 'Door Lock Installation', 'Furniture Restoration', 'Custom Shelving'],
    services: [
      { id: 'srv-401', name: 'Digital & Godrej Lock Precision Fitting', description: 'Mortise lock, deadbolt, or biometric smart lock mortise groove carving & installation.', price: 449, durationMinutes: 45, popular: true },
      { id: 'srv-402', name: 'Modular Cabinet & Soft-Close Hinge Overhaul', description: 'Re-aligning sagging shutters and replacing hydraulic soft-close hinges.', price: 399, durationMinutes: 40 },
    ],
    reviews: [],
    badges: ['Woodcraft Master', 'Verified Identity']
  }
];
