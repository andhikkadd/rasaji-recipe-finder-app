import './NavbarBreadcrumb.css';

interface NavbarBreadcrumbProps {
  label: string;
}

export function NavbarBreadcrumb({ label }: NavbarBreadcrumbProps) {
  return (
    <div className="navbar-breadcrumb-trail animate-fade-in">
      <span className="navbar-breadcrumb-separator">/</span>
      <span className="navbar-breadcrumb-current" title={label}>
        {label}
      </span>
    </div>
  );
}
