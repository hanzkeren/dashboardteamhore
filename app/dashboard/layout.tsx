import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* --- SIDEBAR DESKTOP --- */}
      <div className="hidden md:block w-64 border-r bg-gray-100/40 dark:bg-gray-800/40 shrink-0">
        <Sidebar />
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 flex flex-col">
        {/* --- MOBILE HEADER --- */}
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="font-semibold">Teamhore</div>
        </header>

        {/* --- MAIN CONTENT WRAPPER (Update Disini) --- */}
        {/* Kita tambahkan p-4 md:p-8 disini biar SEMUA halaman otomatis rapi */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
