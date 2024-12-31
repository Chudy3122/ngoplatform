import { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient } from '@clerk/nextjs/server'; // Użyj clerkClient zamiast Clerk

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, username } = req.body;

    // Sprawdź, czy wszystkie dane zostały przekazane
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required' });
    }

    try {
      // Tworzenie nowego użytkownika w Clerk
      const user = await clerkClient.users.createUser({
        emailAddress: email,
        password,
        // Dodatkowe metadane, jeśli potrzebujesz
        unsafeMetadata: {
          username, // Możesz dodać inne metadane
        },
      });

      // Odpowiedź z informacjami o nowym użytkowniku
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    // Metoda HTTP nieobsługiwana
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
