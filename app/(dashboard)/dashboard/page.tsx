"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { User } from "@/lib/db/schema";
import useSWR  from "swr";
import { Suspense } from "react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserArticles() {
  type ListingWithSeller = {
    id: number;
    createdAt: string; // o Date, según lo que te devuelva
    userId: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string | null;
    sellerName: string;
  };

  const { data: articles, error } = useSWR<ListingWithSeller[]>(
    "/api/user/listings",
    fetcher
  );



  if (error) return <div>Error al cargar artículos.</div>;
  if (!articles) return <div>Cargando tus artículos…</div>;
  if (articles.length === 0)
    return <div>No has publicado ningún artículo.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((item) => (
        <Link
          href={`/listings/${item.id}`}
          key={item.id}
          className="border p-4 rounded-xl shadow-md hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <p className="text-gray-600">€{item.price}</p>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="mt-2 w-full h-40 object-cover rounded"
            />
          )}
          <p className="text-sm text-gray-400 mt-1">
            Publicado por {item.sellerName || "usuario"}
          </p>
          <div className="flex justify-end my-2.5">

          </div>
        </Link>
      ))}
    </div>
  );
}

//Tarjeta de suscripcion de usuario
function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Tu suscripción</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: user } = useSWR<User>("/api/user", fetcher);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Tu Suscripción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Plan actual: {user?.planName || "Sin suscripción activa"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.subscriptionStatus === "active"
                  ? "Facturado mensualmente"
                  : user?.subscriptionStatus === "trialing"
                  ? "Período de prueba"
                  : "No tienes ningun plan activo"}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Gestionar suscripción
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

//Pagina completa
export default function AccountPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Tu cuenta</h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>
      <h2 className="text-lg font-medium mb-6"> Articulos Publicados </h2>
      <UserArticles />
    </section>
  );
}
