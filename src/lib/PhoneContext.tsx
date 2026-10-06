import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getContact, type Contact, type PhoneKey } from "./contact";

const PhoneContext = createContext<PhoneKey>("novo");

export function PhoneProvider({
  phone,
  children,
}: {
  phone: PhoneKey;
  children: ReactNode;
}) {
  return <PhoneContext.Provider value={phone}>{children}</PhoneContext.Provider>;
}

export function usePhoneContact(): Contact {
  const phone = useContext(PhoneContext);
  return useMemo(() => getContact(phone), [phone]);
}
