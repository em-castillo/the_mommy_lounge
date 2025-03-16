import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../../../utils/db";

export async function GET() {
  const { db } = await connectToDatabase();

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.collection("notifications").find({ userId }).toArray();

  return NextResponse.json(notifications);
}
