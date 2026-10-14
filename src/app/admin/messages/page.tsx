import { requireAdmin } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
export const dynamic = "force-dynamic";
export default async function MessagesPage() {
  await requireAdmin("/admin/messages");
  const messages = await getPrisma().contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <main className="container py-12"><h1>پیام‌های تماس</h1><p>۱۰۰ پیام اخیر</p>{messages.map((message) => <article key={message.id} className="border p-4 my-4"><h2>{message.name}</h2><p dir="ltr">{message.email}</p><p>{message.createdAt.toLocaleString("fa-IR")}</p><p className="whitespace-pre-wrap">{message.message}</p></article>)}</main>;
}
