

import { prisma } from "@/lib/prisma";

async function getSkills() {
    const skills = await prisma.workerSkill.findMany()
    return skills
}