import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "Full-stack e-commerce platform API documentation",
      contact: {
        name: "API Support",
        email: "trongvinhle04@gmail.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || "http://localhost:4000/api",
        description: "Development server",
      },
      {
        url: "http://localhost/api",
        description: "Production server (via Nginx)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            name: {
              type: "string",
              description: "User name",
            },
            role: {
              type: "string",
              enum: ["customer", "admin"],
              description: "User role",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Product ID",
            },
            name: {
              type: "string",
              description: "Product name",
            },
            price: {
              type: "number",
              description: "Product price",
            },
            brand: {
              type: "string",
              description: "Product brand",
            },
            description: {
              type: "string",
              description: "Product description",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Product images",
            },
            category: {
              type: "string",
              enum: ["Gaming", "Business", "Ultrabook", "Workstation", "2-in-1", "Chromebook", "Other"],
              description: "Product category",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Product tags",
            },
            stock: {
              type: "number",
              description: "Product stock",
            },
            rating: {
              type: "number",
              description: "Product rating",
            },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Order ID",
            },
            user: {
              type: "string",
              description: "User ID",
            },
            items: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Order items",
            },
            totalAmount: {
              type: "number",
              description: "Total amount",
            },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
              description: "Order status",
            },
            paymentMethod: {
              type: "string",
              enum: ["cod", "vnpay", "other"],
              description: "Payment method",
            },
            paymentStatus: {
              type: "string",
              enum: ["pending", "paid", "failed", "refunded"],
              description: "Payment status",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js",
    "./src/routes/admin/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerSetup = (app) => {
  // Swagger UI
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "E-Commerce API Documentation",
  }));

  // Swagger JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;

