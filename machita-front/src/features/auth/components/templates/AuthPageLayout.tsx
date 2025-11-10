import { PageHeader } from "@/shared/components/molecules/PageHeader";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <PageHeader title="Machtia" description="Aprende Náhuatl de forma interactiva" />
        {children}
      </div>
    </div>
  );
}
