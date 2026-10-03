'use client';

import { getCalApi } from '@calcom/embed-react';
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

const NAMESPACE = 'glen-booking';

type CalModalOptions = {
  calLink: string;
  calOrigin?: string;
  config?: Record<string, string>;
};

type CalUiOptions = {
  theme: 'dark' | 'light';
  colorScheme: 'dark' | 'light';
  hideEventTypeDetails?: boolean;
  layout?: string;
  styles?: { body?: { background?: string } };
};

type CalInstance = {
  (action: 'modal', options: CalModalOptions): void;
  (action: 'ui', options: CalUiOptions): void;
};

let calPromise: Promise<CalInstance> | null = null;

function loadCal(): Promise<CalInstance> {
  if (!calPromise) {
    calPromise = getCalApi({ namespace: NAMESPACE }).then((cal) => {
      const withNamespaces = cal as unknown as { ns?: Record<string, CalInstance> };
      return withNamespaces.ns?.[NAMESPACE] ?? (cal as unknown as CalInstance);
    });
    calPromise.catch(() => {
      calPromise = null;
    });
  }
  return calPromise;
}

function parseBookingUrl(bookingUrl: string) {
  try {
    const url = new URL(bookingUrl);
    const calLink = url.pathname.replace(/^\/+|\/+$/g, '');
    if (!calLink) return null;
    return { calLink, origin: url.origin };
  } catch {
    return null;
  }
}

type BookCallButtonProps = {
  bookingUrl: string;
  theme?: 'dark' | 'light';
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
};

export default function BookCallButton({ bookingUrl, theme = 'dark', className, children, onOpen }: BookCallButtonProps) {
  const calRef = useRef<CalInstance | null>(null);

  useEffect(() => {
    let active = true;
    loadCal()
      .then((cal) => {
        if (active) calRef.current = cal;
      })
      .catch(() => {
        calRef.current = null;
      });
    return () => {
      active = false;
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onOpen?.();
    const cal = calRef.current;
    const parsed = parseBookingUrl(bookingUrl);
    // If the embed has not loaded yet, the link opens Cal.com in a new tab.
    if (!cal || !parsed || event.metaKey || event.ctrlKey || event.shiftKey) return;

    event.preventDefault();
    document.documentElement.style.colorScheme = theme;
    document.body.style.colorScheme = theme;
    cal('ui', {
      theme,
      colorScheme: theme,
      hideEventTypeDetails: false,
      layout: 'month_view',
      styles: { body: { background: 'transparent' } },
    });
    cal('modal', {
      calLink: parsed.calLink,
      calOrigin: parsed.origin,
      config: { layout: 'month_view', theme },
    });
  };

  return (
    <a className={className} href={bookingUrl} target="_blank" rel="noreferrer" onClick={handleClick}>
      {children}
    </a>
  );
}
