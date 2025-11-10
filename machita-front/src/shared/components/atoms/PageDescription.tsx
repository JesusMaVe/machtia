interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageDescription({ children, className = "" }: PageDescriptionProps) {
  return <p className={`text-muted-foreground ${className}`}>{children}</p>;
}
