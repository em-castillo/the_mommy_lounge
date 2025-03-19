import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";

export async function PUT(req: Request, { params }: { params: { notificationId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Mark the notification as read
    const result = await db
      .collection("notifications")
      .updateOne({ _id: params.notificationId, userId }, { $set: { isRead: true } });

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
