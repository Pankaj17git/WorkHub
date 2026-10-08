import { prisma } from "@/lib/prisma";

export const skillController = {
    async getAllSkill() {
        try {
            const skillList = await prisma.skill.findMany({
                select: {
                  id: true,
                  name: true,
                  key: true,
                  isCustom: true,
                },
                orderBy: {
                  name: "asc",
                },
            });
            return {
              success: true,
              data: skillList.map((s) => ({
                id: s.id.toString(),
                name: s.name,
                key: s.key,
                isCustom: s.isCustom,
              })),
            };
        } catch (error) {
            console.log(error);
            return { success: false, error };
        }
    },

    async createCustomSkill(name: string, userId?: bigint | null) {
      try {
        const trimmed = name.trim();
        if (!trimmed) {
          return { success: false, error: "Skill name is required" };
        }

        // Check if skill already exists
        const existing = await prisma.skill.findFirst({
          where: {
            OR: [
              { name: { equals: trimmed } },
              { key: { equals: trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_") } },
            ],
          },
        });

        if (existing) {
          return {
            success: true,
            data: {
              id: existing.id.toString(),
              name: existing.name,
              key: existing.key,
              isCustom: existing.isCustom,
            },
          };
        }

        const baseKey = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 80);
        const uniqueKey = `${baseKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        const created = await prisma.skill.create({
          data: {
            name: trimmed,
            key: uniqueKey,
            isCustom: true,
            createdBy: userId ?? null,
          },
        });

        return {
          success: true,
          data: {
            id: created.id.toString(),
            name: created.name,
            key: created.key,
            isCustom: created.isCustom,
          },
        };
      } catch (error) {
        console.error("Create custom skill error:", error);
        return { success: false, error: "Failed to create skill" };
      }
    },
};