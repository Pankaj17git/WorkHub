import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, UserRole, PricingType } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

// Common password for all seeded test accounts (easy to log in and test)
const COMMON_PASSWORD = "password123";

const ROLES: UserRole[] = [
  UserRole.CUSTOMER,
  UserRole.WORKER,
  UserRole.ADMIN,
  UserRole.CONTRACTOR,
];

const skills = [
  // Construction
  { key: "mason", name: "Mason" },
  { key: "bricklayer", name: "Bricklayer" },
  { key: "concrete_worker", name: "Concrete Worker" },
  { key: "tile_worker", name: "Tile Worker" },
  { key: "plaster_worker", name: "Plaster Worker" },
  { key: "waterproofing_worker", name: "Waterproofing Worker" },
  { key: "construction_worker", name: "Construction Worker" },
  { key: "demolition_worker", name: "Demolition Worker" },

  // Carpentry & Woodwork
  { key: "carpenter", name: "Carpenter" },
  { key: "furniture_carpenter", name: "Furniture Carpenter" },
  { key: "modular_furniture_worker", name: "Modular Furniture Worker" },
  { key: "wood_polisher", name: "Wood Polisher" },

  // Electrical
  { key: "electrician", name: "Electrician" },
  { key: "electrical_helper", name: "Electrical Helper" },
  { key: "ac_technician", name: "AC Technician" },
  { key: "solar_panel_installer", name: "Solar Panel Installer" },
  { key: "inverter_technician", name: "Inverter Technician" },

  // Plumbing
  { key: "plumber", name: "Plumber" },
  { key: "pipe_fitter", name: "Pipe Fitter" },
  { key: "sanitary_worker", name: "Sanitary Worker" },

  // Painting & Finishing
  { key: "painter", name: "Painter" },
  { key: "wall_painter", name: "Wall Painter" },
  { key: "texture_painter", name: "Texture Painter" },
  { key: "interior_painter", name: "Interior Painter" },
  { key: "polisher", name: "Polisher" },

  // Welding & Metal Work
  { key: "welder", name: "Welder" },
  { key: "fabricator", name: "Fabricator" },
  { key: "metal_worker", name: "Metal Worker" },
  { key: "steel_fabricator", name: "Steel Fabricator" },
  { key: "aluminium_worker", name: "Aluminium Worker" },

  // HVAC & Appliances
  { key: "refrigerator_technician", name: "Refrigerator Technician" },
  { key: "washing_machine_technician", name: "Washing Machine Technician" },
  { key: "appliance_repair_worker", name: "Appliance Repair Worker" },
  { key: "hvac_technician", name: "HVAC Technician" },

  // Automotive
  { key: "mechanic", name: "Mechanic" },
  { key: "car_mechanic", name: "Car Mechanic" },
  { key: "bike_mechanic", name: "Bike Mechanic" },
  { key: "auto_electrician", name: "Auto Electrician" },
  { key: "tyre_worker", name: "Tyre Worker" },
  { key: "car_washer", name: "Car Washer" },
  { key: "vehicle_detailer", name: "Vehicle Detailer" },

  // Cleaning & Maintenance
  { key: "cleaner", name: "Cleaner" },
  { key: "house_cleaner", name: "House Cleaner" },
  { key: "office_cleaner", name: "Office Cleaner" },
  { key: "deep_cleaning_worker", name: "Deep Cleaning Worker" },
  { key: "pest_control_worker", name: "Pest Control Worker" },
  { key: "gardener", name: "Gardener" },
  { key: "landscaping_worker", name: "Landscaping Worker" },

  // Domestic Services
  { key: "cook", name: "Cook" },
  { key: "chef", name: "Chef" },
  { key: "house_help", name: "House Help" },
  { key: "babysitter", name: "Babysitter" },
  { key: "elderly_care_worker", name: "Elderly Care Worker" },
  { key: "caretaker", name: "Caretaker" },

  // Security
  { key: "security_guard", name: "Security Guard" },
  { key: "watchman", name: "Watchman" },
  { key: "security_supervisor", name: "Security Supervisor" },

  // Drivers & Delivery
  { key: "driver", name: "Driver" },
  { key: "car_driver", name: "Car Driver" },
  { key: "truck_driver", name: "Truck Driver" },
  { key: "delivery_driver", name: "Delivery Driver" },
  { key: "delivery_worker", name: "Delivery Worker" },
  { key: "e_rickshaw_driver", name: "E-Rickshaw Driver" },
  { key: "auto_rickshaw_driver", name: "Auto Rickshaw Driver" },

  // Beauty & Personal Care
  { key: "barber", name: "Barber" },
  { key: "hair_stylist", name: "Hair Stylist" },
  { key: "beautician", name: "Beautician" },
  { key: "makeup_artist", name: "Makeup Artist" },
  { key: "mehndi_artist", name: "Mehndi Artist" },

  // Tailoring & Textile
  { key: "tailor", name: "Tailor" },
  { key: "sewing_machine_operator", name: "Sewing Machine Operator" },
  { key: "embroidery_worker", name: "Embroidery Worker" },
  { key: "clothing_alteration_worker", name: "Clothing Alteration Worker" },

  // Glass, Doors & Windows
  { key: "glass_worker", name: "Glass Worker" },
  { key: "glass_installer", name: "Glass Installer" },
  { key: "door_installer", name: "Door Installer" },
  { key: "window_installer", name: "Window Installer" },

  // General Labour
  { key: "general_labourer", name: "General Labourer" },
  { key: "loading_worker", name: "Loading Worker" },
  { key: "unloading_worker", name: "Unloading Worker" },
  { key: "warehouse_worker", name: "Warehouse Worker" },
  { key: "helper", name: "Helper" },
];

