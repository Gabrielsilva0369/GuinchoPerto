/* ==========================================================================
   Guincho Perto — Tracking leve de cliques nos CTAs
   - Envia um evento para o dataLayer (se existir).
   - Dispara a conversão "clique para ligar" do Google Ads nos links de telefone.
   Nunca bloqueia a navegação do link.
   ========================================================================== */

import type { MouseEvent } from "react";
import { logClick } from "./clickLog";

// IDs de conversão do Google Ads
// Conversão "Contato" da conta do Guincho Perto (usada nos dois tipos de botão)
const CALL_CONVERSION_SEND_TO = "AW-18490109090/xhpjCIG15pMdEKLZ4vBE"; // Clique para ligar
const WHATSAPP_CONVERSION_SEND_TO = "AW-18490109090/xhpjCIG15pMdEKLZ4vBE"; // Clique no WhatsApp

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Handler para onClick de um link/botão de CTA.
 * - Lê o atributo data-cta do próprio elemento e registra em window.dataLayer.
 * - Se o CTA for de telefone, dispara a conversão do Google Ads.
 * A navegação do link segue normalmente em qualquer cenário.
 */
export function trackCtaClick(event: MouseEvent<HTMLAnchorElement>): void {
  const ctaName = event.currentTarget.dataset.cta;
  if (!ctaName) return;

  // Log do clique na planilha (Google Sheets), se configurado
  logClick(ctaName);

  // Evento genérico para o dataLayer (GTM/analytics), se disponível
  if (
    typeof window !== "undefined" &&
    Array.isArray(window.dataLayer) &&
    typeof window.dataLayer.push === "function"
  ) {
    window.dataLayer.push({ event: "cta_click", cta_name: ctaName });
  }

  // Conversões do Google Ads por tipo de CTA
  if (typeof window.gtag === "function") {
    if (ctaName.startsWith("telefone") && CALL_CONVERSION_SEND_TO) {
      // Recurso "clique para ligar"
      window.gtag("event", "conversion", {
        send_to: CALL_CONVERSION_SEND_TO,
        value: 1.0,
        currency: "BRL",
      });
    } else if (ctaName.startsWith("whatsapp") && WHATSAPP_CONVERSION_SEND_TO) {
      // Contato (clique no botão do WhatsApp)
      window.gtag("event", "conversion", {
        send_to: WHATSAPP_CONVERSION_SEND_TO,
        value: 1.0,
        currency: "BRL",
      });
    }
  }
}
