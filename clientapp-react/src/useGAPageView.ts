import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 pageview tracking for SPA

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function useGAPageView() {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
}
