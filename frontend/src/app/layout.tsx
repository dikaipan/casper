import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Inter font dengan optimasi untuk readability
const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Menampilkan fallback font sambil menunggu Inter dimuat
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: "HITACHI Cassette Management",
  description: "Sistem manajemen cassette AC Hitachi yang terintegrasi untuk memudahkan tracking, maintenance, dan pelaporan inventori Anda",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ fontSize: '16px', zoom: 1, width: '100%', height: '100%' }}>
      <body className={`${inter.className} antialiased`} style={{ fontSize: '16px', zoom: 1, transform: 'scale(1)', width: '100%', maxWidth: '100vw', overflowX: 'hidden', margin: 0, padding: 0 }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Force viewport meta tag
                var viewport = document.querySelector('meta[name="viewport"]');
                if (!viewport) {
                  viewport = document.createElement('meta');
                  viewport.name = 'viewport';
                  document.head.appendChild(viewport);
                }
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                
                // Prevent zoom on double tap
                var lastTouchEnd = 0;
                document.addEventListener('touchend', function(event) {
                  var now = Date.now();
                  if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                  }
                  lastTouchEnd = now;
                }, false);
                
                // Force font size
                document.documentElement.style.fontSize = '16px';
                document.body.style.fontSize = '16px';
                document.documentElement.style.zoom = '1';
                document.body.style.zoom = '1';
              })();
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

