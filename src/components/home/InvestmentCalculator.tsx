"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { MAX_INVESTMENT_BUDGET, parseInvestmentBudget } from "@/lib/investment-planner";
import type { InvestmentMode, InvestmentPlan } from "@/lib/investment-planner";
import styles from "./InvestmentCalculator.module.css";

const money = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const weight = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 });
const modes: Array<{ value: InvestmentMode; label: string; symbol: string }> = [
  { value: "gold", label: "فقط طلا", symbol: "Au" },
  { value: "silver", label: "فقط نقره", symbol: "Ag" },
  { value: "mixed", label: "طلا و نقره", symbol: "Au + Ag" },
];

export function InvestmentCalculator() {
  const [budget, setBudget] = useState("");
  const [mode, setMode] = useState<InvestmentMode>("mixed");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<InvestmentPlan[] | null>(null);
  const [message, setMessage] = useState("");
  const [calculatedAt, setCalculatedAt] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  function resetResults() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setPlans(null);
    setMessage("");
  }

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetResults();
    const amount = parseInvestmentBudget(budget);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_INVESTMENT_BUDGET) {
      setMessage("مبلغی بیشتر از صفر و حداکثر ۱٬۰۰۰ میلیارد تومان، بدون اعشار وارد کنید.");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    try {
      const response = await fetch("/api/investment-planner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: amount, mode }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "محاسبه انجام نشد؛ دوباره تلاش کنید.");
      if (controller.signal.aborted) return;
      setPlans(data.plans);
      setCalculatedAt(data.calculatedAt);
      setMessage(data.message ? `${data.message}${data.minimum ? ` حداقل بودجه: ${money.format(data.minimum)} تومان.` : ""}` : "");
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "ارتباط برقرار نشد؛ دوباره تلاش کنید.");
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }

  return (
    <section className={styles.section} id="investment-calculator" aria-labelledby="investment-title">
      <Container>
        <div className={styles.shell}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}><span aria-hidden="true">✦</span> هر بودجه، یک انتخاب سنجیده</span>
            <h2 id="investment-title">بودجه از شما،<br /><span>پیشنهاد از ما.</span></h2>
            <p>مبلغ موردنظرتان را وارد کنید؛ ترکیب‌های قابل خرید از شمش‌های موجود را با قیمت روز و دلیل هر انتخاب ببینید.</p>
            <div className={styles.steps} aria-label="مراحل انتخاب">
              <span><b>۰۱</b> تعیین بودجه</span><i aria-hidden="true" /><span><b>۰۲</b> مقایسهٔ پیشنهادها</span>
            </div>
            <div className={styles.metalArt} aria-hidden="true"><div>Au<small>GOLD</small></div><div>Ag<small>SILVER</small></div></div>
          </div>
          <form onSubmit={calculate} className={styles.form}>
            <div className={styles.formHeading}><span aria-hidden="true">↗</span><div><h3>راهنمای انتخاب شمش</h3><p>یک قدم نزدیک‌تر به انتخاب شما</p></div></div>
            <label htmlFor="investment-budget" className={styles.label}>چقدر برای خرید در نظر دارید؟</label>
            <div className={styles.budgetField}>
              <input id="investment-budget" name="budget" type="text" inputMode="numeric" autoComplete="off"
                placeholder="مثلاً ۱۰۰٬۰۰۰٬۰۰۰" value={budget} maxLength={24} aria-describedby="investment-budget-hint"
                onChange={event => { resetResults(); setBudget(event.target.value); }} />
              <span>تومان</span>
            </div>
            <p id="investment-budget-hint" className={styles.hint}>مبلغ را به تومان وارد کنید، نه ریال.</p>
            <div className={styles.presets} aria-label="بودجه‌های نمونه">
              {[50, 100, 250].map(value => <button key={value} type="button" onClick={() => { resetResults(); setBudget(money.format(value * 1_000_000)); }}>{money.format(value)} میلیون</button>)}
            </div>
            <fieldset className={styles.modeField}><legend>چه فلزی را ترجیح می‌دهید؟</legend>
              <div className={styles.modes}>{modes.map(option => <label key={option.value} className={`${styles.mode} ${mode === option.value ? styles.selected : ""}`}>
                <input type="radio" name="investment-mode" value={option.value} checked={mode === option.value} onChange={() => { resetResults(); setMode(option.value); }} />
                <span className={styles.symbol} aria-hidden="true">{option.symbol}</span><span>{option.label}</span>
              </label>)}</div>
            </fieldset>
            <button type="submit" className={styles.submit} disabled={loading}>{loading ? "در حال بررسی قیمت و موجودی…" : "پیشنهادهای من را پیدا کن"}<span aria-hidden="true">←</span></button>
            <p className={styles.formNote}>بر اساس موجودی واقعی و قیمت معتبر هنگام محاسبه</p>
          </form>
        </div>

        <div aria-live="polite" aria-atomic="false" aria-busy={loading}>
          {message && <p className={styles.message} role="status">{message}</p>}
          {!!plans?.length && <div className={styles.results}>
            <div className={styles.resultsHeading}><div><span className={styles.eyebrow}>انتخاب‌های پیش روی شما</span><h3>{money.format(plans.length)} پیشنهاد برای بودجهٔ شما</h3></div><p>محاسبه در {new Date(calculatedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })} · قیمت نهایی در سبد بررسی می‌شود</p></div>
            <div className={styles.planGrid}>{plans.map((plan, index) => <article key={plan.key} className={styles.plan}>
              <div className={styles.planHeading}><span className={styles.planNumber}>{money.format(index + 1).padStart(2, "۰")}</span><h4>{plan.title}</h4><span className={styles.pieces}>{money.format(plan.count)} قطعه</span></div>
              <ul className={styles.products}>{plan.items.map(({ product, quantity }) => <li key={product.id}>
                <Link href={product.href} className={styles.productLink}>
                  <span className={styles.image}><Image src={product.imageSrc} alt="" width={56} height={64} unoptimized /></span>
                  <span className={styles.productInfo}><strong>{product.name}</strong><small>{money.format(quantity)} عدد × {money.format(product.price)} تومان</small></span><span aria-hidden="true" className={styles.productArrow}>↖</span>
                </Link>
              </li>)}</ul>
              <div className={styles.weights}>{plan.goldWeight > 0 && <span><i className={styles.goldDot} />طلا <b>{weight.format(plan.goldWeight)} گرم</b></span>}{plan.silverWeight > 0 && <span><i className={styles.silverDot} />نقره <b>{weight.format(plan.silverWeight)} گرم</b></span>}</div>
              <div className={styles.totals}><div><span>مجموع قیمت شمش‌ها</span><strong>{money.format(plan.total)} <small>تومان</small></strong></div><div><span>باقی‌ماندهٔ بودجه</span><b>{money.format(plan.remaining)} <small>تومان</small></b></div></div>
              <div className={styles.reason}><h5><span aria-hidden="true">✦</span> چرا این پیشنهاد؟</h5><p>{plan.reason}</p></div>
              <Link className={styles.explore} href={plan.items[0].product.href}>{plan.items.length === 1 ? "مشاهدهٔ شمش" : "بررسی اولین شمش این ترکیب"}<span aria-hidden="true">←</span></Link>
            </article>)}</div>
          </div>}
        </div>
        <p className={styles.disclaimer}>این ابزار برای مقایسهٔ خرید است، نه توصیهٔ مالی یا تضمین سود. جست‌وجوی ترکیب‌ها محدود است و همهٔ حالت‌های ممکن را تضمین نمی‌کند. وزن‌ها، وزن درج‌شدهٔ محصول‌اند، نه وزن فلز خالص. هزینهٔ ارسال جداست و قیمت و موجودی ممکن است تغییر کند.</p>
      </Container>
    </section>
  );
}
