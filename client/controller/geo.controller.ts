import { NextRequest } from "next/server";
import { z } from "zod";
import { apiResponse } from "@/lib/apiResponse";
import { status as Status } from "@/constants/statusCodes";
import { getAuthActor } from "@/lib/authActor";
import {
  geoService,
  CoordinateOrigin,
  DistanceUnit,
  Coordinates,
} from "@/services/geo.service";

const nearbyWorkersQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().default(25),
  unit: z.enum(["km", "miles", "m"]).default("km"),
  q: z.string().optional(),
  skill: z.string().optional(),
  service: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minHourlyRate: z.coerce.number().min(0).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),
  isVerified: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  city: z.string().optional(),
  sortBy: z.enum(["distance", "price_low", "price_high", "rating", "recent"]).default("distance"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  addressId: z.string().optional(),
  userId: z.string().optional(),
});

const nearbyJobsQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().default(25),
  unit: z.enum(["km", "miles", "m"]).default("km"),
  q: z.string().optional(),
  serviceName: z.string().optional(),
  service: z.string().optional(),
  skill: z.string().optional(),
  status: z.string().default("OPEN"),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
  preferredDate: z.string().optional(),
  sortBy: z.enum(["distance", "budget_high", "budget_low", "recent"]).default("distance"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  addressId: z.string().optional(),
  userId: z.string().optional(),
});

