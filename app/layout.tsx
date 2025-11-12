import type { Metadata } from "next";
import "./globals.css";
// Trigger initialization by importing the init route
// This ensures it loads when Next.js prepares the app, but doesn't block
// Use setTimeout to defer initialization until after server is ready
if (typeof window === 'undefined') {
  // Defer initialization to avoid blocking server startup
  setTimeout(() => {
    import('@/app/api/init/route').catch(() => {
      // Silently fail - initialization will happen when route is accessed
    });
  }, 5000); // Wait 5 seconds after server starts
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
