import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/validators/auth";
import { apiError, apiSuccess, rateLimit } from "@/lib/utils";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!success) {
      return apiError("Too many attempts. Please try again in a minute.", 429);
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();

    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const verificationToken = randomBytes(32).toString("hex");

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      verificationToken,
    });

    // In production: send verification email here via Resend/SendGrid using verificationToken.

    return apiSuccess(
      { id: user._id.toString(), email: user.email },
      "Account created successfully",
      201
    );
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return apiError("Failed to create account", 500);
  }
}
