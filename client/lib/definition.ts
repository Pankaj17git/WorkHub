import { SwaggerDefinition } from "swagger-jsdoc";

export const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "WorkHub API",
    version: "1.0.0",
    description:
      "WorkHub REST API documentation — Modular OpenAPI documentation with JSDoc annotations.",
    contact: {
      name: "WorkHub Dev Team",
    },
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Auth", description: "User registration & login (email/password)" },
    { name: "OTP", description: "OTP generation & verification (email/phone)" },
    { name: "User", description: "User profile management" },
    { name: "Address", description: "User address management endpoints" },
    { name: "Jobs", description: "Job posting, discovery, application & staffing endpoints" },
    { name: "Assignments", description: "Job assignment lifecycle, travel, doorstep OTP & completion" },
    { name: "Direct Hire", description: "Direct hiring requests between customers and workers" },
    { name: "Team Invitations", description: "Worker team collaboration and invitations for jobs" },
    { name: "Worker Connections", description: "Professional networking and connections between workers" },
    { name: "Conversations", description: "In-app messaging for direct chats and job groups" },
    { name: "Reviews", description: "Worker ratings and reviews for completed jobs" },
    { name: "Notifications", description: "In-app notifications and alerts" },
    { name: "Uploads", description: "File upload and storage management" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT token obtained from login, register, OTP verify, or Firebase session endpoints. Pass as `Authorization: Bearer <token>`.",
      },
    },
    responses: {
      BadRequest: {
        description: "Validation error or bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Invalid input or parameters" },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized (missing or invalid token)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Unauthorized access" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden action",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Forbidden access" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Resource not found" },
          },
        },
      },
      Conflict: {
        description: "Resource conflict",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Resource already exists" },
          },
        },
      },
      TooManyRequests: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "Too many requests. Please try again later." },
          },
        },
      },
      InternalServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { error: "An unexpected server error occurred" },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Human-readable error message",
          },
          status: {
            type: "number",
            description: "HTTP status code",
          },
          note: {
            type: "string",
            description: "Contextual note about the error",
          },
        },
      },

      UserInfo: {
        type: "object",
        properties: {
          id: { type: "string", description: "User ID (BigInt as string)" },
          email: { type: "string" },
          name: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          role: { type: "string" },
          profileImage: { type: "string", nullable: true },
        },
      },

      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string", minLength: 2, description: "User's full name" },
          email: { type: "string", format: "email", description: "Valid email address" },
          password: { type: "string", minLength: 8, description: "Password (min 8 characters)" },
          role: { type: "string", enum: ["CUSTOMER", "WORKER"], description: "User role" },
          phone: { type: "string", nullable: true, description: "Phone number with country code" },
        },
      },

      RegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          user: { $ref: "#/components/schemas/UserInfo" },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", description: "Registered email address" },
          password: { type: "string", minLength: 8, description: "Account password" },
        },
      },

      LoginResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserInfo" },
          token: { type: "string", description: "JWT token (valid 7 days)" },
        },
      },

      SendOtpRequest: {
        type: "object",
        description: "At least one of `email`, `phone`, or `userId` must be provided.",
        properties: {
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          userId: { type: "string" },
          length: { type: "integer", default: 6 },
        },
      },

      SendOtpResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          otpId: { type: "string" },
          expiresAt: { type: "string", format: "date-time" },
          emailSent: { type: "boolean" },
          otp: { type: "string", description: "OTP code (in development mode)" },
        },
      },

      VerifyOtpRequest: {
        type: "object",
        required: ["otp"],
        properties: {
          userId: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          otp: { type: "string", pattern: "^\\d{6}$" },
        },
      },

      VerifyOtpResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          verified: { type: "boolean" },
          token: { type: "string" },
          user: { $ref: "#/components/schemas/UserInfo" },
        },
      },

      AddressInfo: {
        type: "object",
        nullable: true,
        properties: {
          id: { type: "string", description: "Address ID (BigInt as string)" },
          address: { type: "string", nullable: true },
          city: { type: "string", nullable: true },
          state: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          latitude: { type: "number", nullable: true },
          longitude: { type: "number", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      AddAddressRequest: {
        type: "object",
        required: ["address", "city", "state", "country", "latitude", "longitude"],
        properties: {
          address: { type: "string", description: "Street address line" },
          city: { type: "string", description: "City name" },
          state: { type: "string", description: "State or province" },
          country: { type: "string", description: "Country name" },
          latitude: { type: "number", format: "float", description: "Latitude coordinate" },
          longitude: { type: "number", format: "float", description: "Longitude coordinate" },
        },
      },

      AddAddressResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          address: { $ref: "#/components/schemas/AddressInfo" },
        },
      },

      GetAddressResponse: {
        type: "object",
        properties: {
          address: { $ref: "#/components/schemas/AddressInfo" },
        },
      },

      CreateJobRequest: {
        type: "object",
        required: ["title", "description", "minAmount", "maxAmount", "currency", "skills"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          minAmount: { type: "number" },
          maxAmount: { type: "number" },
          currency: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          status: {
            type: "string",
            enum: ["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"],
            default: "OPEN",
          },
          addressId: {
            type: "number",
            description: "Existing address ID (optional if address object is provided)",
          },
          address: {
            $ref: "#/components/schemas/AddAddressRequest",
            description: "Address details to create a new address for this job",
          },
        },
      },

      CreateJobResponse: {
        type: "object",
        properties: {
          job: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              minAmount: { type: "number" },
              maxAmount: { type: "number" },
              currency: { type: "string" },
              skills: { type: "array", items: { type: "string" } },
              status: { type: "string", enum: ["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"] },
              createdById: { type: "string" },
              addressId: { type: "string", nullable: true },
              address: { $ref: "#/components/schemas/AddressInfo" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },

      UpdateProfileResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              profileImage: { type: "string" },
            },
          },
        },
      },

      UploadFileResponse: {
        type: "object",
        properties: {
          id: { type: "string" },
          url: { type: "string" },
          filename: { type: "string" },
          mimeType: { type: "string" },
          size: { type: "integer" },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      DeleteFileRequest: {
        type: "object",
        required: ["key"],
        properties: {
          key: { type: "string", description: "Storage key or URL of the file to delete" },
        },
      },

      DeleteFileResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
        },
      },

      ApplyJobRequest: {
        type: "object",
        properties: {
          message: { type: "string", description: "Cover note or message to the customer" },
          proposedPrice: { type: "number", description: "Worker proposed price quote" },
        },
      },

      SelectWorkersRequest: {
        type: "object",
        required: ["workerIds"],
        properties: {
          workerIds: {
            type: "array",
            items: { type: "number" },
            description: "Array of worker IDs to assign to the job",
          },
        },
      },

      CreateTeamInvitationRequest: {
        type: "object",
        required: ["invitedWorkerId"],
        properties: {
          invitedWorkerId: { type: "number", description: "Worker ID being invited" },
          message: { type: "string", description: "Optional invite message" },
        },
      },

      VerifyStartOtpRequest: {
        type: "object",
        required: ["otp"],
        properties: {
          otp: { type: "string", description: "6-digit doorstep OTP provided by the customer" },
        },
      },

      CancelAssignmentRequest: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason for cancellation" },
        },
      },

      CreateDirectHireRequest: {
        type: "object",
        required: ["workerId"],
        properties: {
          workerId: { type: "number", description: "Target worker ID" },
          serviceName: { type: "string", description: "Service requested" },
          notes: { type: "string", description: "Customer instructions / requirements" },
          scheduledDate: { type: "string", format: "date-time", description: "Requested service date" },
          proposedPrice: { type: "number", description: "Proposed budget / price" },
          addressId: { type: "number", description: "Existing address ID" },
          address: { $ref: "#/components/schemas/AddAddressRequest" },
        },
      },

      SendConnectionRequest: {
        type: "object",
        required: ["targetWorkerId"],
        properties: {
          targetWorkerId: { type: "number", description: "ID of the worker to connect with" },
        },
      },

      CreateConversationRequest: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["DIRECT", "JOB_GROUP"],
            default: "DIRECT",
            description: "Conversation type",
          },
          targetUserId: {
            type: "number",
            description: "Target user ID (required for DIRECT conversations)",
          },
          jobId: {
            type: "number",
            description: "Job ID (required for JOB_GROUP conversations)",
          },
        },
      },

      SendMessageRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string", minLength: 1, description: "Message content" },
        },
      },

      CreateReviewRequest: {
        type: "object",
        required: ["assignmentId", "rating"],
        properties: {
          assignmentId: { type: "number", description: "Completed assignment ID" },
          rating: { type: "number", minimum: 1, maximum: 5, description: "Rating score 1 to 5" },
          comment: { type: "string", description: "Feedback review text" },
          timelinessRating: { type: "number", minimum: 1, maximum: 5 },
          qualityRating: { type: "number", minimum: 1, maximum: 5 },
        },
      },
    },
  },
};
