import type { CheckoutPaymentOptions } from "@syntraa/types";

export const DEFAULT_CHECKOUT_OPTIONS: CheckoutPaymentOptions = {
  bankTransfer: true,
  easypaisa: true,
  cod: true,
  bankAccount: {
    bankName: "Meezan Bank",
    accountTitle: "THE SYNTRAA",
    accountNumber: "",
    instructions: "Transfer total amount and add your order number in the reference.",
  },
};
