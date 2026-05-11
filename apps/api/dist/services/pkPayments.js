"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJazzcashFormFields = buildJazzcashFormFields;
exports.verifyJazzcashCallback = verifyJazzcashCallback;
exports.verifyEasypaisaCallback = verifyEasypaisaCallback;
exports.redirectHtml = redirectHtml;
exports.sendAutoPostRedirect = sendAutoPostRedirect;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
function buildJazzcashFormFields(payload) {
    const pp_Amount = (payload.amountPkr * 100).toFixed(0);
    const fields = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: env_1.env.jazzcash.merchantId || "SANDBOX_MERCHANT_ID",
        pp_SubMerchantID: "",
        pp_Password: env_1.env.jazzcash.password || "",
        pp_BankID: "",
        pp_ProductID: "",
        pp_TxnRefNo: crypto_1.default.randomUUID().slice(0, 20),
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
function formatJcDate() {
    const d = new Date();
    const pad = (n) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function formatJcDatePlusMinutes(mins) {
    const d = new Date(Date.now() + mins * 60 * 1000);
    const pad = (n) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function jazzcashIntegrityHash(parts) {
    const salt = env_1.env.jazzcash.salt || "sandbox";
    const canonical = Object.keys(parts)
        .filter((k) => k.startsWith("pp_") || k.startsWith("ppmpf"))
        .sort()
        .map((k) => `${k}=${parts[k]}`)
        .join("&");
    const payload = `${canonical}&INTEGRITY_SALT=${salt}`;
    return crypto_1.default.createHmac("sha256", salt).update(payload).digest("hex");
}
function verifyJazzcashCallback(body) {
    if (!env_1.env.jazzcash.salt || !body || typeof body !== "object") {
        return process.env.NODE_ENV !== "production";
    }
    const received = String(body.pp_Signature ?? "");
    if (!received)
        return process.env.NODE_ENV !== "production";
    const clone = {};
    for (const [k, v] of Object.entries(body)) {
        if (typeof v === "string" || typeof v === "number")
            clone[k] = String(v);
    }
    delete clone.pp_Signature;
    const calc = jazzcashIntegrityHash(clone);
    try {
        if (received.length !== calc.length)
            return false;
        return crypto_1.default.timingSafeEqual(Buffer.from(received), Buffer.from(calc));
    }
    catch {
        return false;
    }
}
/** Easypaisa hash construction — replace with PSP doc */
function verifyEasypaisaCallback(body) {
    const key = env_1.env.easypaisa.hashKey;
    if (!key)
        return process.env.NODE_ENV !== "production";
    const concat = `${body.orderRef ?? ""}|${body.transactionAmount ?? ""}|${body.transactionId ?? ""}`;
    const hex = crypto_1.default.createHmac("sha256", key).update(concat).digest("hex");
    const received = body.secureHash ?? "";
    if (!received)
        return false;
    try {
        if (hex.length !== received.length)
            return false;
        return crypto_1.default.timingSafeEqual(Buffer.from(hex), Buffer.from(received));
    }
    catch {
        return false;
    }
}
function redirectHtml(postUrl, fields) {
    const inputs = Object.entries(fields)
        .map(([k, v]) => `<input type="hidden" name="${escapeHtmlAttr(k)}" value="${escapeHtmlAttr(v)}" />`)
        .join("");
    return `<!DOCTYPE html><html><body><form id="p" action="${escapeHtmlAttr(postUrl)}" method="POST">${inputs}</form><script>document.getElementById('p').submit()</script></body></html>`;
}
function escapeHtmlAttr(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
}
function sendAutoPostRedirect(res, postUrl, fields) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(redirectHtml(postUrl, fields));
}
