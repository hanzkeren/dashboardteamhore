"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileBarChart,
  Wallet,
  Calendar as CalendarIcon,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function PublicClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const accessKey = params.accessKey as string;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State Date Filter
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Date Change -> Push ke URL
  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from) {
      const params = new URLSearchParams(searchParams);
      params.set("from", format(newDate.from, "yyyy-MM-dd"));
      if (newDate.to) {
        params.set("to", format(newDate.to, "yyyy-MM-dd"));
      } else {
        params.delete("to");
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const menuItems = [
    {
      title: "Overview",
      href: `/view/${accessKey}/overview`,
      icon: LayoutDashboard,
    },
    {
      title: "Reports",
      href: `/view/${accessKey}/reports`,
      icon: FileBarChart,
    },
    {
      title: "Budgets",
      href: `/view/${accessKey}/budgets`,
      icon: Wallet,
    },
  ];

  const queryString = searchParams.toString();
  const buildHref = (href: string) => (queryString ? `${href}?${queryString}` : href);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6 h-16 border-b flex items-center">
        <h2 className="text-xl font-bold tracking-tight text-primary">Teamhore</h2>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={buildHref(item.href)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER with mobile toggle */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="sr-only">Navigasi</SheetTitle>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg">Client Dashboard</h1>
          </div>

          {/* DATE PICKER */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] md:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
