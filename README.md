# Finanças Família — V33.2.3 Correções

Aplicativo web (PWA) de organização financeira familiar: despesas fixas e variáveis,
cartões de crédito, relatórios, backup/importação e sincronização opcional em nuvem.

Veja `CHANGELOG_V33_2_3.md` para a lista completa de correções desta versão — inclui
uma correção crítica de dados corrompidos que fazia o app carregar vazio.

## Como usar

Basta abrir `index.html` num navegador, ou hospedar a pasta inteira em qualquer
servidor estático (GitHub Pages, Netlify, Vercel, etc.). Os dados ficam salvos no
`localStorage` do navegador por padrão — funciona 100% offline.

## Sincronização em nuvem (opcional)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode o conteúdo de `supabase.sql` no editor SQL do seu projeto.
3. Preencha `supabase-config.js` com a URL e a `anon key` do projeto.
4. Na aba "Exportar / Backup" do app, defina um código familiar (uma frase-senha só
   sua, com pelo menos 8 caracteres) e use "Salvar na nuvem" / "Carregar da nuvem".

Os dados são criptografados no seu navegador antes de saírem para o Supabase — o
código familiar funciona como senha de criptografia, então **se você esquecê-lo, os
dados salvos na nuvem não podem ser recuperados**.

## Testes

Um teste de regressão simples (sem dependências) valida a integridade dos arquivos:

```
node test/check-ui-bindings.js
```

Rode isso depois de qualquer edição manual nos arquivos, especialmente em
`financeiro-data.js` — um erro de sintaxe nesse arquivo faz o app carregar vazio
sem nenhum aviso visível, como aconteceu na versão anterior.

## Status

Versão recomendada — corrige o problema de dados corrompidos e ativa a
sincronização em nuvem, que antes existia no código mas não aparecia na interface.
