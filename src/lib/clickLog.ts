/* ==========================================================================
   Guincho Perto — Log de cliques para Google Sheets (via Apps Script Web App)
   Envia sinais úteis de cada clique de CTA para uma planilha, ajudando na
   análise de fraude de anúncios. Não bloqueia a navegação (usa sendBeacon).
   Veja o passo a passo em docs/rastreamento-cliques.md
   ========================================================================== */

/* ------------------------------------------------------------------ CONFIG */

// 1) Cole aqui a URL do Web App do Apps Script (após o deploy).
//    Enquanto estiver vazio, o log fica DESATIVADO (nenhuma chamada é feita).
const CLICK_LOG_ENDPOINT = "https://script.google.com/macros/s/AKfycbxUyqaPY0tLiGv-X0Ur3d4pXt2ahFnA2aUb2elKSkAiieDXqv7eqFYWpxM7RrWSt0c/exec";

// 2) Buscar o IP do visitante por um serviço externo (api.ipify.org)?
//    O Apps Script/Sheets não captura IP de forma confiável, então pegamos
//    no cliente. Deixe false para não fazer essa chamada externa.
const COLLECT_IP = true;

import { getDeviceHash } from "./fingerprint";

/* ------------------------------------------------------------------ ESTADO */

let cachedIp = "";

/* ---------------------------------------------------------------- HELPERS */

function param(name: string): string {
  try {
    return new URLSearchParams(window.location.search).get(name) ?? "";
  } catch {
    return "";
  }
}

/** Id persistente por dispositivo — ajuda a detectar cliques repetidos. */
export function getVisitorId(): string {
  try {
    const key = "sg_visitor_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()) + String(Math.random()).slice(2);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------- API */

/** Chamar uma vez ao carregar a página (busca o IP em segundo plano). */
export function initClickLog(): void {
  if (!CLICK_LOG_ENDPOINT || !COLLECT_IP) return;
  fetch("https://api.ipify.org?format=json")
    .then((r) => r.json())
    .then((d: { ip?: string }) => {
      cachedIp = d.ip ?? "";
    })
    .catch(() => {
      cachedIp = "";
    });
}

/** Registra um clique de CTA na planilha (fire-and-forget). */
export function logClick(ctaName: string): void {
  if (!CLICK_LOG_ENDPOINT) return;
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
    };

    const payload = {
      ts: new Date().toISOString(),
      cta: ctaName,
      visitor_id: getVisitorId(),
      device_hash: getDeviceHash(),
      ip: cachedIp,
      gclid: param("gclid"),
      gbraid: param("gbraid"),
      wbraid: param("wbraid"),
      utm_source: param("utm_source"),
      utm_medium: param("utm_medium"),
      utm_campaign: param("utm_campaign"),
      utm_term: param("utm_term"),
      utm_content: param("utm_content"),
      page: window.location.href,
      referrer: document.referrer,
      user_agent: nav.userAgent,
      language: nav.language,
      platform: nav.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      dpr: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cores: nav.hardwareConcurrency ?? "",
      memory: nav.deviceMemory ?? "",
    };

    const body = JSON.stringify(payload);
    // text/plain evita preflight CORS (o Apps Script não trata OPTIONS bem).
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        CLICK_LOG_ENDPOINT,
        new Blob([body], { type: "text/plain;charset=UTF-8" })
      );
    } else {
      void fetch(CLICK_LOG_ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
      }).catch(() => {});
    }
  } catch {
    /* nunca quebrar o clique por causa do log */
  }
}
