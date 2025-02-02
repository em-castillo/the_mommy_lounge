import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    return NextResponse.json({ message: "✅ MongoDB is connected!" }, { status: 200 });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return NextResponse.json({ message: "❌ Failed to connect to MongoDB" }, { status: 500 });
  }
}
