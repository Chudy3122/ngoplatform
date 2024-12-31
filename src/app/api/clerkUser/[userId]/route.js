// app/api/clerkUser/[userId]/route.js
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await clerkClient.users.getUser(userId);

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress
    });

  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}