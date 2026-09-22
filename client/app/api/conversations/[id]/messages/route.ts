import { NextRequest } from "next/server";
import { getAuthActor } from "@/lib/authActor";
import { apiResponse } from "@/lib/apiResponse";
import { MessagingService } from "@/services/chat/messaging.service";
import { status as Status } from "@/constants/statusCodes";

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   get:
 *     tags: [Conversations]
 *     summary: Get conversation messages
 *     description: Retrieves the chronological message history for the specified conversation.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: List of messages
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const { id } = await params;
    const messages = await MessagingService.getMessages(actor, BigInt(id));

    return apiResponse.success(
      {
        messages: messages.map((m) => ({
          ...m,
          id: m.id.toString(),
          conversationId: m.conversationId.toString(),
          senderId: m.senderId.toString(),
        })),
      },
      Status.OK
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch messages";
    return apiResponse.badRequest(message);
  }
}

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     tags: [Conversations]
 *     summary: Send message
 *     description: Sends a text message to the specified conversation.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthActor(request);
    if (!actor) return apiResponse.unauthorized();

    const { id } = await params;
    const body = await request.json();

    if (!body.message || !body.message.trim()) {
      return apiResponse.badRequest("Message cannot be empty");
    }

    const message = await MessagingService.sendMessage(actor, BigInt(id), body.message);

    return apiResponse.success(
      {
        message: {
          ...message,
          id: message.id.toString(),
          conversationId: message.conversationId.toString(),
          senderId: message.senderId.toString(),
        },
      },
      Status.CREATED,
      "Message sent"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return apiResponse.badRequest(message);
  }
}
