import type { Metadata, Viewport } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'ProjectSync — Final-Year Project Workspace',
  description:
    'Manage your final-year project: group registration, mentor preferences, topic approval, milestones, and more.',
  generator: 'ProjectSync',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070d18' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon — inline SVG ProjectSync logo */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%2314b8a6'/%3E%3Cstop offset='1' stop-color='%230f766e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='16' fill='url(%23g)'/%3E%3Cpath d='M20 18v28M20 46c0-11 8-16 17-16 7 0 9-5 9-12' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='18' r='6' fill='%230f766e' stroke='white' stroke-width='4'/%3E%3Ccircle cx='46' cy='18' r='6' fill='%230f766e' stroke='white' stroke-width='4'/%3E%3Ccircle cx='20' cy='46' r='6' fill='%230f766e' stroke='white' stroke-width='4'/%3E%3C/svg%3E"
        />
        {/* Google Fonts — Inter (body) + Plus Jakarta Sans (display/headings) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
