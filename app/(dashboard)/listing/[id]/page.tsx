import { getListingById } from "@/lib/db/queries";
import { getSession }      from '@/lib/auth/session';
import { notFound, redirect } from 'next/navigation';
import { DeleteListingButton } from "@/components/DeleteListingButton"; // ← nuevo

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 1) Parse and validate ID
  const { id } = await params;
  const listingId = Number(id);
  if (isNaN(listingId)) {
    notFound();
  }

 // Fetch listing + session en el servidor
  const [listing, session] = await Promise.all([
    getListingById(listingId),
    getSession()
  ]);

  if (!listing) notFound();
  if (!session?.user) {
    // redirige o muestra sin el botón
    redirect('/sign-in');
  }

  const isOwner = listing.userId === session.user.id;

  return (
    <section className="flex flex-col items-start mx-auto w-[70vw] max-w-6xl p-4 lg:p-8 gap-8">
      {/* Imagen */}
      {listing.imageUrl && (
        <div className="w-full">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-[400px] object-contain rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Detalles */}
      <div className="w-full space-y-4">
        <p className="text-2xl font-semibold">€{listing.price}</p>
        <h1 className="text-xl font-bold">{listing.title}</h1>
        <p className="text-gray-700">{listing.description}</p>

        {/* Botones de acción */}
        <div className="flex space-x-4 mt-6">
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            tu dashboard
          </a>
            {isOwner && (
          // Solo el propietario ve este botón
          <DeleteListingButton listingId={listing.id} />
        )}
        </div>
      </div>
    </section>
  );
}
