'use client';

import { useUser } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Strona Główna",
        href: "/",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/student.png",
        label: "Użytkownicy",
        href: "/list/students",
        visible: ["ADMIN", "MANAGER"],
      },
      {
        icon: "/attendance.png",
        label: "Obecność",
        href: "/list/attendance",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/calendar.png",
        label: "Wydarzenia",
        href: "/list/events",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/exam.png",
        label: "Biblioteka",
        href: "/library",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/message.png",
        label: "Wiadomości",
        href: "/list/messages",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/announcement.png",
        label: "Ogłoszenia",
        href: "/list/announcements",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profil",
        href: "/profile",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/setting.png",
        label: "Ustawienia",
        href: "/settings",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
      {
        icon: "/logout.png",
        label: "Wyloguj",
        href: "/logout",
        visible: ["ADMIN", "MANAGER", "USER"],
      },
    ],
  },
];

const ClientMenu = () => {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    if (isLoaded && user) {
      setRole(user.role as string);
    }
  }, [user, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null; // Dodane aby uniknąć warning o braku return w map
          })}
        </div>
      ))}
    </div>
  );
};

export default ClientMenu;