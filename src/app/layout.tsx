import LogoSVG from '@/assets/talaryo';
import DefaultNavbar from '@/components/navbar';
import config from '@/config';
import metadataConfig from '@/config/metadata';
import { AnalyticsProvider } from '@/hooks/providers/AnalyticsProvider';
import { AppContextProvider } from '@/hooks/providers/AppProvider';
import AuthProvider from '@/hooks/providers/AuthProvider';
import ThemeProvider from '@/hooks/providers/ThemeProvider';
import UiProviders from '@/hooks/providers/UiProvider';
import { SocketContextProvider } from '@/hooks/providers/socketProvider';
import '@/styles/globals.css';
import cn from '@/utils/cn';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(metadataConfig.url),
  title: {
    default: metadataConfig.title,
    template: `%s | ${metadataConfig.title}`,
  },
  viewport: {
    interactiveWidget: 'overlays-content',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'auto',
  },
  description: metadataConfig.description,
  keywords: ['Recrutement', 'Recrutements', 'Candidat', 'Embauche', 'Trouver', 'Talaryo', 'outil', 'outil de recrutement'],
  robots: { index: false, follow: false },
  icons: {
    icon: metadataConfig.defaultIcon,
  },
  openGraph: {
    url: metadataConfig.url,
    title: metadataConfig.title,
    description: metadataConfig.description,
    siteName: metadataConfig.title,
    images: [metadataConfig.siteImg],
    type: 'website',
    locale: 'fr_FR',
  },
  // Shared link on twitter
  twitter: {
    card: 'summary_large_image',
    title: metadataConfig.title,
    description: metadataConfig.description,
    images: [metadataConfig.siteImg],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background no-scrollbar" suppressHydrationWarning>
      <body className={cn('no-scrollbar', inter.className)}>
        <main className="no-scrollbar hidden md:block">
          <AuthProvider>
            <AppContextProvider>
              <SocketContextProvider socketURI={config.SERVER_URI as string}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
                  <AnalyticsProvider>
                    <UiProviders>
                      <DefaultNavbar />
                      {children}
                      <Toaster />
                      <Script strategy="afterInteractive" src="//code.tidio.co/7sx8dzkfgrnet53ejdguulcuncclkue0.js" async />
                    </UiProviders>
                  </AnalyticsProvider>
                </ThemeProvider>
              </SocketContextProvider>
            </AppContextProvider>
          </AuthProvider>
        </main>
        <main className="flex w-full h-screen justify-center items-center flex-col md:hidden">
          <p className="mx-5 text-center md:mx-20 p-5 bg-content rounded-lg">
            Désolé, la taille de votre écran ne permet pas d&#39;afficher correctement notre site. Veuillez utiliser un appareil avec un écran plus
            grand pour une meilleure expérience.
          </p>
          <div className="w-2/5 md:w-36 mt-10">
            <LogoSVG className="stroke-secondary text-secondary fill-secondary" />
          </div>
        </main>
      </body>
    </html>
  );
}
