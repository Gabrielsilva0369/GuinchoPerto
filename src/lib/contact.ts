export type PhoneKey = "novo" | "atendimento";

const PHONES: Record<PhoneKey, { ddi: string; ddd: string; number: string }> = {
  novo: { ddi: "55", ddd: "41", number: "999999999" },
  atendimento: { ddi: "55", ddd: "41", number: "999999999" },
};

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
    WHATSAPP_URL: `https://wa.me/${digits}?text=Olá%2C%20preciso%20de%20um%20guincho.%20Pode%20me%20atender%20agora%3F`,
    CALL_URL: `tel:+${digits}`,
  };
}
