import crypto from "crypto";
import { ValidationError } from "@packages/error-handler/index";
import { Request, NextFunction, Response } from "express";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validationRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields for ${userType}`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account locked due to multiple failed attepmts! Please try again after 30 minutes."
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      "Too many OTP requests. Please wait 1 hour before requesting a new OTP."
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      "Please wait 1 minute before requesting a new OTP."
    );
  }
};

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = "otp_request_count:" + email;
  const otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // 1 hour lock
    throw new ValidationError(
      "Too many OTP requests. Please wait 1 hour before requesting a new OTP."
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); // Count resets after 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your email", template, { name, otp });

  // Store OTP in Redis with a 5-minute expiration
  await redis.set(`otp:${email}`, otp, "EX", 300); // OTP valid for 5 minutes
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("OTP has expired. Please request a new one.");
  }

  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  let failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts >= 3) {
      await redis.set(`otp_lock:${email}`, "true", "EX", 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Account locked due to multiple failed attempts! Please try again after 30 minutes."
      );
    }

    failedAttempts += 1;
    await redis.set(failedAttemptsKey, failedAttempts.toString(), "EX", 1800); // 30 minutes

    throw new ValidationError(
      `Invalid OTP. ${2 - failedAttempts} attempts left.`
    );
  }

  // OTP is valid, clear failed attempts
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    // find user/seller in DB
    const user =
      userType === "user" &&
      (await prisma.users.findUnique({ where: { email } }));

    if (!user) {
      throw new ValidationError(
        `No ${userType} found with the provided email.`
      );
    }

    // check otp restrictions
    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);

    // Generate OTP and send email
    await sendOtp(user.name, email, "forgot-password-user-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify to reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required");
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    next(error);
  }
};
