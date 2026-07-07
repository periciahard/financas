# Como adicionar os logos oficiais dos bancos

Este app não pode incluir os logos oficiais de bancos por conta própria (são marcas
registradas de terceiros), mas ele já está pronto para usá-los se você adicionar os
arquivos aqui.

## Passo a passo

1. Baixe o logo oficial de cada banco (nos sites de imprensa/marca deles, ou em bancos
   de logos como Wikimedia Commons / brandfetch, formato PNG com fundo transparente,
   de preferência quadrado, ex.: 256×256px).
2. Salve os arquivos **exatamente** com estes nomes dentro desta pasta
   (`icons/banks/`):
   - `itau.png`
   - `bradesco.png`
   - `nubank.png`
3. Pronto — não precisa mexer em nenhum código. Ao carregar a aba "Cartões", o app
   tenta mostrar o arquivo real; se o arquivo não existir, ele volta automaticamente
   para o selo colorido estilizado que já existia (então nada quebra se você adicionar
   só alguns bancos, ou nenhum).

Se seus cartões usarem outra bandeira/banco (fora Itaú, Bradesco e Nubank), me avise
o nome usado no app (aparece em `cardBrandInfo` no `app.js`) que eu adiciono o mapeamento
para o nome do arquivo correspondente.
