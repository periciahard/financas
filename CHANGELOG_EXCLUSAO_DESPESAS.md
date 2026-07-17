# Exclusão de despesas

## Correção da função `digest` no Supabase

- A função criptográfica `digest` passou a ser chamada explicitamente como `extensions.digest`, conforme a organização de extensões do Supabase.
- O script agora garante a existência do esquema `extensions` antes de habilitar o `pgcrypto`.
- Corrigido o erro `function digest(text, unknown) does not exist` ao salvar ou carregar dados na nuvem.

## Correção do salvamento no Supabase

- Corrigido o erro `Maximum call stack size exceeded` ao salvar bases financeiras grandes na nuvem.
- A conversão do conteúdo criptografado para Base64 agora é realizada em blocos, sem ultrapassar o limite de chamadas do navegador.
- A leitura do backup também passou a usar conversão iterativa, compatível com arquivos maiores.

## Supabase configurado

- Adicionada a URL pública do projeto Supabase e sua chave publicável ao arquivo de configuração.
- A URL da API REST foi normalizada para a URL raiz exigida pelo cliente Supabase.
- Nenhuma chave secreta ou `service_role` foi incluída no site.

## Validação do nome da despesa

- O Assistente financeiro não aceita mais comandos genéricos, como “inserir uma despesa”, como nome da compra.
- Ao receber esse tipo de comando, ele permanece na etapa inicial e solicita o nome real do estabelecimento ou da despesa.
- O lançamento incorreto denominado “inserir uma despesa” é removido automaticamente dos dados já salvos.
- A mesma validação foi aplicada ao formulário tradicional de nova despesa.

## Receitas mensais por pessoa

- Criados na aba Relatórios os campos “Receita de Felipe” e “Receita de Rafaela”, vinculados ao mês e ao ano selecionados.
- O total das duas receitas atualiza automaticamente Dashboard, Relatórios, saldo, comprometimento e projeções.
- Os valores ficam salvos separadamente por competência e podem variar de um mês para outro.
- Enquanto um mês futuro não tiver valor próprio, ele utiliza a última receita mensal cadastrada, facilitando o planejamento.

## Fatura de agosto de 2026

- Fatura do Nubank Felipe substituída pela relação completa de 24 lançamentos informada pelo usuário, totalizando R$ 1.669,20.
- Valores e parcelas passaram a refletir exatamente a fatura: C&A R$ 93,34 (1/3), Jim R$ 28,19 (1/10), Banca Santana R$ 60,00 (1/2), OpenAI R$ 26,89 e IOF R$ 0,94, além dos demais itens.
- As parcelas começam na fatura de agosto de 2026 e avançam automaticamente pelos meses e anos seguintes.
- A inclusão também é aplicada aos dados já salvos no navegador, sem duplicar os lançamentos em novas aberturas.
- Removido o corte que mostrava somente as seis maiores compras dentro de cada cartão; agora todas ficam disponíveis na lista com rolagem vertical.
- Recalculadas as 77 parcelas restantes das compras da fatura de agosto, distribuídas de setembro de 2026 até junho de 2027 conforme a numeração de cada parcelamento.
- Removidas as projeções antigas correspondentes antes da inclusão das parcelas atualizadas, evitando duplicidades nos meses seguintes.

- Adicionado botão de lixeira nas despesas fixas e variáveis.
- Adicionado botão de lixeira nas compras exibidas nos cartões.
- Incluída confirmação antes da exclusão para evitar remoções acidentais.
- A exclusão atualiza imediatamente totais, gráficos e projeções.
- A operação fica registrada no histórico local.

Nas despesas fixas e variáveis, a exclusão remove o item e seus valores de todos os meses. Nas compras de cartão, remove somente a parcela exibida na fatura selecionada.

## Correção dos cartões

- Corrigido o filtro “Empresa”, que podia receber automaticamente o e-mail salvo no navegador e ocultar as compras dentro de cada cartão.
- A busca agora só é aplicada depois de uma ação intencional do usuário no campo.
- A associação das compras aos cartões passou a tolerar diferenças de maiúsculas, acentos e espaços nos nomes.

## Dashboard compacto e navegável

