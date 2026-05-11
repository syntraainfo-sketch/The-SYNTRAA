import crypto from "crypto";
import type { Response } from "express";
import { env } from "../config/env";

/**
 * JazzCash/Easypaisa field shapes differ by merchant product.
 * Extend these builders with official signed field ordering from your onboarding PDF.
 */

export interface JazzcashFormFields extends Record<string, string> {}

export function buildJazzcashFormFields(payload: {
  amountPkr: number;
  billReference: string;
  description: string;
}): JazzcashFormFields {
  const pp_Amount = (payload.amountPkr * 100).toFixed(0);
  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: env.jazzcash.merchantId || "SANDBOX_MERCHANT_ID",
    pp_SubMerchantID: "",
    pp_Password: env.jazzcash.password || "",
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: crypto.randomUUID().slice(0, 20),
    pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatJcDate(),
    pp_BillReference: payload.billReference,
    pp_Description: payload.description,
    pp_TxnExpiryDateTime: formatJcDatePlusMinutes(60),
    pp_MobileNumber: "",
    pp_CNIC: "",
    pp_IsMobileVerified: "",
    pp_DeviceID: "",
    pp_SecurityToken: "",
    pp_MERCHANT_ACTIVITY: "",
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };
  fields.pp_Signature = jazzcashIntegrityHash(fields);
  return fields;
}

/** Format yyyyMMddHHmmss typical for JazzCash */
function formatJcDate(): string {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function formatJcDatePlusMinutes(mins: number): string {
  const d = new Date(Date.now() + mins * 60 * 1000);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function jazzcashIntegrityHash(parts: Record<string, string>): string {
  const salt = env.jazzcash.salt || "sandbox";
  const canonical = Object.keys(parts)
    .filter((k) => k.startsWith("pp_") || k.startsWith("ppmpf"))
    .sort()
    .map((k) => `${k}=${parts[k]}`)
    .join("&");
  const payload = `${canonical}&INTEGRITY_SALT=${salt}`;
  return crypto.createHmac("sha256", salt).update(payload).digest("hex");
}

export function verifyJazzcashCallback(body: Record<string, unknown>): boolean {
  if (!env.jazzcash.salt || !body || typeof body !== "object") {
    return process.env.NODE_ENV !== "production";
  }
  const received = String(body.pp_Signature ?? "");
  if (!received) return process.env.NODE_ENV !== "production";
  const clone: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "string" || typeof v === "number") clone[k] = String(v);
  }
  delete clone.pp_Signature;
  const calc = jazzcashIntegrityHash(clone);
  try {
    if (received.length !== calc.length) return false;
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(calc));
  } catch {
    return false;
  }
}

/** Easypaisa hash construction — replace with PSP doc */
export function verifyEasypaisaCallback(body: Record<string, string>): boolean {
  const key = env.easypaisa.hashKey;
  if (!key) return process.env.NODE_ENV !== "production";
  const concat = `${body.orderRef ?? ""}|${body.transactionAmount ?? ""}|${body.transactionId ?? ""}`;
  const hex = crypto.createHmac("sha256", key).update(concat).digest("hex");
  const received = body.secureHash ?? "";
  if (!received) return false;
  try {
    if (hex.length !== received.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hex), Buffer.from(received));
  } catch {
    return false;
  }
}

export function redirectHtml(postUrl: string, fields: Record<string, string>) {
  const inputs = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${escapeHtmlAttr(k)}" value="${escapeHtmlAttr(v)}" />`
    )
    .join("");
  return `<!DOCTYPE html><html><body><form id="p" action="${escapeHtmlAttr(
    postUrl
  )}" method="POST">${inputs}</form><script>document.getElementById('p').submit()</script></body></html>`;
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function sendAutoPostRedirect(res: Response, postUrl: string, fields: Record<string, string>) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(redirectHtml(postUrl, fields));
}
