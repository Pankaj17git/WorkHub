import { skillController } from "@/controller/skills/skill.controller"

export async function GET() {
    const result = await skillController.getAllSkill()
    return new Response(JSON.stringify({
        data: result,
    }), {
        headers: {
            "Content-Type": "application/json",
        },
    })
}

