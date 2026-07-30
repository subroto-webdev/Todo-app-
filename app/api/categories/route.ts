import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { apiError, apiSuccess } from "@/lib/utils";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().default("#059669"),
  icon: z.string().optional().default("folder"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const categories = await Category.find({
      userId: (session.user as { id: string }).id,
    }).sort({ name: 1 });

    return apiSuccess(categories, "Categories fetched");
  } catch (err) {
    console.error("[CATEGORIES_GET_ERROR]", err);
    return apiError("Failed to fetch categories", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return apiError("Unauthorized", 401);

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const category = await Category.create({
      ...parsed.data,
      userId: (session.user as { id: string }).id,
    });

    return apiSuccess(category, "Category created", 201);
  } catch (err: any) {
    if (err?.code === 11000) {
      return apiError("A category with this name already exists", 409);
    }
    console.error("[CATEGORIES_POST_ERROR]", err);
    return apiError("Failed to create category", 500);
  }
}
