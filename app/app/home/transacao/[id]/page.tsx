import { TransactionDetailPage } from "@/pwa/modules/home/pages/TransactionDetailPage";

export default async function TransacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionDetailPage transactionId={id} owner="gabriel" />;
}
