import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import './PageLayout.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link home-link">
            Rasaji
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            <span className="breadcrumb-separator">›</span>
            {item.path ? (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current" title={item.label}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header-block">
      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
    </header>
  );
}

interface PageShellProps {
  children: ReactNode;
  breadcrumbItems: BreadcrumbItem[];
  title: string;
  subtitle?: string;
}

export function PageShell({ children, breadcrumbItems, title, subtitle }: PageShellProps) {
  return (
    <div className="page-layout-wrapper">
      <Navbar />
      <main className="page-shell animate-fade-in">
        <Breadcrumb items={breadcrumbItems} />
        <PageHeader title={title} subtitle={subtitle} />
        <div className="page-shell-content">
          {children}
        </div>
      </main>
    </div>
  );
}
