'use server';

import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { listings } from '@/lib/db/schema';
import { redirect } from 'next/navigation';

export async function createListing(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: 'Debes iniciar sesión.' };

  if (user.planName === 'null') {
    return { error: 'Necesitas una suscripción activa para publicar.' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string, 10);
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !description || isNaN(price)) {
    return { error: 'Campos inválidos.' };
  }

  await db.insert(listings).values({
    userId: user.id,
    title,
    description,
    price,
    imageUrl,
  });

  redirect('/');
}
