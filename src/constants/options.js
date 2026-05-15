
export const FLOWER_OPTS = ["roses", "tulips", "lilies", "sunflowers", "peonies", "orchids"];
export const COLOR_OPTS = ["red", "white", "pink", "yellow", "purple", "orange"];
export const RIBBON_OPTS = ["gold", "silver", "black", "pink"];
export const WRAP_OPTS = ["natural", "elegant", "modern", "rustic"];

export const CURRENCY_CODE = "SYP";
export const DELIVERY_FEE = 25000;

export const SHAM_CASH_ACCOUNT_NUMBER = "0000000000";
export const SHAM_CASH_QR_TEXT = `Sham Cash account: ${SHAM_CASH_ACCOUNT_NUMBER}`;

export function formatCurrency(amount) {
  return `${Number(amount || 0).toLocaleString("en-US")} ${CURRENCY_CODE}`;
}
