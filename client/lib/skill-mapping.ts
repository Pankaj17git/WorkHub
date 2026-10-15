/**
 * Skill-Service Mapping Utility
 *
 * This module provides a single source of truth for mapping between:
 * - Service categories (used in job forms, UI labels): "Plumbing", "Electrician", "Carpentry"
 * - Skill keys (used in the database `skills` table): "plumber", "pipe_fitter", "carpenter"
 * - Skill names (human-readable from `skills` table): "Plumber", "Pipe Fitter", "Carpenter"
 *
 * It ensures that when a job requires "Plumbing", a worker with skill key "plumber" is matched.
 */

/**
 * Maps a service category (or common skill label) to all related skill keys from the `skills` table.
 * Keys must match the `key` column in the `skills` table exactly.
 */
export const SERVICE_TO_SKILL_KEYS: Record<string, string[]> = {
  // Electrical
  electrician: ["electrician", "electrical_helper", "solar_panel_installer", "inverter_technician"],
  "electrical repair": ["electrician", "electrical_helper"],
  "wiring & earthing": ["electrician", "electrical_helper"],

  // Plumbing
  plumbing: ["plumber", "pipe_fitter", "sanitary_worker"],
  plumber: ["plumber", "pipe_fitter", "sanitary_worker"],

  // Carpentry
  carpentry: ["carpenter", "furniture_carpenter", "modular_furniture_worker", "wood_polisher"],
  carpenter: ["carpenter", "furniture_carpenter", "modular_furniture_worker", "wood_polisher"],

  // AC & HVAC
  "ac repair": ["ac_technician", "hvac_technician"],
  "ac installation & repair": ["ac_technician", "hvac_technician"],
  "ac technician": ["ac_technician", "hvac_technician"],

  // Painting
  painting: ["painter", "wall_painter", "texture_painter", "interior_painter"],
  painter: ["painter", "wall_painter", "texture_painter", "interior_painter"],

  // Appliance Repair
  "appliance fix": ["appliance_repair_worker", "refrigerator_technician", "washing_machine_technician"],
  "appliance repair": ["appliance_repair_worker", "refrigerator_technician", "washing_machine_technician"],

  // Masonry
  masonry: ["mason", "tile_worker", "stone_worker", "flooring_worker"],
  mason: ["mason", "tile_worker", "stone_worker", "flooring_worker"],

  // Cleaning
  "deep cleaning": ["deep_cleaning_worker", "house_cleaner", "office_cleaner", "cleaner"],
  cleaning: ["cleaner", "house_cleaner", "office_cleaner", "deep_cleaning_worker"],

  // Tile Fitting
  "tile fitting": ["tile_worker", "flooring_worker", "mason"],

  // Welding
  welding: ["welder", "fabricator", "metal_worker", "steel_fabricator", "aluminium_worker"],
  welder: ["welder", "fabricator", "metal_worker"],

  // Waterproofing
  waterproofing: ["waterproofing_worker"],

  // Pest Control
  "pest control": ["pest_control_worker"],

  // Gardening & Landscaping
  gardening: ["gardener", "landscaping_worker"],
  landscaping: ["gardener", "landscaping_worker"],

  // Domestic
  cooking: ["cook", "chef"],
  "house help": ["house_help", "caretaker"],
  babysitting: ["babysitter"],
  "elderly care": ["elderly_care_worker", "caretaker"],

  // Security
  security: ["security_guard", "watchman", "security_supervisor"],

  // Driving & Delivery
  driving: ["driver", "car_driver", "truck_driver"],
  delivery: ["delivery_driver", "delivery_worker"],

  // Beauty & Personal Care
  barber: ["barber", "hair_stylist"],
  beauty: ["beautician", "makeup_artist", "mehndi_artist"],

  // Tailoring
  tailoring: ["tailor", "sewing_machine_operator", "embroidery_worker", "clothing_alteration_worker"],

  // Glass, Doors & Windows
  "glass work": ["glass_worker", "glass_installer"],
  "door installation": ["door_installer"],
  "window installation": ["window_installer"],

  // General Labour
  labour: ["general_labourer", "loading_worker", "unloading_worker", "warehouse_worker", "helper"],
  helper: ["helper", "general_labourer"],
};

/**
 * Reverse mapping: skill key → list of service categories it belongs to.
 * Auto-generated from SERVICE_TO_SKILL_KEYS.
 */
export const SKILL_KEY_TO_SERVICES: Record<string, string[]> = {};

for (const [service, skillKeys] of Object.entries(SERVICE_TO_SKILL_KEYS)) {
  for (const key of skillKeys) {
    if (!SKILL_KEY_TO_SERVICES[key]) {
      SKILL_KEY_TO_SERVICES[key] = [];
    }
    if (!SKILL_KEY_TO_SERVICES[key].includes(service)) {
      SKILL_KEY_TO_SERVICES[key].push(service);
    }
  }
}

/**
 * Given a required skill/service name (e.g. "Plumbing", "Electrician"),
 * returns all matching skill keys from the database.
 * Falls back to treating the input itself as a skill key if no mapping found.
 */
export function getRelatedSkillKeys(serviceOrSkill: string): string[] {
  const normalized = serviceOrSkill.toLowerCase().trim();
  return SERVICE_TO_SKILL_KEYS[normalized] || [normalized];
}

/**
 * Checks if a worker's skill keys match any of the required skills/services.
 *
 * @param workerSkillKeys - Array of skill keys the worker has (from `skills.key`)
 * @param workerSkillNames - Array of skill names the worker has (from `skills.name`)
 * @param requiredSkills - Array of required skill labels (could be service categories OR skill keys)
 * @returns true if the worker has at least one matching skill
 */
export function hasMatchingSkills(
  workerSkillKeys: string[],
  workerSkillNames: string[],
  requiredSkills: string[]
): boolean {
  const normalizedWorkerKeys = workerSkillKeys.map((k) => k.toLowerCase().trim());
  const normalizedWorkerNames = workerSkillNames.map((n) => n.toLowerCase().trim());

  for (const required of requiredSkills) {
    const normalized = required.toLowerCase().trim();

    // 1. Direct match on worker skill key
    if (normalizedWorkerKeys.includes(normalized)) {
      return true;
    }

    // 2. Direct match on worker skill name
    if (normalizedWorkerNames.includes(normalized)) {
      return true;
    }

    // 3. Expand the required skill via mapping and check against worker keys
    const relatedKeys = getRelatedSkillKeys(normalized);
    for (const relatedKey of relatedKeys) {
      if (normalizedWorkerKeys.includes(relatedKey)) {
        return true;
      }
    }

    // 4. Reverse check: see if any of the worker's skill keys map to the required service
    for (const workerKey of normalizedWorkerKeys) {
      const workerServices = SKILL_KEY_TO_SERVICES[workerKey] || [];
      if (workerServices.includes(normalized)) {
        return true;
      }
    }
  }

  return false;
}
