# Rastreamento de cliques + sinais de fraude (Google Sheets)

Cada clique nos CTAs (WhatsApp e telefone) é enviado para uma **Planilha Google**,
que funciona como o "log" com a contagem de cliques e os sinais para análise de
fraude nos anúncios do Google Ads.

> **Como funciona:** o site (front-end) envia os dados com `navigator.sendBeacon`
> para um **Web App do Google Apps Script**, que grava uma linha na planilha.
> Nada trava o clique do usuário.

---

## Passo 1 — Criar a planilha e o Apps Script

1. Crie uma **Planilha Google** nova (ex.: "Guincho Perto — Cliques").
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo e cole o código abaixo. Salve.

```js
// Apps Script — recebe os cliques e grava na planilha.
const SHEET_NAME = "cliques";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sh.getLastRow() === 0) {
      sh.appendRow([
        "recebido_em", "ts_cliente", "cta", "visitor_id", "ip",
        "gclid", "gbraid", "wbraid",
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "page", "referrer", "user_agent", "language", "platform",
        "screen", "viewport", "dpr", "timezone", "cores", "memory"
      ]);
    }

    sh.appendRow([
      new Date(), data.ts, data.cta, data.visitor_id, data.ip,
      data.gclid, data.gbraid, data.wbraid,
      data.utm_source, data.utm_medium, data.utm_campaign, data.utm_term, data.utm_content,
      data.page, data.referrer, data.user_agent, data.language, data.platform,
      data.screen, data.viewport, data.dpr, data.timezone, data.cores, data.memory
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Passo 2 — Publicar como Web App

1. No Apps Script: **Implantar → Nova implantação**.
2. Tipo: **App da Web**.
3. **Executar como:** Eu (sua conta).
4. **Quem tem acesso:** **Qualquer pessoa**.
5. Clique em **Implantar**, autorize as permissões e **copie a URL** gerada
   (algo como `https://script.google.com/macros/s/AKfy.../exec`).

---

## Passo 3 — Conectar o site

Abra `src/lib/clickLog.ts` e cole a URL na constante:

```ts
const CLICK_LOG_ENDPOINT = "https://script.google.com/macros/s/AKfy.../exec";
```

Depois, gere o build e publique:

```bash
npm run build
```

Enquanto `CLICK_LOG_ENDPOINT` estiver vazio, o log fica **desativado** (nenhuma
chamada externa é feita).

---

## Passo 4 — Contagem de cliques por botão

Em uma nova aba da planilha (ex.: "resumo"), use:

```
=COUNTIF(cliques!C:C; "whatsapp-hero")
=COUNTIF(cliques!C:C; "telefone-hero")
=COUNTIF(cliques!C:C; "telefone-final")
=COUNTIF(cliques!C:C; "whatsapp-final")
```

Ou crie uma **Tabela dinâmica** (Inserir → Tabela dinâmica) com `cta` nas linhas
e "Contagem" nos valores — atualiza sozinha conforme chegam cliques.

---

## Colunas gravadas

| Coluna | O que é | Uso no antifraude |
|---|---|---|
| `recebido_em` | Hora que a planilha recebeu (servidor) | Confiável; base para janelas de tempo |
| `ts_cliente` | Hora no dispositivo do visitante | Divergência grande vs servidor = suspeito |
| `cta` | Qual botão (`whatsapp-hero`, `telefone-final`, ...) | Contagem por botão |
| `visitor_id` | Id fixo por dispositivo (localStorage) | **Muitos cliques do mesmo id = suspeito** |
| `ip` | IP do visitante (via api.ipify) | **Repetição do mesmo IP / IP de datacenter** |
| `gclid` / `gbraid` / `wbraid` | Id do clique do Google Ads | **Sem gclid vindo de anúncio = tráfego estranho** |
| `utm_*` | Origem da campanha | Cruzar com a campanha certa |
| `page` / `referrer` | URL e de onde veio | Referrer estranho = suspeito |
| `user_agent` / `platform` | Navegador/SO | Bots costumam ter UA incomum |
| `screen` / `viewport` / `dpr` | Tela | Resoluções "impossíveis" = bot |
| `timezone` | Fuso do dispositivo | Fora do Brasil clicando em anúncio local = suspeito |
| `cores` / `memory` | Núcleos de CPU / memória | Valores atípicos = automação |

---

## Como usar para bloquear fraude no Google Ads

1. **IP repetido:** ordene por `ip` e conte. Um mesmo IP com vários cliques em
   pouco tempo é forte sinal. Adicione esse IP em
   **Google Ads → Configurações → Exclusões de IP**.
2. **`visitor_id` repetido:** mesmo dispositivo clicando muitas vezes.
3. **`timezone` / IP fora da sua região de atuação** (você atende Curitiba e
   região) clicando no anúncio local.
4. **Sem `gclid`** em cliques que deveriam vir do anúncio: pode ser tráfego
   direto/robô — ajuste segmentação.

> Você já tem o **clickfortify** instalado, que faz proteção de fraude de cliques
> do lado do servidor (incluindo IP) e pode excluir IPs automaticamente no Google
> Ads. Esta planilha é um **complemento** para você inspecionar manualmente e
> guardar histórico próprio.

---

## Observações importantes

- **IP pelo cliente tem limite:** o `api.ipify.org` retorna o IP público, mas um
  bot sofisticado pode usar proxy/VPN. IP capturado no **servidor** é mais
  confiável — se precisar disso, dá para migrar para um endpoint serverless
  (Vercel/Netlify/Cloudflare) depois. Para desativar a busca de IP, mude
  `COLLECT_IP = false` em `src/lib/clickLog.ts`.
- **Privacidade (LGPD):** você está coletando dados de visitantes (IP, dispositivo)
  para prevenção de fraude. Convém mencionar isso na política de privacidade do
  site. Uso legítimo, mas precisa estar declarado.
- **CORS:** o envio usa `text/plain` de propósito, para o Apps Script aceitar sem
  bloqueio de preflight. Não altere isso sem necessidade.
