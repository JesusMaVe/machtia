import { PageTitle } from "../atoms/PageTitle";
import { PageDescription } from "../atoms/PageDescription";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <PageTitle>{title}</PageTitle>
      <PageDescription>{description}</PageDescription>
    </div>
  );
}
