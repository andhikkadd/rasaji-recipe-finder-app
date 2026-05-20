import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import './InfoPageLayout.css';

interface InfoPageLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}

export function InfoPageLayout({ title, subtitle, children, wide = false }: InfoPageLayoutProps) {
  return (
    <div className="info-page-layout">
      <Navbar />
      <div className={`info-page-container ${wide ? 'wide-layout' : ''} animate-fade-in`}>
        {/* Page Hero Section */}
        {(title || subtitle) && (
          <section className="info-hero">
            {title && <h1 className="info-title">{title}</h1>}
            {subtitle && <p className="info-subtitle">{subtitle}</p>}
          </section>
        )}

        {/* Content Section */}
        <main className="info-content">
          {children}
        </main>
      </div>
    </div>
  );
}

