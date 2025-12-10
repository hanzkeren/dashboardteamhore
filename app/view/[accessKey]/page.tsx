import { redirect } from "next/navigation";

export default async function RedirectPage({ params }: { params: Promise<{ accessKey: string }> }) {
  const { accessKey } = await params;
  redirect(`/view/${accessKey}/overview`);
}
