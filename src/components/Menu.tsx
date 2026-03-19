// /components/Menu.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import CollaborationLabel from './CollaborationLabel';
import { useUser } from "@/context/AuthContext";

interface MenuProps {
  lang: string;
}

const Menu: React.FC<MenuProps> = () => {
  const params = useParams();
  const lang = params?.lang as string || 'pl';
  const pathname = usePathname();
  const t = useTranslations();
  const { user } = useUser();
  const role = user?.role?.toLowerCase();

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: t.common.menu.home,
          href: "/",
          className: "menu-home",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/announcement.png",
          label: t.common.menu.announcements,
          href: "/list/announcements",
          className: "menu-announcements",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/calendar.png",
          label: t.common.menu.events,
          href: "/list/events",
          className: "menu-events",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/message.png",
          label: t.common.menu.messages,
          href: "/list/messages",
          className: "menu-messages",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/ToDoList.png",
          label: t.common.menu.todoList || "Lista Zadań",
          href: "/ToDoList",
          className: "menu-todo",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/exam.png",
          label: t.common.menu.library,
          href: "/library",
          className: "menu-library",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/files.png",
          label: t.common.menu.resources || "Resources",
          href: "/list/resources",
          className: "menu-resources",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/share.png",
          label: t.common.menu.shared || "Shared Files",
          href: "/list/share",
          className: "menu-sharedfiles",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/online-meeting.png",
          label: t.common.menu.videoCommunication || "Wideo Komunikacja",
          href: "/video-communication",
          className: "menu-video",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/calculator.png",
          label: t.common.menu.calculator,
          href: "/list/calculator",
          className: "menu-calculator",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/energy.png",
          label: t.common.menu.energy,
          href: "/list/energy",
          className: "menu-energy",
          visible: ["admin", "manager", "user"],
        },
        {
          icon: "/finance.png",
          label: t.common.menu.financing,
          href: "/list/financing",
          className: "menu-financing",
          visible: ["admin", "manager", "user"],
        },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          icon: "/teacher.png",
          label: "Teachers",
          href: "/list/teachers",
          className: "menu-teachers",
          visible: ["admin"],
        },
        {
          icon: "/student.png",
          label: "Students",
          href: "/list/students",
          className: "menu-students",
          visible: ["admin", "manager"],
        },
        {
          icon: "/parent.png",
          label: "Parents",
          href: "/list/parents",
          className: "menu-parents",
          visible: ["admin"],
        },
        {
          icon: "/setting.png",
          label: "Admins",
          href: "/list/admins",
          className: "menu-admins",
          visible: ["admin"],
        },
        {
          icon: "/subject.png",
          label: "Subjects",
          href: "/list/subjects",
          className: "menu-subjects",
          visible: ["admin"],
        },
        {
          icon: "/class.png",
          label: "Classes",
          href: "/list/classes",
          className: "menu-classes",
          visible: ["admin"],
        },
        {
          icon: "/lesson.png",
          label: "Lessons",
          href: "/list/lessons",
          className: "menu-lessons",
          visible: ["admin", "manager"],
        },
        {
          icon: "/exam.png",
          label: "Exams",
          href: "/list/exams",
          className: "menu-exams",
          visible: ["admin", "manager"],
        },
      ],
    },
  ];

  return (
    <div className="relative h-full">
      <nav className="mt-1 text-sm">
        {menuItems.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !role || item.visible.includes(role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-1">
              {/* Section Label */}
              <p className="hidden lg:block text-[10px] font-semibold uppercase tracking-widest px-4 pt-4 pb-1 letter-spacing-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>
                {section.title}
              </p>

              {/* Items */}
              <div className="flex flex-col gap-0.5 px-2">
                {visibleItems.map((item) => {
                  const fullHref = `/${lang}${item.href}`;
                  const isActive = pathname === fullHref ||
                    (item.href !== "/" && pathname?.startsWith(fullHref));

                  return (
                    <Link
                      href={fullHref}
                      key={item.label}
                      className={`
                        ${item.className}
                        flex items-center justify-center lg:justify-start gap-3
                        px-3 py-2 rounded-lg text-[14px] font-medium
                        transition-all duration-150
                        ${isActive
                          ? "text-indigo-300 shadow-[inset_3px_0_0_#6366f1]"
                          : "text-slate-400 hover:text-slate-200"
                        }
                      `}
                      style={isActive ? { background: 'rgba(99,102,241,0.12)' } : undefined}
                    >
                      <span
                        className={`flex-shrink-0 ${isActive ? "opacity-90" : "opacity-40"}`}
                        style={{ filter: 'brightness(0) invert(1)' }}
                      >
                        <Image src={item.icon} alt="" width={16} height={16} />
                      </span>
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <CollaborationLabel />
    </div>
  );
};


export default Menu;
