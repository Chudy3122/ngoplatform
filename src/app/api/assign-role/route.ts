// src/app/api/assign-role/route.ts
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    // Pobierz instancję klienta Clerk
    const clerk = await clerkClient();

    // Przypisz rolę do użytkownika
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return NextResponse.json(
      { success: true, message: `Role ${role} assigned to user ${userId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: "Failed to assign role", details: error },
      { status: 500 }
    );
  }
}