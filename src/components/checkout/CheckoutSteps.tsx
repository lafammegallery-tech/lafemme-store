interface CheckoutStepsProps {
  currentStep?: number;
}

const steps = [
  { number: 1, label: "اطلاعات تماس" },
  { number: 2, label: "آدرس ارسال" },
  { number: 3, label: "روش پرداخت" },
  { number: 4, label: "تأیید سفارش" },
];

/** نمایش مراحل تسویه حساب به‌صورت نشانگر مرحله‌ای. */
export function CheckoutSteps({ currentStep = 1 }: CheckoutStepsProps) {
  return (
    <nav className="checkout-steps" aria-label="مراحل تسویه حساب">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`checkout-step ${step.number <= currentStep ? "active" : ""} ${step.number < currentStep ? "completed" : ""}`}
        >
          <span className="checkout-step-number">
            {step.number < currentStep ? "✓" : step.number.toLocaleString("fa-IR")}
          </span>
          <span className="checkout-step-label">{step.label}</span>
          {index < steps.length - 1 && <span className="checkout-step-divider" aria-hidden="true" />}
        </div>
      ))}
    </nav>
  );
}
