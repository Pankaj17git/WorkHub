import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "WorkHub API",
    version: "1.0.0",
    description:
      "WorkHub REST API documentation — Authentication, OTP verification, session management, user profile, and file uploads endpoints.",
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
    {
      name: "Auth",
      description: "User registration & login (email/password)",
    },
    {
      name: "OTP",
      description: "OTP generation & verification (email/phone)",
    },
    {
      name: "Firebase",
      description: "Firebase Phone Auth session sync",
    },
    {
      name: "User",
      description: "User profile management",
    },
    {
      name: "Uploads",
      description: "File upload and storage management",
    },
  ],
  paths: {
    // ─── REGISTER ───────────────────────────────────────────────
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Creates a new user account with email, password, name, phone, and role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "Pankaj Chaudhary",
                email: "pankaj@example.com",
                password: "SecurePass123",
                phone: "+919876543210",
                role: "CUSTOMER",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" },
                example: {
                  message: "User registered successfully",
                  user: {
                    id: "1",
                    email: "pankaj@example.com",
                    name: "Pankaj Chaudhary",
                    phone: "+919876543210",
                    role: "CUSTOMER",
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error (invalid email, short password, etc.)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error: "Password must be at least 8 characters",
                },
              },
            },
          },
          "409": {
            description: "User with this email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error: "User with this email already exists",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Registration failed" },
              },
            },
          },
        },
      },
    },

    // ─── LOGIN ──────────────────────────────────────────────────
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email & password",
        description:
          "Authenticates a user with email and password. Returns user info and a JWT token valid for 7 days.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                email: "pankaj@example.com",
                password: "SecurePass123",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
                example: {
                  user: {
                    id: "1",
                    email: "pankaj@example.com",
                    name: "Pankaj Chaudhary",
                    role: "CUSTOMER",
                  },
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error: "Invalid email address",
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials (wrong email or password)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Invalid credentials" },
              },
            },
          },
        },
      },
    },

    // ─── OTP SEND ───────────────────────────────────────────────
    "/api/auth/otp/send": {
      post: {
        tags: ["OTP"],
        summary: "Send OTP to user",
        description:
          "Generates a 6-digit OTP and sends it via email. You can identify the user by `userId`, `email`, or `phone`. Requires an existing user account.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SendOtpRequest" },
              examples: {
                byEmail: {
                  summary: "Send OTP by email",
                  value: { email: "pankaj@example.com" },
                },
                byPhone: {
                  summary: "Send OTP by phone (auto-creates user)",
                  value: {
                    phone: "+919876543210",
                    name: "Pankaj",
                    role: "CUSTOMER",
                  },
                },
                byUserId: {
                  summary: "Send OTP by user ID",
                  value: { userId: "1" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OTP generated and dispatched",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SendOtpResponse" },
                example: {
                  message: "OTP generated successfully",
                  otpId: "42",
                  expiresAt: "2026-08-24T12:05:00.000Z",
                  emailSent: true,
                  otp: "482910",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  error:
                    "Either userId, email, or phone must be provided",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "User not found" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Failed to send OTP" },
              },
            },
          },
        },
      },
    },

    // ─── OTP VERIFY ─────────────────────────────────────────────
    "/api/auth/otp/verify": {
      post: {
        tags: ["OTP"],
        summary: "Verify an OTP",
        description:
          "Verifies a 6-digit OTP for a user (identified by `userId`, `email`, or `phone`). On success, returns a JWT token and user details.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
              examples: {
                byEmail: {
                  summary: "Verify by email",
                  value: { email: "pankaj@example.com", otp: "482910" },
                },
                byPhone: {
                  summary: "Verify by phone",
                  value: { phone: "+919876543210", otp: "482910" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OTP verified, JWT token issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpResponse" },
                example: {
                  message: "OTP verified successfully",
                  verified: true,
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: {
                    id: "1",
                    email: "pankaj@example.com",
                    name: "Pankaj Chaudhary",
                    phone: "+919876543210",
                    role: "CUSTOMER",
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid OTP or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: {
                  invalidOtp: {
                    summary: "Wrong OTP code",
                    value: { error: "Invalid or expired OTP" },
                  },
                  validation: {
                    summary: "Missing required fields",
                    value: {
                      error:
                        "Either userId, email, or phone must be provided",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "User not found" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Failed to verify OTP" },
              },
            },
          },
        },
      },
    },

    // ─── FIREBASE SESSION ───────────────────────────────────────
    "/api/auth/firebase/session": {
      post: {
        tags: ["Firebase"],
        summary: "Sync Firebase Phone Auth session",
        description:
          "After Firebase phone authentication completes on the client, call this endpoint to sync the authenticated phone number with the WorkHub database. If no user exists for the phone, one is created automatically. Returns a WorkHub JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FirebaseSessionRequest",
              },
              example: {
                phone: "+919876543210",
                name: "Pankaj",
                role: "CUSTOMER",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Session created, JWT token issued",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FirebaseSessionResponse",
                },
                example: {
                  message: "Firebase Phone Authentication successful",
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  user: {
                    id: "1",
                    name: "Pankaj",
                    email: "9876543210@phone.workhub",
                    phone: "+919876543210",
                    role: "CUSTOMER",
                  },
                },
              },
            },
          },
          "400": {
            description: "Phone number is required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Phone number is required" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Failed to create session" },
              },
            },
          },
        },
      },
    },

    // ─── UPDATE PROFILE ──────────────────────────────────────────
    "/api/user/update-profile": {
      patch: {
        tags: ["User"],
        summary: "Update user profile image",
        description:
          "Uploads a new profile image for the authenticated user and updates their profile in the database. Deletes the previous profile image from storage if present. Requires JWT authentication.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["profileImage"],
                properties: {
                  profileImage: {
                    type: "string",
                    format: "binary",
                    description: "Profile image file to upload",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileResponse" },
                example: {
                  user: {
                    id: "1",
                    profileImage:
                      "https://xyz.supabase.co/storage/v1/object/public/uploads/1724847000000_avatar.jpg",
                  },
                },
              },
            },
          },
          "400": {
            description: "No file provided or bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "No file provided" },
              },
            },
          },
          "401": {
            description: "Unauthorized (missing or invalid JWT token)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Unauthorized" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "User not found" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Profile update failed" },
              },
            },
          },
        },
      },
    },

    // ─── UPLOADS ────────────────────────────────────────────────
    "/api/uploads": {
      post: {
        tags: ["Uploads"],
        summary: "Upload a file",
        description:
          "Uploads a generic file to storage (Supabase). Requires JWT authentication.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "File to upload",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "File uploaded successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadFileResponse" },
                example: {
                  id: "101",
                  url: "https://xyz.supabase.co/storage/v1/object/public/uploads/1724847000000_doc.pdf",
                  filename: "doc.pdf",
                  mimeType: "application/pdf",
                  size: 204800,
                  userId: "1",
                  createdAt: "2026-08-28T12:00:00.000Z",
                },
              },
            },
          },
          "400": {
            description: "No file provided",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "No file provided" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Unauthorized" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "File upload failed" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Uploads"],
        summary: "Delete a file",
        description:
          "Deletes a file from storage using its key or URL. Requires JWT authentication.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteFileRequest" },
              example: {
                key: "https://xyz.supabase.co/storage/v1/object/public/uploads/1724847000000_doc.pdf",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "File deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteFileResponse" },
                example: { success: true },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Unauthorized" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { error: "Failed to delete file" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      // ─── REQUEST SCHEMAS ────────────────────────────────────────
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            description: "User's full name (min 2 characters)",
          },
          email: {
            type: "string",
            format: "email",
            description: "Valid email address",
          },
          password: {
            type: "string",
            minLength: 8,
            description: "Password (min 8 characters)",
          },
          role: {
            type: "string",
            enum: ["CUSTOMER", "WORKER"],
            description: "User role",
          },
          phone: {
            type: "string",
            nullable: true,
            description: "Phone number with country code (optional)",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Registered email address",
          },
          password: {
            type: "string",
            minLength: 8,
            description: "Account password",
          },
        },
      },

      SendOtpRequest: {
        type: "object",
        description:
          "At least one of `email` or `phone` must be provided.",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "User email",
          },
          phone: {
            type: "string",
            description: "Phone number with country code",
          },
          length: {
            type: "integer",
            minimum: 4,
            maximum: 8,
            default: 6,
            description: "OTP digit length",
          },
        },
      },

      VerifyOtpRequest: {
        type: "object",
        required: ["otp"],
        description:
          "At least one of `userId`, `email`, or `phone` must be provided alongside the OTP.",
        properties: {
          userId: {
            type: "string",
            description: "User ID (BigInt as string)",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email",
          },
          phone: {
            type: "string",
            description: "Phone number with country code",
          },
          otp: {
            type: "string",
            pattern: "^\\d{6}$",
            description: "6-digit OTP code",
          },
        },
      },

      FirebaseSessionRequest: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: {
            type: "string",
            description: "Phone number verified by Firebase",
          },
          name: {
            type: "string",
            description: "Optional display name",
          },
          role: {
            type: "string",
            enum: ["USER", "CUSTOMER", "WORKER", "ADMIN"],
            description: "Optional user role (default: CUSTOMER)",
          },
        },
      },

      DeleteFileRequest: {
        type: "object",
        required: ["key"],
        properties: {
          key: {
            type: "string",
            description: "Storage key or URL of the file to delete",
          },
        },
      },

      // ─── RESPONSE SCHEMAS ───────────────────────────────────────
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

      RegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          user: { $ref: "#/components/schemas/UserInfo" },
        },
      },

      LoginResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserInfo" },
          token: {
            type: "string",
            description: "JWT token (valid 7 days)",
          },
        },
      },

      SendOtpResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          otpId: { type: "string", description: "OTP record ID" },
          expiresAt: {
            type: "string",
            format: "date-time",
            description: "OTP expiry timestamp",
          },
          emailSent: { type: "boolean" },
        },
      },

      VerifyOtpResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          verified: { type: "boolean" },
          token: {
            type: "string",
            description: "JWT token (valid 7 days)",
          },
          user: { $ref: "#/components/schemas/UserInfo" },
        },
      },

      FirebaseSessionResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          token: {
            type: "string",
            description: "JWT token (valid 7 days)",
          },
          user: { $ref: "#/components/schemas/UserInfo" },
        },
      },

      UpdateProfileResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", description: "User ID (BigInt as string)" },
              profileImage: {
                type: "string",
                description: "URL of the uploaded profile image",
              },
            },
          },
        },
      },

      UploadFileResponse: {
        type: "object",
        properties: {
          id: { type: "string", description: "Upload record ID" },
          url: { type: "string", description: "Public file URL" },
          filename: { type: "string", description: "Original filename" },
          mimeType: { type: "string", description: "MIME type" },
          size: { type: "integer", description: "File size in bytes" },
          userId: { type: "string", description: "Uploader user ID" },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Upload timestamp",
          },
        },
      },

      DeleteFileResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Human-readable error message",
          },
        },
      },
    },

    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT token obtained from login, register, OTP verify, or Firebase session endpoints. Pass as `Authorization: Bearer <token>`.",
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [], // We define paths inline above — no JSDoc annotations needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
