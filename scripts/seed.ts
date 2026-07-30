/**
 * Seed the database with a demo user, categories, and tasks.
 * Run with: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User";
import Category from "../models/Category";
import Task from "../models/Task";

const MONGODB_URI = process.env.MONGODB_URI as string;

async function seed() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in your environment");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = "demo@taskflow.app";
  await User.deleteOne({ email });
  await Category.deleteMany({});
  await Task.deleteMany({});

  const user = await User.create({
    name: "Demo User",
    email,
    password: "Demo1234",
    emailVerified: true,
  });

  const categories = await Category.insertMany([
    { userId: user._id, name: "Work", color: "#2563eb" },
    { userId: user._id, name: "Personal", color: "#059669" },
    { userId: user._id, name: "Learning", color: "#d97706" },
  ]);

  const [work, personal, learning] = categories;

  await Task.insertMany([
    {
      userId: user._id,
      title: "Finalize Q3 product roadmap",
      description: "Align with design and engineering on scope for next quarter.",
      priority: "urgent",
      category: work._id,
      tags: ["roadmap", "planning"],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "in-progress",
      pinned: true,
      subtasks: [
        { title: "Collect stakeholder feedback", completed: true },
        { title: "Draft roadmap doc", completed: false },
      ],
    },
    {
      userId: user._id,
      title: "Book flights for team offsite",
      priority: "medium",
      category: work._id,
      tags: ["travel"],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "pending",
    },
    {
      userId: user._id,
      title: "Grocery shopping",
      priority: "low",
      category: personal._id,
      tags: ["errands"],
      status: "pending",
      checklist: [
        { label: "Vegetables", checked: false },
        { label: "Milk", checked: false },
      ],
    },
    {
      userId: user._id,
      title: "Complete React Server Components course",
      priority: "medium",
      category: learning._id,
      tags: ["nextjs", "react"],
      status: "completed",
      completedAt: new Date(),
    },
    {
      userId: user._id,
      title: "Renew passport",
      priority: "high",
      category: personal._id,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // overdue on purpose
      status: "pending",
    },
  ]);

  console.log("Seed complete!");
  console.log(`Demo login → email: ${email} / password: Demo1234`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
