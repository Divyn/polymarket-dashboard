import type { Metadata } from "next";
import "./globals.css";
// Trigger initialization by importing the init route
// This ensures it loads when Next.js prepares the app, but doesn't block
if (typeof window === 'undefined') {
  // Import the init route module - it will auto-initialize when loaded
  // Use dynamic import to avoid blocking
  import('@/app/api/init/route').catch(() => {
    // Silently fail - initialization will happen when route is accessed
  });
}

export const metadata: Metadata = {
  title: "Polymarket Dashboard",
  description: "Latest Polymarket markets and trades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
