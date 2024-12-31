import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, type } = await req.json();

    // Sprawdź czy reakcja już istnieje
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        authorId: userId,
        postId: postId
      }
    });

    if (existingReaction) {
      // Jeśli reakcja istnieje i jest taka sama - usuń ją
      if (existingReaction.type === type) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        });
        return NextResponse.json({ message: "Reaction removed" });
      } else {
        // Jeśli reakcja istnieje ale jest inna - zaktualizuj ją
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type }
        });
        return NextResponse.json(updatedReaction);
      }
    }

    // Jeśli reakcja nie istnieje - stwórz nową
    const reaction = await prisma.reaction.create({
      data: {
        type,
        authorId: userId,
        postId
      }
    });

    return NextResponse.json(reaction);
  } catch (error: unknown) {
    const customError = {
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
    
    return NextResponse.json(
      { error: customError.message },
      { status: 500 }
    );
  }
}