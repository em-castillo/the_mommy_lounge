import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: { notificationId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Ensure the notificationId is a valid ObjectId
    const notificationId = params.notificationId;
    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    // Update notification to mark it as read for the current user
    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), userId },
      { $set: { isRead: true } }
    );

    // If no notification is updated, notify the user
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Notification not found or already read" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
