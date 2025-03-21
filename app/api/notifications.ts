// import { NextApiRequest, NextApiResponse } from "next";
// import { connectToDatabase } from "../../utils/db"; 
// import { auth } from "@clerk/nextjs/server"; // To get the logged-in user

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { db } = await connectToDatabase();
//   const { userId } = await auth();

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   if (req.method === "GET") {
//     // Get unread notifications for the logged-in user
//     try {
//       const notifications = await db.collection("notifications")
//         .find({ userId, read: false })
//         .sort({ createdAt: -1 })
//         .toArray();

//       return res.status(200).json(notifications);
//     } catch {
//       return res.status(500).json({ error: "Failed to fetch notifications" });
//     }
//   }

//   if (req.method === "PATCH") {
//     // Mark notifications as read
//     try {
//       await db.collection("notifications").updateMany(
//         { userId, read: false },
//         { $set: { read: true } }
//       );
//       return res.status(200).json({ message: "Notifications marked as read" });
//     } catch{
//       return res.status(500).json({ error: "Failed to update notifications" });
//     }
//   }

//   return res.status(405).json({ error: "Method not allowed" });
// }
