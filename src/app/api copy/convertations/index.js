import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: 'senderId and receiverId are required' });
  }

  try {
    // Sprawdź, czy konwersacja już istnieje
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { has: senderId } },
          { members: { has: receiverId } }
        ]
      }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Jeśli nie istnieje, utwórz nową konwersację
    const newConversation = await prisma.conversation.create({
      data: {
        members: [senderId, receiverId]
      }
    });

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}