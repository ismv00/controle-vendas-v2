# Handoff: Venda Fácil — redesign do app de registro de vendas

## Overview
Redesign completo do "Venda Fácil", app web de controle de vendas para uma papelaria/gráfica. Cinco telas — Dashboard, Clientes, Produtos, Tabela de Preços e Vendas — mais três modais de cadastro (cliente, produto, venda). A estrutura de informação do app atual foi mantida; o que mudou é a navegação (tabs horizontais → sidebar fixa), a hierarquia visual do dashboard e o tratamento de dados numéricos.

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar**. A tarefa é **recriar estes designs no ambiente já existente do codebase** (React, Vue, Next, etc.), usando seus padrões, componentes e bibliotecas. Se não houver ambiente ainda, escolher o framework mais adequado e implementar lá.

`Venda Facil Redesign.dc.html` é um componente de design com um pequeno runtime próprio (`support.js`): template HTML com marcadores `{{ }}` e uma classe de lógica no fim do arquivo. Leia-o como especificação (todos os estilos são inline e explícitos, e todos os dados de exemplo estão na classe de lógica), não como fonte a portar.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos, raios, estados e microinterações estão finais. Recriar com fidelidade de pixel usando os componentes do codebase.

## Design Tokens

### Cores
| Uso | Valor |
|---|---|
| Fundo da app | `#f7f6f3` |
| Superfície (cards, tabelas, modais) | `#ffffff` |
| Superfície sutil (thead, footer de modal) | `#fbfaf8` / `#faf9f7` |
| Preenchimento de input / chip | `#f2f0eb`, `#f4f2ed` |
| Borda padrão | `#e8e5df` |
| Borda de input | `#e2dfd8` |
| Borda de linha de tabela | `#f4f2ed` |
| Borda de divisor de card | `#efece6` / `#f2f0ea` |
| Texto primário (ink) | `#1a1917` |
| Texto secundário | `#5c5951` |
| Texto terciário / labels | `#7c786f`, `#8d897f` |
| Texto desabilitado / vazio | `#9a968d`, `#b6b2a9` |
| Placeholder | `#a8a49c` |
| Painel escuro (dashboard hero + sidebar escura) | `#151417` |
| Acento (primário) — tweakável | `#4338ca` (alternativas: `#0f766e`, `#b45309`, `#1f2937`) |
| Positivo (lucro) | `#1a7f52`; sobre escuro: `#7ee2b0`; fundo `#e8f3ec` |
| Atenção (margem baixa / pendente) | `#96631c`, `#b0742a`, `#d98a3a`; fundo `#fdf1e3` |
| Negativo (lucro negativo / excluir) | `#b03a2e`, `#c0453a`; fundo `#fbecea`; borda `#f0dcd9` |
| Overlay de modal | `rgba(20,19,17,.42)` + `backdrop-filter: blur(3px)` |

### Tipografia
- **Texto/UI:** `Plus Jakarta Sans` (400/500/600/700), fallback `system-ui, sans-serif`.
- **Números, datas, valores monetários:** `IBM Plex Mono` (400/500/600). Regra: **todo valor numérico, monetário, percentual, telefone e data usa a mono.**
- Escala: título de página 25px/700/`letter-spacing:-.025em`; título de modal 18px/700/-.02em; título de seção 14px/600; corpo/tabela 13px; secundário 12.5px; label de campo 12px/600; header de tabela 11px/600/uppercase/`letter-spacing:.06em`; micro-label 10.5px/600/uppercase/.06em.
- Números display: hero 40px/600/-.03em (centavos em 22px com `opacity:.55`); KPI 24px/600/-.02em; métrica de card 22px/600.
- `-webkit-font-smoothing: antialiased` no body.

