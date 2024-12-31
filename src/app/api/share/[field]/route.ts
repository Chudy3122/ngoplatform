import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Usuń wszystkie udostępnienia dla tego pliku
    await prisma.fileShare.deleteMany({
      where: {
        fileId: params.fileId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking access:', error);
    return NextResponse.json(
      { error: "Failed to revoke access" },
      { status: 500 }
    );
  }
}