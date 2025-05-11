'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createListing } from './actions'; // la definimos enseguida
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function NewListingPage() {
  const [formState, setFormState] = useState({ error: '', success: '' });
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createListing(formData);
    if (result?.error) {
      setFormState({ error: result.error, success: '' });
    } else {
      router.push('/');
    }
  };

  return (
    <form action={handleSubmit} className="max-w-md p-6 mx-auto space-y-4">
      <h1 className="text-xl font-semibold mb-4">Crear nuevo producto</h1>

      <Input name="title" placeholder="Título" required />
      <Textarea name="description" placeholder="Descripción" required />
      <Input type="number" name="price" placeholder="Precio (€)" required />
      <Input type="url" name="imageUrl" placeholder="URL de la imagen (opcional)" />

      {formState.error && <p className="text-red-500">{formState.error}</p>}

      <Button type="submit" className="bg-orange-500 text-white w-full">Publicar</Button>
    </form>
  );
}