- Reduzido o tamanho dos sete cartões centrais de resumo.
- “Fixas”, “Variáveis” e “Cartões” agora abrem diretamente suas respectivas abas.
- “Receitas”, “Comprometimento”, “Total do mês” e “Superávit/Déficit” abrem a aba “Relatórios”.
- Mantida uma disposição compacta em duas colunas nas telas pequenas.

## Atualização forçada da interface

- Alterada a estratégia do aplicativo offline para priorizar sempre os arquivos novos publicados.
- Atualizado o identificador do cache e adicionada versão aos arquivos JavaScript.
- Incluído recarregamento automático quando uma nova versão do aplicativo assumir o controle.
- Redução adicional e mais perceptível dos cartões de resumo.
- Adicionado tratamento global dos cliques nos atalhos do Dashboard.

## Reorganização e compactação geral

- Removido o bloco “Resumo por cartão” do Dashboard.
- Transferidos para “Relatórios”: comprometimento da renda, fluxo e saldo mensal, distribuição do mês, insights, resumo mensal, maiores empresas e projeção anual.
- Reduzidos cards, gráficos, tabelas, categorias, indicadores e cards individuais dos cartões em todas as abas.
- O Dashboard passou a concentrar somente visão rápida e gastos por categoria.

## Cartões compactos e ações organizadas

- Reduzidos novamente os cards de cartões e os indicadores das demais abas.
- Aproximadas as colunas Compra, Parcela e Valor.
- Impedida a quebra do texto da parcela em duas linhas.
- Substituída a lixeira por menu vertical com “Mudar categoria” e “Excluir”.
- Lista geral de compras compactada, com categoria visível e editável.
- Controles de mês, busca e nova despesa alinhados horizontalmente com o título das abas em telas largas.

## Distribuição otimizada e listas compactas

- Aumentada a largura útil das colunas Parcela e Valor, evitando cruzamentos.
- Removidas as caixas sombreadas externas dessas duas colunas.
- Eliminada a repetição de status quando parcela e status possuem o mesmo texto.
- Subtítulos dos indicadores colocados entre parênteses ao lado do título.
- Reduzidas a altura dos indicadores e a área vazia acima das barras dos gráficos.
- “Gastos por categoria” transformado em uma única lista compacta no Dashboard.

## Dashboard limpo e cartões responsivos

- Removido o selo técnico de versão da interface.
- Removidas as descrições redundantes entre parênteses somente no Dashboard.
- Valores do Dashboard reposicionados para evitar cortes.
- Colunas dos cartões alteradas para proporções flexíveis, sem larguras mínimas rígidas.
- Eliminada a rolagem horizontal da lista interna de compras.

## Planejamento por ano

- Removido o indicador “Categorias” das abas de despesas.
- Todas as categorias passam a iniciar recolhidas.
- Adicionado seletor de ano de 2026 a 2040 no Dashboard, Fixas, Variáveis, Cartões e Relatórios.
- Compras, faturas, relatórios, projeções e parcelas passam a respeitar o ano selecionado.
- Ajustadas as barras para preservar os valores no topo.
- Reduzidos o gráfico de fluxo e o card de comprometimento da renda.

## Adicionar por conversa

- Criado fluxo conversacional dentro do site para celular e computador.
- Perguntas sequenciais para descrição, valor, tipo, cartão, parcelas, categoria, mês, ano e recorrência.
- Resumo completo antes da confirmação.
- Geração automática de parcelas nos meses e anos correspondentes.
- Atualização da mesma base usada por cartões, gráficos e relatórios.

## Orçamentos conversacionais

- Alimentação, Combustível e Água mineral usam referências aos itens existentes, sem copiar seus valores.
- O limite é consultado dinamicamente conforme mês e ano selecionados.
- Frases como “gastei 10 reais no supermercado” registram o consumo diretamente.
- Perguntas como “quanto ainda tenho para alimentação?” retornam orçamento, gasto e disponível.
- Criada lista compacta de orçamentos disponíveis no Dashboard.
- Os consumos não são somados novamente às despesas planejadas, evitando dupla contagem.

## Relatório de orçamentos

- “Adicionar por conversa” renomeado para “Assistente financeiro”.
- Criada tabela na aba Relatórios para Alimentação, Combustível e Água mineral.
- A tabela mostra orçamento, gasto, disponível, percentual utilizado e situação.
- Mês e ano da tabela acompanham os seletores da aba Relatórios.
