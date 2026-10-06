# Bloqueio de acesso com Cloudflare (Free) — IP + Visitor ID

Arquitetura em duas camadas:

```
[Visitante acessa o site]
        │
        ▼
[Script confere: IP ou visitor_id está na lista?] ──não──► site normal
        │ sim
        ▼
[Mostra "Conteúdo indisponível"]  +  [Grava cookie sg_block=1]
        │
        ▼
[Próxima requisição] ──► [Cloudflare lê o cookie / IP] ──► [BLOQUEIO na borda]
```

- **Camada 1 (código, já pronto):** o site esconde o conteúdo na hora e planta o
  cookie `sg_block=1`. Você edita as listas em `src/lib/ipBlock.ts`.
- **Camada 2 (Cloudflare):** bloqueia a requisição **antes de chegar no site**.

> ⚠️ **Pré-requisito:** o site precisa usar um **domínio próprio** (ex.:
> `sulguinchos.com.br`). Não dá para colocar Cloudflare na frente de um endereço
> tipo `*.vercel.app` ou `*.netlify.app`.

---

## Passo 1 — Colocar o site atrás do Cloudflare

1. Crie conta em **cloudflare.com** (grátis).
2. **Add a site** → digite seu domínio → escolha o plano **Free**.
3. O Cloudflare importa seu DNS. Confira se os registros apontam para sua
   hospedagem e deixe-os **Proxied** (nuvem laranja 🟠).
4. O Cloudflare mostra **2 nameservers**. Vá no seu registrador (Registro.br,
   GoDaddy, etc.) e **troque os nameservers** por esses dois.
5. Aguarde ativar (pode levar de minutos a algumas horas).

---

## Passo 2 — Bloquear IPs (bloqueio "de verdade", na borda)

**Security → WAF → Tools → IP Access Rules** (ou "IP Access Rules"):

- **IP:** `200.173.50.160`
- **Action:** `Block`
- **Zone:** este site
- Create.

Repita para cada IP. Isso barra o IP **antes** de carregar a página. Ideal para
**IP fixo** (o `200.173.50.160` parece ser). Evite bloquear faixas de operadora
móvel (4G) — pega cliente real.

---

## Passo 3 — Bloquear pelo cookie (Visitor ID)

**Security → WAF → Custom rules → Create rule:**

- **Field:** `Cookie`
- **Operator:** `contains`
- **Value:** `sg_block=1`

Ou cole a expressão direto (modo de edição por expressão):

```
(http.cookie contains "sg_block=1")
```

- **Action:** `Block`
- **Deploy**.

O plano Free permite até **5 custom rules** — suficiente.

Como funciona junto com o código: quando você adiciona um `visitor_id` em
`BLOCKED_VISITOR_IDS` (em `src/lib/ipBlock.ts`) e publica, o aparelho daquele id,
ao abrir o site, recebe o cookie `sg_block=1`. Da requisição seguinte em diante,
o Cloudflare bloqueia na borda.

---

## Como adicionar alguém à lista

1. Na planilha (aba `cliques`), copie o **`ip`** (coluna E) ou o **`visitor_id`**
   (coluna D) do abusador.
2. Cole em `src/lib/ipBlock.ts`:
   - IP fixo → `BLOCKED_IPS`
   - Aparelho → `BLOCKED_VISITOR_IDS`
3. `npm run build` e publique.
4. (IP) adicione também em **Cloudflare → IP Access Rules** para bloqueio na borda.

---

## Limites honestos

| Tipo | Onde bloqueia | Dá pra burlar? |
|---|---|---|
| **IP (Cloudflare IP Rules)** | Borda, antes do site | Só trocando de IP/VPN. Sólido p/ IP fixo. |
| **Visitor ID (cookie + WAF)** | Borda, via cookie | **Sim:** limpar cookies / aba anônima / outro aparelho. É "grudento", não absoluto. |
| **Camada do código (tela)** | No navegador | Sim (JS off). É só o feedback imediato. |

E o mais importante: **nada disso devolve o dinheiro do clique no anúncio** — o
Google cobra no clique, antes da página. Para não **pagar** o clique daquele IP,
exclua-o em **Google Ads → Exclusões de IP**. O Cloudflare impede o acesso ao
site; o Google Ads é que impede o gasto.
