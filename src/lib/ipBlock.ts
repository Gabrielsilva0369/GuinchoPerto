import { useEffect, useState } from "react";
import { getVisitorId } from "./clickLog";
import { getDeviceHash } from "./fingerprint";

/* ==========================================================================
   Guincho Perto — Bloqueio de acesso (IP + Visitor ID)
   --------------------------------------------------------------------------
   Duas listas que VOCÊ edita à mão. Depois de editar: npm run build + deploy.

   1) BLOCKED_IPS         -> IPs que não devem ver o site.
   2) BLOCKED_VISITOR_IDS -> ids de aparelho (coluna "visitor_id" da planilha).

   Quando o visitante casa com uma das listas, ele é REDIRECIONADO para o
   Google (não vê o site). Também grava o cookie sg_block=1 (útil se um dia
   você colocar Cloudflare/Firewall na frente para bloquear na borda).

   ⚠️ Honestidade:
   - É verificado no navegador; pode ser burlado (aba anônima, VPN, JS off,
     limpar cookies, outro aparelho). É um bloqueio "leve".
   - NÃO devolve dinheiro de anúncio (o clique no Google já foi cobrado).
     Para não PAGAR o clique, exclua o IP em Google Ads → Exclusões de IP.
   ========================================================================== */

export const BLOCKED_IPS: string[] = [
  "200.173.50.160",
 
];

export const BLOCKED_VISITOR_IDS: string[] = [
  "835e54fd-58d0-462d-8539-bc800518ef52",
  "3c9561a5-4dff-4a0b-8c5e-9f6d5f7a7c5a"
];

/* device_hash do aparelho (coluna "device_hash" da planilha).
   ESTE é o único que resiste à ABA ANÔNIMA e à TROCA DE IP (4G),
   porque é do aparelho, não da rede nem do cookie.
   ⚠️ PREÇO: colide com quem tiver o MESMO modelo + mesmo navegador
   (principalmente iPhone/Safari). Se o fraudador usar aparelho comum,
   você pode acabar redirecionando clientes com aparelho igual. */
export const BLOCKED_DEVICE_HASHES: string[] = [
  // cole aqui o device_hash do fraudador, um por linha:
  // "8431b17c",
];

// Para onde o visitante bloqueado é mandado.
const REDIRECT_URL = "https://www.google.com/";

/** Grava o cookie de bloqueio (para uso futuro em borda: Cloudflare/Firewall). */
function setBlockCookie(): void {
  try {
    document.cookie = "sg_block=1; path=/; max-age=31536000; SameSite=Lax";
  } catch {
    /* ignora */
  }
}

/** Verifica (síncrono) se o visitor_id salvo está na lista de bloqueio. */
function isVisitorBlocked(): boolean {
  if (BLOCKED_VISITOR_IDS.length === 0) return false;
  const id = getVisitorId();
  return id !== "" && BLOCKED_VISITOR_IDS.includes(id);
}

/** Verifica (síncrono) se a impressão digital do aparelho está bloqueada.
    É o único que pega o cara em aba anônima / IP novo. */
function isDeviceBlocked(): boolean {
  if (BLOCKED_DEVICE_HASHES.length === 0) return false;
  const hash = getDeviceHash();
  return hash !== "" && BLOCKED_DEVICE_HASHES.includes(hash);
}

async function fetchVisitorIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data: { ip?: string } = await res.json();
    return data.ip ?? "";
  } catch {
    return "";
  }
}

/**
 * Redireciona o visitante bloqueado (por Visitor ID ou IP) para o Google.
 * Não atrasa a renderização para quem está liberado: o site aparece normal
 * e só bloqueia depois da verificação.
 */
export function useAccessBlock(): boolean {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const doBlock = () => {
      setBlockCookie();
      setBlocked(true);
      window.location.replace(REDIRECT_URL);
    };

    // 1) Visitor ID + impressão digital do aparelho — imediato
    //    (device_hash pega até em aba anônima / IP novo)
    if (isVisitorBlocked() || isDeviceBlocked()) {
      doBlock();
      return;
    }

    // 2) IP — assíncrono
    if (BLOCKED_IPS.length === 0) return;
    let active = true;
    fetchVisitorIp().then((ip) => {
      if (active && ip && BLOCKED_IPS.includes(ip)) {
        doBlock();
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return blocked;
}