### Espaçamento & forma
- Escala usada: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32.
- Raios: 7px (chip/botão pequeno), 8–9px (botão de ícone, avatar pequeno), 10px (botão, input), 11px (logo), 12px (bloco interno), 14px (card), 16px (hero), 18px (modal), 99px (pill).
- Sombras: botão primário `0 1px 2px rgba(0,0,0,.14)`; pill ativo `0 1px 2px rgba(0,0,0,.10)`; modal `0 24px 60px rgba(0,0,0,.28)`.
- Animação: entrada de tela/modal `vfIn` — `opacity 0→1` + `translateY(6px)→0`, 220ms (tela) / 180ms (modal), `ease`.

## Layout global
Duas colunas em `display:flex; min-height:100vh`.

**Sidebar** — 252px fixa, `padding: 22px 16px`, `flex-direction:column; gap:26px`, borda direita 1px. Conteúdo, de cima para baixo:
1. Marca: quadrado 34px, raio 11px, fundo = acento, texto "VF" branco 15px/700; ao lado "Venda Fácil" 14.5px/700 e "Controle de vendas" 11px.
2. Nav: label de grupo "OPERAÇÃO" (10px/600/uppercase/.09em) + 5 itens. Item = botão full-width, `padding:9px 10px`, raio 9px, 13.5px/500, `gap:10px`: dot de 7px (acento quando ativo, senão cinza), label flexível, contagem à direita em mono 10.5px `opacity:.6`. Contagens: Dashboard —, Clientes 36, Produtos 45, Tabela de preços 45, Vendas 128. Ativo: fundo `rgba(255,255,255,.10)` (tema escuro) / `#fff` (claro), texto branco/ink.
3. Rodapé (`margin-top:auto`): card "Meta do mês" (68% de R$ 18.000 + barra de 5px) e linha de usuário (avatar 30px "MR", "Marcos R." / "Papelaria Central", botão "Sair" 11.5px sem borda).

**Topbar** — `position:sticky; top:0`, `padding:16px 32px`, fundo `rgba(255,255,255,.72)` + `blur(8px)`, borda inferior. Esquerda: campo de busca (máx 340px, raio 10px, fundo `#f2f0eb`, ícone = círculo 11px com borda 1.5px, placeholder "Buscar cliente, produto ou venda"). Direita: "Novo cliente" e "Novo produto" (secundários: fundo branco, borda `#dcd8d0`, 13px/600, `padding:9px 14px`) e "+ Nova venda" (primário: fundo acento, texto branco, `padding:9px 16px`).

**Conteúdo** — `padding:28px 32px 48px`, `max-width:1280px`.

**Cabeçalho de página** (todas as telas): `<h1>` 25px + subtítulo 13.5px `#7c786f` à esquerda, ação primária à direita, `margin-bottom:20–22px`.

## Screens / Views

### 1. Dashboard
Propósito: leitura rápida de faturamento, lucro e ritmo de vendas do período.
- Título "Bom dia, Marcos" / "Junho de 2026 · 12 vendas nos últimos 7 dias". À direita, segmented control de período (`Hoje | Este mês | Ano`) — trilha `#eeece7`, borda `#e4e1da`, padding 3px, item ativo branco com sombra; padrão "Este mês".
- **Grid superior** `1.4fr 1fr`, gap 16px:
  - **Hero escuro** (`#151417`, raio 16, padding 22): eyebrow "FATURAMENTO DO MÊS" (11.5px/600/uppercase, `rgba(255,255,255,.5)`); valor `R$ 12.480,00` (40px mono, centavos menores); linha "Lucro **R$ 5.312,00**" (verde `#7ee2b0`) e "Margem **42,6%**"; badge `+18,4%` no topo direito (`rgba(126,226,176,.16)` / `#7ee2b0`, pill). Abaixo, gráfico de 14 barras (`display:flex; gap:5px; height:96px`, `align-items:flex-end`), alturas em % `[42,58,30,71,48,88,62,35,74,96,55,68,80,46]`, raio `4px 4px 2px 2px`, cor `rgba(255,255,255, .16 + v/400)` e `#7ee2b0` quando v > 85. Eixo: `01 JUN / 15 JUN / 30 JUN` em mono 10.5px `rgba(255,255,255,.38)`.
  - **4 KPIs** em grid 2×2 (card branco, raio 14, padding 16): label 11.5px, valor 24px mono, delta 11.5px/600 colorido. Dados: Vendas no mês `128` "+12 vs. maio" (verde) · Ticket médio `R$ 97,50` "+R$ 6,20" (verde) · Produtos `45` "4 sem preço" (âmbar `#b0742a`) · Clientes `36` "+3 novos" (verde).
