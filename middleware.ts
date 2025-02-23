import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|_static|_vercel|favicon.ico).*)", // Protect everything except Clerk's routes and static files
    "/api/:path*", // Always run for API routes
    "/profile", // Example of a protected route
  ],
};



