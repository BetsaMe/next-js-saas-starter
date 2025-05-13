'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
// import { useActionState } from 'react';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
// import { Input } from '@/components/ui/input';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Loader2, PlusCircle } from 'lucide-react';

// type ActionState = {
//   error?: string;
//   success?: string;
// };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Mi suscripción</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

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
                Plan actual: {user?.planName || 'Sin suscripción activa'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.subscriptionStatus === 'active'
                  ? 'Facturado mensualmente'
                  : user?.subscriptionStatus === 'trialing'
                  ? 'Período de prueba'
                  : 'Sin suscripción activa'}
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

export default function AccountPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Tu cuenta</h1>
      <Suspense fallback={<SubscriptionSkeleton />}>
        <ManageSubscription />
      </Suspense>
    </section>
  );
}