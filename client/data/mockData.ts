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
    id: 'pro-amit',
    name: 'Amit Kumar',
    title: 'Electrician & Electrical Specialist',
    avatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    category: 'Electricians',
    location: 'Sector 22, Chandigarh',
    distanceKm: 3.2,
    rating: 4.8,
    reviewCount: 132,
    completedJobs: 340,
    experienceYears: 8,
    hourlyRate: 400,
    verified: true,
    online: true,
    responseTimeMinutes: 15,
    about: 'Licensed electrician with 8+ years of experience in residential and commercial installations, repairs and maintenance.',
    skills: ['Wiring', 'Panel Upgrade', 'Lighting', 'Switches & Outlets', 'Circuit Breakers', 'Earthing', 'Safety Audit'],
    services: [
      { id: 'srv-a1', name: 'Electrical Panel & MCB Inspection', description: 'Complete panel load testing and circuit breaker replacement.', price: 400, durationMinutes: 45, popular: true },
      { id: 'srv-a2', name: 'Complete Home Wiring Diagnostics', description: 'Fault tracing, neutral leakage testing and earthing check.', price: 600, durationMinutes: 60, popular: true },
      { id: 'srv-a3', name: 'Chandelier & Designer Light Fitting', description: 'Heavy ceiling mount and concealed wiring setup.', price: 350, durationMinutes: 30 },
    ],
    reviews: [
      {
        id: 'rev-a1',
        author: 'Sunil Rao',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '12 Aug 2026',
        serviceUsed: 'Electrical Panel & MCB Inspection',
        verified: true,
        comment: 'Amit did a phenomenal job fixing our tripped main line. Very professional and tidy.'
      }
    ],
    badges: ['Govt. Certified', 'Top Rated 2026', 'Verified Identity']
  },
  {
    id: 'pro-rohit',
    name: 'Rohit Verma',
    title: 'Plumber & Sanitary Expert',
    avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    category: 'Plumbers',
    location: 'Sector 17, Chandigarh',
    distanceKm: 4.8,
    rating: 4.7,
    reviewCount: 98,
    completedJobs: 210,
    experienceYears: 6,
    hourlyRate: 350,
    verified: true,
    online: true,
    responseTimeMinutes: 20,
    about: 'Skilled plumber with expertise in pipe fitting, leak detection, bathroom fittings and water pump installation.',
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Fittings', 'Water Pumps', 'Drain Cleaning', 'Sanitary Ware', 'Geyser Installation'],
    services: [
      { id: 'srv-r1', name: 'Concealed Pipeline Leak Repair', description: 'Precision acoustic pinpointing and copper/CPVC pipe patching.', price: 499, durationMinutes: 50, popular: true },
      { id: 'srv-r2', name: 'Complete Bathroom Sanitary Fitting', description: 'Mixer faucet, shower head, divertor and jet spray setup.', price: 350, durationMinutes: 40, popular: true },
    ],
    reviews: [
      {
        id: 'rev-r1',
        author: 'Meenakshi Iyer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '08 Aug 2026',
        serviceUsed: 'Concealed Pipeline Leak Repair',
        verified: true,
        comment: 'Rohit identified our stubborn bathroom seepage within 15 minutes. Highly recommended!'
      }
    ],
    badges: ['Licensed Plumber', 'Top Rated', 'Verified Identity']
  },
  {
    id: 'pro-sandeep',
    name: 'Sandeep Singh',
    title: 'AC Repair & Service Technician',
    avatar: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&auto=format&fit=crop&q=80',
    category: 'AC & Appliance Repair',
    location: 'Sector 35, Chandigarh',
    distanceKm: 5.6,
    rating: 4.9,
    reviewCount: 164,
    completedJobs: 480,
    experienceYears: 7,
    hourlyRate: 450,
    verified: true,
    online: true,
    responseTimeMinutes: 10,
    about: 'Expert in AC installation, repair and maintenance for all major brands. Fast, reliable and professional service.',
    skills: ['AC Repair', 'AC Installation', 'Gas Refilling', 'Troubleshooting', 'PCB Diagnostics', 'Coil Cleaning'],
    services: [
      { id: 'srv-s1', name: 'Deep Jet Pump AC Foam Cleaning', description: 'Dual unit anti-bacterial foam treatment & power coil wash.', price: 450, durationMinutes: 45, popular: true },
      { id: 'srv-s2', name: 'Refrigerant Leak Test & Gas Refill', description: 'Nitrogen leak test followed by pure R32/R410A charge.', price: 1800, durationMinutes: 75, popular: true },
    ],
    reviews: [
      {
        id: 'rev-s1',
        author: 'Vivek Chawla',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '04 Aug 2026',
        serviceUsed: 'Deep Jet Pump AC Foam Cleaning',
        verified: true,
        comment: 'Sandeep is top-tier. Cleaned both our ACs without spilling a drop on our wooden floors.'
      }
    ],
    badges: ['HVAC Certified', 'Top Rated', 'Verified Identity']
  },
  {
    id: 'pro-vikas',
    name: 'Vikas Sharma',
    title: 'Painter & Wall Decor Expert',
    avatar: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&auto=format&fit=crop&q=80',
    category: 'Painters',
    location: 'Sector 20, Chandigarh',
    distanceKm: 6.1,
    rating: 4.6,
    reviewCount: 76,
    completedJobs: 190,
    experienceYears: 5,
    hourlyRate: 300,
    verified: true,
    online: true,
    responseTimeMinutes: 25,
    about: 'Professional painter with expertise in interior & exterior painting, texture finishes and wall decoration.',
    skills: ['Interior Painting', 'Exterior Painting', 'Texture Finish', 'Wallpaper', 'Waterproofing', 'Wood Polishing'],
    services: [
      { id: 'srv-v1', name: 'Feature Wall Textured Painting', description: 'Designer metallic or rustic texture application.', price: 850, durationMinutes: 90, popular: true },
      { id: 'srv-v2', name: 'Room Repainting & Putty Touchup', description: 'Wall sanding, primer coat and 2 coats of emulsion.', price: 499, durationMinutes: 60, popular: true },
    ],
    reviews: [
      {
        id: 'rev-v1',
        author: 'Ananya Gupta',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        rating: 5.0,
        date: '10 Aug 2026',
        serviceUsed: 'Feature Wall Textured Painting',
        verified: true,
        comment: 'Vikas gave our living room accent wall such a luxurious finish. Amazing craftsmanship.'
      }
    ],
    badges: ['Paint Specialist', 'Color Expert', 'Verified Identity']
  },
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

