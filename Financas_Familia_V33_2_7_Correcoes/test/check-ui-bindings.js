#!/usr/bin/env node
/**
 * Teste de regressão leve — sem dependências externas.
 *
 * Este script existe porque uma versão anterior do app referenciava, em app.js,
 * elementos de interface (familyKey, cloudStatus, btnCloudSave, btnCloudLoad) que
 * nunca haviam sido adicionados ao index.html. Como o código usa `$(id)` com
 * checagem de null, o recurso simplesmente não aparecia — sem erro, sem aviso.
 *
 * Rode com: node test/check-ui-bindings.js
 * Saída: 0 (sucesso) ou 1 (falha) — pode ser usado em CI.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

let failures = 0;
function fail(msg) { failures++; console.error('✗ ' + msg); }
function ok(msg) { console.log('✓ ' + msg); }

// 1) Todo id referenciado via $('algumId') em app.js deve existir em index.html
const idsInHtml = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
);
const idsUsedInJs = new Set(
  [...js.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1])
);
const missing = [...idsUsedInJs].filter(id => !idsInHtml.has(id));
if (missing.length) {
  fail(`app.js referencia id(s) que não existem em index.html: ${missing.join(', ')}`);
} else {
  ok(`Todos os ${idsUsedInJs.size} ids referenciados em app.js existem em index.html.`);
}

// 2) financeiro-data.js deve carregar como objeto válido com estrutura mínima
try {
  const dataSrc = fs.readFileSync(path.join(ROOT, 'financeiro-data.js'), 'utf8');
  const sandbox = { window: {} };
  new Function('window', dataSrc)(sandbox.window);
  const seed = sandbox.window.SEED_DATA;
  if (!seed) throw new Error('window.SEED_DATA não foi definido.');
  if (!Array.isArray(seed.meses) || seed.meses.length !== 12) throw new Error('seed.meses deve ter 12 itens.');
  if (!Array.isArray(seed.fixas)) throw new Error('seed.fixas ausente.');
  ok('financeiro-data.js carrega e tem estrutura mínima válida (12 meses, fixas presentes).');
} catch (e) {
  fail('financeiro-data.js inválido: ' + e.message);
}

// 3) supabase-config.js deve carregar sem lançar erro
try {
  const cfgSrc = fs.readFileSync(path.join(ROOT, 'supabase-config.js'), 'utf8');
  const sandbox = { window: {} };
  new Function('window', cfgSrc)(sandbox.window);
  if (!sandbox.window.SUPABASE_CONFIG) throw new Error('window.SUPABASE_CONFIG não definido.');
  ok('supabase-config.js carrega corretamente.');
} catch (e) {
  fail('supabase-config.js inválido: ' + e.message);
}

// 4) manifest.webmanifest deve ser JSON válido com ícones
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  if (!Array.isArray(manifest.icons) || !manifest.icons.length) throw new Error('sem ícones.');
  ok('manifest.webmanifest é JSON válido e tem ícones.');
} catch (e) {
  fail('manifest.webmanifest inválido: ' + e.message);
}

console.log('');
if (failures) {
  console.error(`${failures} verificação(ões) falharam.`);
  process.exit(1);
} else {
  console.log('Todas as verificações passaram.');
  process.exit(0);
}
