"use server";
export async function startPaymentAction(_fd: FormData) {
  void _fd;
  throw new Error("پرداخت آنلاین فعال نیست. لطفاً از کارت‌به‌کارت استفاده کنید.");
}
