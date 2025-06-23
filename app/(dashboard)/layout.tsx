"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Home, LogOut, CirclePlus } from "lucide-react";
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
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate("/api/user"); // 🔁 fuerza la recarga del dato user
    router.refresh(); // 🔄 refresca la ruta actual
    router.push("/"); // 🚀 redirige al home
  }

  // Ruta dinámica para publicar
  const publishHref = user ? "/listings/new" : "/sign-up";

  return (
    <>
      <Button
        asChild
        variant={user ? "default" : "outline"}
        className={!user ? "border-primary text-black" : ""}
      >
        <Link href={publishHref}>
          <CirclePlus className="w-5 h-5" />
          Publicar artículo
        </Link>
      </Button>

      {/* Si no hay usuario, mostramos Sign Up; si hay, el avatar con dropdown */}
      {!user ? (
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      ) : (
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
      )}
    </>
  ); 
}

function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <CircleIcon className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              AIRhub market
            </span>
          </Link>
          <Link className="text-base font-semibold mx-8" href="/">
            Listing
          </Link>
          <Link className="text-base font-semibold mr-8" href="/">
            Technical Library
          </Link>
          <Link className="text-base font-semibold mr-8" href="/">
            Blog
          </Link>
          <Link className="text-base font-semibold mr-8" href="/pricing">
            Pricing
          </Link>
          <Link className="text-base font-semibold mr-8" href="/">
            Contact
          </Link>
        </div>

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
