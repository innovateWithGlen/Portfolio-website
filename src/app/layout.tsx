import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import portfolioData from '@/data/portfolio.json';
import type { PortfolioData } from '@/data/types';
import './globals.css';

const { ui } = portfolioData as PortfolioData;
const title = 'Glen Monteiro — Web & Mobile App Developer';
const description = 'Glen Monteiro builds web and mobile apps, custom CRM systems, e-commerce websites, and digital visibility strategies for businesses.';
const socialPortrait = ui.portrait?.src ?? '/images/glen-portrait.jpg';

export const metadata: Metadata = {
  metadataBase: new URL('https://glenmonteiro.dev'),
  title: { default: title, template: '%s | Glen Monteiro' },
  description,
  alternates: { canonical: '/' },
  keywords: [
    'Glen Monteiro',
    'full stack developer',
    'web and mobile app developer',
    'MERN developer Bengaluru',
    'custom CRM development',
    'management systems',
    'e-commerce website developer',
    'SEO GEO AEO specialist',
    'NFC QR Google reviews cards',
  ],
  authors: [{ name: ui.name, url: ui.linkedin }],
  creator: ui.name,
  openGraph: {
    type: 'website',
    url: 'https://glenmonteiro.dev',
    title,
    description,
    siteName: ui.name,
    images: [{ url: socialPortrait, alt: `${ui.name} portrait` }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [socialPortrait] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#030304',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${ui.name} — Web & Mobile App Developer`,
    url: 'https://glenmonteiro.dev',
    image: socialPortrait,
    description,
    email: ui.email,
    sameAs: [ui.linkedin, ui.bookingUrl],
    founder: {
      '@type': 'Person',
      name: ui.name,
      jobTitle: ui.role,
      alumniOf: ui.education.institution,
      sameAs: [ui.linkedin],
    },
    areaServed: 'Worldwide',
    priceRange: '$$',
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