- **Grid inferior** `1.4fr 1fr`, gap 16px, `margin-top:16px`:
  - **Vendas recentes**: header "Vendas recentes" + link "Ver todas" (cor acento, navega para Vendas). 5 linhas: avatar 28px raio 8 com iniciais, nome 13px/600, "N itens · dd/mm/aaaa" 11.5px, total mono à direita, lucro mono verde.
  - **Produtos mais vendidos**: 4 linhas nome + quantidade mono, barra de 6px (trilha `#f0eee9`) na cor do acento com opacidade decrescente: Caderno A6 84 un (100%, 1.0) · Agenda A6 2 dias 61 un (73%, .8) · Kit curso básico 48 un (57%, .6) · Adesivo laminado 5x5 30 un (36%, .42).

### 2. Clientes
Subtítulo "36 cadastrados · 12 compraram este mês"; ação "+ Novo cliente".
- Card de tabela (branco, raio 14, `overflow:hidden`). Barra de filtro no topo: input "Filtrar clientes" (máx 280px, fundo `#f4f2ed`, raio 9) + "Ordenado por nome" 12px.
- Colunas: Cliente · Fantasia · Endereço · Telefone · Ações (direita).
- Célula Cliente: avatar 30px raio 9 (`#f2f0eb`, iniciais 11.5px/600 `#5c5951`) + nome 13px/600.
- Endereço ausente → texto "Não informado" em `#b6b2a9`.
- Telefone em mono, formatado `67 99129-6860`.
- Ações: dois botões 28×28 raio 8 — editar (`✎`, borda `#e6e3dc`, ícone `#7c786f`) e excluir (`×`, borda `#f0dcd9`, ícone `#c0453a`). **Substituir por ícones do icon set do codebase (pencil / trash).**
- Dados: 12 clientes (Adrielle/3A Fitness/Grupo Pereira, Aline/Do Leo Heitor/—, Amanda/Psicologia/Jardim Aeroporto, Amanda/Store Amanda Make/—, Beatriz/Beatriz/Tijuca, Bianca Rodríguez Beauty/Bianca Beauty/—, Camila Alber/Camila Alber/Tv. José de Oliveira Lima 101 — Jd. dos Estados, Cristiane/Cristiane/R. Cel. Athos P. da Silveira 565, Derina/Derina/Nova Campo Grande, Edinete/Mae/Villa Popular, Eduarda/Studio/—, Eliza/MB/—).

### 3. Produtos
Subtítulo "45 itens · 4 sem preço definido"; ação "+ Novo produto".
- Grid de 3 colunas, gap 14. Card: nome 13.5px/600 + categoria 11.5px `#9a968d`; badge no topo direito ("Ativo" cinza `#eef1ef`/`#5c5951`, ou "Revisar margem" âmbar quando margem < 60%). Rodapé separado por borda superior com três métricas (Custo, Venda, Margem — micro-label uppercase + valor mono 14px); Margem alinhada à direita, verde `#1a7f52` ou vermelha `#b03a2e` se < 60%.
- Dados: Caderno A5 80 folhas/Cadernos/R$ 13,17/R$ 45,04/128% · Agenda A6 2 dias/Agendas/R$ 5,86/R$ 34,28/290% · Kit curso básico/Kits/R$ 6,10/R$ 27,45/200% · Apostila/Impressos/R$ 10,50/R$ 12,07/15% · Adesivo laminado 5x5/Adesivos/R$ 0,14/R$ 0,25/80% · Placa de mesa/Personalizados/R$ 0,73/R$ 1,80/145%.

