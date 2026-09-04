import { NextResponse } from "next/server";
import { status as Status } from "@/constants/statusCodes";

export const apiResponse = {
  /**
   * Send a successful JSON response
   */
  success<T = any>(data?: T, statusCode: number = Status.OK, message?: string) {
    const payload = {
      ...(message ? { message } : {}),
      ...(typeof data === "object" && data !== null ? data : data !== undefined ? { data } : {}),
    };
    return NextResponse.json(payload, { status: statusCode });
  },

  /**
   * Send a standardized error JSON response
   */
  error(message: string, statusCode: number = Status.BAD_REQUEST, extra?: Record<string, any>) {
    return NextResponse.json(
      {
        error: message,
        ...extra,
      },
      { status: statusCode }
    );
  },

  /**
   * 400 Bad Request
   */
  badRequest(message: string = "Invalid input or parameters", extra?: Record<string, any>) {
    return this.error(message, Status.BAD_REQUEST, extra);
  },

  /**
   * 401 Unauthorized
   */
  unauthorized(message: string = "Unauthorized", extra?: Record<string, any>) {
    return this.error(message, Status.UNAUTHORIZED, extra);
  },

  /**
   * 403 Forbidden
   */
  forbidden(message: string = "Forbidden", extra?: Record<string, any>) {
    return this.error(message, Status.FORBIDDEN, extra);
  },

  /**
   * 404 Not Found
   */
  notFound(message: string = "Resource not found", extra?: Record<string, any>) {
    return this.error(message, Status.NOT_FOUND, extra);
  },

  /**
   * 409 Conflict
   */
  conflict(message: string = "Resource conflict", extra?: Record<string, any>) {
    return this.error(message, Status.CONFLICT, extra);
  },

  /**
   * 429 Too Many Requests
   */
  tooManyRequests(message: string = "Too many requests. Please try again later.", extra?: Record<string, any>) {
    return this.error(message, Status.TOO_MANY_REQUESTS, extra);
  },

  /**
   * 500 Internal Server Error
   */
  internalError(message: string = "An unexpected server error occurred", extra?: Record<string, any>) {
    return this.error(message, Status.INTERNAL_SERVER_ERROR, extra);
  },
};
