import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { status } from "@/constants/statusCodes";
import { authMiddleware } from "@/middleware/auth.middleware";
import { uploadService } from "@/services/upload.service";
import { extractKeyFromUrl, generateKey } from "@/utils/file.upload";
import { validateFile } from "@/middleware/validateUpload.middleware";


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
          worker: { include: { address: true, skills: true } },
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
                  headline: user.worker.headline,
                  bio: user.worker.bio,
                  portfolio: user.worker.portfolio,
                  skills: user.worker.skills.map((s) => ({ id: s.id.toString(), name: s.name })),
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
      let newProfileImageUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("profileImage") as File | null;
        const nameVal = formData.get("name") as string | null;
        const phoneVal = formData.get("phone") as string | null;
        const companyVal = formData.get("companyName") as string | null;
        const headlineVal = formData.get("headline") as string | null;
        const bioVal = formData.get("bio") as string | null;

        if (nameVal !== null) name = nameVal;
        if (phoneVal !== null) phone = phoneVal;
        if (companyVal !== null) companyName = companyVal;
        if (headlineVal !== null) headline = headlineVal;
        if (bioVal !== null) bio = bioVal;

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
        if (body.profileImage) {
          newProfileImageUrl = body.profileImage;
        }
      }

      const userUpdateData: { name?: string; phone?: string; profileImage?: string } = {};
      if (name !== undefined) userUpdateData.name = name;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (newProfileImageUrl !== undefined) userUpdateData.profileImage = newProfileImageUrl;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
        include: { roleRef: true },
      });

      // Update customer specific fields if provided
      if (companyName !== undefined && existingUser.customer) {
        await prisma.customer.update({
          where: { id: existingUser.customer.id },
          data: { companyName },
        });
      }

      // Update worker specific fields if provided
      if ((headline !== undefined || bio !== undefined) && existingUser.worker) {
        await prisma.worker.update({
          where: { id: existingUser.worker.id },
          data: {
            ...(headline !== undefined && { headline }),
            ...(bio !== undefined && { bio }),
          },
        });
      }

      // Delete old profile image on Cloudinary if replaced
      if (newProfileImageUrl && existingUser.profileImage && existingUser.profileImage !== newProfileImageUrl) {
        const key = extractKeyFromUrl(existingUser.profileImage);
        uploadService.deleteFileOnCloudinary(`users/profile/${key}`).catch((err) => {
          console.error("Failed to delete previous profile image:", err);
        });
      }

      return NextResponse.json(
        {
          user: {
            id: updatedUser.id.toString(),
            email: updatedUser.email,
            name: updatedUser.name,
            phone: updatedUser.phone,
            profileImage: updatedUser.profileImage,
            role: updatedUser.roleRef?.type || "CUSTOMER",
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