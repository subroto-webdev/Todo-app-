import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { resetPasswordSchema } from "@/validators/auth";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: parsed.data.token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return apiError("This reset link is invalid or has expired", 400);
    }

    user.password = parsed.data.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return apiSuccess(null, "Password reset successfully");
  } catch (err) {
    console.error("[RESET_PASSWORD_ERROR]", err);
    return apiError("Something went wrong", 500);
  }
}
