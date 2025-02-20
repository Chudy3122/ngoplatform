import { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient } from '@clerk/clerk-sdk-node';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required' });
    }

    try {
      const user = await clerkClient.users.createUser({
        emailAddress: email,
        password,
        username,
        publicMetadata: {
          username,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}