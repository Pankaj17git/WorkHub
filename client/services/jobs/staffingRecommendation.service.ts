import { timeToMinutes } from "../worker/availability.service";

export interface RecommendationInput {
  serviceName?: string;
  skills?: string[];
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface RecommendationResult {
  recommendedWorkers: number;
  reason: string;
}

export const StaffingRecommendationService = {
  /**
   * Rule-based staffing recommendation engine
   */
  recommendStaffing(input: RecommendationInput): RecommendationResult {
    let durationHours = 2; // Default baseline
    if (input.startTime && input.endTime) {
      const startMins = timeToMinutes(input.startTime);
      const endMins = timeToMinutes(input.endTime);
      if (endMins > startMins) {
        durationHours = (endMins - startMins) / 60;
      }
    }

    const text = `${input.serviceName || ""} ${input.description || ""} ${(input.skills || []).join(" ")}`.toLowerCase();

    // Rule 1: Large moving, heavy logistics or full-house shifting
    if (
      text.includes("office") ||
      text.includes("house shift") ||
      text.includes("furniture move") ||
      text.includes("heavy lifting") ||
      text.includes("warehouse")
    ) {
      if (durationHours >= 4) {
        return {
          recommendedWorkers: 4,
          reason: "Heavy logistics/shifting with long duration requires a 4-person team for safe handling.",
        };
      }
      return {
        recommendedWorkers: 3,
        reason: "Moving/heavy lifting requires at least 3 workers for ergonomic and swift execution.",
      };
    }

    // Rule 2: Multi-room painting, deep cleaning, civil/masonry work
    if (
      text.includes("full house") ||
      text.includes("multi room") ||
      text.includes("deep clean") ||
      text.includes("construction") ||
      text.includes("masonry") ||
      text.includes("renovation")
    ) {
      return {
        recommendedWorkers: 2,
        reason: "Comprehensive multi-area renovation or deep cleaning recommends a 2-person crew.",
      };
    }

    // Rule 3: Extensive multi-skill requirement
    if (input.skills && input.skills.length >= 4 && durationHours >= 3) {
      return {
        recommendedWorkers: 2,
        reason: "Broad scope with multiple specialized skills and extended duration recommends 2 workers.",
      };
    }

    // Default baseline
    return {
      recommendedWorkers: 1,
      reason: "Standard single-worker task based on scope and duration.",
    };
  },
};
