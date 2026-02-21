import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { PayPalProvider } from "@/components/providers/PayPalProvider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "L'Essence | Fine Dining & Online Ordering",
  description: "Experience the art of culinary excellence. Order online for curated pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} font-sans bg-white`}>
        <PayPalProvider>
          <nav className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-white">L'Essence</h1>
              </div>
              <div className="hidden md:flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em]">
                <a href="/" className="hover:text-brand-200 transition-colors">The Menu</a>
                <a href="/admin" className="hover:text-brand-200 transition-colors">Concierge</a>
              </div>
            </div>
          </nav>
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-brand-900 text-brand-100 py-20">
            <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                <h2 className="text-2xl font-serif">L'Essence</h2>
                <p className="text-sm font-light leading-relaxed opacity-60">
                  A culinary journey through the seasons, celebrating the purity of local ingredients and the art of fine dining.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Location</h3>
                <p className="text-sm font-light opacity-60">123 Culinary Avenue<br />Fine City, FC 45678</p>
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Hours</h3>
                <p className="text-sm font-light opacity-60">Tue - Sun: 5:00 PM - 11:00 PM<br />Monday: Closed</p>
              </div>
            </div>
          </footer>
        </PayPalProvider>
      </body>
    </html>
  );
}