const customers = [
  {
    email: "customer.rahul@workhub.com",
    name: "Rahul Sharma",
    phone: "+919876543211",
    companyName: "Sharma Tech Solutions",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Flat 402, Sunshine Heights, Andheri West, Mumbai",
    latitude: 19.1136,
    longitude: 72.8697,
  },
  {
    email: "customer.priya@workhub.com",
    name: "Priya Patel",
    phone: "+919876543212",
    companyName: null,
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    address: "12, Shanti Niketan Society, Satellite, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    email: "customer.vikram@workhub.com",
    name: "Vikram Malhotra",
    phone: "+919876543213",
    companyName: "Malhotra Properties & Living",
    profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "Villa 45, Green Meadows, Koramangala 4th Block, Bengaluru",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    email: "customer.anita@workhub.com",
    name: "Anita Desai",
    phone: "+919876543214",
    companyName: "Desai Design Studios",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "D-14, Hauz Khas Enclave, New Delhi",
    latitude: 28.5494,
    longitude: 77.2001,
  },
  {
    email: "customer.rajesh@workhub.com",
    name: "Rajesh Khanna",
    phone: "+919876543215",
    companyName: null,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    address: "A-501, Marvel Residency, Kalyani Nagar, Pune",
    latitude: 18.5529,
    longitude: 73.9014,
  },
];

