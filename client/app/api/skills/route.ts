import { NextRequest } from "next/server";
import { skillController } from "@/controller/skills/skill.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

export async function GET() {
    const result = await skillController.getAllSkill();
    return new Response(JSON.stringify({
        data: result,
    }), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const userId = authMiddleware(request);
        const body = await request.json();
        const name = body?.name;

        if (!name || typeof name !== "string") {
            return new Response(JSON.stringify({ success: false, error: "Skill name is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = await skillController.createCustomSkill(name, userId);
        return new Response(JSON.stringify(result), {
            status: result.success ? 201 : 400,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("POST /api/skills error:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

