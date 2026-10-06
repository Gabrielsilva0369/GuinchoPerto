/* ==========================================================================
   Guincho Perto — Impressão digital do aparelho (device_hash)
   --------------------------------------------------------------------------
   Junta sinais estáveis do aparelho/navegador (canvas, GPU/WebGL, tela,
   fuso, hardware) num código curto. Esse é o "rastro" que:
     - SOBREVIVE à troca de IP (4G) — é do aparelho, não da rede.
     - SOBREVIVE à aba anônima — não depende de cookie/localStorage.

   ⚠️ Não é 100% único no mobile (aparelhos do mesmo modelo colidem) e
   navegadores anti-fingerprint (Brave/Safari) embaralham. Por isso ele é
   usado junto com a FREQUÊNCIA de cliques: um reincidente aparece com o
   MESMO device_hash em vários IPs/horários — um cliente real, não.
   ========================================================================== */

/** Hash estável (FNV-1a 32 bits) -> string hex curta. */
function hashString(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Assinatura do canvas (varia por GPU/driver/fontes do aparelho). */
function canvasSignal(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 220;
    c.height = 40;
    const ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.textBaseline = "top";
    ctx.font = '14px "Arial"';
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 220, 40);
    ctx.fillStyle = "#069";
    ctx.fillText("Guincho Perto \u{1F6FB} fp", 2, 2);
    ctx.fillStyle = "rgba(102,0,255,0.5)";
    ctx.fillText("Guincho Perto \u{1F6FB} fp", 4, 4);
    return c.toDataURL();
  } catch {
    return "";
  }
}

/** Vendor + renderer do WebGL (identifica a GPU do aparelho). */
function webglSignal(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") ||
      c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (!dbg) return "";
    const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string;
    const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
    return `${vendor}~${renderer}`;
  } catch {
    return "";
  }
}

/** Retorna o "rastro" do aparelho — o mesmo em IPs diferentes e em aba anônima. */
export function getDeviceHash(): string {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    nav.platform,
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    `${window.devicePixelRatio}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${nav.hardwareConcurrency ?? ""}`,
    `${nav.deviceMemory ?? ""}`,
    webglSignal(),
    canvasSignal(),
  ];
  return hashString(parts.join("|"));
}