const workers = [
  {
    email: "worker.amit@workhub.com",
    name: "Amit Sharma",
    phone: "+919123456701",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    headline: "Master Electrician & AC Technician",
    bio: "Certified electrical specialist with 8+ years of hands-on experience in residential wiring, short-circuit diagnostics, inverter setups, and split AC maintenance.",
    portfolio: "https://portfolio.workhub.internal/amit-sharma",
    hourlyRate: 350.0,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Shop 12, Link Road, Oshiwara, Andheri West, Mumbai",
    latitude: 19.1412,
    longitude: 72.8315,
    skillKeys: ["electrician", "ac_technician", "electrical_helper", "inverter_technician"],
    services: [
      { name: "Switchboard & Wiring Repair", price: 299, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "AC Point & Heavy Load Line Installation", price: 499, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Ceiling Fan & Chandelier Fitting", price: 199, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Comprehensive Home Electrical Inspection", price: 799, pricingType: PricingType.FIXED, emergencyAvailable: true },
    ],
  },
  {
    email: "worker.suresh@workhub.com",
    name: "Suresh Patel",
    phone: "+919123456702",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    headline: "Senior Plumber & Pipe Fitting Specialist",
    bio: "Over 10 years of expertise in high-pressure pipe fittings, concealed leak detection, water heater plumbing, and modern sanitary installations.",
    portfolio: "https://portfolio.workhub.internal/suresh-patel",
    hourlyRate: 300.0,
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    address: "Plot 88, Near Shiv Mandir, Maninagar, Ahmedabad",
    latitude: 22.9984,
    longitude: 72.6025,
    skillKeys: ["plumber", "pipe_fitter", "sanitary_worker", "waterproofing_worker"],
    services: [
      { name: "Tap Leakage & Valve Replacement", price: 249, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Drain & Sewer Line Unclogging", price: 499, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Modern Bathroom Sanitary Fitting", price: 699, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Overhead Water Tank & Motor Installation", price: 999, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.ramesh@workhub.com",
    name: "Ramesh Suthar",
    phone: "+919123456703",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    headline: "Custom Furniture Carpenter & Modular Woodworker",
    bio: "Skilled woodwork artisan specializing in custom wardrobes, modular kitchen setups, antique furniture restorations, and door hardware.",
    portfolio: "https://portfolio.workhub.internal/ramesh-suthar",
    hourlyRate: 400.0,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "23 Wood Crafts Lane, Bellandur, Bengaluru",
    latitude: 12.9304,
    longitude: 77.6784,
    skillKeys: ["carpenter", "furniture_carpenter", "modular_furniture_worker", "wood_polisher"],
    services: [
      { name: "Furniture Repair & Re-assembly", price: 449, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Door Locks, Hinges & Handle Fitting", price: 299, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Custom Modular Cabinet Installation", price: 1499, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Natural Wood Polishing & Touch-up", price: 350, pricingType: PricingType.HOURLY, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.manoj@workhub.com",
    name: "Manoj Kumar",
    phone: "+919123456704",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    headline: "Expert Interior & Exterior Painter",
    bio: "Professional painter with 7+ years of experience delivering flawless royal texture finishes, waterproof exterior coatings, and clean interior repainting.",
    portfolio: "https://portfolio.workhub.internal/manoj-kumar",
    hourlyRate: 320.0,
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "B-22, Vikas Marg, Laxmi Nagar, New Delhi",
    latitude: 28.6318,
    longitude: 77.2773,
    skillKeys: ["painter", "wall_painter", "texture_painter", "interior_painter", "waterproofing_worker"],
    services: [
      { name: "Interior Wall Painting & Touch-up", price: 320, pricingType: PricingType.HOURLY, emergencyAvailable: false },
      { name: "Designer Texture & Accent Wall", price: 1200, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Anti-Dampness Waterproof Coating", price: 450, pricingType: PricingType.HOURLY, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.sunita@workhub.com",
    name: "Sunita Verma",
    phone: "+919123456705",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    headline: "Professional Home & Office Deep Cleaning Specialist",
    bio: "Equipped with commercial-grade cleaning tools and eco-friendly solutions for deep residential cleaning, sofa shampooing, and kitchen degreasing.",
    portfolio: "https://portfolio.workhub.internal/sunita-verma",
    hourlyRate: 280.0,
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    address: "Flat 101, Green Avenues, Baner, Pune",
    latitude: 18.5597,
    longitude: 73.7799,
    skillKeys: ["cleaner", "house_cleaner", "deep_cleaning_worker", "office_cleaner"],
    services: [
      { name: "Full Home Deep Cleaning (Mechanized)", price: 1499, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Kitchen & Exhaust Degreasing Deep Clean", price: 799, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Bathroom Sanitization & Tile Descaling", price: 599, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Sofa & Upholstery Shampooing", price: 499, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.dinesh@workhub.com",
    name: "Dinesh Yadav",
    phone: "+919123456706",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    headline: "Civil Mason & Tile Fitting Craftsman",
    bio: "Experienced civil mason specializing in laser-level tile flooring, brick masonry, partition walls, and durable concrete repairs.",
    portfolio: "https://portfolio.workhub.internal/dinesh-yadav",
    hourlyRate: 450.0,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Gala 5, Industrial Area, Kurla West, Mumbai",
    latitude: 19.0726,
    longitude: 72.8845,
    skillKeys: ["mason", "bricklayer", "concrete_worker", "tile_worker", "plaster_worker"],
    services: [
      { name: "Floor & Wall Tile Laying", price: 450, pricingType: PricingType.HOURLY, emergencyAvailable: false },
      { name: "Brick Wall & Partition Construction", price: 550, pricingType: PricingType.HOURLY, emergencyAvailable: false },
      { name: "Cement Plastering & Patch Repair", price: 350, pricingType: PricingType.HOURLY, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.deepak@workhub.com",
    name: "Deepak Verma",
    phone: "+919123456707",
    profileImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    headline: "HVAC & Major Home Appliance Specialist",
    bio: "Certified technician diagnosing and repairing inverter split ACs, double-door refrigerators, front-load washing machines, and microwave ovens.",
    portfolio: "https://portfolio.workhub.internal/deepak-verma",
    hourlyRate: 380.0,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "15 Appliance Care Hub, HSR Layout Sector 2, Bengaluru",
    latitude: 12.9121,
    longitude: 77.6446,
    skillKeys: ["ac_technician", "refrigerator_technician", "washing_machine_technician", "appliance_repair_worker", "hvac_technician"],
    services: [
      { name: "AC Jet Service & Filter Wash", price: 499, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Refrigerator Cooling Coil & Gas Refill", price: 899, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Washing Machine Drum & Motor Repair", price: 650, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.arjun@workhub.com",
    name: "Arjun Singh",
    phone: "+919123456708",
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
    headline: "Metal Fabricator & Certified Arc Welder",
    bio: "Expert metal fabricator with full workshop equipment for iron security gates, balcony safety railings, structural welding, and window frames.",
    portfolio: "https://portfolio.workhub.internal/arjun-singh",
    hourlyRate: 420.0,
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    address: "Plot 104, GIDC Vatva, Ahmedabad",
    latitude: 22.9554,
    longitude: 72.6346,
    skillKeys: ["welder", "fabricator", "metal_worker", "steel_fabricator", "aluminium_worker"],
    services: [
      { name: "On-site Arc & Gas Welding Repair", price: 399, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Main Gate & Grille Fabrication", price: 420, pricingType: PricingType.HOURLY, emergencyAvailable: false },
      { name: "Aluminium Sliding Window Channel Repair", price: 299, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.pooja@workhub.com",
    name: "Pooja Mehra",
    phone: "+919123456709",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    headline: "Professional Home Cook & Gourmet Chef",
    bio: "Experienced home chef providing daily healthy home meals, dietary planning, and specialized event catering with strict hygiene standards.",
    portfolio: "https://portfolio.workhub.internal/pooja-mehra",
    hourlyRate: 300.0,
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "Pocket 2, Mayur Vihar Phase 1, New Delhi",
    latitude: 28.6083,
    longitude: 77.2942,
    skillKeys: ["cook", "chef", "house_help"],
    services: [
      { name: "Daily Home Meal Preparation (Lunch & Dinner)", price: 300, pricingType: PricingType.HOURLY, emergencyAvailable: false },
      { name: "Special Event / Party Gourmet Catering", price: 1999, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
  {
    email: "worker.imran@workhub.com",
    name: "Imran Khan",
    phone: "+919123456710",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    headline: "Automotive Mechanic & Two-Wheeler Specialist",
    bio: "Doorstep emergency vehicle repair specialist handling engine diagnostics, battery jumpstarts, brake replacements, and periodical bike maintenance.",
    portfolio: "https://portfolio.workhub.internal/imran-khan",
    hourlyRate: 350.0,
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    address: "Garage 4, Pune-Satara Road, Swargate, Pune",
    latitude: 18.5018,
    longitude: 73.8636,
    skillKeys: ["mechanic", "car_mechanic", "bike_mechanic", "auto_electrician", "tyre_worker"],
    services: [
      { name: "Doorstep Bike General Servicing & Oil Change", price: 449, pricingType: PricingType.FIXED, emergencyAvailable: false },
      { name: "Car Battery Jumpstart & Breakdown Assist", price: 349, pricingType: PricingType.FIXED, emergencyAvailable: true },
      { name: "Brake Pad Replacement & Inspection", price: 399, pricingType: PricingType.FIXED, emergencyAvailable: false },
    ],
  },
];

const sampleJobs = [
  {
    customerEmail: "customer.rahul@workhub.com",
    title: "Complete 3BHK Electrical Rewiring & MCB Fitting",
    description: "Looking for experienced electricians to rewire the living room and install an 8-way MCB distribution board with high-load lines for two 1.5 ton ACs.",
    serviceName: "Switchboard & Wiring Repair",
    minAmount: 3500,
    maxAmount: 6000,
    currency: "INR",
    skills: ["electrician", "ac_technician"],
    requiredWorkers: 2,
    minimumWorkers: 1,
    maximumWorkers: 3,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "Flat 402, Sunshine Heights, Andheri West, Mumbai",
    latitude: 19.1136,
    longitude: 72.8697,
  },
  {
    customerEmail: "customer.priya@workhub.com",
    title: "Bathroom Sanitary Fittings & Concealed Leakage Repair",
    description: "Need a certified plumber to trace and fix concealed pipe leakage behind master bathroom wall tiles and install modern diverter valves.",
    serviceName: "Bathroom Fittings Installation",
    minAmount: 1800,
    maxAmount: 3500,
    currency: "INR",
    skills: ["plumber", "pipe_fitter", "sanitary_worker"],
    requiredWorkers: 1,
    minimumWorkers: 1,
    maximumWorkers: 2,
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    address: "12, Shanti Niketan Society, Satellite, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    customerEmail: "customer.vikram@workhub.com",
    title: "Custom TV Entertainment Unit & Modular Living Room Shelving",
    description: "Need skilled carpenters to build a custom plywood TV wall unit with acoustic panel backing and LED grooves as per architectural drawings.",
    serviceName: "Furniture Assembly & Repair",
    minAmount: 8000,
    maxAmount: 15000,
    currency: "INR",
    skills: ["carpenter", "furniture_carpenter", "modular_furniture_worker"],
    requiredWorkers: 2,
    minimumWorkers: 1,
    maximumWorkers: 4,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: "Villa 45, Green Meadows, Koramangala 4th Block, Bengaluru",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    customerEmail: "customer.anita@workhub.com",
    title: "Post-Monsoon Interior Texture Painting & Waterproofing",
    description: "Full interior repainting of a 2BHK flat with anti-damp primer treatment on exterior-facing walls and royal texture finish in the living room.",
    serviceName: "Interior Wall Painting",
    minAmount: 12000,
    maxAmount: 22000,
    currency: "INR",
    skills: ["painter", "wall_painter", "waterproofing_worker"],
    requiredWorkers: 2,
    minimumWorkers: 1,
    maximumWorkers: 3,
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "D-14, Hauz Khas Enclave, New Delhi",
    latitude: 28.5494,
    longitude: 77.2001,
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run the dev seed in production. Use seed-roles instead.");
  }
  console.log("Starting database seed...");

  // 1. Seed Roles
  const roleMap = new Map<UserRole, bigint>();
  for (const roleType of ROLES) {
    let role = await prisma.role.findFirst({
      where: { type: roleType },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { type: roleType },
      });
    }
    roleMap.set(roleType, role.id);
  }
  console.log(`Roles verified/seeded: ${ROLES.join(", ")}`);

  const customerRoleId = roleMap.get(UserRole.CUSTOMER)!;
  const workerRoleId = roleMap.get(UserRole.WORKER)!;

  // 2. Hash Common Password
  const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 10);
  console.log(`Common password prepared: "${COMMON_PASSWORD}"`);

  // 3. Seed Skills
  const skillMap = new Map<string, bigint>();
  for (const skill of skills) {
    const record = await prisma.skill.upsert({
      where: {
        key: skill.key,
      },
      update: {
        name: skill.name,
      },
      create: skill,
    });
    skillMap.set(record.key, record.id);
  }
  console.log(`Skills verified/seeded: ${skills.length} skills.`);

  // 4. Seed Customers
  for (const c of customers) {
    const user = await prisma.user.upsert({
      where: { email: c.email.toLowerCase() },
      update: {
        name: c.name,
        password: hashedPassword,
        phone: c.phone,
        profileImage: c.profileImage,
        roleId: customerRoleId,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      create: {
        email: c.email.toLowerCase(),
        name: c.name,
        password: hashedPassword,
        phone: c.phone,
        profileImage: c.profileImage,
        roleId: customerRoleId,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      include: { address: true },
    });

    let addressId = customer?.addressId;
    if (addressId) {
      await prisma.address.update({
        where: { id: addressId },
        data: {
          city: c.city,
          state: c.state,
          country: c.country,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
        },
      });
    } else {
      const address = await prisma.address.create({
        data: {
          city: c.city,
          state: c.state,
          country: c.country,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
        },
      });
      addressId = address.id;
    }

    if (!customer) {
      await prisma.customer.create({
        data: {
          userId: user.id,
          addressId: addressId,
          companyName: c.companyName || null,
          phone: c.phone,
          avatar: c.profileImage,
        },
      });
    } else {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          addressId: addressId,
          companyName: c.companyName || null,
          phone: c.phone,
          avatar: c.profileImage,
        },
      });
    }
  }
  console.log(`Customers verified/seeded: ${customers.length} customers.`);

  // 5. Seed Workers (Profile, Skills, Services, Availability)
  for (const w of workers) {
    const user = await prisma.user.upsert({
      where: { email: w.email.toLowerCase() },
      update: {
        name: w.name,
        password: hashedPassword,
        phone: w.phone,
        profileImage: w.profileImage,
        roleId: workerRoleId,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      create: {
        email: w.email.toLowerCase(),
        name: w.name,
        password: hashedPassword,
        phone: w.phone,
        profileImage: w.profileImage,
        roleId: workerRoleId,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    let worker = await prisma.worker.findUnique({
      where: { userId: user.id },
      include: { address: true },
    });

    let addressId = worker?.addressId;
    if (addressId) {
      await prisma.address.update({
        where: { id: addressId },
        data: {
          city: w.city,
          state: w.state,
          country: w.country,
          address: w.address,
          latitude: w.latitude,
          longitude: w.longitude,
        },
      });
    } else {
      const address = await prisma.address.create({
        data: {
          city: w.city,
          state: w.state,
          country: w.country,
          address: w.address,
          latitude: w.latitude,
          longitude: w.longitude,
        },
      });
      addressId = address.id;
    }

    if (!worker) {
      worker = await prisma.worker.create({
        data: {
          userId: user.id,
          addressId: addressId,
          headline: w.headline,
          bio: w.bio,
          portfolio: w.portfolio,
          isVerified: true,
          hourlyRate: w.hourlyRate,
        },
        include: {
          address: true,
        },
      });
    } else {
      worker = await prisma.worker.update({
        where: { id: worker.id },
        data: {
          addressId: addressId,
          headline: w.headline,
          bio: w.bio,
          portfolio: w.portfolio,
          isVerified: true,
          hourlyRate: w.hourlyRate,
        },
        include: {
          address: true,
        },
      });
    }

    // Worker Skills
    for (const key of w.skillKeys) {
      const skillId = skillMap.get(key);
      if (skillId) {
        await prisma.workerSkill.upsert({
          where: {
            workerId_skillId: {
              workerId: worker.id,
              skillId: skillId,
            },
          },
          update: {},
          create: {
            workerId: worker.id,
            skillId: skillId,
          },
        });
      }
    }

    // Worker Services
    for (const srv of w.services) {
      await prisma.workerService.upsert({
        where: {
          workerId_serviceName: {
            workerId: worker.id,
            serviceName: srv.name,
          },
        },
        update: {
          price: srv.price,
          pricingType: srv.pricingType,
          isActive: true,
          emergencyAvailable: srv.emergencyAvailable,
        },
        create: {
          workerId: worker.id,
          serviceName: srv.name,
          price: srv.price,
          pricingType: srv.pricingType,
          isActive: true,
          emergencyAvailable: srv.emergencyAvailable,
        },
      });
    }

    // Worker Availability (Mon-Sat 09:00 - 18:00)
    for (let day = 1; day <= 6; day++) {
      await prisma.workerAvailability.upsert({
        where: {
          workerId_dayOfWeek: {
            workerId: worker.id,
            dayOfWeek: day,
          },
        },
        update: {
          startTime: "09:00",
          endTime: "18:00",
          isAvailable: true,
        },
        create: {
          workerId: worker.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
          isAvailable: true,
        },
      });
    }
  }
  console.log(`Workers verified/seeded: ${workers.length} workers with skills, services & availability.`);

  // 6. Seed Sample Jobs
  for (const jobData of sampleJobs) {
    const customerUser = await prisma.user.findUnique({
      where: { email: jobData.customerEmail },
      include: { customer: true },
    });

    if (!customerUser || !customerUser.customer) continue;

    const existingJob = await prisma.job.findFirst({
      where: {
        title: jobData.title,
        customerId: customerUser.customer.id,
      },
    });

    if (!existingJob) {
      const jobAddress = await prisma.address.create({
        data: {
          city: jobData.city,
          state: jobData.state,
          country: jobData.country,
          address: jobData.address,
          latitude: jobData.latitude,
          longitude: jobData.longitude,
        },
      });

      const preferredDate = new Date();
      preferredDate.setDate(preferredDate.getDate() + 7);

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 5);

      await prisma.job.create({
        data: {
          title: jobData.title,
          description: jobData.description,
          serviceName: jobData.serviceName,
          customerId: customerUser.customer.id,
          addressId: jobAddress.id,
          minAmount: jobData.minAmount,
          maxAmount: jobData.maxAmount,
          currency: jobData.currency,
          preferredDate,
          preferredStartTime: "10:00",
          preferredEndTime: "17:00",
          applicationDeadline: deadline,
          workerRequirementType: "CUSTOMER_DEFINED",
          requiredWorkers: jobData.requiredWorkers,
          minimumWorkers: jobData.minimumWorkers,
          maximumWorkers: jobData.maximumWorkers,
          skills: jobData.skills,
          status: "OPEN",
        },
      });
    }
  }
  console.log(`Sample Jobs verified/seeded: ${sampleJobs.length} open jobs.`);

  console.log("\n========================================================");
  console.log("SEEDED AUTHENTICATION CREDENTIALS");
  console.log(`Common Password for ALL users: ${COMMON_PASSWORD}`);
  console.log("--------------------------------------------------------");
  console.log("Customer Accounts:");
  customers.forEach((c) => console.log(`  - Email: ${c.email} | Name: ${c.name}`));
  console.log("Worker Accounts:");
  workers.forEach((w) => console.log(`  - Email: ${w.email} | Name: ${w.name} | Role: ${w.headline}`));
  console.log("========================================================\n");
}

main()
  .then(() => {
    console.log("Seeding completed successfully.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  });