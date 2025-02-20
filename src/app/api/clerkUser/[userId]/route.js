import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { userId: currentUserId } = auth();

    // Jeśli chcesz pobrać konkretnego użytkownika
    const specificUser = await clerkClient.users.getUser(userId);

    return NextResponse.json({
      firstName: specificUser.firstName,
      lastName: specificUser.lastName,
      imageUrl: specificUser.imageUrl,
      email: specificUser.emailAddresses[0]?.emailAddress
    });

  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}