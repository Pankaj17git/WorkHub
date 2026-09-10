import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { MessagingService } from "@/services/chat/messaging.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: List user conversations
 *     description: Returns all conversations (direct and job-group) that the authenticated user belongs to.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const conversations = await MessagingService.getUserConversations(actor);

    return apiResponse.success(
      {
        conversations: conversations.map((c) => ({
          ...c,
          id: c.id.toString(),
          jobId: c.jobId?.toString(),
          customerId: c.customerId?.toString(),
          workerId: c.workerId?.toString(),
          members: c.members.map((m) => ({
            id: m.id.toString(),
            userId: m.userId.toString(),
            user: m.user,
          })),
        })),
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch conversations";
    return apiResponse.internalError(message);
  }
}

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     tags: [Conversations]
 *     summary: Create or retrieve conversation
 *     description: Initializes or fetches an existing 1-on-1 direct conversation or a job-team group conversation.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       201:
 *         description: Conversation retrieved or created
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const body = await request.json();

    if (body.type === "JOB_GROUP" && body.jobId) {
      const conv = await MessagingService.getOrCreateJobGroupConversation(BigInt(body.jobId));
      return apiResponse.success({ conversationId: conv.id.toString() }, Status.CREATED);
    }

    if (body.targetUserId) {
      const conv = await MessagingService.getOrCreateDirectConversation(actor, BigInt(body.targetUserId));
      return apiResponse.success({ conversationId: conv.id.toString() }, Status.CREATED);
    }

    return apiResponse.badRequest("Either jobId (for JOB_GROUP) or targetUserId (for DIRECT) is required");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process conversation request";
    return apiResponse.badRequest(message);
  }
}
