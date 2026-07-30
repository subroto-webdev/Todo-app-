import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/validators/auth";
import { apiError, apiSuccess, rateLimit } from "@/lib/utils";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = rateLimit(`forgot:${ip}`, 5, 60_000);
    if (!success) return apiError("Too many attempts. Try again shortly.", 429);

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    // Always respond with success to avoid leaking which emails are registered.
    if (user) {
      const token = randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      // In production: email a link like `${APP_URL}/reset-password?token=${token}`
    }

    return apiSuccess(null, "If that email exists, a reset link has been sent");
  } catch (err) {
    console.error("[FORGOT_PASSWORD_ERROR]", err);
    return apiError("Something went wrong", 500);
  }
}
