import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Open_Sans } from 'next/font/google'
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'Airbhub market',
  description: 'Marketplace de suministros para la aviacion'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-open-sans',   // opcional, para usarlo como CSS variable
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${openSans.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
           
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
