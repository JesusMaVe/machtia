interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTitle({ children, className = "" }: PageTitleProps) {
  return <h1 className={`text-4xl font-bold text-primary mb-2 ${className}`}>{children}</h1>;
}
