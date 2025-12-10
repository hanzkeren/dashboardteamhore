"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  BarChart,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      href: "/dashboard/clients", // Sesuaikan route kamu
      icon: Users,
    },
    {
      title: "Budgets",
      href: "/dashboard/budgets", // Sesuaikan route kamu
      icon: Wallet,
    },
    {
      title: "Reports",
      href: "/dashboard/reports", // Sesuaikan route kamu
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics", // Sesuaikan route kamu
      icon: BarChart,
    },
  ];

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Teamhore
          </h2>
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === item.href // Highlight jika aktif
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "w-full justify-start"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
