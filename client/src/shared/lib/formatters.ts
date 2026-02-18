import { parsePhoneNumber, AsYouType } from "libphonenumber-js";

/** Formata um telefone completo para exibição */
export function formatPhone(value: string): string {
  if (!value) return "";
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits) return "";

  try {
    const phone = parsePhoneNumber(digits.startsWith("+") ? digits : `+${digits}`);
    if (phone) return phone.formatInternational();
  } catch {}

  return value;
}

/** Formata progressivamente enquanto o usuário digita */
export function formatPhoneAsYouType(value: string): string {
  if (!value) return "";
  const digits = value.replace(/[^\d+]/g, "");
  if (!digits) return "";

  const input = digits.startsWith("+") ? digits : `+${digits}`;
  return new AsYouType().input(input) || value;
}
