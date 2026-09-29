import { prisma } from "@/lib/prisma";

export const skillController = {

    async getAllSkill() {
        try {
            const skillList = await prisma.skill.findMany({
                select: {
                  id: true,
                  name: true,
                  key: true,
                }
            })
            return { success: true, data: skillList }
        } catch (error) {
            console.log(error);
            return { success: false, error }
        }
  }
}