import type { Metadata } from 'next';
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import {ClerkProvider} from '@clerk/nextjs'
import { NotificationsProvider } from "./context/NotificationsContext";


// metadata
export const metadata: Metadata = {
  title: {
    //%s specific page title
    template: '%s | The Mommy Lounge',
    default: 'The Mommy Lounge',
  },
  description: "The Mommy Lounge is a website where moms can share tips, ideas, stories, and activities while building a sense of community with other moms.",
};

// layout
export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <ClerkProvider>
      <NotificationsProvider>
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
    </NotificationsProvider>
    </ClerkProvider>
  );
}
