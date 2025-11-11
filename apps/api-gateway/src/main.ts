import express, { Request } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import * as path from "path";
import initializeSiteConfig from "./libs/initializaSiteConfig";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Aply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: true,
  // Use the package helper which handles IPv6 subnetting correctly
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip as string),
});

app.use(limiter);

app.use("/product", proxy("http://localhost:6002")); // product-service
app.use("/", proxy("http://localhost:6001")); // auth-service

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);

  try {
    initializeSiteConfig();
    console.log("Site config initialized");
  } catch (error) {
    console.error("Error initializing site config", error);
  }
});
server.on("error", console.error);
