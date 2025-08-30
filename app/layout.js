import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Skinstric',
  description: 'Skinstric Next.js application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
  <body className="use-roobert">{children}</body>
    </html>
  );
}
