import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { status } from "@/constants/statusCodes";
import { authMiddleware } from "@/middleware/auth.middleware";
import { uploadService } from "@/services/upload.service";
import { extractKeyFromUrl, generateKey } from "@/utils/file.upload";
import { validateFile } from "@/middleware/validateUpload.middleware";
import { skill } from "@/types";


export const userController = {
  /**
   * @swagger
   * /api/user/update-profile:
   *   patch:
   *     tags: [User]
   *     summary: Update user profile image
   *     description: Uploads a new profile image for the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [profileImage]
   *             properties:
   *               profileImage:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UpdateProfileResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  /**
   * @swagger
   * /api/user/profile:
   *   get:
   *     tags: [User]
   *     summary: Get user profile
   *     description: Fetches the authenticated user profile along with role details and address.
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Profile fetched successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async getProfile(req: NextRequest) {
    try {
      const userId = authMiddleware(req);
      if (userId === null) {
        return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roleRef: true,
          customer: { include: { address: true } },
          worker: {
            include: {
              address: true,
              skills: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.deletedAt !== null) {
        return NextResponse.json({ error: "User not found" }, { status: status.NOT_FOUND });
      }

      const rawAddress = user.customer?.address || user.worker?.address || null;
      const address = rawAddress
        ? {
            id: rawAddress.id.toString(),
            address: rawAddress.address,
            city: rawAddress.city,
            state: rawAddress.state,
            country: rawAddress.country,
            latitude: rawAddress.latitude ? Number(rawAddress.latitude) : null,
            longitude: rawAddress.longitude ? Number(rawAddress.longitude) : null,
          }
        : null;

      return NextResponse.json(
        {
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            profileImage: user.profileImage,
            role: user.roleRef?.type || "CUSTOMER",
            status: user.status,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
            address,
            customer: user.customer
              ? {
                  companyName: user.customer.companyName,
                  phone: user.customer.phone,
                  avatar: user.customer.avatar,
                }
              : null,
            worker: user.worker
              ? {
                  id: user.worker.id.toString(),
                  headline: user.worker.headline,
                  bio: user.worker.bio,
                  portfolio: user.worker.portfolio,
                  hourlyRate: user.worker.hourlyRate ? Number(user.worker.hourlyRate) : null,
                  isVerified: user.worker.isVerified,
                  skills: user.worker.skills.map((s) => ({
                    id: s.skillId.toString(),
                    name: s.skill.name,
                    key: s.skill.key,
                  })),
                }
              : null,
          },
        },
        { status: status.OK }
      );
    } catch (error: unknown) {
      console.error("Get profile failed:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },

  /**
   * @swagger
   * /api/user/update-profile:
   *   patch:
   *     tags: [User]
   *     summary: Update user profile
   *     description: Updates personal details and/or uploads a new profile image.
   *     security:
   *       - BearerAuth: []
   */
  async updateProfile(req: NextRequest) {
    try {
      const userId = authMiddleware(req);

      if (userId === null) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: status.UNAUTHORIZED }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { roleRef: true, customer: true, worker: true },
      });
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: status.NOT_FOUND });
      }

      const contentType = req.headers.get("content-type") || "";
      let name: string | undefined;
      let phone: string | undefined;
      let companyName: string | undefined;
      let headline: string | undefined;
      let bio: string | undefined;
      let portfolio: string | undefined;
      let hourlyRate: number | null | undefined;
      let skills: skill[] | undefined;
      let newProfileImageUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        console.log("inside multipart/form-data")
        const formData = await req.formData();
        const file = formData.get("profileImage") as File | null;
        const nameVal = formData.get("name") as string | null;
        const phoneVal = formData.get("phone") as string | null;
        const companyVal = formData.get("companyName") as string | null;
        const headlineVal = formData.get("headline") as string | null;
        const bioVal = formData.get("bio") as string | null;
        const portfolioVal = formData.get("portfolio") as string | null;
        const hourlyRateVal = formData.get("hourlyRate") as string | null;
        const skillsVal = formData.get("skills") as string | null;

        if (nameVal !== null) name = nameVal;
        if (phoneVal !== null) phone = phoneVal;
        if (companyVal !== null) companyName = companyVal;
        if (headlineVal !== null) headline = headlineVal;
        if (bioVal !== null) bio = bioVal;
        if (portfolioVal !== null) portfolio = portfolioVal;
        if (hourlyRateVal !== null) {
          hourlyRate = hourlyRateVal === "" ? null : Number(hourlyRateVal);
        }
        if (skillsVal !== null) {
          try {
            skills = JSON.parse(skillsVal);
          } catch {
            skills = [];
          }
        }

        if (file && typeof file === "object" && file.size > 0) {
          validateFile(file);
          const key = generateKey();
          const buffer = Buffer.from(await file.arrayBuffer());

          const record = await uploadService.uploadToCloudinary(buffer, {
            public_id: key,
            folder: `users/profile`,
          });

          if (!record) {
            return NextResponse.json({ error: "File upload failed" }, { status: status.INTERNAL_SERVER_ERROR });
          }
          newProfileImageUrl = record.url;
        }
      } else {
        const body = await req.json();
        name = body.name;
        phone = body.phone;
        companyName = body.companyName;
        headline = body.headline;
        bio = body.bio;
        portfolio = body.portfolio;
        if (body.hourlyRate !== undefined) {
          hourlyRate = body.hourlyRate === "" || body.hourlyRate === null ? null : Number(body.hourlyRate);
        }
        if (body.skills !== undefined) {
          skills = Array.isArray(body.skills) ? body.skills : [];
        }
        if (body.profileImage) {
          newProfileImageUrl = body.profileImage;
        }
      }

      const userUpdateData: { name?: string; phone?: string; profileImage?: string } = {};
      if (name !== undefined) userUpdateData.name = name;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (newProfileImageUrl !== undefined) userUpdateData.profileImage = newProfileImageUrl;

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // Update customer specific fields if provided
      if (companyName !== undefined && existingUser.customer) {
        await prisma.customer.update({
          where: { id: existingUser.customer.id },
          data: { companyName },
        });
      }

      // Update worker specific fields if provided
      if (existingUser.roleRef?.type === "WORKER" || existingUser.worker) {
        let workerId = existingUser.worker?.id;
        if (!workerId) {
          const newWorker = await prisma.worker.create({
            data: { userId },
          });
          workerId = newWorker.id;
        }

        const workerUpdateData: {
          headline?: string;
          bio?: string;
          portfolio?: string | null;
          hourlyRate?: number | null;
        } = {};

        if (headline !== undefined) workerUpdateData.headline = headline;
        if (bio !== undefined) workerUpdateData.bio = bio;
        if (portfolio !== undefined) workerUpdateData.portfolio = portfolio || null;
        if (hourlyRate !== undefined) workerUpdateData.hourlyRate = hourlyRate;

        if (Object.keys(workerUpdateData).length > 0) {
          await prisma.worker.update({
            where: { id: workerId },
            data: workerUpdateData,
          });
        }

        // Sync skills if provided
        if (skills !== undefined && Array.isArray(skills)) {
          const skillIdentifiers: string[] = skills
            .map((s) => (typeof s === "string" ? s : (s.name || s.id || "")))
            .filter(Boolean);

          const skillIds: bigint[] = [];
          for (const identifier of skillIdentifiers) {
            let foundSkill = null;
            if (/^\d+$/.test(identifier)) {
              foundSkill = await prisma.skill.findUnique({
                where: { id: BigInt(identifier) },
              });
            }
            if (!foundSkill) {
              foundSkill = await prisma.skill.findFirst({
                where: {
                  OR: [
                    { name: { equals: identifier } },
                    { key: { equals: identifier.toLowerCase().replace(/[^a-z0-9]/g, "_") } },
                  ],
                },
              });
            }
            if (!foundSkill) {
              const baseKey = identifier.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 80);
              const uniqueKey = `${baseKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              foundSkill = await prisma.skill.create({
                data: {
                  name: identifier,
                  key: uniqueKey,
                  isCustom: true,
                  createdBy: userId,
                },
              });
            }
            if (foundSkill && !skillIds.some((id) => id === foundSkill.id)) {
              skillIds.push(foundSkill.id);
            }
          }

          // Delete existing worker skills
          await prisma.workerSkill.deleteMany({
            where: { workerId },
          });

          // Insert updated worker skills
          if (skillIds.length > 0) {
            await prisma.workerSkill.createMany({
              data: skillIds.map((sId) => ({
                workerId,
                skillId: sId,
              })),
            });
          }
        }
      }

      // Delete old profile image on Cloudinary if replaced
      if (newProfileImageUrl && existingUser.profileImage && existingUser.profileImage !== newProfileImageUrl) {
        const key = extractKeyFromUrl(existingUser.profileImage);
        uploadService.deleteFileOnCloudinary(`users/profile/${key}`).catch((err) => {
          console.error("Failed to delete previous profile image:", err);
        });
      }

      // Fetch refreshed user record
      const refreshedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roleRef: true,
          customer: { include: { address: true } },
          worker: {
            include: {
              address: true,
              skills: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!refreshedUser) {
        return NextResponse.json({ error: "User not found" }, { status: status.NOT_FOUND });
      }

      const rawAddress = refreshedUser.customer?.address || refreshedUser.worker?.address || null;
      const address = rawAddress
        ? {
            id: rawAddress.id.toString(),
            address: rawAddress.address,
            city: rawAddress.city,
            state: rawAddress.state,
            country: rawAddress.country,
            latitude: rawAddress.latitude ? Number(rawAddress.latitude) : null,
            longitude: rawAddress.longitude ? Number(rawAddress.longitude) : null,
          }
        : null;

      return NextResponse.json(
        {
          user: {
            id: refreshedUser.id.toString(),
            email: refreshedUser.email,
            name: refreshedUser.name,
            phone: refreshedUser.phone,
            profileImage: refreshedUser.profileImage,
            role: refreshedUser.roleRef?.type || "CUSTOMER",
            status: refreshedUser.status,
            emailVerifiedAt: refreshedUser.emailVerifiedAt,
            createdAt: refreshedUser.createdAt,
            address,
            customer: refreshedUser.customer
              ? {
                  companyName: refreshedUser.customer.companyName,
                  phone: refreshedUser.customer.phone,
                  avatar: refreshedUser.customer.avatar,
                }
              : null,
            worker: refreshedUser.worker
              ? {
                  id: refreshedUser.worker.id.toString(),
                  headline: refreshedUser.worker.headline,
                  bio: refreshedUser.worker.bio,
                  portfolio: refreshedUser.worker.portfolio,
                  hourlyRate: refreshedUser.worker.hourlyRate ? Number(refreshedUser.worker.hourlyRate) : null,
                  isVerified: refreshedUser.worker.isVerified,
                  skills: refreshedUser.worker.skills.map((s) => ({
                    id: s.skillId.toString(),
                    name: s.skill.name,
                    key: s.skill.key,
                  })),
                }
              : null,
          },
        },
        { status: status.OK }
      );
    } catch (error: unknown) {
      console.error("Profile update failed:", error);
      return NextResponse.json(
        { error: "Profile update failed" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },
};