'use client';

import config from '@/config';
import { ClientException } from '@/exceptions';
import {
  ContextProviderProps,
  GAaction,
  GoogleAnalyticValues,
} from '@/interfaces/providers';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

import { useReportWebVitals } from 'next/web-vitals';
import { createContext, useCallback, useContext, useEffect } from 'react';

const AnalyticsContext = createContext<GoogleAnalyticValues>(null);

export const AnalyticsProvider = ({ children }: ContextProviderProps) => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', config.gaId, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  useReportWebVitals((metric) => {
    if (typeof window !== 'undefined' && window?.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: `stats : ${metric.rating}`,
        value: Math.round(metric.value),
      });
    }
  });

  const trackGAEvent = useCallback(
    (
      category: GAaction,
      action: string,
      label: string,
      value: number,
      callback?: () => void,
    ) => {
      if (typeof window !== 'undefined' && window?.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          event_callback: callback,
        });
      }
    },
    [],
  );

  return (
    <AnalyticsContext.Provider value={{ trackGAEvent }}>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${config.gaId}');
      `}
      </Script>
      <Script id="hotjar-init" strategy="afterInteractive">
        {`
         (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${config.hotjarId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
      </Script>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new ClientException(
      404,
      'useAnalyticsContext must be used within an AnalyticsContextProvider',
    );
  }
  return context;
}
