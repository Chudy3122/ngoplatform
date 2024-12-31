// pages/api/messages/[conversationId].js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { conversationId } = req.query;

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else if (req.method === 'POST') {
    const { sender, text } = req.body;

    try {
      const newMessage = await prisma.message.create({
        data: {
          conversationId,
          sender,
          text
        }
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
