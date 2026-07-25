"use server";
import { redirect } from "next/navigation";
import { requireSession } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { createMockPayment } from "@/backend/services/payment.service";
import { text } from "@/backend/security/validation";
export async function startPaymentAction(fd:FormData){const s=await requireSession();const orderNumber=text(fd.get("orderNumber"),100);const order=await getPrisma().order.findFirst({where:{orderNumber,userId:s.userId}});if(!order)throw new Error("سفارش قابل پرداخت پیدا نشد.");const {redirectUrl}=await createMockPayment(order.id);redirect(redirectUrl)}
