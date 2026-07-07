# CHANGELOG — V33.2.3 Correções

## Corrigido (crítico)

- **Dados corrompidos em `financeiro-data.js` que impediam o carregamento de todo o arquivo de dados-semente.** Três compras (cartão, "Ortobom", maio/junho/julho) tinham `"valor": 33.2.2` — um número inválido em JavaScript — e um item de feira ("sabonete") tinha `"total": 33.2.26`. Como o arquivo é carregado via `<script>`, um erro de sintaxe como esse interrompe a execução do arquivo inteiro: o app carregava com a base de dados vazia, mesmo com os dados "existindo" no arquivo. As 3 compras do cartão foram zeradas e marcadas com "(REVISAR VALOR - dado corrompido na importação)" no nome (o valor original não pôde ser recuperado); o total da feira foi recalculado corretamente (preço × quantidade = 33,12).
- **Sincronização em nuvem (Supabase) estava com a interface ausente.** O `app.js` já tinha toda a lógica de `cloudSave`/`cloudLoad`, mas o `index.html` nunca teve os campos `familyKey`, `cloudStatus`, `btnCloudSave`, `btnCloudLoad`. O recurso existia no código mas era impossível de usar pela interface. Adicionado o bloco completo na aba "Exportar / Backup".

## Adicionado

- **Criptografia ponta-a-ponta dos dados sincronizados**: antes de qualquer envio ao Supabase, os dados são criptografados no navegador (AES-GCM, chave derivada do código familiar via PBKDF2/150k iterações). O banco armazena apenas texto cifrado — quem tiver acesso ao banco sem o código familiar não consegue ler nada. Compatível com dados antigos não criptografados já salvos.
- **Proteção contra força bruta no código familiar**: nova tabela e lógica no `supabase.sql` que bloqueiam tentativas de leitura por 15 minutos após 15 tentativas malsucedidas seguidas com o mesmo código.
- **Aviso de conflito de sincronização**: ao salvar na nuvem, o app agora avisa se detectar uma versão mais recente salva por outro dispositivo, evitando sobrescrever silenciosamente.
- **Indicador de "última sincronização"** visível na aba de backup.
- **Seletor de usuário ativo** na barra lateral ("Quem está usando"): o histórico de alterações agora registra corretamente quem fez cada mudança, em vez de sempre atribuir a "Felipe".
- **Exportação em CSV** (além do backup em JSON), útil para abrir em planilha ou enviar a um contador.
- **Ícone para tela de início no iOS** (`apple-touch-icon`) e favicon — antes só funcionava corretamente em Android.
- **Teste de regressão automatizado** (`test/check-ui-bindings.js`, sem dependências): valida que todo elemento referenciado pelo JavaScript existe no HTML e que os arquivos de dados carregam sem erro de sintaxe. Rode com `node test/check-ui-bindings.js`. Foi esse teste que revelou os dois bugs críticos acima.

## Não alterado

- Estrutura geral de dados, backup e restauração.
- Interface visual (escala/layout da V33.2.2 mantida).
- Chaves de armazenamento local (`localStorage`), para não perder dados de quem já usa o app — apenas o cache do Service Worker foi renovado para garantir que os arquivos corrigidos sejam realmente baixados.

## Recomendação

Depois de aplicar esta versão, se você usa sincronização em nuvem, rode o script `supabase.sql` novamente no seu projeto Supabase (é seguro rodar de novo — usa `create or replace` e `create table if not exists`, não apaga dados existentes) para ativar a proteção contra força bruta.

## Corrigido (adicional — pós V33.2.3)

- **Cartões contados em dobro no total de despesas.** Dentro da lista de "Despesas variáveis" existia um item legado chamado "Cartões" (importado da planilha original), cujos valores mensais já representavam o total das faturas. Como o app também soma o total real dos cartões separadamente (a partir das compras registradas na aba "Cartões"), esse valor estava sendo somado duas vezes no total de despesas do mês — no Dashboard, nos Relatórios e no saldo projetado. A correção exclui esse item legado do cálculo do total de despesas variáveis (no Dashboard, Relatórios e na própria aba "Despesas variáveis"), já que os cartões continuam sendo contabilizados normalmente pela aba "Cartões". O item "Cartões" continua visível na lista de despesas variáveis, caso você queira revisá-lo ou apagá-lo manualmente.

## Corrigido (V33.2.4)

- **A correção anterior do cartão duplicado "não pegava" no navegador.** O app é um PWA com Service Worker em modo cache-first, com nome de cache fixo — por isso, mesmo publicando os arquivos corrigidos, o navegador continuava servindo o `app.js` antigo do cache. O nome do cache foi alterado (`financas-familia-v33-2-4-correcoes`), o que força o Service Worker a instalar a versão nova e descartar a antiga. **Depois de atualizar os arquivos, feche completamente e reabra o app (ou dê um refresh forçado) uma vez para o novo Service Worker assumir.**
- **Números dos cartões (KPIs) enormes e cortados.** Uma regra de CSS (`#kpis .kpiText .value`), adicionada em uma camada posterior de estilo, forçava a fonte dos valores em até 44px, o que cortava valores como "R$ 17.175,40" dentro do card. Reduzido para um tamanho que cabe no card e passa a quebrar linha em vez de cortar, caso o valor seja muito longo.
- **Resumo de totais dos cartões movido para o topo** da aba "Cartões" (Total em faturas, Maior fatura, Parcelas ativas, Utilização total, Compromisso futuro), antes dos cartões individuais.

## Observação sobre logos dos bancos

Os "logos" atuais (Itaú, Bradesco, Nubank) já usam as cores oficiais de cada marca com um ícone estilizado — não são logotipos oficiais reproduzidos, pois este ambiente não tem acesso à internet para baixar os arquivos originais dos bancos. Se você tiver os arquivos oficiais (PNG/SVG) dos logos, posso embuti-los como imagens reais no app.

## Corrigido (V33.2.5)

- **O item "Cartões" foi removido de vez da lista de despesas variáveis** — não é mais só excluído do total, ele nem aparece mais na lista/aba "Despesas variáveis". A remoção acontece na camada de normalização dos dados (`normalize()`), então funciona tanto para instalações novas quanto para quem já tinha dados salvos no navegador (o item é limpo automaticamente na próxima abertura do app, sem precisar apagar nada manualmente).
- Cartões continuam sendo contabilizados normalmente, só que exclusivamente pela aba "Cartões" (compras registradas), sem duplicidade.

## Adicionado (V33.2.5 — logos)

- **Suporte a logos oficiais reais dos bancos.** O app não pode baixar/incorporar logos de bancos por conta própria (são marcas registradas de terceiros), mas agora está preparado para usá-los: se você colocar os arquivos `itau.png`, `bradesco.png` e `nubank.png` na pasta `icons/banks/`, o app passa a exibi-los automaticamente nos cartões. Sem arquivo = mantém o selo colorido estilizado atual (nada quebra). Instruções detalhadas em `icons/banks/LEIA-ME.md`.

## Corrigido (V33.2.7 — urgente)

- **A mudança dos logos quebrou a interface inteira ("desconfigurou tudo").** O código anterior gerava um atributo `onerror="..."` que continha aspas duplas dentro de aspas duplas, o que interrompia a tag HTML no meio e corrompia todo o restante do bloco de cartões (e, por consequência, o layout). Corrigido usando uma função global (`bankLogoFallback`) com atributos `data-*` em vez de HTML embutido dentro do atributo — sem aspas aninhadas, sem risco de quebra.
