import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const routesPattern = path
  .resolve(__dirname, "../routes/*.{ts,js}")
  .replace(/\\/g, "/");

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NexGen Clinic API",
      version: "1.0.0",
      description:
        "Comprehensive REST API documentation for NexGen Clinic backend. Includes all public endpoints (landing page, ecommerce, careers, leads) and private admin endpoints (services, blogs, products, leads, jobs, media, RBAC roles & permissions).",
      contact: {
        name: "NexGen Clinic Engineering",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Current environment server",
      },
      {
        url: "/",
        description: "Relative URL (works on any host/domain)",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from POST /auth/login",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error message details" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication, session & user profile" },
      { name: "Public - Services", description: "Public service listings & details" },
      { name: "Public - Blogs", description: "Public blog articles" },
      { name: "Public - Products", description: "Public product catalog" },
      { name: "Public - Jobs", description: "Public career openings & job applications" },
      { name: "Public - Leads", description: "Public enquiry / lead submission" },
      { name: "Public - Offers", description: "Public active promo offers" },
      { name: "Public - Reviews", description: "Google reviews & ratings" },
      { name: "Admin - Services", description: "Service management (requires services:read/write)" },
      { name: "Admin - Blogs", description: "Blog management (requires blogs:read/write)" },
      { name: "Admin - Products", description: "Product catalog management (requires products:read/write)" },
      { name: "Admin - Jobs", description: "Careers & applications management (requires careers:read/write)" },
      { name: "Admin - Leads", description: "CRM leads management (requires leads:read/write)" },
      { name: "Admin - Offers", description: "Promotional banner offers (requires offers:read/write)" },
      { name: "Admin - Media", description: "Media assets library (requires media:read/write)" },
      { name: "Admin - Roles", description: "RBAC roles & assigned permissions" },
      { name: "Admin - Permissions", description: "System permissions catalog" },
    ],
  },
  apis: [routesPattern],
};

export const swaggerSpec = swaggerJsdoc(options);
