"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type RoleHint = "ADMIN" | "STAFF" | "CUSTOMER" | null;

function readRoleCookie(): RoleHint {
  const match = document.cookie.match(/(?:^|;\s*)lf_role=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : "";
  return value === "ADMIN" || value === "STAFF" || value === "CUSTOMER" ? value : null;
}

/**
 * لینک حساب کاربری در هدر — وضعیت ورود را از یک کوکی سبک (غیر-httpOnly) در سمت
 * کلاینت می‌خواند تا صفحات همچنان به‌صورت استاتیک/ISR قابل کش باشند (بدون فراخوانی
 * cookies() در سرور که رندر کل صفحه را پویا می‌کند).
 */
export function AccountLink({ className }: { className?: string }) {
  const [role, setRole] = useState<RoleHint>(null);

  useEffect(() => {
    setRole(readRoleCookie());
  }, []);

  const isAdmin = role === "ADMIN" || role === "STAFF";
  const loggedIn = role !== null;

  return (
    <>
      {isAdmin && (
        <Link className="hidden text-sm font-semibold text-lf-gold lg:inline" href="/admin">
          پنل مدیریت
        </Link>
      )}
      <Link className={className} href={loggedIn ? "/dashboard" : "/login"}>
        {loggedIn ? "پنل کاربری" : "حساب کاربری"}
      </Link>
    </>
  );
}
