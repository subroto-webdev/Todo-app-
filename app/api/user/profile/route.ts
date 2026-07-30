import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  timezone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const user = await User.findById((session.user as { id: string }).id);
  if (!user) return apiError("User not found", 404);

  return apiSuccess(user, "Profile fetched");
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("Unauthorized", 401);

  const body = await req.json();

  // Password change is handled as a distinct action for extra validation
  if (body.currentPassword && body.newPassword) {
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const user = await User.findById((session.user as { id: string }).id).select("+password");
    if (!user) return apiError("User not found", 404);

    const isValid = await user.comparePassword(parsed.data.currentPassword);
    if (!isValid) return apiError("Current password is incorrect", 400);

    user.password = parsed.data.newPassword;
    await user.save();
    return apiSuccess(null, "Password updated successfully");
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(
    (session.user as { id: string }).id,
    { $set: parsed.data },
    { new: true }
  );

  return apiSuccess(user, "Profile updated");
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const userId = (session.user as { id: string }).id;

  await Promise.all([Task.deleteMany({ userId }), User.findByIdAndDelete(userId)]);

  return apiSuccess(null, "Account deleted");
}
