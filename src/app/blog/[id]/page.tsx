import { notFound } from "next/navigation";
import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";
import { getBlogPost } from "@/src/lib/blog-posts";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  if (!getBlogPost(id)) {
    notFound();
  }

  return <ServiceShowcase service={getHospitalService("dental")} />;
}
