// /components/Menu.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import CollaborationLabel from './CollaborationLabel';

interface MenuProps {
  lang: string;
}

const Menu: React.FC<MenuProps> = () => {
  const params = useParams();
  const lang = params?.lang as string || 'pl';
  const t = useTranslations();

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: t.common.menu.home,
          href: "/",
          className: "menu-home",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/announcement.png",
          label: t.common.menu.announcements,
          href: "/list/announcements",
          className: "menu-announcements",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/calendar.png",
          label: t.common.menu.events,
          href: "/list/events",
          className: "menu-events",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/message.png",
          label: t.common.menu.messages,
          href: "/list/messages",
          className: "menu-messages",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/ToDoList.png",
          label: t.common.menu.todoList || "Lista Zadań",
          href: "/ToDoList",
          className: "menu-todo",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/exam.png",
          label: t.common.menu.library,
          href: "/library",
          className: "menu-library",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/files.png",
          label: t.common.menu.resources || "Resources",
          href: "/list/resources",
          className: "menu-resources",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/share.png",
          label: t.common.menu.shared || "Shared Files",
          href: "/list/share",
          className: "menu-sharedfiles",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/online-meeting.png",
          label: t.common.menu.videoCommunication || "Wideo Komunikacja",
          href: "/video-communication",
          className: "menu-video",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/calculator.png",
          label: t.common.menu.calculator,
          href: "/list/calculator",
          className: "menu-calculator",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/energy.png",
          label: t.common.menu.energy,
          href: "/list/energy",
          className: "menu-energy",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/finance.png",
          label: t.common.menu.financing,
          href: "/list/financing",
          // Dodaj klasę menu-financing dla przewodnika
          className: "menu-financing",
          visible: ["admin", "teacher", "student", "parent"],
        },
      ],
    }
  ];

  return (
    <div className="relative h-full">
      <div className="mt-4 text-sm">
        {menuItems.map((i) => (
          <div className="flex flex-col gap-2" key={i.title}>
            <span className="hidden lg:block text-gray-400 font-light my-4">
              {i.title}
            </span>
            {i.items.map((item) => (
              <Link
                href={`/${lang}${item.href}`}
                key={item.label}
                className={`${item.className} flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight`}
              >
                <Image src={item.icon} alt="" width={20} height={20} />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <CollaborationLabel />
    </div>
  );
};


export default Menu;