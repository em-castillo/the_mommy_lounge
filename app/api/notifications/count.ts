import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Fetch the count of unread notifications for the user
    const notificationsCount = await db
      .collection("notifications")
      .countDocuments({ userId, isRead: false }); // assuming 'isRead' field marks notifications as read

    return NextResponse.json({ count: notificationsCount });
  } catch (error) {
    console.error("Error fetching notifications count:", error);
    return NextResponse.json({ error: "Failed to fetch notifications count" }, { status: 500 });
  }
}
