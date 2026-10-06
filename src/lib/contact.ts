export type PhoneKey = "novo" | "atendimento";

const PHONES: Record<PhoneKey, { ddi: string; ddd: string; number: string }> = {
  novo: { ddi: "55", ddd: "41", number: "991273955" },
  atendimento: { ddi: "55", ddd: "41", number: "991273955" },
};

const WHATSAPP_MESSAGE = "Olá! Preciso de um Guincho Perto!!!";

export interface Contact {
  PHONE_DISPLAY: string;
  WHATSAPP_URL: string;
  CALL_URL: string;
}

export function getContact(key: PhoneKey): Contact {
  const { ddi, ddd, number } = PHONES[key];
  const digits = `${ddi}${ddd}${number}`;

  return {
    PHONE_DISPLAY: `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`,
    WHATSAPP_URL: `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
    CALL_URL: `tel:+${digits}`,
  };
}
