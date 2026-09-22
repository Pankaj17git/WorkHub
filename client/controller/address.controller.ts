import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authMiddleware } from "@/middleware/auth.middleware";
import { status as Status } from "@/constants/statusCodes";
import { apiResponse } from "@/lib/apiResponse";
import { addressService } from "@/services/address.service";

const addAddressSchema = z.object({
  address: z.string({ error: "Address line is required" }).min(1, "Address line is required"),
  city: z.string({ error: "City is required" }).min(1, "City is required"),
  state: z.string({ error: "State is required" }).min(1, "State is required"),
  country: z.string({ error: "Country is required" }).min(1, "Country is required"),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const addressController = {
  /**
   * @swagger
   * /api/address:
   *   post:
   *     tags: [Address]
   *     summary: Add or update address
   *     description: Creates or updates an address record and connects it to the user profile.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AddAddressRequest'
   *     responses:
   *       201:
   *         description: Address added successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AddAddressResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async addAddress(request: NextRequest) {
    try {
      const userId = authMiddleware(request);
      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }

      const body = await request.json();
      const result = addAddressSchema.safeParse(body);

      if (!result.success) {
        return apiResponse.badRequest(result.error.issues[0].message);
      }

      const { address, city, state, country, latitude, longitude } = result.data;
      const userIdBigInt = BigInt(userId);

      const user = await prisma.user.findUnique({
        where: { id: userIdBigInt },
        include: { customer: true, worker: true },
      });

      if (!user) {
        return apiResponse.notFound("User not found");
      }

      const existingAddressId = user.customer?.addressId || user.worker?.addressId;
      let addressRecord;

      if (existingAddressId) {
        // Update existing address
        addressRecord = await addressService.updateAddress(existingAddressId.toString(), {
          address,
          city,
          state,
          country,
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
        });
      } else {
        // Create new address record
        addressRecord = await addressService.createAddress({
          address,
          city,
          state,
          country,
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
        });

        // Link address to user's profile (Customer or Worker)
        if (user.customer) {
          await prisma.customer.update({
            where: { id: user.customer.id },
            data: { addressId: addressRecord.id },
          });
        } else if (user.worker) {
          await prisma.worker.update({
            where: { id: user.worker.id },
            data: { addressId: addressRecord.id },
          });
        } else {
          // Create default customer profile linked to this address
          await prisma.customer.create({
            data: {
              userId: userIdBigInt,
              addressId: addressRecord.id,
            },
          });
        }
      }

      const formattedAddress = {
        id: addressRecord.id.toString(),
        address: addressRecord.address,
        city: addressRecord.city,
        state: addressRecord.state,
        country: addressRecord.country,
        latitude: addressRecord.latitude ? Number(addressRecord.latitude) : null,
        longitude: addressRecord.longitude ? Number(addressRecord.longitude) : null,
        createdAt: addressRecord.createdAt,
        updatedAt: addressRecord.updatedAt,
      };

      return apiResponse.success({ address: formattedAddress }, Status.CREATED, "Address saved successfully");
    } catch (error: unknown) {
      console.error("Error adding address:", error);
       return apiResponse.internalError("Failed to add address");
    }
  },

  /**
   * @swagger
   * /api/address:
   *   get:
   *     tags: [Address]
   *     summary: Get authenticated user address
   *     description: Fetches the currently linked address for the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Address fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GetAddressResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getAddress(request: NextRequest) {
    try {
      const userId = authMiddleware(request);
      if (!userId || typeof userId === "object") {
        return apiResponse.unauthorized();
      }

      const userIdBigInt = BigInt(userId);

      const user = await prisma.user.findUnique({
        where: { id: userIdBigInt },
        include: {
          customer: { include: { address: true } },
          worker: { include: { address: true } },
        },
      });

      if (!user) {
        return apiResponse.notFound("User not found");
      }

      const addressData = user.customer?.address || user.worker?.address || null;

      if (!addressData) {
        return apiResponse.success({ address: null });
      }

      const formattedAddress = {
        id: addressData.id.toString(),
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        latitude: addressData.latitude ? Number(addressData.latitude) : null,
        longitude: addressData.longitude ? Number(addressData.longitude) : null,
        createdAt: addressData.createdAt,
        updatedAt: addressData.updatedAt,
      };

      return apiResponse.success({ address: formattedAddress });
    } catch (error: unknown) {
      console.error("Error fetching address:", error);
      return apiResponse.internalError("Failed to fetch address");
    }
  },
};
