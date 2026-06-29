import { SkillDetailView } from "@/components/views/SkillDetailView";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SkillDetailView id={id} />;
}
