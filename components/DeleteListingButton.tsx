'use client';

import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface Props { listingId: number }

export function DeleteListingButton({ listingId }: Props) {
  const { mutate } = useSWRConfig();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('¿Seguro que quieres borrar este artículo?')) return;

    const res = await fetch(`/api/user/listings/${listingId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      alert('Error borrando el artículo');
      return;
    }

    // 1) Refresca la lista en el dashboard  
    mutate('/api/user/listings');
    // 2) Regresa al dashboard  
    router.push('/dashboard');
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      className="flex items-center"
    >
      <Trash className="mr-2" /> Eliminar
    </Button>
  );
}
