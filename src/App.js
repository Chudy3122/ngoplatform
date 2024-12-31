import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { AuthProvider } from "./context/AuthContext"; // Kontekst do zarządzania autoryzacją
import { SocketProvider } from "./context/SocketContext"; // Kontekst do zarządzania połączeniami WebSocket
import Home from "./pages/home/Home"; // Komponent strony głównej
import Login from "/app/[[...sign-in]]/page"; // Komponent logowania
import Profile from "./pages/profile/Profile"; // Komponent profilu użytkownika
import Register from "./pages/register/Register"; // Komponent rejestracji
import Messages from "./list/messages/page"; // Komponent wiadomości (czatu)
import Link from "next/link"; // Komponent do nawigacji

function App() {
  return (
    <ClerkProvider publishableKey="pk_test_cHJlY2lvdXMtYm9hci0zMy5jbGVyay5hY2NvdW50cy5kZXYk">
      <AuthProvider>
        <SocketProvider>
          <Main /> {/* Główny komponent aplikacji */}
        </SocketProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

const Main = () => {
  const { user, isLoaded, isSignedIn } = useUser(); // Używamy useUser, aby uzyskać informacje o użytkowniku

  if (!isLoaded) {
    return <div>Loading...</div>; // Loader, gdy dane użytkownika są ładowane
  }

  return (
    <div>
      <Home /> {/* Wyświetlanie komponentu strony głównej */}
      <Link href="/login">
        <a>Login</a> {/* Link do strony logowania */}
      </Link>
      <Link href="/register">
        <a>Register</a> {/* Link do strony rejestracji */}
      </Link>
      <Link href="/messenger">
        <a>Messenger</a> {/* Link do komponentu wiadomości */}
      </Link>
      <Link href="/profile">
        <a>Profile</a> {/* Link do profilu użytkownika */}
      </Link>
      <Link href="/">
        <a>Home</a> {/* Link do strony głównej */}
      </Link>

      {isSignedIn && user && (
        <div>
          <h3>Witaj, {user.firstName}!</h3> {/* Wyświetlanie imienia zalogowanego użytkownika */}
        </div>
      )}
    </div>
  );
};

export default App; // Eksport komponentu App