export const geoController = {
  /**
   * @swagger
   * /api/workers/nearby:
   *   get:
   *     tags: [Geo, Workers]
   *     summary: Find workers within a geographic radius
   *     description: Returns verified workers located within the specified radius (in km/miles) from coordinates or user profile address.
   *     parameters:
   *       - in: query
   *         name: latitude
   *         schema:
   *           type: number
   *         description: Origin latitude (or lat)
   *       - in: query
   *         name: longitude
   *         schema:
   *           type: number
   *         description: Origin longitude (or lng)
   *       - in: query
   *         name: radius
   *         schema:
   *           type: number
   *           default: 25
   *         description: Search radius (default 25 km)
   *       - in: query
   *         name: unit
   *         schema:
   *           type: string
   *           enum: [km, miles, m]
   *           default: km
   *         description: Distance unit
   *       - in: query
   *         name: skill
   *         schema:
   *           type: string
   *         description: Filter by skill
   *       - in: query
   *         name: service
   *         schema:
   *           type: string
   *         description: Filter by service category
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [distance, price_low, price_high, rating, recent]
   *           default: distance
   *     responses:
   *       200:
   *         description: List of nearby workers with calculated distance
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async findNearbyWorkers(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const rawParams = Object.fromEntries(searchParams.entries());

      const parseResult = nearbyWorkersQuerySchema.safeParse(rawParams);
      if (!parseResult.success) {
        return apiResponse.badRequest(parseResult.error.issues[0].message);
      }

      const params = parseResult.data;
      const actor = await getAuthActor(request);

      // Determine origin coordinate
      let origin: CoordinateOrigin | null = null;
      const lat = params.latitude ?? params.lat;
      const lng = params.longitude ?? params.lng;

      if (lat != null && lng != null) {
        origin = { latitude: lat, longitude: lng };
      } else if (params.addressId) {
        origin = { addressId: params.addressId };
      } else if (params.userId) {
        origin = { userId: params.userId };
      } else if (actor) {
        if (actor.customer?.addressId) {
          origin = { addressId: actor.customer.addressId };
        } else if (actor.worker?.addressId) {
          origin = { addressId: actor.worker.addressId };
        } else {
          origin = { userId: actor.userId };
        }
      }

      if (!origin) {
        return apiResponse.badRequest(
          "Origin coordinates required. Provide 'latitude' & 'longitude', or 'addressId', or sign in with a profile address."
        );
      }

      const result = await geoService.findNearbyWorkers({
        origin,
        radius: params.radius,
        unit: params.unit as DistanceUnit,
        query: params.q,
        skill: params.skill,
        service: params.service,
        minRating: params.minRating,
        minHourlyRate: params.minHourlyRate,
        maxHourlyRate: params.maxHourlyRate,
        isVerified: params.isVerified,
        city: params.city,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: params.page,
        limit: params.limit,
      });

      return apiResponse.success(
        {
          workers: result.data,
          meta: result.meta,
          origin: result.origin,
          radius: result.radius,
          unit: result.unit,
        },
        Status.OK
      );
    } catch (error) {
      console.error("Error finding nearby workers:", error);
      const message = error instanceof Error ? error.message : "Failed to find nearby workers";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/jobs/nearby:
   *   get:
   *     tags: [Geo, Jobs]
   *     summary: Find jobs within a geographic radius
   *     description: Returns open jobs located within the specified radius (in km/miles) from coordinates or worker profile address.
   *     parameters:
   *       - in: query
   *         name: latitude
   *         schema:
   *           type: number
   *         description: Origin latitude (or lat)
   *       - in: query
   *         name: longitude
   *         schema:
   *           type: number
   *         description: Origin longitude (or lng)
   *       - in: query
   *         name: radius
   *         schema:
   *           type: number
   *           default: 25
   *         description: Search radius (default 25 km)
   *       - in: query
   *         name: unit
   *         schema:
   *           type: string
   *           enum: [km, miles, m]
   *           default: km
   *         description: Distance unit
   *       - in: query
   *         name: skill
   *         schema:
   *           type: string
   *         description: Filter by skill
   *       - in: query
   *         name: service
   *         schema:
   *           type: string
   *         description: Filter by service category name
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [distance, budget_high, budget_low, recent]
   *           default: distance
   *     responses:
   *       200:
   *         description: List of nearby jobs with calculated distance
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async findNearbyJobs(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const rawParams = Object.fromEntries(searchParams.entries());

      const parseResult = nearbyJobsQuerySchema.safeParse(rawParams);
      if (!parseResult.success) {
        return apiResponse.badRequest(parseResult.error.issues[0].message);
      }

      const params = parseResult.data;
      const actor = await getAuthActor(request);

      let origin: CoordinateOrigin | null = null;
      const lat = params.latitude ?? params.lat;
      const lng = params.longitude ?? params.lng;

      if (lat != null && lng != null) {
        origin = { latitude: lat, longitude: lng };
      } else if (params.addressId) {
        origin = { addressId: params.addressId };
      } else if (params.userId) {
        origin = { userId: params.userId };
      } else if (actor) {
        if (actor.worker?.addressId) {
          origin = { addressId: actor.worker.addressId };
        } else if (actor.customer?.addressId) {
          origin = { addressId: actor.customer.addressId };
        } else {
          origin = { userId: actor.userId };
        }
      }

      if (!origin) {
        return apiResponse.badRequest(
          "Origin coordinates required. Provide 'latitude' & 'longitude', or 'addressId', or sign in with a profile address."
        );
      }

      const result = await geoService.findNearbyJobs({
        origin,
        radius: params.radius,
        unit: params.unit as DistanceUnit,
        query: params.q,
        serviceName: params.serviceName || params.service,
        skill: params.skill,
        status: params.status,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        preferredDate: params.preferredDate,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: params.page,
        limit: params.limit,
      });

      return apiResponse.success(
        {
          jobs: result.data,
          meta: result.meta,
          origin: result.origin,
          radius: result.radius,
          unit: result.unit,
        },
        Status.OK
      );
    } catch (error) {
      console.error("Error finding nearby jobs:", error);
      const message = error instanceof Error ? error.message : "Failed to find nearby jobs";
      return apiResponse.badRequest(message);
    }
  },

  /**
   * @swagger
   * /api/geo/distance:
   *   post:
   *     tags: [Geo]
   *     summary: Calculate distance between two coordinates or entities
   *     description: Calculates Haversine distance and radius containment between two locations.
   */
  async calculateDistance(request: NextRequest) {
    try {
      const body = await request.json();

      const schema = z.object({
        from: z.object({
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
          addressId: z.string().optional(),
          userId: z.string().optional(),
        }),
        to: z.object({
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
          addressId: z.string().optional(),
          userId: z.string().optional(),
          workerId: z.string().optional(),
          jobId: z.string().optional(),
        }),
        unit: z.enum(["km", "miles", "m"]).default("km"),
        radiusCheck: z.number().positive().optional(),
      });

      const parseResult = schema.safeParse(body);
      if (!parseResult.success) {
        return apiResponse.badRequest(parseResult.error.issues[0].message);
      }

      const { from, to, unit, radiusCheck } = parseResult.data;

      // Resolve from coordinates
      let fromCoords: Coordinates | null = null;
      if (from.latitude != null && from.longitude != null) {
        fromCoords = { latitude: from.latitude, longitude: from.longitude };
      } else {
        fromCoords = await geoService.resolveCoordinates(from);
      }

      // Resolve to coordinates
      let toCoords: Coordinates | null = null;
      if (to.latitude != null && to.longitude != null) {
        toCoords = { latitude: to.latitude, longitude: to.longitude };
      } else if (to.jobId) {
        const jobDistance = await geoService.getDistanceToJob(fromCoords || from, to.jobId, unit);
        if (jobDistance) {
          return apiResponse.success({
            distance: jobDistance.distance,
            unit: jobDistance.unit,
            formattedDistance: jobDistance.formattedDistance,
            isWithinRadius: radiusCheck != null ? jobDistance.distance <= radiusCheck : undefined,
          });
        }
      } else {
        toCoords = await geoService.resolveCoordinates(to);
      }

      if (!fromCoords || !toCoords) {
        return apiResponse.badRequest("Could not resolve coordinates for both origin and destination");
      }

      const distance = geoService.calculateDistance(fromCoords, toCoords, unit);
      const isWithin = radiusCheck != null ? distance <= radiusCheck : undefined;

      return apiResponse.success({
        distance,
        unit,
        formattedDistance: geoService.formatDistance(distance, unit),
        from: fromCoords,
        to: toCoords,
        ...(isWithin !== undefined ? { isWithinRadius: isWithin, radiusChecked: radiusCheck } : {}),
      });
    } catch (error) {
      console.error("Error calculating distance:", error);
      const message = error instanceof Error ? error.message : "Failed to calculate distance";
      return apiResponse.badRequest(message);
    }
  },
};
