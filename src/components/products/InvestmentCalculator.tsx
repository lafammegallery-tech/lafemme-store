"use client";

import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { formatMoney, moneyToPersianWords } from "@/lib/format-money";

interface InvestmentCalculatorProps {
  productPrice: number;
  productWeight: number;
  metalLabel: string;
}

/** ماشین حساب ساده برای برآورد تعداد قابل خرید و سناریوی تغییر ارزش. */
export function InvestmentCalculator({ productPrice, productWeight, metalLabel }: InvestmentCalculatorProps) {
  const [budget, setBudget] = useState(productPrice);
  const [changePercent, setChangePercent] = useState(10);

  const result = useMemo(() => {
    const safeBudget = Math.max(0, Number(budget) || 0);
    const quantity = productPrice > 0 ? Math.floor(safeBudget / productPrice) : 0;
    const invested = quantity * productPrice;
    const totalWeight = quantity * productWeight;
    const projectedValue = invested * (1 + changePercent / 100);
    return { quantity, invested, totalWeight, projectedValue, difference: projectedValue - invested };
  }, [budget, changePercent, productPrice, productWeight]);

  return (
    <section className="investment-calculator" aria-labelledby="investment-calculator-title">
      <div className="investment-calculator__head">
        <div>
          <span>ابزار تصمیم‌گیری</span>
          <h2 id="investment-calculator-title">ماشین حساب سرمایه‌گذاری</h2>
        </div>
        <p>این محاسبه صرفاً تخمینی است و تضمین سود محسوب نمی‌شود.</p>
      </div>
      <div className="investment-calculator__inputs">
        <label>
          بودجه شما (تومان)
          <MoneyInput value={budget} onValueChange={value => setBudget(Number(value) || 0)} aria-describedby="product-budget-words" />
          <small id="product-budget-words" aria-live="polite">{moneyToPersianWords(budget)}</small>
        </label>
        <label>
          سناریوی تغییر قیمت (%)
          <input type="number" min={-90} max={500} step={1} value={changePercent} onChange={(event) => setChangePercent(Number(event.target.value))} />
        </label>
      </div>
      <div className="investment-calculator__results">
        <div><span>تعداد قابل خرید</span><strong>{result.quantity.toLocaleString("fa-IR")} عدد</strong></div>
        <div><span>وزن کل {metalLabel}</span><strong>{result.totalWeight.toLocaleString("fa-IR")} گرم</strong></div>
        <div><span>مبلغ سرمایه‌گذاری</span><strong>{formatMoney(result.invested)} تومان</strong></div>
        <div><span>ارزش در سناریوی انتخابی</span><strong>{formatMoney(result.projectedValue)} تومان</strong></div>
        <div className={result.difference >= 0 ? "is-positive" : "is-negative"}><span>تغییر تخمینی</span><strong>{formatMoney(result.difference)} تومان</strong></div>
      </div>
    </section>
  );
}
