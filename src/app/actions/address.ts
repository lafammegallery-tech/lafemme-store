"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/backend/auth/session";
import { getPrisma } from "@/backend/database/prisma";
import { phone, text } from "@/backend/security/validation";
export async function createAddressAction(fd:FormData){const s=await requireSession();const p=getPrisma();const isDefault=fd.get("isDefault")==="on";if(isDefault)await p.address.updateMany({where:{userId:s.userId},data:{isDefault:false}});await p.address.create({data:{userId:s.userId,title:text(fd.get("title")),recipient:text(fd.get("recipient")),phone:phone(fd.get("phone")),province:text(fd.get("province")),city:text(fd.get("city")),postalCode:text(fd.get("postalCode"),20)||null,addressLine:text(fd.get("addressLine"),500),plaque:text(fd.get("plaque"),20)||null,unit:text(fd.get("unit"),20)||null,isDefault}});revalidatePath('/addresses')}
export async function deleteAddressAction(fd:FormData){const s=await requireSession();await getPrisma().address.updateMany({where:{id:text(fd.get("id"),100),userId:s.userId},data:{deletedAt:new Date(),isDefault:false}});revalidatePath('/addresses')}
