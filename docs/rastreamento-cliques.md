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
// Apps Script — recebe os cliques, grava na planilha e identifica a mesma pessoa.
const SHEET_NAME = "cliques";

const HEADERS = [
  "recebido_em", "ts_cliente", "cta", "visitor_id", "ip",
  "gclid", "gbraid", "wbraid",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "page", "referrer", "user_agent", "language", "platform",
  "screen", "viewport", "dpr", "timezone", "cores", "memory",
  "device_hash", "pessoa", "cliques_pessoa", "motivo"
];

// Colunas (1 = A). O IP NÃO entra na identificação: no 4G ele muda
// para a mesma pessoa e é compartilhado por pessoas diferentes.
const COL = { visitor: 4, hash: 25, pessoa: 26, total: 27, motivo: 28 };

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // evita dois cliques simultâneos pegarem o mesmo código
    var data = JSON.parse(e.postData.contents);
    var sh = getSheet();

    sh.appendRow([
      new Date(), data.ts, data.cta, data.visitor_id, data.ip,
      data.gclid, data.gbraid, data.wbraid,
      data.utm_source, data.utm_medium, data.utm_campaign, data.utm_term, data.utm_content,
      data.page, data.referrer, data.user_agent, data.language, data.platform,
      data.screen, data.viewport, data.dpr, data.timezone, data.cores, data.memory,
      data.device_hash
    ]);

    var row = sh.getLastRow();
    var rows = sh.getRange(2, 1, row - 1, COL.motivo).getValues();
    var r = identificar(rows, rows.length - 1);
    sh.getRange(row, COL.pessoa).setValue(r.pessoa);
    sh.getRange(row, COL.total).setFormula("=COUNTIF(Z:Z,Z" + row + ")");
    sh.getRange(row, COL.motivo).setValue(r.motivo);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Decide quem é a pessoa da linha i, olhando só as linhas anteriores. */
function identificar(rows, i) {
  var vid = String(rows[i][COL.visitor - 1] || "");
  var hash = String(rows[i][COL.hash - 1] || "");
  var porHash = "";
  var maior = 0;

  for (var j = 0; j < i; j++) {
    var p = String(rows[j][COL.pessoa - 1] || "");
    if (!p) continue;
    maior = Math.max(maior, parseInt(p.slice(1), 10) || 0);
    // Mesmo visitor_id = mesmo navegador: certeza.
    if (vid && String(rows[j][COL.visitor - 1]) === vid) {
      return { pessoa: p, motivo: "mesmo navegador" };
    }
    // Mesmo device_hash = mesmo aparelho (aba anônima, dados limpos...).
    if (!porHash && hash && String(rows[j][COL.hash - 1]) === hash) porHash = p;
  }

  if (porHash) return { pessoa: porHash, motivo: "mesmo aparelho (provável)" };
  return { pessoa: "P" + ("000" + (maior + 1)).slice(-4), motivo: "primeiro clique" };
}

/** Rode UMA vez pelo editor para preencher pessoa/motivo nas linhas antigas. */
function preencherPessoas() {
  var sh = getSheet();
  var last = sh.getLastRow();
  if (last < 2) return;
  var rows = sh.getRange(2, 1, last - 1, COL.motivo).getValues();
  var saida = [];
  for (var i = 0; i < rows.length; i++) {
    rows[i][COL.pessoa - 1] = ""; // recalcula do zero
    var r = identificar(rows, i);
    rows[i][COL.pessoa - 1] = r.pessoa;
    saida.push([r.pessoa, "=COUNTIF(Z:Z,Z" + (i + 2) + ")", r.motivo]);
  }
  sh.getRange(2, COL.pessoa, saida.length, 3).setValues(saida);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getRange(1, COL.motivo).getValue() === "") {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sh;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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

## Passo 4 — Destacar a mesma pessoa clicando

O script identifica a pessoa só por `visitor_id` e `device_hash`. O **IP fica
de fora**: no 4G ele muda para a mesma pessoa e é compartilhado por várias.

1. Se a planilha já tinha cliques, no Apps Script escolha a função
   **preencherPessoas** e clique em **Executar** (uma vez só).
2. Em **Formatar → Formatação condicional**, intervalo `A2:AB1000`,
   **A fórmula personalizada é**:
   - `=$AA2>=3` → vermelho claro (3 cliques ou mais)
   - `=$AA2=2` → amarelo claro (2 cliques)

---

## Passo 5 — Contagem de cliques por botão

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
| `pessoa` | Código da pessoa (P0001...), dado pelo script | **Mesmo código em várias linhas = mesma pessoa clicando** |
| `cliques_pessoa` | Quantos cliques essa pessoa já deu | Base para a cor na planilha |
| `motivo` | Por que o script juntou: `mesmo navegador` (visitor_id, certeza) ou `mesmo aparelho (provável)` (device_hash) | Provável = conferir horário/modelo antes de bloquear |
| `device_hash` | Impressão digital do aparelho (canvas + hardware) | **Mesmo hash com ids diferentes = mesmo aparelho limpando dados**; usado em `BLOCKED_DEVICE_HASHES` (`src/lib/ipBlock.ts`) |

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
