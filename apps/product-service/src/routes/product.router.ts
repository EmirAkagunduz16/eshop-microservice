import express, { Router } from "express";
import {
  createDiscountCode,
  deleteDiscountCode,
  getAllDiscountCodes,
  getCategories,
} from "../controller/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router = Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getAllDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);

export default router;