### 4. Tabela de Preços
Subtítulo "Custo, despesa e margem por produto · 2 itens com lucro negativo"; ação "+ Novo preço".
- Linha de chips-filtro (pills 12px/600): "Todos" ativo (fundo `#151417`, texto branco), "Lucro negativo · 2", "Margem abaixo de 60% · 3" (branco, borda `#e2dfd8`).
- Colunas: Produto · Custo (dir.) · Despesa (dir.) · Margem (esq.) · Preço de venda (dir.) · Lucro (dir.) · Ações.
- Célula Margem: barra de 56×5px (trilha `#f0eee9`), largura = `min(100, margem/3)%`, cor acento ou `#d98a3a` se margem < 60%; ao lado o valor em mono 12px.
- Célula Lucro: valor mono 12.5px/600 dentro de pill `padding:3px 8px`, raio 7 — verde `#e8f3ec`/`#1a7f52`, ou vermelho `#fbecea`/`#b03a2e` quando negativo.
- Dados (produto, custo, despesa, margem, preço, lucro): Placa de mesa 0,73/50%/145%/1,80/0,70 · Kit curso básico 6,10/50%/200%/27,45/18,30 · Agenda A6 2 dias 5,86/50%/290%/34,28/25,49 · Bloco M personalizado 4,99/50%/140%/17,96/10,48 · Apostila 10,50/50%/15%/12,07/**-3,68** · Agendamento anual 23,86/50%/137%/84,82/49,03 · Adesivo laminado 5x5 0,14/100%/80%/0,25/**-0,03** · Cartão sulfite 0,09/50%/80%/0,16/0,03 · Caderno A6 5,12/50%/264%/27,96/20,28 · Caderno A5 80 folhas 13,17/50%/128%/45,04/25,29.

### 5. Vendas
Subtítulo "128 vendas em junho · ticket médio R$ 97,50"; ação "+ Nova venda".
- Três cards de resumo (grid 3, gap 14): Total faturado `R$ 12.480,00` · Lucro acumulado `R$ 5.312,00` (verde) · Itens vendidos `1.406`.
- Tabela: Cliente (avatar + nome) · Data (mono, `#7c786f`) · Itens (dir., mono) · Total (dir., mono 13px/600) · Lucro (dir., mono verde) · Status · Ações.
- Status: pill 11px/600 — "Pago" `#e8f3ec`/`#1a7f52`; "Pendente" `#fdf1e3`/`#96631c`.
- Dados: Gesimary 30/06 2 R$17,00 R$15,01 Pago · Gabrieli Gonsales Chuartes 30/06 1 R$21,02 R$18,06 Pago · Beatriz 30/06 130 R$143,50 R$54,05 Pendente · Kamilly Gomes 29/06 2 R$70,00 R$49,00 Pago · Emilly Olartechea 29/06 2 R$9,10 R$6,83 Pago · Camila Alber 28/06 2 R$76,00 R$50,84 Pago · Stefany 28/06 1 R$35,00 R$21,56 Pendente · Kemilly Maia 27/06 227 R$60,01 R$23,95 Pago · Evelyn Nascimento 27/06 2 R$38,00 R$30,56 Pago · Izabel 26/06 30 R$165,00 R$101,70 Pago · Bianca Rodríguez Beauty 26/06 10 R$23,00 R$10,80 Pendente.

## Modais
Padrão comum: overlay full-screen centralizado (`padding:24px`), painel branco raio 18, sombra grande; header com título 18px/700 + subtítulo 12.5px `#8d897f` + botão fechar 30×30 (raio 9, borda `#e6e3dc`); corpo `padding:20px 24px`; footer `#faf9f7` com borda superior e botões alinhados à direita ("Cancelar" secundário + primário no acento). Fecha por clique no overlay, no `×` ou em Cancelar (clique no painel não propaga). Inputs: `padding:10px 12px`, raio 10, borda `#e2dfd8`, fundo `#faf9f7`, 13px; label 12px/600 `#5c5951` acima, `gap:6px`.

- **Novo cliente** (máx 520px): sub "Só o nome é obrigatório — o resto pode vir depois."; grid 2 colunas — Nome, Fantasia, Endereço (largura total), Telefone, Tabela de preço (select: Padrão/Atacado). CTA "Cadastrar cliente".
- **Novo produto** (máx 560px): sub "Informe custo e margem — o preço de venda é sugerido."; grid 3 colunas — Nome (largura total), Custo, Despesa, Margem; faixa de resultado verde (`#f3f6f4`, borda `#e0eae4`) com "Preço de venda sugerido" e `R$ 45,04` (18px mono `#14663f`) — deve recalcular ao vivo a partir de custo/despesa/margem. CTA "Cadastrar produto".
- **Nova venda** (máx 680px): sub "O lucro é calculado a partir da tabela de preços."; linha 1 grid `1.3fr 1fr` — Cliente (select) e Data (mono, 30/06/2026); linha 2 — Adicionar produto (select com preço no label), Qtd (96px) e botão "Adicionar"; lista de itens em bloco com borda (nome + "qtd × unitário", total mono, lucro mono verde, remover `×`); rodapé de resumo `#faf9f7` com Itens `3`, Total `R$ 90,20`, Lucro `R$ 61,40` e "Margem **68,1%**" à direita. CTA "Salvar venda".

## Interactions & Behavior
- Nav da sidebar troca a tela; abrir modal fecha nada além de si (a nav zera o modal aberto).
- "Ver todas" no dashboard navega para Vendas.
- Segmented control de período só muda o filtro visual (no protótipo os números são fixos; na implementação deve refazer a consulta).
- Entrada de tela e de modal animam com `vfIn` (ver tokens). Botões de ícone e linhas de tabela devem ganhar hover discreto (fundo `#faf9f7` na linha, borda `#dcd8d0` no botão).
- Estados a implementar que o protótipo não cobre: loading (skeleton nas linhas), vazio (o app atual mostra "Nenhuma venda registrada neste período." — manter, centralizado, 13px `#9a968d`, com CTA "+ Nova venda"), erro de gravação (toast) e validação de formulário (Nome obrigatório em cliente; Nome + Custo em produto; Cliente + ≥1 item em venda).
- Responsivo: abaixo de ~1100px a sidebar deve colapsar (drawer ou barra de ícones); grids `1.4fr 1fr` viram uma coluna; tabelas rolam horizontalmente ou viram cards por linha no mobile.

## State Management
- `screen`: `dash | clientes | produtos | precos | vendas`.
- `modal`: `null | cliente | produto | venda`.
- `period`: `Hoje | Este mês | Ano`.
- Carrinho da venda: array de `{ produtoId, qtd, precoUnit, custoUnit }`; totais (itens, total, lucro, margem) derivados, não armazenados.
- Dados: coleções de clientes, produtos, preços (custo/despesa/margem/preço/lucro) e vendas. Lucro por item = `preço − custo × (1 + despesa)`; margem da venda = `lucro / total`.
- Tokens de aparência tweakáveis no protótipo (acento, sidebar escura/clara, densidade de tabela `14px` vs `9px` de padding vertical) — implementar como tema/preferência só se fizer sentido no produto.

## Assets
Nenhum asset binário. Fontes via Google Fonts (`Plus Jakarta Sans`, `IBM Plex Mono`). Os "ícones" do protótipo são placeholders geométricos/glifos (`✎`, `×`, círculos com borda) — **trocar pelo icon set do codebase** (busca, editar, excluir, sacola, pacote, etiqueta, usuários, dashboard, sair). Nenhuma marca de terceiros usada.

## Files
- `Venda Facil Redesign.dc.html` — protótipo com as 5 telas e os 3 modais; estilos inline (valores exatos) e dados de exemplo na classe de lógica no fim do arquivo.
- `support.js` — runtime do formato de componente de design; necessário só para abrir o protótipo no navegador, **não** para a implementação.
