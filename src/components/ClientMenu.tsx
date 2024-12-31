'use client';

import { useUser } from "@clerk/nextjs";
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
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/student.png",
        label: "Użytkownicy",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/attendance.png",
        label: "Obecność",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Wydarzenia",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/exam.png",
        label: "Biblioteka",
        href: "/library",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Wiadomości",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Ogłoszenia",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
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
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Ustawienia",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Wyloguj",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const ClientMenu = () => {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    if (isLoaded && user) {
      setRole(user.publicMetadata.role as string);
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