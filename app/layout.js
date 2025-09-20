import './globals.css';
import { JourneyProvider } from './providers/JourneyProvider.jsx';
import GlobalHeader from './components/GlobalHeader';

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
      <body className="use-roobert min-h-screen flex flex-col">
        <JourneyProvider>
          <GlobalHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          {/* Footer guidelines only on camera capture for now: conditional handled inside pages if they add the component directly; keeping global simple */}
        </JourneyProvider>
      </body>
    </html>
  );
}

