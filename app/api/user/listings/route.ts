import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getListingsByUser } from '@/lib/db/queries';

export async function GET() {
  // 1) Obtén la sesión del usuario
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 2) Trae solo los listings de este userId
  const listings = await getListingsByUser(session.user.id);

  // 3) Devuelve la lista
  return NextResponse.json(listings);
}
