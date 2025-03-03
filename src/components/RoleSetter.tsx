"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function RoleSetter() {
  const { user, isLoaded } = useUser();
  const [isSettingRole, setIsSettingRole] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata.role;
      
      if (!userRole) {
        setIsSettingRole(true);
        setMessage("Role not set, setting default student role...");
        
        // Ustaw rolę student
        user.update({
          publicMetadata: { role: "student" },
        }).then(() => {
          setMessage("Role set successfully. Refreshing page...");
          // Odśwież stronę po 2 sekundach
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }).catch((error) => {
          setMessage(`Error setting role: ${error.message}`);
        }).finally(() => {
          setIsSettingRole(false);
        });
      }
    }
  }, [isLoaded, user]);

  // Jeśli nie ustawiamy roli, nie renderuj nic
  if (!isSettingRole) return null;

  // Renderuj komunikat o ustawianiu roli
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-2 text-center z-50">
      {message}
    </div>
  );
}