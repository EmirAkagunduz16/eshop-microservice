import { AuthorizationError } from "@packages/error-handler";
import { Response, NextFunction } from "express";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthorizationError("Seller access only."));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthorizationError("Seller access only."));
  }
  next();
};
