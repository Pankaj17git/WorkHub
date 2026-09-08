import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./definition";


export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ["./controller/**/*.ts"],
});

export default swaggerSpec;