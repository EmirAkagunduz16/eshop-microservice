import { output } from "@nx/workspace";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Product Service API",
    description: "API documentation for the Product Service",
    version: "1.0.0",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/product.router.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
