import { NextResponse } from "next/server";
import { status as Status } from "@/constants/statusCodes";

// Enable JSON.stringify to serialize BigInt across all API responses
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (!("toJSON" in BigInt.prototype)) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function () {
      return this.toString();
    },
    writable: true,
    configurable: true,
  });
}

export const apiResponse = {
  /**
   * Send a successful JSON response
   */
  success<T = unknown>(data?: T, statusCode: number = Status.OK, message?: string) {
    const payload = {
      ...(message ? { message } : {}),
      ...(typeof data === "object" && data !== null ? data : data !== undefined ? { data } : {}),
    };
    return NextResponse.json(payload, { status: statusCode });
  },

  /**
   * Send a standardized error JSON response
   */
  error(message: string, statusCode: number = Status.BAD_REQUEST, extra?: Record<string, unknown>) {
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
  badRequest(message: string = "Invalid input or parameters", extra?: Record<string, unknown>) {
    return this.error(message, Status.BAD_REQUEST, extra);
  },

  /**
   * 401 Unauthorized
   */
  unauthorized(message: string = "Unauthorized", extra?: Record<string, unknown>) {
    return this.error(message, Status.UNAUTHORIZED, extra);
  },

  /**
   * 403 Forbidden
   */
  forbidden(message: string = "Forbidden", extra?: Record<string, unknown>) {
    return this.error(message, Status.FORBIDDEN, extra);
  },

  /**
   * 404 Not Found
   */
  notFound(message: string = "Resource not found", extra?: Record<string, unknown>) {
    return this.error(message, Status.NOT_FOUND, extra);
  },

  /**
   * 409 Conflict
   */
  conflict(message: string = "Resource conflict", extra?: Record<string, unknown>) {
    return this.error(message, Status.CONFLICT, extra);
  },

  /**
   * 429 Too Many Requests
   */
  tooManyRequests(message: string = "Too many requests. Please try again later.", extra?: Record<string, unknown>) {
    return this.error(message, Status.TOO_MANY_REQUESTS, extra);
  },

  /**
   * 500 Internal Server Error
   */
  internalError(message: string = "An unexpected server error occurred", extra?: Record<string, unknown>) {
    return this.error(message, Status.INTERNAL_SERVER_ERROR, extra);
  },
};
