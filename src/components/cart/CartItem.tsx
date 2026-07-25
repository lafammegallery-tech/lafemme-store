import Image from "next/image";
import Link from "next/link";
import type { CartItemData } from "@/types/cart";
import { removeCartItemAction, updateCartItemAction } from "@/app/actions/cart";
export function CartItem({ item }: { item: CartItemData }) {
  return <div className="cart-item">
    <Link href={`/products/${item.productId}`} className="cart-item-image"><Image src={item.image} alt={item.title} width={100} height={100} sizes="100px" /></Link>
    <div className="cart-item-info"><Link href={`/products/${item.productId}`}><h3>{item.title}</h3></Link>{item.variant && <span className="cart-item-variant">{item.variant}</span>}<p className="cart-item-unit-price">{new Intl.NumberFormat("fa-IR").format(item.price)} تومان</p></div>
    <form action={updateCartItemAction} className="cart-item-quantity"><input type="hidden" name="itemId" value={item.id} /><label htmlFor={`qty-${item.id}`}>تعداد</label><input id={`qty-${item.id}`} className="input" name="quantity" type="number" min="0" max="99" defaultValue={item.quantity} /><button className="btn btn-secondary" type="submit">به‌روزرسانی</button></form>
    <div className="cart-item-total"><span>جمع</span><strong>{new Intl.NumberFormat("fa-IR").format(item.price * item.quantity)} تومان</strong><form action={removeCartItemAction}><input type="hidden" name="itemId" value={item.id} /><button className="btn btn-link" type="submit">حذف</button></form></div>
  </div>;
}
