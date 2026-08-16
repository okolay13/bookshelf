import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Книжная полка",
  description: "Уютная книжная полка — храните и отслеживайте свои книги",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="roughen">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" result="noise" seed="7" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div className="app-bg-root flex-1 flex flex-col">
          <div className="app-content flex-1 flex flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
