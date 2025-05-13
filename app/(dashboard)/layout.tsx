"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Home, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/(login)/actions";
import { useRouter } from "next/navigation";
import { User } from "@/lib/db/schema";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  // console.log("🧪 user:", user);

  const router = useRouter();
  async function handleSignOut() {
    await signOut();
    mutate("/api/user"); // 🔁 fuerza la recarga del dato user
    router.refresh(); // 🔄 refresca la ruta actual
    router.push("/"); // 🚀 redirige al home
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <>
     {["active", "trialing"].includes(user.subscriptionStatus || "") && (
        <Button
          asChild
          className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Link href="/listing/new">Publicar articulo</Link>
        </Button>
      )}

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer size-9">
            <AvatarImage alt={user.name || ""} />
            <AvatarFallback>
              {user.email
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="w-full flex-1 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ); // ✅ el cierre correcto
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            AIRhub market
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      {children}
    </section>
  );
}