export interface MockJobPosting {
  id: string;
  title: string;
  category: string;
  customerName: string;
  customerAvatar: string;
  location: string;
  distanceKm: number;
  postedAt: string;
  status: 'OPEN' | 'URGENT' | 'IN_PROGRESS';
  minBudget: number;
  maxBudget: number;
  requiredWorkers: number;
  description: string;
  skills: string[];
}

export const MOCK_JOB_POSTINGS: MockJobPosting[] = [
  {
    id: 'job-p1',
    title: 'Urgent 3-Phase MCB Tripping Diagnostics & Wiring Overhaul',
    category: 'Electricians',
    customerName: 'Aarav Malhotra',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    location: 'Sector 22, Chandigarh',
    distanceKm: 2.1,
    postedAt: '2 hours ago',
    status: 'URGENT',
    minBudget: 800,
    maxBudget: 1500,
    requiredWorkers: 1,
    description: 'Main breaker repeatedly trips whenever two air conditioners run simultaneously. Need a licensed electrician with load testing instruments to fix neutral faults.',
    skills: ['Wiring', 'Panel Upgrade', 'Circuit Breakers', 'Safety Audit'],
  },
  {
    id: 'job-p2',
    title: 'Concealed Bathroom Seepage & High Pressure Diverter Fitting',
    category: 'Plumbers',
    customerName: 'Priya Singla',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    location: 'Sector 17, Chandigarh',
    distanceKm: 3.4,
    postedAt: '4 hours ago',
    status: 'OPEN',
    minBudget: 600,
    maxBudget: 1200,
    requiredWorkers: 1,
    description: 'Dampness showing on master bedroom wall originating from adjacent bath divertor. Requires acoustic leak pinpointing and pipe joint replacement.',
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Fittings', 'Sanitary Ware'],
  },
  {
    id: 'job-p3',
    title: 'Dual Split AC Deep Foam Wash & R32 Gas Refill',
    category: 'AC & Appliance Repair',
    customerName: 'Ramesh Kulkarni',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    location: 'Sector 35, Chandigarh',
    distanceKm: 4.2,
    postedAt: '5 hours ago',
    status: 'OPEN',
    minBudget: 1200,
    maxBudget: 2400,
    requiredWorkers: 2,
    description: 'Two 1.5 ton Inverter AC units in office need pressure foam service, outdoor coil cleaning and refrigerant top-up before summer peak.',
    skills: ['AC Repair', 'Gas Refilling', 'Troubleshooting', 'Coil Cleaning'],
  },
  {
    id: 'job-p4',
    title: 'Living Room Texture Painting & Wall Primer Treatment',
    category: 'Painters',
    customerName: 'Harsh Vardhan',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    location: 'Sector 20, Chandigarh',
    distanceKm: 5.0,
    postedAt: '1 day ago',
    status: 'OPEN',
    minBudget: 2500,
    maxBudget: 4500,
    requiredWorkers: 2,
    description: 'Accent wall in 220 sq ft living room needs rustic concrete texture finish. Paint material provided by client; skilled labor needed.',
    skills: ['Interior Painting', 'Texture Finish', 'Wallpaper', 'Wall Prep'],
  },
  {
    id: 'job-p5',
    title: 'Modular Kitchen Hydraulic Hinges & Drawer Alignment',
    category: 'Carpenters',
    customerName: 'Kavita Menon',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    location: 'Phase 7, Mohali',
    distanceKm: 6.8,
    postedAt: '1 day ago',
    status: 'OPEN',
    minBudget: 700,
    maxBudget: 1400,
    requiredWorkers: 1,
    description: 'Six soft-close cabinet doors sagging and two tandem box kitchen drawers jumping off rails. Need replacement hinges and proper leveling.',
    skills: ['Modular Kitchen Adjustments', 'Hydraulic Hinges', 'Custom Shelving'],
  },
  {
    id: 'job-p6',
    title: 'Pre-Move Deep Sanitization & High-Pressure Floor Scrubbing',
    category: 'Deep Cleaning',
    customerName: 'Devika Chawla',
    customerAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    location: 'Sector 43, Chandigarh',
    distanceKm: 3.9,
    postedAt: '2 days ago',
    status: 'OPEN',
    minBudget: 2200,
    maxBudget: 3800,
    requiredWorkers: 3,
    description: 'Full 3BHK flat deep cleaning including balcony tile scrubbing, window tracks, kitchen exhaust degreasing and bathroom descaling.',
    skills: ['Deep Cleaning', 'Degreasing', 'Floor Scrubbing', 'Sanitization'],
  },
];

