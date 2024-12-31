// app/api/resources/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authData = await auth();
    const role = (authData?.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admin can delete files" },
        { status: 401 }
      );
    }

    await prisma.resource.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}