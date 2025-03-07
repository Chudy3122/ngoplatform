// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Definiujemy typy dla postów i ogłoszeń
type PostType = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  type: string;
}

type AnnouncementType = {
  id: number;
  title: string;
  description: string;
  date: Date;
  classId?: number | null;
}

// Typ dla połączonych danych
type CombinedPost = PostType | AnnouncementType;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    console.log("Fetching posts with limit:", limit);
    
    // Próbujemy najpierw pobrać posty
    const posts = await prisma.post.findMany({
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${posts.length} posts`);
    
    // Jeśli nie ma postów lub jest ich mniej niż limit, pobieramy też ogłoszenia
    if (posts.length < limit) {
      const announcements = await prisma.announcement.findMany({
        take: limit - posts.length,
        skip: 0, // Nie stosujemy skip dla ogłoszeń
        orderBy: {
          date: 'desc'
        }
      });
      
      console.log(`Found ${announcements.length} announcements`);
      
      // Łączymy oba zestawy danych
      const combinedData: CombinedPost[] = [
        ...posts,
        ...announcements.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description,
          date: a.date,
          classId: a.classId
        }))
      ];
      
      // Sortujemy według daty w bezpieczny sposób
      combinedData.sort((a, b) => {
        const dateA = 'createdAt' in a ? a.createdAt : 'date' in a ? a.date : new Date(0);
        const dateB = 'createdAt' in b ? b.createdAt : 'date' in b ? b.date : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      return NextResponse.json(combinedData.slice(0, limit));
    }
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}