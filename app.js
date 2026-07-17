const STORAGE_VERSION='v33.2.2-interface-compacta';
(function(){
'use strict';


const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const ANOS=Array.from({length:15},(_,i)=>2026+i);
const CATEGORIAS=['Moradia','Alimentação','Saúde','Veículos','Educação','Assinaturas','Lazer','Compras','Transporte','Outros'];
const BUDGET_CONTROLS=[
  {id:'alimentacao',label:'Alimentação',refId:'f8',refName:'Alimentação',keywords:['alimentacao','supermercado','mercado','feira','comida']},
  {id:'combustivel',label:'Combustível',refId:'f3',refName:'Combustível',keywords:['combustivel','gasolina','etanol','diesel','posto','abasteci','abastecimento']},
  {id:'agua_mineral',label:'Água mineral',refId:'f5',refName:'Água mineral',keywords:['agua mineral','garrafao','garrafoes']}
];
const FATURA_NUBANK_FELIPE_AGOSTO_2026=[
  {id:'cea',data:'2026-07-14',empresa:'Cea Crs 465 Ecpc',valor:93.34,atual:1,total:3,categoria:'Compras'},
  {id:'netflix',data:'2026-07-13',empresa:'Netflix.Com',valor:44.90,categoria:'Assinaturas'},
  {id:'jim',data:'2026-07-05',empresa:'Jim.Com* 52389421 Art',valor:28.19,atual:1,total:10,categoria:'Compras'},
  {id:'bancasantana-120',data:'2026-07-04',empresa:'Bancasantana',valor:60,atual:1,total:2,categoria:'Compras'},
  {id:'banca-santana-180',data:'2026-07-03',empresa:'Banca Santana',valor:180,categoria:'Compras'},
  {id:'matuto',data:'2026-07-02',empresa:'Zp *Matuto Sofisticado',valor:209.90,categoria:'Outros'},
  {id:'openai',data:'2026-06-30',empresa:'OpenAI',valor:26.89,categoria:'Assinaturas'},
  {id:'iof-openai',data:'2026-06-30',empresa:'IOF de compra internacional',valor:0.94,categoria:'Outros'},
  {id:'google',data:'2026-06-28',empresa:'Dl*Google Google',valor:9.99,categoria:'Assinaturas'},
  {id:'shopee-friopeas',data:'2026-06-26',empresa:'Shopee *Friopeas',valor:160.90,atual:5,total:12,categoria:'Compras'},
  {id:'mercadolivre-mercadol',data:'2026-06-26',empresa:'Mercadolivre*Mercadol',valor:22.21,atual:9,total:10,categoria:'Compras'},
  {id:'mercadopago-laismore',data:'2026-06-26',empresa:'Mercadopago *Laismore',valor:241.58,atual:12,total:12,categoria:'Compras'},
  {id:'farmacia-trabalhador',data:'2026-06-26',empresa:'Farmacia do Trabalhad',valor:26.25,atual:5,total:10,categoria:'Saúde'},
  {id:'academia-k1',data:'2026-06-26',empresa:'Academia K1',valor:79.90,atual:6,total:12,categoria:'Saúde'},
  {id:'millennium',data:'2026-06-26',empresa:'Vindi *Millenniumedit',valor:154.48,atual:2,total:8,categoria:'Educação'},
  {id:'happykids',data:'2026-06-26',empresa:'Happykids',valor:93.30,atual:2,total:3,categoria:'Compras'},
  {id:'oboticario-5',data:'2026-06-26',empresa:'Hna*Oboticario',valor:52.22,atual:5,total:10,categoria:'Compras'},
  {id:'shopee-thayshop',data:'2026-06-26',empresa:'Shopee *Thayshopbrasil',valor:9.58,atual:3,total:12,categoria:'Compras'},
  {id:'mercado-mercadolivre',data:'2026-06-26',empresa:'Mercado*Mercadolivre',valor:12.59,atual:6,total:12,categoria:'Compras'},
  {id:'ri-happy-9',data:'2026-06-26',empresa:'Ri Happy Brinquedos',valor:38.99,atual:9,total:10,categoria:'Compras'},
  {id:'shopee-usinapesca',data:'2026-06-26',empresa:'Shopee *Usinadapesca',valor:17.31,atual:2,total:12,categoria:'Compras'},
  {id:'ri-happy-2',data:'2026-06-26',empresa:'Ri Happy Brinquedos',valor:44.97,atual:2,total:2,categoria:'Compras'},
  {id:'ri-happy-5',data:'2026-06-26',empresa:'Ri Happy',valor:29.99,atual:5,total:5,categoria:'Compras'},
  {id:'oboticario-2',data:'2026-06-26',empresa:'Hna*Oboticario',valor:30.78,atual:2,total:10,categoria:'Compras'}
];
const TABS=[['dashboard','Dashboard','📊'],['fixas','Despesas fixas','🏠'],['variaveis','Despesas variáveis','🛒'],['cartoes','Cartões','💳'],['orcamentos','Relatórios','📈'],['historico','Exportar / Backup','☁️']];
const APP_VERSION='V33.3.10';
const STORE='financasFamiliaV33_2_2InterfaceCompacta';
const HIST='financasFamiliaHistoricoV33_2_2InterfaceCompacta';
let state=null;
let active='dashboard';
let selectedFixasMes=null, selectedVariaveisMes=null, selectedCartoesMes=null;
let pendingCategoriaEdit=null;

migrateLegacyStorageToV33();

const $=id=>document.getElementById(id);
const fmt=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function isGenericExpenseName(value){
  const n=norm(value).replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  return new Set(['inserir uma despesa','inserir despesa','adicionar uma despesa','adicionar despesa','cadastrar uma despesa','cadastrar despesa','registrar uma despesa','registrar despesa','nova despesa','criar uma despesa','criar despesa','quero inserir uma despesa','quero adicionar uma despesa']).has(n);
}

function mesNorm(m){
  const n=norm(m);
  const map={jan:'janeiro',janeiro:'janeiro',fev:'fevereiro',fevereiro:'fevereiro',mar:'março',marco:'março',abr:'abril',abril:'abril',mai:'maio',maio:'maio',jun:'junho',junho:'junho',jul:'julho',julho:'julho',ago:'agosto',agosto:'agosto',set:'setembro',setembro:'setembro',out:'outubro',outubro:'outubro',nov:'novembro',novembro:'novembro',dez:'dezembro',dezembro:'dezembro'};
  return map[n]||'';
}
function currentMes(){return MESES[new Date().getMonth()]}
function nameOf(x){if(x&&typeof x==='object')return String(x.nome??x.name??x.cartao??x.descricao??x.item??x.label??x.value??'').trim();return String(x??'').trim()}
function cardName(x){let raw=nameOf(x),n=norm(raw);if(n.includes('rafaela'))return 'Nubank Rafaela';if(n.includes('felipe')&&n.includes('nubank'))return 'Nubank Felipe';if(n.includes('bradesco'))return 'Bradesco';if(n.includes('itau'))return 'Itaucard Felipe';return raw||'Sem cartão'}
function valorMes(x,mes){if(x&&x.valores){for(const k in x.valores){if(norm(k)===norm(mes))return Number(x.valores[k]||0)}}if(x&&x.mes&&norm(x.mes)!==norm(mes))return 0;return Number((x&&x.valor)||0)}
function soma(arr,mes){return (arr||[]).reduce((s,x)=>s+valorMes(x,mes),0)}
function isItemCartao(x){return norm(nameOf(x)).includes('cartao')}
function variaveisSemCartao(){return (state.variaveis||[]).filter(x=>!isItemCartao(x))}
function parcelaLabel(c){
  const atual=Number(c?.parcelaAtual||0), total=Number(c?.parcelaTotal||0);
  if(atual&&total)return `${atual}/${total}`;
  const st=String(c?.status||'').trim();
  if(st)return st;
  const p=String(c?.parcela||'').trim();
  return p&&p!=='importado'?p:'';
}
function compraTitulo(c){return String(c.apelido||c.empresa||'Sem empresa').trim()}
function compraSubtitulo(c){const a=String(c.apelido||'').trim(), e=String(c.empresa||'').trim(), nf=String(c.nomeFatura||'').trim();if(a&&e&&norm(a)!==norm(e))return e;if(nf&&e&&norm(nf)!==norm(e))return nf;return c.cartao||''}
function statusParcela(c){
  const st=String(c?.status||'').trim();
  if(st)return st;
  const atual=Number(c?.parcelaAtual||0), total=Number(c?.parcelaTotal||0);
  if(atual&&total)return atual>=total?'última parcela':'ativa';
  const p=String(c?.parcela||'').trim();
  if(/recorrente|mensal/i.test(p))return 'recorrente';
  if(/vista/i.test(p))return 'à vista';
  return 'à vista';
}
function statusClass(st){const n=norm(st);if(n.includes('ultima'))return 'status-ultima';if(n.includes('encerr'))return 'status-encerrada';if(n.includes('recorr'))return 'status-recorrente';if(n.includes('vista'))return 'status-avista';if(n.includes('ativa'))return 'status-ativa';return 'status-neutra'}
function statusBadge(c){const st=statusParcela(c);return st?`<span class="statusChip ${statusClass(st)}">${esc(st)}</span>`:''}
function compraDisplay(c){const title=esc(compraTitulo(c));const sub=esc(compraSubtitulo(c));return `<div><div class="rowName">${title}</div>${sub?`<div class="rowHint">${sub}</div>`:''}</div>`}

function catEmpresa(emp){const e=norm(emp);if(/assai|atacadao|carrefour|bompreco|supermercado|mercado|hortifruti|padaria|acougue|frutaria|feira|extra/.test(e))return 'Alimentação';if(/shell|ipiranga|petrobras|posto|combustivel|gasolina|etanol|diesel/.test(e))return 'Veículos';if(/drogasil|drogaria|farmacia|pague menos|raia|unimed|clinica|hospital|medico|odont/.test(e))return 'Saúde';if(/netflix|spotify|icloud|google|apple|youtube|prime|disney|hbo|max|globoplay|microsoft|gympass/.test(e))return 'Assinaturas';if(/uber|99|estacionamento|pedagio|oficina|pneu|lavagem|seguro|onstar/.test(e))return 'Transporte';if(/escola|curso|livro|papelaria|faculdade|udemy/.test(e))return 'Educação';if(/restaurante|ifood|lanchonete|pizzaria|burger|sushi|bar|acai|cafeteria|sorveteria/.test(e))return 'Lazer';if(/amazon|mercado livre|shopee|magalu|americanas|aliexpress|shein|loja|shopping|iphone|boticario|natura|cea|c&a/.test(e))return 'Compras';return 'Outros'}
function autoCategoriaFixa(nome){const n=norm(nome);if(/condominio|aluguel|celpe|energia|internet|compesa|agua|gas|iptu|caixa/.test(n))return 'Moradia';if(/unimed|saude|exame|clinica|hospital|medico|odonto|sao gabriel|farmacia/.test(n))return 'Saúde';if(/carro|moto|seguro|combustivel|posto|onstar|ipva|licenciamento|oficina|pneu/.test(n))return 'Veículos';if(/spotify|netflix|icloud|youtube|prime|disney|assinatura|select|google|apple|antena/.test(n))return 'Assinaturas';if(/escola|curso|faculdade|educacao|livro/.test(n))return 'Educação';if(/alimentacao|feira|mercado/.test(n))return 'Alimentação';return 'Outros'}
function autoCategoriaVariavel(nome){const n=norm(nome);if(/lanche|alimentacao|feira|mercado|sobral/.test(n))return 'Alimentação';if(/cartao|cartoes/.test(n))return 'Compras';if(/spotify|youtube|netflix|assinatura/.test(n))return 'Assinaturas';if(/felipe|rafaela/.test(n))return 'Outros';return catEmpresa(nome)}
function overrideKey(tipo,nome){return tipo+':'+norm(nome)}
function categoriaItem(tipo,item){const nome=item.nome||item.item||item.descricao||'Sem nome';const key=overrideKey(tipo,nome);const ov=state?.config?.categoryOverrides?.[key];if(ov)return ov;return tipo==='fixas'?autoCategoriaFixa(nome):autoCategoriaVariavel(nome)}
function setCategoria(tipo,nome,categoria){state.config=state.config||{};state.config.categoryOverrides=state.config.categoryOverrides||{};state.config.categoryOverrides[overrideKey(tipo,nome)]=categoria;save();addHist('Categoria alterada',`${nome}: ${categoria}`)}

function statusFromFields(c){
  const atual=Number(c?.parcelaAtual||0), total=Number(c?.parcelaTotal||0);
  if(atual&&total)return atual>=total?'última parcela':'ativa';
  const p=String(c?.parcela||'').trim();
  if(/recorrente|mensal/i.test(p))return 'recorrente';
  if(/vista/i.test(p))return 'à vista';
  return 'à vista';
}
function parseParcela(p){
  const nums=String(p||'').match(/\d+/g)||[];
  return nums.length>=2?[Number(nums[0]),Number(nums[1])]:[null,null];
}
function normalizeCompraFields(c){
  c.schemaVersion='v33.2.2.2';
  c.cartao=cardName(c.cartao);
  c.mes=mesNorm(c.mes)||currentMes();
  c.mesNumero=MESES.indexOf(c.mes)+1;
  c.ano=Number(c.ano||2026);
  c.competencia=`${c.ano}-${String(c.mesNumero).padStart(2,'0')}`;
  c.empresa=String(c.empresa||c.nomeFatura||c.descricao||c.nome||'Sem empresa').trim();
  c.nomeFatura=String(c.nomeFatura||c.empresa).trim();
  c.apelido=String(c.apelido||c.empresa).trim();
  c.empresaNorm=norm(c.empresa);
  c.categoria=c.categoria||catEmpresa(c.empresa);
  c.valor=Number(c.valor||0);
  c.meio=c.meio||'Cartão';
  c.origem='normalizado';
  let [pa,pt]=parseParcela(c.parcela);
  c.parcelaAtual=Number(c.parcelaAtual||pa||0)||null;
  c.parcelaTotal=Number(c.parcelaTotal||pt||0)||null;
  if(c.parcelaAtual&&c.parcelaTotal)c.parcela=`${c.parcelaAtual}/${c.parcelaTotal}`;
  else if(/recorrente|mensal/i.test(String(c.parcela||'')))c.parcela='recorrente';
  else c.parcela='à vista';
  c.status=statusFromFields(c);
  return c;
}
function dedupeCompras(compras){
  const seen=new Set(), out=[];
  (compras||[]).forEach(c=>{
    const key=[norm(c.cartao),norm(c.empresa),c.competencia,Number(c.valor||0).toFixed(2),c.parcelaAtual||'',c.parcelaTotal||'',norm(c.apelido)].join('|');
    if(seen.has(key))return;
    seen.add(key);out.push(c);
  });
  return out;
}
function annotateParcelas(compras){
  return compras;
}

function faturaNubankFelipeAgosto2026(){
  const atuais=FATURA_NUBANK_FELIPE_AGOSTO_2026.map(c=>normalizeCompraFields({
    id:`nf-ago-2026-${c.id}`,grupoCompra:`nf-ago-2026-${c.id}`,data:c.data,
    mes:'agosto',ano:2026,cartao:'Nubank Felipe',empresa:c.empresa,nomeFatura:c.empresa,
    apelido:c.empresa,categoria:c.categoria,parcela:c.atual?`${c.atual}/${c.total}`:'à vista',
    parcelaAtual:c.atual||null,parcelaTotal:c.total||null,valor:c.valor,valorTotal:0,origem:'fatura-nubank-agosto-2026'
  }));
  const futuras=FATURA_NUBANK_FELIPE_AGOSTO_2026.filter(c=>c.atual&&c.total&&c.atual<c.total).flatMap(c=>
    Array.from({length:c.total-c.atual},(_,i)=>{
      const atual=c.atual+i+1, mesIndex=MESES.indexOf('agosto')+(i+1);
      const valor=c.id==='cea'?93.32:c.id==='jim'?28.10:c.valor;
      return normalizeCompraFields({
        id:`nf-ago-2026-${c.id}-${atual}`,grupoCompra:`nf-ago-2026-${c.id}`,data:'',
        mes:MESES[mesIndex%12],ano:2026+Math.floor(mesIndex/12),cartao:'Nubank Felipe',
        empresa:c.empresa,nomeFatura:c.empresa,apelido:c.empresa,categoria:c.categoria,
        parcela:`${atual}/${c.total}`,parcelaAtual:atual,parcelaTotal:c.total,
        valor,valorTotal:0,origem:'fatura-nubank-agosto-2026'
      });
    })
  );
  return [...atuais,...futuras];
}

function isProjecaoAntigaFaturaAgosto(c){
  if(norm(c.cartao)!=='nubank felipe')return false;
  const ordem=Number(c.ano||0)*12+MESES.indexOf(mesNorm(c.mes)),inicio=2026*12+MESES.indexOf('setembro');
  if(ordem<inicio)return false;
  const nomes=new Set(['gympass/academia','shopee','boticario','farmacia','tinta impressora','mercado livre','shopee (friopeas)','ri happy','happy kids','millennium edit']);
  return nomes.has(norm(c.empresa));
}

function ultimaValorValido(obj){
  const vals=obj?.valores||{};
  for(let i=MESES.length-1;i>=0;i--){
    const v=Number(vals[MESES[i]]||0);
    if(v>0)return v;
  }
  return Number(obj?.valor||0)||0;
}
function valorBaseFixa(obj){
  const vals=obj?.valores||{};
  const baseMes=mesNorm(state?.config?.mesBaseFixas||'julho')||'julho';
  const julho=Number(vals[baseMes]||0);
  return Number(obj?.valorRecorrente||obj?.valorPermanente||julho||ultimaValorValido(obj)||0);
}
function normalizeFixas(fixas){
  return (fixas||[]).map((x,i)=>{
    const out={...x};
    out.id=out.id||('f'+i);
    out.tipo='fixa';
    out.recorrente=true;
    out.permanente=true;
    out.valorRecorrente=valorBaseFixa(out);
    out.mesBaseRecorrencia=out.mesBaseRecorrencia||'julho';
    out.inicioRecorrencia=out.inicioRecorrencia||'2026-07';
    out.valores=out.valores||{};
    // Preserva meses anteriores e garante repetição da despesa fixa de julho a dezembro.
    const base=Number(out.valorRecorrente||0);
    MESES.forEach((m,idx)=>{
      if(idx>=MESES.indexOf('julho')) out.valores[m]=base;
      else if(out.valores[m]===undefined) out.valores[m]=0;
    });
    return out;
  });
}
function normalize(seed){
  const s=seed||{};
  let compras=(s.comprasCartao||s.compras||[]).map((x,i)=>normalizeCompraFields(Object.assign({id:x.id||('c'+i)},x)));
  const config={fixasPermanentes:true,mesBaseFixas:'julho',anoBase:2026,cardLimits:{},...(s.config||{})};
  if(!config.faturaNubankFelipeAgosto2026V3){
    compras=compras.filter(c=>{
      const faturaAlvo=norm(c.cartao)==='nubank felipe'&&norm(c.mes)==='agosto'&&Number(c.ano)===2026;
      const importacaoAnterior=String(c.id||'').startsWith('fatura-ago-2026-')||String(c.id||'').startsWith('nf-ago-2026-');
      return !faturaAlvo&&!importacaoAnterior&&!isProjecaoAntigaFaturaAgosto(c);
    });
    compras.push(...faturaNubankFelipeAgosto2026());
    config.faturaNubankFelipeAgosto2026V2=true;
    config.faturaNubankFelipeAgosto2026V3=true;
  }
  if(!config.nomesGenericosDespesaRemovidosV1){
    compras=compras.filter(c=>!isGenericExpenseName(c.empresa)&&!isGenericExpenseName(c.apelido));
    config.nomesGenericosDespesaRemovidosV1=true;
  }
  compras=dedupeCompras(compras);
  const cartoes=[...new Set(compras.map(c=>c.cartao).filter(Boolean))].sort();
  return {schemaVersion:'v33.2.2.2',meses:MESES,comprasCartao:compras,cartoes,fixas:normalizeFixas(s.fixas||[]),variaveis:(s.variaveis||[]).filter(v=>!isItemCartao(v)),orcamento:s.orcamento||[],feira:s.feira||[],budgetTransactions:Array.isArray(s.budgetTransactions)?s.budgetTransactions:[],config};
}

function migrateLegacyStorageToV33(){
  const legacyKeys=[
    'financasFamiliaV32_2AuditadaFinal',
    'financasFamiliaV32_1AuditadaFinal',
    'financasFamiliaV32_1Auditada',
    'financasFamiliaV32Editavel'
  ];
  if(localStorage.getItem(STORE)) return;
  for(const key of legacyKeys){
    const raw=localStorage.getItem(key);
    if(!raw) continue;
    try{
      const data=JSON.parse(raw);
      if(data && typeof data==='object'){
        data.schemaVersion='v33.2.2.2';
        data.migratedFrom=key;
        data.migratedAt=new Date().toISOString();
        localStorage.setItem(STORE, JSON.stringify(data));
        return;
      }
    }catch(e){
      console.warn('Falha ao migrar armazenamento legado:', key, e);
    }
  }
}

function load(){
  try{
    const raw=localStorage.getItem(STORE);
    if(raw){
      const st=normalize(JSON.parse(raw));
      if(st.comprasCartao.length||st.fixas.length||st.variaveis.length)return st;
    }
  }catch(e){console.warn('Dados locais ignorados',e)}
  return normalize(window.SEED_DATA||{});
}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function hist(){try{const raw=localStorage.getItem(HIST);const h=raw?JSON.parse(raw):[];return Array.isArray(h)?h:[]}catch(e){return []}}
function addHist(action,detail){const h=hist();h.unshift({at:new Date().toISOString(),by:localStorage.getItem('ff_user')||'Felipe',action,detail:detail||''});localStorage.setItem(HIST,JSON.stringify(h.slice(0,500)))}
function supabaseReady(){return !!(window.supabase&&window.SUPABASE_CONFIG&&window.SUPABASE_CONFIG.url&&window.SUPABASE_CONFIG.anonKey)}
function supabaseClient(){if(!supabaseReady())return null;if(!window.__ffSupabase)window.__ffSupabase=window.supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.anonKey);return window.__ffSupabase}
function familyKey(){return localStorage.getItem('ff_family_key')||''}
function setFamilyKey(k){localStorage.setItem('ff_family_key',String(k||'').trim())}
function lastSyncKey(){return 'ff_last_sync_'+norm(familyKey())}
function getLastSync(){return localStorage.getItem(lastSyncKey())||''}
function setLastSync(iso){if(iso)localStorage.setItem(lastSyncKey(),iso)}

// --- Criptografia local dos dados antes de irem para a nuvem (AES-GCM, chave derivada do código familiar) ---
function bufToB64(buf){
  const bytes=new Uint8Array(buf),chunk=0x8000,parts=[];
  for(let i=0;i<bytes.length;i+=chunk)parts.push(String.fromCharCode.apply(null,bytes.subarray(i,i+chunk)));
  return btoa(parts.join(''));
}
function b64ToBuf(b64){
  const binary=atob(b64),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}
async function deriveCryptoKey(familyKeyStr){
  const enc=new TextEncoder();
  const keyMaterial=await crypto.subtle.importKey('raw',enc.encode(familyKeyStr),{name:'PBKDF2'},false,['deriveKey']);
  return crypto.subtle.deriveKey(
    {name:'PBKDF2',salt:enc.encode('financas-familia-v33-encrypt'),iterations:150000,hash:'SHA-256'},
    keyMaterial,{name:'AES-GCM',length:256},false,['encrypt','decrypt']
  );
}
async function encryptForCloud(obj,familyKeyStr){
  const key=await deriveCryptoKey(familyKeyStr);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=new TextEncoder().encode(JSON.stringify(obj));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);
  return {enc:'aes-gcm-v1',iv:bufToB64(iv),data:bufToB64(cipher)};
}
async function decryptFromCloud(payload,familyKeyStr){
  if(!payload||payload.enc!=='aes-gcm-v1')return payload;
  const key=await deriveCryptoKey(familyKeyStr);
  const plainBuf=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBuf(payload.iv)},key,b64ToBuf(payload.data));
  return JSON.parse(new TextDecoder().decode(plainBuf));
}

async function cloudSave(){
  try{
    const key=familyKey();
    if(!key||key.length<8)throw new Error('Informe um código familiar com pelo menos 8 caracteres.');
    const sb=supabaseClient();
    if(!sb)throw new Error('Supabase não configurado. Preencha supabase-config.js.');
    // Verifica se há uma versão mais nova na nuvem (salva por outro dispositivo) antes de sobrescrever.
    const {data:remoteCheck}=await sb.rpc('family_load_state',{p_family_key:key});
    const lastKnown=getLastSync();
    if(remoteCheck&&remoteCheck.savedAt&&lastKnown&&remoteCheck.savedAt>lastKnown){
      const quando=new Date(remoteCheck.savedAt).toLocaleString('pt-BR');
      if(!confirm(`Existe uma versão mais recente na nuvem (salva em ${quando}), possivelmente de outro dispositivo. Salvar mesmo assim e sobrescrever?`))return;
    }
    const inner={state,history:hist(),device:navigator.userAgent};
    const encInner=await encryptForCloud(inner,key);
    const savedAt=new Date().toISOString();
    const payload={...encInner,version:APP_VERSION,savedAt};
    const {error}=await sb.rpc('family_save_state',{p_family_key:key,p_payload:payload});
    if(error)throw error;
    setLastSync(savedAt);
    addHist('Sincronização em nuvem','Backup criptografado enviado ao Supabase');
    alert('Dados criptografados e salvos no Supabase.');
    renderCloudStatus();
  }catch(e){alert('Falha ao salvar na nuvem: '+(e.message||e));}
}
async function cloudLoad(){
  try{
    const key=familyKey();
    if(!key||key.length<8)throw new Error('Informe um código familiar com pelo menos 8 caracteres.');
    const sb=supabaseClient();
    if(!sb)throw new Error('Supabase não configurado. Preencha supabase-config.js.');
    const {data,error}=await sb.rpc('family_load_state',{p_family_key:key});
    if(error)throw error;
    if(!data||(!data.state&&!data.enc))throw new Error('Nenhum backup encontrado para este código.');
    let inner;
    try{inner=data.enc?await decryptFromCloud(data,key):data;}
    catch(e){throw new Error('Não foi possível decodificar os dados. Confira se o código familiar está correto.');}
    if(!inner||!inner.state)throw new Error('Nenhum backup encontrado para este código.');
    if(!confirm('Substituir os dados locais pelos dados salvos no Supabase?'))return;
    state=normalize(inner.state);save();
    if(Array.isArray(inner.history))localStorage.setItem(HIST,JSON.stringify(inner.history.slice(0,500)));
    setLastSync(data.savedAt||new Date().toISOString());
    addHist('Sincronização em nuvem','Backup restaurado e decodificado do Supabase');
    alert('Dados restaurados do Supabase.');
    render();
  }catch(e){alert('Falha ao carregar da nuvem: '+(e.message||e));}
}
function renderCloudStatus(){
  const el=$('cloudStatus');if(!el)return;
  el.textContent=supabaseReady()?'Supabase configurado. Os dados são criptografados neste navegador antes do envio.':'Supabase não configurado: edite supabase-config.js.';
  const input=$('familyKey');if(input)input.value=familyKey();
  const info=$('lastSyncInfo');
  if(info){const ls=getLastSync();info.textContent=ls?('Última sincronização: '+new Date(ls).toLocaleString('pt-BR')):'Ainda não sincronizado neste dispositivo.';}
}

// --- Usuário ativo (autoria no histórico) ---
function initUserSelect(){
  const sel=$('userSelect');if(!sel)return;
  const current=localStorage.getItem('ff_user')||'Felipe';
  if([...sel.options].some(o=>o.value===current))sel.value=current;
  else{const opt=document.createElement('option');opt.value=current;opt.textContent=current;sel.insertBefore(opt,sel.lastElementChild);sel.value=current;}
  sel.onchange=()=>{
    if(sel.value==='Outro'){
      const nome=prompt('Nome de quem está usando o app agora:');
      if(nome&&nome.trim()){
        const clean=nome.trim();
        if(![...sel.options].some(o=>o.value===clean)){const opt=document.createElement('option');opt.value=clean;opt.textContent=clean;sel.insertBefore(opt,sel.lastElementChild);}
        sel.value=clean;localStorage.setItem('ff_user',clean);
      }else{sel.value=localStorage.getItem('ff_user')||'Felipe';}
    }else{localStorage.setItem('ff_user',sel.value);}
  };
}

// --- Exportação CSV ---
function csvEscape(v){const s=String(v??'');return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function exportCSV(){
  const linhas=[['Tipo','Nome/Empresa','Categoria','Mês','Ano','Valor','Cartão','Parcela','Status']];
  (state.fixas||[]).forEach(f=>{MESES.forEach(m=>{const v=valorMes(f,m);if(v)linhas.push(['Fixa',nameOf(f),categoriaItem('fixas',f),m,'',v.toFixed(2),'','',''])})});
  (state.variaveis||[]).forEach(v0=>{MESES.forEach(m=>{const v=valorMes(v0,m);if(v)linhas.push(['Variável',nameOf(v0),categoriaItem('variaveis',v0),m,'',v.toFixed(2),'','',''])})});
  (state.comprasCartao||[]).forEach(c=>{linhas.push(['Cartão',compraTitulo(c),c.categoria||'',c.mes||'',c.ano||'',Number(c.valor||0).toFixed(2),c.cartao||'',parcelaLabel(c),statusParcela(c)])});
  const csv=linhas.map(l=>l.map(csvEscape).join(';')).join('\r\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
  a.download='financas-familia-v33-2-2-'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();URL.revokeObjectURL(a.href);
  addHist('Exportação CSV','Arquivo CSV gerado');
}


function options(id,arr,sel){const el=$(id);if(!el)return;const current=String(sel??el.value??'');const vals=[...new Set(arr.map(nameOf).filter(Boolean))];el.innerHTML=vals.map(v=>`<option value="${esc(v)}" ${String(v)===current?'selected':''}>${esc(v)}</option>`).join('');if(!el.value&&vals.length)el.value=vals[0]}
function table(id,cols,rows){const el=$(id);if(!el)return;rows=rows||[];el.innerHTML='<thead><tr>'+cols.map(c=>`<th${c.num?' class="num"':''}>${esc(c.t)}</th>`).join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+cols.map(c=>`<td${c.num?' class="num"':''}>${c.f?c.f(r):esc(r[c.k])}</td>`).join('')+'</tr>').join(''):`<tr><td colspan="${cols.length}" class="small">Nenhum dado encontrado.</td></tr>` )+'</tbody>'}
function kpiIconFor(label){
  const l=norm(label);
  if(l.includes('receita'))return '💰';
  if(l.includes('fixa'))return '🏠';
  if(l.includes('vari'))return '🛒';
  if(l.includes('cart'))return '💳';
  if(l.includes('super'))return '📈';
  if(l.includes('déficit')||l.includes('deficit'))return '⚠️';
  if(l.includes('total'))return '🧾';
  if(l.includes('comprom'))return '🎯';
  if(l.includes('compra'))return '🛍️';
  if(l.includes('mês'))return '📅';
  return '✨';
}
function kpiTarget(label){const n=norm(label);if(n==='fixas')return'fixas';if(n.includes('variave'))return'variaveis';if(n.includes('cart'))return'cartoes';return'orcamentos'}
function kpis(items,id){const el=$(id);if(!el)return;const dashboard=id==='kpis';el.innerHTML=items.map(k=>{const target=dashboard?kpiTarget(k[0]):'';const tag=target?'button':'div';const inlineHint=!dashboard&&k[2]?` <span class="kpiInlineHint">(${esc(k[2])})</span>`:'';return `<${tag} ${target?`type="button" data-kpi-tab="${target}" title="Abrir ${target==='orcamentos'?'Relatórios':esc(k[0])}"`:''} class="card kpi kpiExecutive${target?' kpiShortcut':''}"><div class="kpiIconExec">${kpiIconFor(k[0])}</div><div class="kpiText"><div class="label">${esc(k[0])}${inlineHint}</div><div class="value ${k[3]||''}">${k[1]}</div></div>${target?'<span class="kpiGo" aria-hidden="true">›</span>':''}</${tag}>`}).join('');if(dashboard)el.querySelectorAll('[data-kpi-tab]').forEach(btn=>btn.onclick=()=>show(btn.dataset.kpiTab))}
function chartBars(id,rows,labelKey,valueKey,onClick,selectedLabel){const el=$(id);if(!el)return;const vals=(rows||[]).map(r=>Number(r[valueKey]||0));const max=Math.max(1,...vals.map(v=>Math.abs(v)));el.innerHTML=(rows||[]).map(r=>{const v=Number(r[valueKey]||0),h=Math.max(4,Math.round(Math.abs(v)/max*96)),lab=String(r[labelKey]);return `<div class="bar ${selectedLabel&&norm(selectedLabel)===norm(lab)?'selected':''}" data-label="${esc(lab)}" title="Clique para abrir as contas de ${esc(lab)}"><div class="barValue">${fmt(v).replace('R$','').trim()}</div><div class="barFill" style="height:${h}px"></div><div class="barLabel">${esc(lab.slice(0,3))}</div></div>`}).join('')||'<div class="small">Sem dados.</div>'; if(onClick){el.querySelectorAll('.bar').forEach(b=>b.onclick=()=>onClick(b.dataset.label));}}
function monthlyRows(arr){return MESES.map(m=>({mes:m,valor:soma(arr,m)}))}
function monthlyCardRows(ano){return MESES.map(m=>({mes:m,valor:state.comprasCartao.filter(c=>norm(c.mes)===norm(m)&&Number(c.ano||anoBase())===Number(ano||anoBase())).reduce((s,c)=>s+Number(c.valor||0),0)}))}

function monthDetail(id,title,total,rows,kind){const el=$(id);if(!el)return;if(!rows||!rows.length){el.innerHTML='';return;}const isCards=kind==='cartoes';const body=rows.map(r=>isCards?`<div class="monthRow cardMonthRow"><div><div class="rowName">${esc(r.nome||r.empresa||'Sem nome')}</div><div class="rowMetaCompact">${esc(r.cartao||'')} ${r.status?`· ${esc(r.status)}`:''}</div></div><button type="button" class="categoryChoice" data-change-card-category="${esc(r.id)}">${esc(r.categoria||'Outros')}</button><div class="rowValue">${fmt(r.valor)}</div><button type="button" class="purchaseMenuBtn" data-purchase-menu="${esc(r.id)}" aria-label="Opções da compra">⋮</button></div>`:`<div class="monthRow"><div><div class="rowName">${esc(r.nome||r.empresa||'Sem nome')}</div></div><div class="rowSub">${esc(r.categoria||r.cartao||'-')}</div><div class="rowValue">${fmt(r.valor)}</div></div>`).join('');el.innerHTML=`<div class="card"><div class="monthDetailsHeader"><span>${esc(title)}</span><span>Total do mês&nbsp;&nbsp;${fmt(total)}</span></div><div class="monthDetailsBody">${body}</div></div>`}
function clickMonth(tipo,mes){if(tipo==='fixas'){$('fixMes').value=mes;selectedFixasMes=mes;renderFixas();}
  if(tipo==='variaveis'){$('varMes').value=mes;selectedVariaveisMes=mes;renderVariaveis();}
  if(tipo==='cartoes'){$('cardMes').value=mes;selectedCartoesMes=mes;renderCartoes();}}
function editCategoria(tipo,nome){
  pendingCategoriaEdit={tipo,nome};
  const atual=state?.config?.categoryOverrides?.[overrideKey(tipo,nome)]||'';
  const modal=$('editModal'), select=$('modalCategoria'), label=$('modalItemName');
  if(!modal||!select){return editCategoriaFallback(tipo,nome);}
  select.innerHTML=CATEGORIAS.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  select.value=atual && CATEGORIAS.includes(atual) ? atual : (categoriaItem(tipo,{nome})||CATEGORIAS[0]);
  if(label) label.textContent=nome;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function editCategoriaFallback(tipo,nome){
  const atual=state?.config?.categoryOverrides?.[overrideKey(tipo,nome)]||'';
  const msg='Escolha uma categoria:\\n'+CATEGORIAS.map((c,i)=>`${i+1}. ${c}`).join('\\n');
  const resp=prompt(msg, atual||'');
  if(!resp)return;
  let cat=resp.trim();
  const num=Number(cat);
  if(num>=1&&num<=CATEGORIAS.length)cat=CATEGORIAS[num-1];
  if(!CATEGORIAS.includes(cat)){alert('Categoria inválida.');return;}
  setCategoria(tipo,nome,cat);render();
}
function closeEditModal(){
  const modal=$('editModal');
  if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
  pendingCategoriaEdit=null;
}
function saveEditModal(){
  if(!pendingCategoriaEdit)return;
  const cat=$('modalCategoria')?.value;
  if(!CATEGORIAS.includes(cat)){alert('Categoria inválida.');return;}
  setCategoria(pendingCategoriaEdit.tipo,pendingCategoriaEdit.nome,cat);
  closeEditModal();
  render();
}


function comprasMes(m,ano){return state.comprasCartao.filter(c=>norm(c.mes)===norm(m) && (!ano || !c.ano || Number(c.ano)===Number(ano)))}
function budgetControlById(id){return BUDGET_CONTROLS.find(c=>c.id===id)}
function detectBudgetControl(textValue){const n=norm(textValue);return BUDGET_CONTROLS.find(c=>c.keywords.some(k=>n.includes(norm(k))))||null}
function budgetReference(control){return (state.fixas||[]).find(x=>String(x.id)===String(control.refId))||(state.fixas||[]).find(x=>norm(nameOf(x))===norm(control.refName))}
function budgetLimit(control,mes,ano){const ref=budgetReference(control);if(!ref)return 0;return Number(ano||anoBase())>anoBase()?valorBaseFixa(ref):valorMes(ref,mes)}
function budgetSpent(control,mes,ano){return (state.budgetTransactions||[]).filter(x=>x.controlId===control.id&&norm(x.mes)===norm(mes)&&Number(x.ano)===Number(ano)).reduce((s,x)=>s+Number(x.valor||0),0)}
function budgetStatus(control,mes,ano){const limite=budgetLimit(control,mes,ano),gasto=budgetSpent(control,mes,ano),disponivel=limite-gasto,pct=limite?gasto/limite*100:0;return{control,mes,ano,limite,gasto,disponivel,pct}}
function budgetStatusText(control,mes,ano){const s=budgetStatus(control,mes,ano);return `${control.label} — ${mesCap(mes)}/${ano}\nOrçamento: ${fmt(s.limite)}\nGasto acumulado: ${fmt(s.gasto)}\nDisponível: ${fmt(s.disponivel)}\nUtilizado: ${s.pct.toFixed(1).replace('.',',')}%`}
function extractMoneyFromText(textValue){const s=String(textValue||'');const matches=[...s.matchAll(/(?:r\$\s*)?(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:reais?|real)?/gi)];if(!matches.length)return 0;const withCurrency=matches.find(m=>/r\$|reais?|real/i.test(m[0]));return parseMoney((withCurrency||matches[matches.length-1])[1])}
function isBudgetQuery(textValue){return /(quanto|saldo|dispon[ií]vel|posso gastar|ainda tenho|resta)/i.test(String(textValue||''))}
function top(rows,key,lim){const m={};rows.forEach(r=>{const k=r[key]||'Sem identificação';m[k]=(m[k]||0)+Number(r.valor||0)});return Object.entries(m).map(([nome,total])=>({nome,total})).sort((a,b)=>b.total-a.total).slice(0,lim||20)}
function orcMes(m){return (state.orcamento||[]).find(o=>norm(o.mes)===norm(m))||{}}
function receitaBaseLegada(){const jul=orcMes('julho');const val=Number(jul.receitas||0);if(val>0)return val;const last=[...(state.orcamento||[])].reverse().find(o=>Number(o.receitas||0)>0);return Number(last?.receitas||0)}
function receitaKey(m,ano){return `${Number(ano||anoBase())}-${String(MESES.indexOf(mesNorm(m))+1).padStart(2,'0')}`}
function receitasDoMes(m,ano){
  const mapa=state?.config?.receitasMensais||{},key=receitaKey(m,ano);
  let registro=Object.prototype.hasOwnProperty.call(mapa,key)?mapa[key]:null;
  if(!registro){const anterior=Object.keys(mapa).filter(k=>k<=key).sort().pop();if(anterior)registro=mapa[anterior]}
  if(registro){const felipe=Number(registro.felipe||0),rafaela=Number(registro.rafaela||0);return{felipe,rafaela,total:felipe+rafaela}}
  const legado=Number(Number(ano||anoBase())===anoBase()?orcMes(m).receitas:0)||receitaBaseLegada();
  return{felipe:legado,rafaela:0,total:legado};
}
function receitaBase(){const mapa=state?.config?.receitasMensais||{},ultima=Object.keys(mapa).sort().pop();if(ultima){const r=mapa[ultima]||{};return Number(r.felipe||0)+Number(r.rafaela||0)}return receitaBaseLegada()}
function deveUsarRecorrencia(m,ano){const base=anoBase();if(Number(ano||base)>base)return true;return MESES.indexOf(m)>=MESES.indexOf('julho')}
function somaFixasPermanentes(){return (state.fixas||[]).reduce((s,x)=>s+Number(x.valorRecorrente||valorBaseFixa(x)||0),0)}
function projecao(m,ano){const base=anoBase(),yr=Number(ano||base),o=orcMes(m),compras=comprasMes(m,yr),usarRecorrencia=deveUsarRecorrencia(m,yr);const fixas=usarRecorrencia?somaFixasPermanentes():Number(o.fixas??soma(state.fixas,m));const variaveis=Number((!usarRecorrencia&&o.variaveis!==undefined)?o.variaveis:soma(variaveisSemCartao(),m));const cartoes=Number((!usarRecorrencia&&o.cartoes!==undefined)?o.cartoes:compras.reduce((s,c)=>s+Number(c.valor||0),0));const despesasCalc=fixas+variaveis+cartoes;const receitas=receitasDoMes(m,yr).total;const despesas=usarRecorrencia?despesasCalc:(Number(o.despesas_planilha||0)||despesasCalc);const saldo=receitas-despesas;return{mes:m,ano:yr,receitas,fixas,variaveis,cartoes,despesas,saldo}}
function evolucaoMensal(ano){return MESES.map(m=>{const p=projecao(m,ano||anoBase());return{mes:m,fixas:p.fixas,variaveis:p.variaveis,cartoes:p.cartoes,despesas:p.despesas,saldo:p.saldo}})}
function anoBase(){return Number(state?.config?.anoBase||2026)}
function mesCap(m){return String(m||'').charAt(0).toUpperCase()+String(m||'').slice(1)}
function mesesProjecaoRolante(mesInicial,anoInicial){
  const start = Math.max(0, MESES.indexOf(mesInicial || currentMes()));
  const base=Number(anoInicial||anoBase());
  return Array.from({length:12}, (_,i)=>{const idx=(start+i)%MESES.length;const ano=base+Math.floor((start+i)/12);const mes=MESES[idx];return {mes,ano,label:`${mesCap(mes)}/${String(ano).slice(-2)}`};});
}

function renderInsights(m,ano){const el=$('insights');if(!el)return;const p=projecao(m,ano),dist=[['Fixas',p.fixas],['Variáveis',p.variaveis],['Cartões',p.cartoes]].sort((a,b)=>b[1]-a[1]);const maior=dist[0]||['-',0];const pct=p.despesas?((maior[1]/p.despesas)*100).toFixed(1)+'%':'-';const compras=comprasMes(m,ano);const topEmp=top(compras,'empresa',1)[0];const saldoClass=p.saldo>=0?'positive':'negative';el.innerHTML=[['Principal peso',`${esc(maior[0])} · ${pct}`,'maior grupo nas despesas do mês'],['Maior empresa',topEmp?`${esc(topEmp.nome)} · ${fmt(topEmp.total)}`:'Sem compras','maior gasto em cartão no mês'],['Leitura rápida',p.saldo>=0?'Mês com folga prevista':'Mês exige atenção','com base no saldo projetado',saldoClass]].map(k=>`<div class="card kpi insightCard"><div class="label">${esc(k[0])}</div><div class="value ${k[3]||''}">${k[1]}</div><div class="hint">${esc(k[2]||'')}</div></div>`).join('')}

function renderDistrib(m,ano){const p=projecao(m,ano);chartBars('chartDistrib',[{nome:'Fixas',valor:p.fixas},{nome:'Variáveis',valor:p.variaveis},{nome:'Cartões',valor:p.cartoes}],'nome','valor');const total=p.fixas+p.variaveis+p.cartoes,pct=v=>total?((v/total)*100).toFixed(1)+'%':'-';const el=$('legendDistrib');if(el)el.innerHTML=[['Fixas',p.fixas],['Variáveis',p.variaveis],['Cartões',p.cartoes]].map(x=>`<span>${esc(x[0])}: <b>${fmt(x[1])}</b> · ${pct(x[1])}</span>`).join('')}
function renderSaldoChart(ano){chartBars('chartSaldo',evolucaoMensal(ano).map(r=>({mes:r.mes,valor:r.saldo})),'mes','valor')}
function iconForCategoria(cat){const c=norm(cat);if(c.includes('compra'))return ['🛒',''];if(c.includes('alimenta'))return ['🍴','yellow'];if(c.includes('assin'))return ['📱','purple'];if(c.includes('veicul')||c.includes('transporte'))return ['🚘',''];if(c.includes('moradia'))return ['🏠','green'];if(c.includes('saude'))return ['❤️','red'];return ['✨','gray']}
function dashboardGroups(m,ano){
  const all=[];
  itemRows('fixas',state.fixas,m,'').forEach(r=>all.push({...r,origem:'fixa'}));
  itemRows('variaveis',state.variaveis,m,'').forEach(r=>all.push({...r,origem:'variável'}));
  comprasMes(m,ano).forEach(c=>all.push({nome:c.empresa,valor:Number(c.valor||0),categoria:c.categoria||catEmpresa(c.empresa),origem:c.cartao}));
  const map={};all.forEach(r=>{const k=r.categoria||'Outros';(map[k]=map[k]||{categoria:k,total:0,itens:[]}).total+=Number(r.valor||0);map[k].itens.push(r)});
  return Object.values(map).sort((a,b)=>b.total-a.total);
}
function renderDashboardCategories(m,ano){
  const el=$('dashCategorias'); if(!el)return;
  const groups=dashboardGroups(m,ano).slice(0,8);
  el.innerHTML=groups.length?`<div class="dashboardCategoryList card">${groups.map(g=>{const [ico]=iconForCategoria(g.categoria);return `<div class="dashboardCategoryRow"><span class="categoryListIcon">${esc(ico)}</span><span class="categoryListName">${esc(g.categoria)} <small>(${g.itens.length} despesa${g.itens.length===1?'':'s'})</small></span><strong>${fmt(g.total)}</strong></div>`}).join('')}</div>`:'<div class="card empty">Nenhuma despesa encontrada no mês.</div>';
}
function renderBudgetAvailable(mes,ano){const host=$('budgetAvailableList');if(!host)return;host.innerHTML=`<div class="budgetAvailableList card">${BUDGET_CONTROLS.map(control=>{const s=budgetStatus(control,mes,ano),cls=s.disponivel<0?'over':s.pct>=80?'warning':'';return `<div class="budgetAvailableRow ${cls}"><div><strong>${esc(control.label)}</strong><small>${fmt(s.gasto)} de ${fmt(s.limite)}</small></div><div><span>Disponível</span><b>${fmt(s.disponivel)}</b></div><div class="budgetMiniBar"><i style="width:${Math.min(100,Math.max(0,s.pct)).toFixed(1)}%"></i></div></div>`}).join('')}</div>`}
function renderBudgetReport(mes,ano){const rows=BUDGET_CONTROLS.map(control=>{const s=budgetStatus(control,mes,ano);return{controle:control.label,orcamento:s.limite,gasto:s.gasto,disponivel:s.disponivel,utilizado:s.pct,status:s.disponivel<0?'Excedido':s.pct>=80?'Atenção':'Disponível'}});table('tblBudgetReport',[{t:'Controle',k:'controle'},{t:'Orçamento',num:1,f:r=>fmt(r.orcamento)},{t:'Gasto',num:1,f:r=>fmt(r.gasto)},{t:'Disponível',num:1,f:r=>`<span class="${r.disponivel<0?'negative':'positive'}">${fmt(r.disponivel)}</span>`},{t:'Utilizado',num:1,f:r=>r.utilizado.toFixed(1).replace('.',',')+'%'},{t:'Situação',k:'status'}],rows)}

function parcelaCellHtml(r){const label=parcelaLabel(r),status=statusParcela(r),repeat=label&&norm(label)===norm(status);return `${label?`<span class="pill">${esc(label)}</span>`:''}${repeat?'':statusBadge(r)}`}
function renderSideResumo(m,ano){const p=projecao(m,ano);const html=`<div class="sideLine"><span class="ok">Receitas</span><b>${fmt(p.receitas)}</b></div><div class="sideLine"><span class="bad">Despesas</span><b>${fmt(p.despesas)}</b></div><div class="sideLine"><span>Saldo</span><b>${fmt(p.saldo)}</b></div>`;['sideResumo','sideResumoNuvem'].forEach(id=>{const el=$(id);if(el)el.innerHTML=html;});}


function renderCommitmentBand(m,p){
  const el=$('commitmentBand'); if(!el)return;
  const receitas=Number(p.receitas||0), despesas=Number(p.despesas||0);
  const pct=receitas?despesas/receitas*100:0;
  const status=pct<40?'Excelente':(pct<50?'Bom':(pct<60?'Atenção':'Crítico'));
  const cls=pct<50?'good':(pct>=60?'critical':'');
  el.className='commitmentBand executiveCommitment '+cls;
  el.innerHTML=`<div class="commitMain"><div class="commitIcon">🎯</div><div><div class="commitTitle">Comprometimento da renda</div><div class="commitText">Suas despesas comprometem ${pct.toFixed(1).replace('.',',')}% da receita mensal. Recomendação: manter abaixo de 50%.</div></div></div><div class="commitValue"><b>${pct.toFixed(1).replace('.',',')}%</b><span>${status}</span></div>`;
}

function renderDashboard(){options('dashMes',MESES,$('dashMes')?.value||currentMes());options('dashAno',ANOS,$('dashAno')?.value||anoBase());const mes=$('dashMes').value||currentMes(),ano=Number($('dashAno').value||anoBase()),p=projecao(mes,ano),status=p.saldo>=0?'Superávit projetado':'Déficit projetado',comprom=p.receitas?((p.despesas/p.receitas)*100):0,compStatus=comprom<40?'Excelente':(comprom<50?'Bom':(comprom<60?'Atenção':'Crítico'));renderDashboardCategories(mes,ano);renderBudgetAvailable(mes,ano);renderSideResumo(mes,ano);kpis([['Receitas',fmt(p.receitas),'receitas do mês'],['Fixas',fmt(p.fixas),'despesas fixas'],['Variáveis',fmt(p.variaveis),'despesas variáveis'],['Cartões',fmt(p.cartoes),'faturas do mês'],['Comprometimento',comprom.toFixed(1).replace('.',',')+'%',compStatus,comprom<60?'positive':'negative'],['Total do mês',fmt(p.despesas),'despesas totais'],[status,fmt(p.saldo),p.saldo>=0?'saldo positivo':'saldo negativo',p.saldo>=0?'positive':'negative']], 'kpis')}

function itemRows(tipo,arr,mes,busca){const b=norm(busca);return (arr||[]).map(x=>{const nome=x.nome||x.item||x.descricao||'Sem nome';return{nome,valor:valorMes(x,mes),categoria:categoriaItem(tipo,x),raw:x,id:x.id}}).filter(r=>Number(r.valor||0)!==0).filter(r=>!b||norm([r.nome,r.categoria].join(' ')).includes(b)).sort((a,b)=>b.valor-a.valor)}
function groupedRows(tipo,arr,mes,busca){const rows=itemRows(tipo,arr,mes,busca),map={};rows.forEach(r=>{(map[r.categoria]=map[r.categoria]||{categoria:r.categoria,total:0,itens:[]}).total+=Number(r.valor||0);map[r.categoria].itens.push(r)});return Object.values(map).sort((a,b)=>b.total-a.total)}
function renderCategoryCards(id,groups,tipo){const el=$(id);if(!el)return;el.innerHTML=groups.length?groups.map(g=>`<div class="categoryCard"><button type="button" class="categoryHead"><div><div class="categoryTitle">${esc(g.categoria)}</div><div class="categoryMeta">${g.itens.length} despesa${g.itens.length===1?'':'s'}</div></div><div class="categoryTotal">${fmt(g.total)}</div><div class="categoryArrow">⌄</div></button><div class="categoryBody">${g.itens.map(r=>`<div class="expenseRow"><div class="expenseDot"></div><button type="button" class="expenseName editableField" data-edit-item="${esc(tipo)}" data-id="${esc(r.id)}" data-field="nome" title="Clique para alterar o nome">${esc(r.nome)}</button><button type="button" class="expenseCategory editableField mutedEdit" data-edit-item="${esc(tipo)}" data-id="${esc(r.id)}" data-field="categoria" title="Clique para alterar a categoria">${esc(r.categoria)}</button><button type="button" class="expenseValue editableField" data-edit-item="${esc(tipo)}" data-id="${esc(r.id)}" data-field="valor" title="Clique para alterar o valor">${fmt(r.valor)}</button><button type="button" class="editCat" data-type="${esc(tipo)}" data-name="${esc(r.nome)}" title="Alterar categoria">⋯</button><button type="button" class="deleteExpense" data-delete-item="${esc(tipo)}" data-id="${esc(r.id)}" title="Excluir despesa" aria-label="Excluir ${esc(r.nome)}">🗑</button></div>`).join('')}</div></div>`).join(''):'<div class="card empty">Nenhuma despesa encontrada.</div>';el.querySelectorAll('.categoryHead').forEach(btn=>btn.onclick=()=>btn.closest('.categoryCard').classList.toggle('open'));el.querySelectorAll('.editCat').forEach(btn=>btn.onclick=e=>{e.stopPropagation();editCategoria(btn.dataset.type,btn.dataset.name)})}

function deleteDespesa(tipo,id){
  const key=tipo==='variaveis'?'variaveis':'fixas';
  const list=state[key]||[], index=list.findIndex(x=>String(x.id)===String(id));
  if(index<0)return;
  const item=list[index], nome=item.nome||item.item||item.descricao||'Despesa';
  if(!confirm(`Excluir a despesa "${nome}"?\n\nEsta ação removerá o item e seus valores de todos os meses.`))return;
  list.splice(index,1);
  save();addHist('Despesa excluída',`${nome} · ${tipo==='variaveis'?'Variável':'Fixa'}`);render();
}

function deleteCompra(id){
  const index=(state.comprasCartao||[]).findIndex(x=>String(x.id)===String(id));
  if(index<0)return;
  const compra=state.comprasCartao[index], nome=compraTitulo(compra), parcela=parcelaLabel(compra);
  if(!confirm(`Excluir "${nome}"${parcela?` (parcela ${parcela})`:''} desta fatura?`))return;
  state.comprasCartao.splice(index,1);
  save();addHist('Compra excluída',`${nome}${parcela?` · parcela ${parcela}`:''} · ${fmt(compra.valor)}`);render();
}
function chooseCompraCategoria(id){
  const c=(state.comprasCartao||[]).find(x=>String(x.id)===String(id));if(!c)return;
  const msg='Escolha a categoria da compra:\n'+CATEGORIAS.map((cat,i)=>`${i+1}. ${cat}`).join('\n');
  const resp=prompt(msg,c.categoria||catEmpresa(c.empresa));if(resp===null)return;
  let categoria=String(resp).trim(),numero=Number(categoria);if(numero>=1&&numero<=CATEGORIAS.length)categoria=CATEGORIAS[numero-1];
  if(!CATEGORIAS.includes(categoria)){alert('Categoria inválida. Escolha uma das opções apresentadas.');return;}
  c.categoria=categoria;save();addHist('Categoria de compra alterada',`${compraTitulo(c)} · ${categoria}`);render();
}
function closePurchaseMenu(){document.querySelectorAll('.purchaseContextMenu').forEach(x=>x.remove())}
function openPurchaseMenu(button,id){
  closePurchaseMenu();const menu=document.createElement('div');menu.className='purchaseContextMenu';menu.innerHTML=`<button type="button" data-menu-category="${esc(id)}">Mudar categoria</button><button type="button" class="danger" data-menu-delete="${esc(id)}">Excluir</button>`;document.body.appendChild(menu);
  const rect=button.getBoundingClientRect(),left=Math.min(window.innerWidth-190,Math.max(8,rect.right-180));menu.style.left=left+'px';menu.style.top=Math.min(window.innerHeight-110,rect.bottom+5)+'px';
}
function renderFixas(){options('fixMes',MESES,$('fixMes')?.value||currentMes());options('fixAno',ANOS,$('fixAno')?.value||anoBase());const mes=$('fixMes').value||currentMes(),ano=Number($('fixAno').value||anoBase());selectedFixasMes=mes;const busca=$('fixBusca')?.value||'',rows=itemRows('fixas',state.fixas,mes,busca),groups=groupedRows('fixas',state.fixas,mes,busca),total=rows.reduce((s,r)=>s+Number(r.valor||0),0),annual=MESES.reduce((s,m)=>s+soma(state.fixas,m),0);kpis([['Itens fixos',rows.length,'com valor no mês'],['Total fixo do mês',fmt(total),'soma mensal'],['Total fixo anual',fmt(annual),String(ano)]], 'fixKpis');chartBars('chartFixasMensal',monthlyRows(state.fixas),'mes','valor',m=>clickMonth('fixas',m),selectedFixasMes);const detailRows=itemRows('fixas',state.fixas,selectedFixasMes,busca);monthDetail('fixasMesDetalhe',`Contas de ${selectedFixasMes}/${ano}`,detailRows.reduce((s,r)=>s+Number(r.valor||0),0),detailRows,'fixas');renderCategoryCards('fixasCategorias',groups,'fixas')}
function renderVariaveis(){options('varMes',MESES,$('varMes')?.value||currentMes());options('varAno',ANOS,$('varAno')?.value||anoBase());const mes=$('varMes').value||currentMes(),ano=Number($('varAno').value||anoBase());selectedVariaveisMes=mes;const busca=$('varBusca')?.value||'',rows=itemRows('variaveis',state.variaveis,mes,busca),groups=groupedRows('variaveis',state.variaveis,mes,busca),total=soma(variaveisSemCartao(),mes),annual=MESES.reduce((s,m)=>s+soma(variaveisSemCartao(),m),0);kpis([['Itens variáveis',rows.length,'com valor no mês'],['Total variável do mês',fmt(total),'soma mensal'],['Total variável anual',fmt(annual),String(ano)]], 'varKpis');chartBars('chartVariaveisMensal',monthlyRows(state.variaveis),'mes','valor',m=>clickMonth('variaveis',m),selectedVariaveisMes);const detailRows=itemRows('variaveis',state.variaveis,selectedVariaveisMes,busca);monthDetail('variaveisMesDetalhe',`Contas de ${selectedVariaveisMes}/${ano}`,detailRows.reduce((s,r)=>s+Number(r.valor||0),0),detailRows,'variaveis');renderCategoryCards('variaveisCategorias',groups,'variaveis')}

function cardSearchQuery(){const input=$('cardBusca');return input?.dataset.userEdited==='true'?norm(input.value):''}
function cardRowsForMes(){options('cardMes',MESES,$('cardMes')?.value||currentMes());options('cardAno',ANOS,$('cardAno')?.value||anoBase());let rows=state.comprasCartao.slice();const mes=$('cardMes').value||currentMes(),ano=Number($('cardAno').value||anoBase());rows=rows.filter(c=>norm(c.mes)===norm(mes)&&Number(c.ano||anoBase())===ano);const b=cardSearchQuery();if(b)rows=rows.filter(c=>norm([c.empresa,c.cartao,c.categoria].join(' ')).includes(b));return rows}


function parseMoneyInput(v){return parseMoney(v)}
function selectedMonthFor(tipo){
  if(tipo==='fixas')return $('fixMes')?.value||currentMes();
  if(tipo==='variaveis')return $('varMes')?.value||currentMes();
  if(tipo==='cartoes')return $('cardMes')?.value||currentMes();
  return currentMes();
}
function findDespesaItem(tipo,id){
  const arr=tipo==='variaveis'?state.variaveis:state.fixas;
  return (arr||[]).find(x=>String(x.id)===String(id));
}
function setItemValorMes(item,tipo,mes,valor){
  item.valores=item.valores||{};
  if(tipo==='fixas'){
    const applyAll=confirm('Aplicar este valor como permanente para todos os meses futuros desta despesa fixa?');
    if(applyAll){
      item.valorRecorrente=valor;
      item.valorPermanente=valor;
      MESES.forEach(m=>item.valores[m]=valor);
      item.permanente=true; item.recorrente=true;
    }else item.valores[mes]=valor;
  }else{
    item.valores[mes]=valor;
  }
}
function editDespesaField(tipo,id,field){
  const item=findDespesaItem(tipo,id); if(!item)return;
  const mes=selectedMonthFor(tipo);
  if(field==='nome'){
    const atual=item.nome||item.item||item.descricao||'';
    const novo=prompt('Nome da despesa:', atual);
    if(novo===null)return;
    item.nome=String(novo).trim()||atual;
    addHist('Nome de despesa alterado',`${atual} → ${item.nome}`);
  }else if(field==='valor'){
    const atual=valorMes(item,mes);
    const resp=prompt(`Valor de ${item.nome||'despesa'} em ${mes}:`, String(atual).replace('.',','));
    if(resp===null)return;
    const novo=parseMoneyInput(resp);
    if(!(novo>=0)){alert('Valor inválido.');return;}
    setItemValorMes(item,tipo,mes,novo);
    addHist('Valor de despesa alterado',`${item.nome||'Despesa'} · ${mes} · ${fmt(novo)}`);
  }else if(field==='categoria'){
    editCategoria(tipo,item.nome||item.item||item.descricao||'Sem nome');
    return;
  }
  save(); render();
}
function findCompraById(id){return (state.comprasCartao||[]).find(c=>String(c.id)===String(id));}
function editCompraField(id,field){
  const c=findCompraById(id); if(!c)return;
  if(field==='apelido'){
    const novo=prompt('Apelido da compra:', c.apelido||c.empresa||'');
    if(novo===null)return;
    c.apelido=String(novo).trim()||c.apelido||c.empresa;
    addHist('Apelido da compra alterado',`${c.empresa} · ${c.apelido}`);
  }else if(field==='empresa'){
    const novo=prompt('Nome da despesa/empresa na fatura:', c.empresa||'');
    if(novo===null)return;
    c.empresa=String(novo).trim()||c.empresa;
    c.nomeFatura=c.empresa;
    c.empresaNorm=norm(c.empresa);
    addHist('Nome de compra alterado',c.empresa);
  }else if(field==='valor'){
    const resp=prompt('Valor da parcela/compra:', String(Number(c.valor||0)).replace('.',','));
    if(resp===null)return;
    const novo=parseMoneyInput(resp);
    if(!(novo>=0)){alert('Valor inválido.');return;}
    c.valor=novo;
    addHist('Valor de compra alterado',`${compraTitulo(c)} · ${fmt(novo)}`);
  }else if(field==='parcela'){
    const atual=parcelaLabel(c)||'à vista';
    const resp=prompt('Parcela (ex.: 2/8, recorrente ou à vista):', atual);
    if(resp===null)return;
    const txt=String(resp).trim();
    const [pa,pt]=parseParcela(txt);
    if(pa&&pt){c.parcelaAtual=pa;c.parcelaTotal=pt;c.parcela=`${pa}/${pt}`;}
    else {c.parcelaAtual=null;c.parcelaTotal=null;c.parcela=txt||'à vista';}
    c.status=statusFromFields(c);
    addHist('Parcela de compra alterada',`${compraTitulo(c)} · ${c.parcela}`);
  }else if(field==='categoria'){
    const resp=prompt('Categoria da compra:', c.categoria||catEmpresa(c.empresa));
    if(resp===null)return;
    c.categoria=String(resp).trim()||c.categoria;
  }
  save(); render();
}
function editCardLimit(cartao){
  state.config=state.config||{}; state.config.cardLimits=state.config.cardLimits||{};
  const atual=cardLimit(cartao);
  const resp=prompt(`Limite total do cartão ${cartao}:`, String(atual).replace('.',','));
  if(resp===null)return;
  const novo=parseMoneyInput(resp);
  if(!(novo>=0)){alert('Limite inválido.');return;}
  state.config.cardLimits[cardaoNameSafe(cartao)]=novo;
  save(); addHist('Limite do cartão alterado',`${cartao} · ${fmt(novo)}`); render();
}
function cardaoNameSafe(cartao){return cardName(cartao)}
function editCardName(cartao){
  const novo=prompt('Nome do cartão:', cartao);
  if(novo===null)return;
  const n=String(novo).trim(); if(!n||n===cartao)return;
  state.comprasCartao.forEach(c=>{if(c.cartao===cartao)c.cartao=n});
  state.cartoes=state.cartoes.map(c=>c===cartao?n:c);
  if(state.config?.cardLimits?.[cartao]!==undefined){state.config.cardLimits[n]=state.config.cardLimits[cartao];delete state.config.cardLimits[cartao];}
  save(); addHist('Nome do cartão alterado',`${cartao} → ${n}`); render();
}

function cardBrandInfo(nome){
  const n=norm(nome);
  if(n.includes('itau')||n.includes('itaucard'))return {brand:'itau',label:'Itaú',short:'Itaú',limit:10000,color:'#ff7a00'};
  if(n.includes('bradesco'))return {brand:'bradesco',label:'Bradesco',short:'Bradesco',limit:5000,color:'#e11d48'};
  if(n.includes('nubank'))return {brand:'nubank',label:'Nubank',short:'Nu',limit:n.includes('rafaela')?4000:8000,color:'#820ad1'};
  return {brand:'generic',label:'Cartão',short:'Card',limit:5000,color:'#64748b'};
}
function bankLogoFallback(img){
  const brand=img.dataset.brand||'generic', short=img.dataset.short||'Card', label=img.dataset.label||'Cartão';
  const div=document.createElement('div');
  div.className='bankLogo logo-'+brand;
  div.title=label;
  div.innerHTML='<span></span>';
  div.querySelector('span').textContent=short;
  img.replaceWith(div);
}
function cardLogoHtml(nome){
  const b=cardBrandInfo(nome);
  if(b.brand!=='generic'){
    return `<img class="bankLogo bankLogoImg" src="icons/banks/${b.brand}.png" onerror="bankLogoFallback(this)" data-brand="${esc(b.brand)}" data-short="${esc(b.short)}" data-label="${esc(b.label)}" alt="${esc(b.label)}" title="${esc(b.label)}">`;
  }
  return `<div class="bankLogo logo-${b.brand}" title="${esc(b.label)}"><span>${esc(b.short)}</span></div>`;
}
function cardLimit(nome){
  const n=cardName(nome);
  const limits=state?.config?.cardLimits||{};
  if(limits[n]!==undefined)return Number(limits[n]||0);
  return cardBrandInfo(nome).limit
}
function pctUtilizado(total,limite){return limite?Math.min(999,(Number(total||0)/limite)*100):0}
function progressBarHtml(pct){
  const shown=Math.min(100,Math.max(0,pct));
  return `<div class="usageBar"><span style="width:${shown.toFixed(1)}%"></span></div>`
}
function comprasAtivas(rows){return rows.filter(r=>['ativa','última parcela','ultima parcela'].includes(norm(statusParcela(r))))}
function comprasRecorrentes(rows){return rows.filter(r=>norm(statusParcela(r))==='recorrente')}
function totalRestanteCompra(r){
  const a=Number(r.parcelaAtual||0),t=Number(r.parcelaTotal||0),v=Number(r.valor||0);
  if(a>0&&t>0&&t>=a)return v*(t-a+1);
  return 0;
}
function cardResumoInferior(porCartao, totalGeral, rows){
  const parcelasAtivas=comprasAtivas(rows).length;
  const recorrentes=comprasRecorrentes(rows).length;
  const totalLimite=porCartao.reduce((s,c)=>s+cardLimit(c.cartao),0);
  const pct=pctUtilizado(totalGeral,totalLimite);
  const maior=porCartao.slice().sort((a,b)=>b.total-a.total)[0]||{cartao:'-',total:0};
  const restante=rows.reduce((s,r)=>s+totalRestanteCompra(r),0);
  return `<div class="cardsKpiStrip">
    <div class="cardsKpi"><div class="kpiIcon">💳</div><div><span>Total em faturas</span><b>${fmt(totalGeral)}</b><small>valor total a pagar no mês</small></div></div>
    <div class="cardsKpi"><div class="kpiIcon">🏦</div><div><span>Maior fatura</span><b>${fmt(maior.total)}</b><small>${esc(maior.cartao)}</small></div></div>
    <div class="cardsKpi"><div class="kpiIcon">🧩</div><div><span>Parcelas ativas</span><b>${parcelasAtivas}</b><small>${recorrentes} recorrente(s) no mês</small></div></div>
    <div class="cardsKpi"><div class="kpiIcon">🎯</div><div><span>Utilização total</span><b>${pct.toFixed(1).replace('.',',')}%</b><small>limite total: ${fmt(totalLimite)}</small></div></div>
    <div class="cardsKpi"><div class="kpiIcon">🔁</div><div><span>Compromisso futuro</span><b>${fmt(restante)}</b><small>parcelas restantes estimadas</small></div></div>
  </div>`;
}
function executiveCardTableRows(itens){
  const ordenados=itens.slice().sort((a,b)=>Number(b.valor||0)-Number(a.valor||0));
  return ordenados.map(r=>`<div class="executiveTx">
    <div class="txMain"><button type="button" class="editableText txTitle" data-edit-compra="${esc(r.id)}" data-field="apelido" title="Clique para alterar o apelido"><b>${esc(compraTitulo(r))}</b></button><button type="button" class="editableText txSub" data-edit-compra="${esc(r.id)}" data-field="empresa" title="Clique para alterar o nome da fatura">${esc(compraSubtitulo(r)||statusParcela(r)||'')}</button></div>
    <div class="txParcel"><button type="button" class="editableText parcelInline" data-edit-compra="${esc(r.id)}" data-field="parcela" title="Clique para alterar a parcela">${parcelaCellHtml(r)}</button></div>
    <button type="button" class="txValor editableText" data-edit-compra="${esc(r.id)}" data-field="valor" title="Clique para alterar o valor">${fmt(r.valor)}</button>
    <button type="button" class="purchaseMenuBtn" data-purchase-menu="${esc(r.id)}" title="Opções" aria-label="Opções de ${esc(compraTitulo(r))}">⋮</button>
  </div>`).join('') || `<div class="emptySmall">Sem compras no mês</div>`;
}
function cardMiniStats(c){
  const ativas=comprasAtivas(c.itens).length;
  const recorrentes=comprasRecorrentes(c.itens).length;
  const media=c.itens.length?c.total/c.itens.length:0;
  return `<div class="executiveCardStats">
    <div><span>Compras</span><b>${c.itens.length}</b></div>
    <div><span>Ativas</span><b>${ativas}</b></div>
    <div><span>Recorr.</span><b>${recorrentes}</b></div>
    <div><span>Média</span><b>${fmt(media)}</b></div>
  </div>`
}

function renderCartoes(){
  const rows=cardRowsForMes(),mes=$('cardMes').value||currentMes(),ano=Number($('cardAno').value||anoBase());
  const totalGeral=rows.reduce((s,c)=>s+Number(c.valor||0),0);
  const porCartao=state.cartoes.map(cartao=>{
    const itens=rows.filter(c=>norm(c.cartao)===norm(cartao)),total=itens.reduce((s,c)=>s+Number(c.valor||0),0);
    const limite=cardLimit(cartao), pct=pctUtilizado(total,limite), brand=cardBrandInfo(cartao);
    return{cartao,itens,total,limite,pct,brand}
  });
  kpis([['Mês',mes,'fatura selecionada'],['Total dos cartões',fmt(totalGeral),'soma do mês'],['Compras',rows.length,'registros no mês'],['Cartões com gasto',porCartao.filter(x=>x.total>0).length+'/'+state.cartoes.length,'cartões']], 'cardKpis');
  selectedCartoesMes=mes;
  chartBars('chartCartoesMensal',monthlyCardRows(ano),'mes','valor',m=>clickMonth('cartoes',m),selectedCartoesMes);
  const detailRows=state.comprasCartao.filter(c=>norm(c.mes)===norm(selectedCartoesMes)&&Number(c.ano||anoBase())===ano).map(c=>({id:c.id,nome:compraTitulo(c),cartao:c.cartao,categoria:c.categoria||catEmpresa(c.empresa),status:statusParcela(c),valor:c.valor}));
  monthDetail('cartoesMesDetalhe',`Compras de ${selectedCartoesMes}/${ano}`,detailRows.reduce((s,r)=>s+Number(r.valor||0),0),detailRows,'cartoes');
  $('cartoesGrid').innerHTML=porCartao.map((c,i)=>`
    <div class="executiveCard brand-${c.brand.brand}">
      <div class="executiveCardTop">
        ${cardLogoHtml(c.cartao)}
        <div class="executiveCardTitle"><h3><button type="button" class="editableText cardTitleEdit" data-edit-card-name="${esc(c.cartao)}" title="Clique para alterar o nome do cartão">${esc(c.cartao)}</button></h3><small>${c.itens.length} compras no mês</small></div>
        <div class="executiveTotal"><span>Fatura</span><strong>${fmt(c.total)}</strong></div>
      </div>
      <div class="executiveLimitBlock">
        <div class="limitRow"><span>Limite disponível</span><button type="button" class="editableText limitEdit" data-edit-card-limit="${esc(c.cartao)}" title="Clique para alterar o limite do cartão"><b>${fmt(Math.max(0,c.limite-c.total))}</b></button></div>
        ${progressBarHtml(c.pct)}
        <div class="cardUtilizacaoMeta"><button type="button" class="editableText limitEdit" data-edit-card-limit="${esc(c.cartao)}" title="Clique para alterar o limite total">Limite total: ${fmt(c.limite)}</button><span>${c.pct.toFixed(1).replace('.',',')}% utilizado</span></div>
      </div>
      ${cardMiniStats(c)}
      <div class="executiveTableHead"><span>Compra</span><span>Parcela</span><span>Valor</span></div>
      <div class="executiveTxList">${executiveCardTableRows(c.itens)}</div>
      <div class="executiveCardFoot"><button class="linkBtn executiveSeeAll" type="button" onclick="clickMonth('cartoes','${esc(selectedCartoesMes)}')">Ver todas as compras ›</button></div>
    </div>`).join('');
  const kpiHost=$('cartoesKpiStrip');
  if(kpiHost)kpiHost.innerHTML=cardResumoInferior(porCartao,totalGeral,rows);
}

function inputMoney(v){return Number(v||0).toFixed(2).replace('.',',')}
function updateIncomeTotal(){const el=$('incomeTotal');if(el)el.textContent=fmt(parseMoney($('incomeFelipe')?.value)+parseMoney($('incomeRafaela')?.value))}
function renderMonthlyIncome(mes,ano){const r=receitasDoMes(mes,ano);if($('incomeFelipe'))$('incomeFelipe').value=inputMoney(r.felipe);if($('incomeRafaela'))$('incomeRafaela').value=inputMoney(r.rafaela);updateIncomeTotal()}
function saveMonthlyIncome(){
  const mes=$('orcMes')?.value||currentMes(),ano=Number($('orcAno')?.value||anoBase());
  const felipe=parseMoney($('incomeFelipe')?.value),rafaela=parseMoney($('incomeRafaela')?.value);
  state.config=state.config||{};state.config.receitasMensais=state.config.receitasMensais||{};
  state.config.receitasMensais[receitaKey(mes,ano)]={felipe,rafaela};
  save();addHist('Receitas mensais atualizadas',`${mes}/${ano} · Felipe ${fmt(felipe)} · Rafaela ${fmt(rafaela)}`);renderOrc();
}
function renderOrc(){options('orcMes',MESES,$('orcMes')?.value||currentMes());options('orcAno',ANOS,$('orcAno')?.value||anoBase());const mes=$('orcMes').value,ano=Number($('orcAno').value||anoBase()),p=projecao(mes,ano),compras=comprasMes(mes,ano);kpis([['Receitas',fmt(p.receitas),'receitas do mês'],['Despesas',fmt(p.despesas),'despesas projetadas'],['Cartões',fmt(p.cartoes),'faturas do mês'],[p.saldo>=0?'Superávit':'Déficit',fmt(p.saldo),p.saldo>=0?'saldo positivo':'saldo negativo',p.saldo>=0?'positive':'negative']], 'orcCards');renderMonthlyIncome(mes,ano);renderBudgetReport(mes,ano);renderInsights(mes,ano);renderDistrib(mes,ano);renderSaldoChart(ano);renderCommitmentBand(mes,p);table('tblResumo',[{t:'Item',k:'item'},{t:'Valor',num:1,f:r=>fmt(r.valor)}],[{item:'Receitas',valor:p.receitas},{item:'Despesas fixas',valor:p.fixas},{item:'Despesas variáveis',valor:p.variaveis},{item:'Cartões',valor:p.cartoes},{item:'Total de despesas',valor:p.despesas},{item:p.saldo>=0?'Superávit':'Déficit',valor:p.saldo}]);table('tblTopEmp',[{t:'Empresa',k:'nome'},{t:'Total',num:1,f:r=>fmt(r.total)}],top(compras,'empresa',15));table('tblOrc',[{t:'Item',k:'nome'},{t:'Valor',num:1,f:r=>fmt(r.valor)}],[{nome:'Receitas',valor:p.receitas},{nome:'Despesas totais',valor:p.despesas},{nome:'Fixas',valor:p.fixas},{nome:'Variáveis',valor:p.variaveis},{nome:'Cartões',valor:p.cartoes},{nome:p.saldo>=0?'Superávit':'Déficit',valor:p.saldo}]);table('tblProjecao',[{t:'Mês/Ano',f:r=>r.label||r.mes},{t:'Receitas',num:1,f:r=>fmt(r.receitas)},{t:'Despesas',num:1,f:r=>fmt(r.despesas)},{t:'Cartões',num:1,f:r=>fmt(r.cartoes)},{t:'Saldo projetado',num:1,f:r=>`<span class="${r.saldo>=0?'positive':'negative'}">${fmt(r.saldo)}</span>`},{t:'Status',f:r=>r.saldo>=0?'Superávit':'Déficit'}],mesesProjecaoRolante(mes,ano).map(x=>({...projecao(x.mes,x.ano),ano:x.ano,label:x.label})))}
function saveOrc(){save();renderOrc()}
function renderHist(){renderCloudStatus();const h=hist();kpis([['Eventos',h.length,'histórico local'],['Compras',state.comprasCartao.length,'base atual'],['Cartões',state.cartoes.length,'base atual']], 'histKpis');table('tblHistorico',[{t:'Data',f:r=>new Date(r.at).toLocaleString('pt-BR')},{t:'Usuário',k:'by'},{t:'Ação',k:'action'},{t:'Detalhe',k:'detail'}],h)}


function parseMoney(v){let s=String(v||'').trim().replace(/\s/g,'');if(!s)return 0;s=s.replace(/R\$/i,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');return Number(s)||0}
function updateExpensePreview(){
  const preview=$('expenseParcelasPreview'); if(!preview)return;
  const total=parseMoney($('expenseValor')?.value), parcelas=Math.max(1,Math.min(36,parseInt($('expenseParcelas')?.value||'1',10)||1)), mes=$('expenseMes')?.value||currentMes();
  if(!(total>0)){preview.textContent='Informe valor e parcelas para visualizar.';return}
  const base=Math.floor((total/parcelas)*100)/100, last=Number((total-base*(parcelas-1)).toFixed(2));
  const start=MESES.indexOf(mesNorm(mes));
  const itens=[];
  for(let i=0;i<parcelas;i++){const m=MESES[(start+i)%12]; const v=i===parcelas-1?last:base; itens.push(`${i+1}/${parcelas} em ${m}: ${fmt(v)}`)}
  preview.innerHTML=itens.slice(0,6).map(esc).join('<br>')+(itens.length>6?`<br>… +${itens.length-6} parcela(s)`: '');
}

function setExpenseModalMode(mode){
  const modal=$('expenseModal'); if(!modal)return;
  const isCard=mode==='card';
  modal.dataset.mode=isCard?'card':'normal';
  modal.classList.toggle('mode-card',isCard);
  modal.classList.toggle('mode-normal',!isCard);
  const title=$('expenseModalTitle'); if(title)title.textContent=isCard?'Nova compra no cartão':'Nova despesa';
  const label=$('expenseValorLabel'); if(label)label.textContent=isCard?'Valor total da compra':'Valor';
  const saveBtn=$('expenseSave'); if(saveBtn)saveBtn.textContent=isCard?'Salvar compra':'Salvar despesa';
  updateExpensePreview();
}
function syncExpenseModeFromTipo(){
  const tipo=$('expenseTipo')?.value||'fixas';
  setExpenseModalMode(tipo==='cartoes'?'card':'normal');
  if(tipo==='cartoes' && $('expenseCategoria') && !$('expenseCategoria').value) $('expenseCategoria').value='Compras';
}

function openExpenseModal(mode){
  mode = mode || (active==='cartoes'?'card':'normal');
  const modal=$('expenseModal'); if(!modal)return;
  setExpenseModalMode(mode);
  options('expenseMes',MESES,(active==='cartoes'?$('cardMes')?.value:$('dashMes')?.value)||currentMes());
  options('expenseCartao',state.cartoes,state.cartoes[0]);
  const cat=$('expenseCategoria'); if(cat)cat.innerHTML=CATEGORIAS.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if($('expenseTipo'))$('expenseTipo').value=mode==='card'?'cartoes':(active==='variaveis'?'variaveis':'fixas');
  if($('expenseCategoria'))$('expenseCategoria').value=mode==='card'?'Compras':'Outros';
  if($('expenseNome'))$('expenseNome').value=''; if($('expenseValor'))$('expenseValor').value='';
  if($('expenseParcelas'))$('expenseParcelas').value='1'; updateExpensePreview();
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>$('expenseNome')?.focus(),50);
}
function closeExpenseModal(){const modal=$('expenseModal');if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}}
function saveExpenseModal(){
  const mode=($('expenseTipo')?.value==='cartoes')?'card':($('expenseModal')?.dataset.mode||'normal');
  const nome=String($('expenseNome')?.value||'').trim(), valor=parseMoney($('expenseValor')?.value), categoria=$('expenseCategoria')?.value||'Outros', mes=$('expenseMes')?.value||currentMes();
  if(!nome){alert('Informe a descrição da despesa.');return}
  if(isGenericExpenseName(nome)){alert('Informe o nome real da despesa, por exemplo: supermercado, combustível ou Amazon.');return}
  if(!(valor>0)){alert('Informe um valor válido.');return}
  if(mode==='card'){
    const cartao=String($('expenseCartao')?.value||'').trim()||'Sem cartão';
    const parcelas=Math.max(1,Math.min(36,parseInt($('expenseParcelas')?.value||'1',10)||1));
    const start=MESES.indexOf(mesNorm(mes));
    const base=Math.floor((valor/parcelas)*100)/100;
    const last=Number((valor-base*(parcelas-1)).toFixed(2));
    const grupo='cp'+Date.now();
    if(!state.cartoes.includes(cartao))state.cartoes.push(cartao);
    for(let i=0;i<parcelas;i++){
      const parcelaValor=i===parcelas-1?last:base;
      const mesParcela=MESES[(start+i)%12];
      const anoInicial=Number($('cardAno')?.value||$('dashAno')?.value||anoBase());
      const anoParcela=anoInicial+Math.floor((start+i)/12);
      state.comprasCartao.push(normalizeCompraFields({id:`${grupo}-${i+1}`,grupoCompra:grupo,data:new Date().toISOString().slice(0,10),mes:mesParcela,ano:anoParcela,cartao,empresa:nome,nomeFatura:nome,apelido:nome,categoria,parcela:`${i+1}/${parcelas}`,parcelaAtual:i+1,parcelaTotal:parcelas,valor:parcelaValor,valorTotal:valor,origem:'manual-cartao'}));
    }
    state.comprasCartao=annotateParcelas(state.comprasCartao);
    save();addHist('Compra parcelada adicionada',`${nome} · ${cartao} · ${parcelas}x · total ${fmt(valor)}`);
    closeExpenseModal();render();return;
  }
  const tipo=$('expenseTipo')?.value||'fixas', recorrencia=$('expenseRecorrencia')?.value||'mes';
  const valores={};MESES.forEach(m=>valores[m]=recorrencia==='todos'?valor:(norm(m)===norm(mes)?valor:0));
  const item={id:'d'+Date.now(),nome,valores,categoria,origem:'manual'};
  if(tipo==='variaveis')state.variaveis.push(item);else state.fixas.push(item);
  setCategoria(tipo,nome,categoria);
  save();addHist('Despesa adicionada',`${nome} · ${fmt(valor)} · ${tipo==='fixas'?'Fixa':'Variável'} · ${categoria}`);
  closeExpenseModal();render();
}

let chatExpense=null;
function chatAdd(textValue,role='bot',extra=''){
  const host=$('chatExpenseMessages');if(!host)return;
  const bubble=document.createElement('div');bubble.className=`chatBubble ${role} ${extra}`.trim();bubble.textContent=String(textValue||'');host.appendChild(bubble);host.scrollTop=host.scrollHeight;
}
function chatSetChoices(items){const host=$('chatExpenseChoices');if(!host)return;host.innerHTML=(items||[]).map(x=>`<button type="button" class="chatChoice ${x.danger?'danger':''}" data-chat-value="${esc(x.value)}">${esc(x.label||x.value)}</button>`).join('')}
function chatConfig(step){
  const d=chatExpense?.data||{}, cards=(state.cartoes||[]).map(x=>({label:x,value:x}));
  const configs={
    nome:{q:'Qual é a descrição da despesa?',placeholder:'Ex.: Mercado Livre'},
    valor:{q:'Qual é o valor total?',placeholder:'Ex.: 240,00'},
    tipo:{q:'Qual é o tipo da despesa?',choices:[{label:'Controle mensal',value:'controle'},{label:'Fixa',value:'fixas'},{label:'Variável',value:'variaveis'},{label:'Cartão',value:'cartoes'}]},
    controle:{q:'Qual orçamento deve ser reduzido?',choices:BUDGET_CONTROLS.map(x=>({label:x.label,value:x.id}))},
    cartao:{q:'Qual cartão foi utilizado?',placeholder:'Digite o nome do cartão',choices:cards},
    parcelas:{q:'Em quantas parcelas?',placeholder:'Digite a quantidade',choices:[1,2,3,4,6,10,12].map(x=>({label:`${x}x`,value:String(x)}))},
    categoria:{q:'Qual é a categoria?',choices:CATEGORIAS.map(x=>({label:x,value:x}))},
    mes:{q:'Em qual mês começa o lançamento?',choices:MESES.map(x=>({label:mesCap(x),value:x}))},
    ano:{q:'Qual é o ano inicial?',placeholder:'De 2026 a 2040',choices:ANOS.slice(0,6).map(x=>({label:String(x),value:String(x)}))},
    recorrencia:{q:'Essa despesa deve se repetir?',choices:[{label:'Somente neste mês',value:'mes'},{label:'Todos os meses',value:'todos'}]},
    confirmar:{q:'Confira os dados antes de salvar.',choices:[{label:'Confirmar lançamento',value:'confirmar'},{label:'Cancelar',value:'cancelar',danger:true}]}
  };return configs[step];
}
function chatSummary(){const d=chatExpense.data,control=budgetControlById(d.controlId),tipo=d.tipo==='controle'?'Controle mensal':d.tipo==='cartoes'?'Cartão':d.tipo==='fixas'?'Fixa':'Variável',lines=[`Descrição: ${d.nome}`,`Valor: ${fmt(d.valor)}`,`Tipo: ${tipo}`];if(control)lines.push(`Orçamento: ${control.label}`);if(d.cartao)lines.push(`Cartão: ${d.cartao}`,`Parcelas: ${d.parcelas}x`);if(d.categoria)lines.push(`Categoria: ${d.categoria}`);lines.push(`Início: ${mesCap(d.mes)}/${d.ano}`);if(!['cartoes','controle'].includes(d.tipo))lines.push(`Recorrência: ${d.recorrencia==='todos'?'Todos os meses':'Somente no mês escolhido'}`);return lines.join('\n')}
function chatAsk(){
  if(!chatExpense)return;const cfg=chatConfig(chatExpense.step),input=$('chatExpenseInput');chatAdd(cfg.q);chatSetChoices(cfg.choices||[]);input.value='';input.placeholder=cfg.placeholder||'Digite sua resposta';const needsInput=!cfg.choices||cfg.choices.length===0||['nome','valor','parcelas','ano'].includes(chatExpense.step);input.disabled=!needsInput;$('chatExpenseSend').disabled=!needsInput;if(chatExpense.step==='confirmar')chatAdd(chatSummary(),'bot','summary');if(needsInput)setTimeout(()=>input.focus(),30);
}
function chatNextStep(){const d=chatExpense.data,s=chatExpense.step;if(s==='nome')return'valor';if(s==='valor')return'tipo';if(s==='tipo')return d.tipo==='controle'?'controle':d.tipo==='cartoes'?'cartao':'categoria';if(s==='controle')return'mes';if(s==='cartao')return'parcelas';if(s==='parcelas')return'categoria';if(s==='categoria')return'mes';if(s==='mes')return'ano';if(s==='ano')return ['cartoes','controle'].includes(d.tipo)?'confirmar':'recorrencia';if(s==='recorrencia')return'confirmar';return'confirmar'}
function handleBudgetNaturalLanguage(value){const control=detectBudgetControl(value);if(!control)return false;const d=chatExpense.data;if(isBudgetQuery(value)){chatAdd(value,'user');chatAdd(budgetStatusText(control,d.mes,d.ano),'bot','summary');chatAdd('Você pode fazer outra pergunta ou registrar um gasto.','bot');$('chatExpenseInput').value='';$('chatExpenseInput').focus();return true}const amount=extractMoneyFromText(value);if(!(amount>0))return false;d.nome=value;d.valor=amount;d.tipo='controle';d.controlId=control.id;d.mes=d.mes||currentMes();d.ano=d.ano||anoBase();chatAdd(value,'user');chatExpense.step='confirmar';chatAsk();return true}
function chatSubmit(raw,label){
  if(!chatExpense)return;const s=chatExpense.step,d=chatExpense.data,value=String(raw??'').trim();if(!value)return;
  if(s==='confirmar'){if(value==='cancelar'){closeChatExpense();return}if(value==='confirmar'){saveChatExpense();return}}
  if(s==='nome'){if(handleBudgetNaturalLanguage(value))return;if(isGenericExpenseName(value)){chatAdd(label||value,'user');chatAdd('Entendi que você quer registrar uma despesa. Agora informe o nome real da compra, por exemplo: supermercado, combustível ou Amazon.');$('chatExpenseInput').value='';$('chatExpenseInput').focus();return}d.nome=value;}
  else if(s==='valor'){const n=parseMoney(value);if(!(n>0)){alert('Informe um valor válido.');return}d.valor=n;}
  else if(s==='tipo')d.tipo=value;
  else if(s==='controle')d.controlId=value;
  else if(s==='cartao')d.cartao=value;
  else if(s==='parcelas'){const n=Math.max(1,Math.min(36,parseInt(value,10)||0));if(!n){alert('Informe uma quantidade válida de parcelas.');return}d.parcelas=n;}
  else if(s==='categoria')d.categoria=value;
  else if(s==='mes')d.mes=value;
  else if(s==='ano'){const n=parseInt(value,10);if(n<2026||n>2040){alert('Escolha um ano entre 2026 e 2040.');return}d.ano=n;}
  else if(s==='recorrencia')d.recorrencia=value;
  chatAdd(label||value,'user');chatExpense.step=chatNextStep();chatAsk();
}
function saveChatExpense(){
  const d=chatExpense.data;
  if(d.tipo==='controle'){
    const control=budgetControlById(d.controlId);state.budgetTransactions=state.budgetTransactions||[];state.budgetTransactions.push({id:'bt'+Date.now(),controlId:d.controlId,descricao:d.nome,valor:d.valor,mes:d.mes,ano:d.ano,createdAt:new Date().toISOString(),origem:'conversa'});const s=budgetStatus(control,d.mes,d.ano);addHist('Gasto de orçamento registrado',`${control.label} · ${fmt(d.valor)} · disponível ${fmt(s.disponivel)}`);save();chatAdd(`Registrado em ${control.label}.\nGasto: ${fmt(d.valor)}\nDisponível agora: ${fmt(s.disponivel)}`,'bot','summary');chatSetChoices([]);setTimeout(()=>{closeChatExpense();render()},1000);return;
  }else if(d.tipo==='cartoes'){
    const start=MESES.indexOf(d.mes),base=Math.floor((d.valor/d.parcelas)*100)/100,last=Number((d.valor-base*(d.parcelas-1)).toFixed(2)),grupo='chat'+Date.now();if(!state.cartoes.includes(d.cartao))state.cartoes.push(d.cartao);
    for(let i=0;i<d.parcelas;i++){const mes=MESES[(start+i)%12],ano=d.ano+Math.floor((start+i)/12),valor=i===d.parcelas-1?last:base;state.comprasCartao.push(normalizeCompraFields({id:`${grupo}-${i+1}`,grupoCompra:grupo,data:new Date().toISOString().slice(0,10),mes,ano,cartao:d.cartao,empresa:d.nome,nomeFatura:d.nome,apelido:d.nome,categoria:d.categoria,parcela:`${i+1}/${d.parcelas}`,parcelaAtual:i+1,parcelaTotal:d.parcelas,valor,valorTotal:d.valor,origem:'conversa'}));}
    addHist('Compra adicionada por conversa',`${d.nome} · ${d.cartao} · ${d.parcelas}x · ${fmt(d.valor)}`);
  }else{
    const valores={};MESES.forEach(m=>valores[m]=d.recorrencia==='todos'?d.valor:(m===d.mes?d.valor:0));const item={id:'chat'+Date.now(),nome:d.nome,valores,categoria:d.categoria,origem:'conversa',anoInicial:d.ano};state[d.tipo].push(item);state.config.categoryOverrides[overrideKey(d.tipo,d.nome)]=d.categoria;addHist('Despesa adicionada por conversa',`${d.nome} · ${fmt(d.valor)} · ${d.categoria}`);
  }
  save();chatAdd('Despesa registrada com sucesso.','bot');chatSetChoices([]);setTimeout(()=>{closeChatExpense();render()},650);
}
function openChatExpense(){
  const modal=$('chatExpenseModal'),suggested=active==='cartoes'?'cartoes':active==='variaveis'?'variaveis':'fixas',mes=(active==='cartoes'?$('cardMes')?.value:active==='variaveis'?$('varMes')?.value:active==='fixas'?$('fixMes')?.value:$('dashMes')?.value)||currentMes(),ano=Number((active==='cartoes'?$('cardAno')?.value:active==='variaveis'?$('varAno')?.value:active==='fixas'?$('fixAno')?.value:$('dashAno')?.value)||anoBase());chatExpense={step:'nome',data:{tipo:suggested,mes,ano,parcelas:1,recorrencia:'mes'}};$('chatExpenseMessages').innerHTML='';modal.classList.add('open');modal.setAttribute('aria-hidden','false');chatAdd('Vamos registrar uma nova despesa.');chatAsk();
}
function closeChatExpense(){const modal=$('chatExpenseModal');if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}chatExpense=null}

function show(id){active=id;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));render()}
function render(){({dashboard:renderDashboard,fixas:renderFixas,variaveis:renderVariaveis,cartoes:renderCartoes,orcamentos:renderOrc,historico:renderHist}[active]||renderDashboard)()}
function backup(){const payload={version:APP_VERSION,exportedAt:new Date().toISOString(),state};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='backup-financas-familia-v33.2.2.2-final-limpa.json';a.click();URL.revokeObjectURL(a.href)}
function importBackupFile(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);const imported=normalize(data.state||data);if(!imported.fixas.length&&!imported.variaveis.length&&!imported.comprasCartao.length)throw new Error('O arquivo não contém dados financeiros reconhecidos.');state=imported;save();addHist('Backup importado',file.name||'arquivo JSON');alert('Backup importado com sucesso.');render();}catch(e){alert('Não foi possível importar o backup: '+(e.message||e));}};reader.readAsText(file)}
function reset(){if(confirm('Restaurar os dados originais da V33.2.2.2.2 Interface Compacta?')){const prefixes=['financasFamilia','backup-financas-familia'];for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k==='ff_user'||prefixes.some(p=>String(k).startsWith(p)))localStorage.removeItem(k)}location.reload()}}
function init(){state=load();state.config=state.config||{};state.config.categoryOverrides=state.config.categoryOverrides||{};save();const nav=$('nav');nav.innerHTML=TABS.map(([id,n,ic])=>`<button data-tab="${id}"><span class="navIcon">${esc(ic||'')}</span><span>${esc(n)}</span></button>`).join('');nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.tab));
  initUserSelect();
  document.querySelectorAll('.btnNovaDespesaAlt').forEach(b=>{if(!b.parentElement.querySelector('.btnConversaDespesa')){const chatBtn=document.createElement('button');chatBtn.type='button';chatBtn.className='ghost btnConversaDespesa';chatBtn.textContent='💬 Assistente financeiro';b.insertAdjacentElement('afterend',chatBtn)}});
  document.querySelectorAll('.btnConversaDespesa').forEach(b=>b.onclick=openChatExpense);
  if($('chatExpenseClose'))$('chatExpenseClose').onclick=closeChatExpense;
  if($('chatExpenseSend'))$('chatExpenseSend').onclick=()=>chatSubmit($('chatExpenseInput').value);
  if($('chatExpenseInput'))$('chatExpenseInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();chatSubmit(e.target.value)}};
  if($('chatExpenseChoices'))$('chatExpenseChoices').onclick=e=>{const b=e.target.closest('[data-chat-value]');if(b)chatSubmit(b.dataset.chatValue,b.textContent.trim())};
  if($('chatExpenseModal'))$('chatExpenseModal').onclick=e=>{if(e.target.id==='chatExpenseModal')closeChatExpense()};
  $('dashMes').onchange=renderDashboard;$('dashAno').onchange=renderDashboard; if($('btnNovaDespesa'))$('btnNovaDespesa').onclick=()=>openExpenseModal('normal'); document.querySelectorAll('.btnNovaDespesaAlt').forEach(b=>b.onclick=()=>openExpenseModal(active==='cartoes'?'card':'normal')); if($('btnBackup'))$('btnBackup').onclick=backup; if($('btnPrint'))$('btnPrint').onclick=()=>window.print(); if($('btnImportBackup'))$('btnImportBackup').onclick=()=>$('backupFile')?.click(); if($('backupFile'))$('backupFile').onchange=e=>importBackupFile(e.target.files&&e.target.files[0]);
  $('fixMes').onchange=renderFixas;$('fixAno').onchange=renderFixas;$('fixBusca').oninput=renderFixas;
  $('varMes').onchange=renderVariaveis;$('varAno').onchange=renderVariaveis;$('varBusca').oninput=renderVariaveis;
  $('cardMes').onchange=renderCartoes;$('cardAno').onchange=renderCartoes;
  if($('cardBusca')){
    const busca=$('cardBusca');
    busca.value='';busca.dataset.userEdited='false';
    const markCardSearch=()=>{busca.dataset.userEdited='true'};
    busca.addEventListener('keydown',markCardSearch);
    busca.addEventListener('paste',markCardSearch);
    busca.oninput=()=>{if(busca.dataset.userEdited==='true')renderCartoes()};
    setTimeout(()=>{if(busca.dataset.userEdited!=='true'&&busca.value){busca.value='';renderCartoes()}},500);
  }
  $('orcMes').onchange=renderOrc;$('orcAno').onchange=renderOrc;
  if($('btnSalvarReceitas'))$('btnSalvarReceitas').onclick=saveMonthlyIncome;
  if($('incomeFelipe'))$('incomeFelipe').oninput=updateIncomeTotal;
  if($('incomeRafaela'))$('incomeRafaela').oninput=updateIncomeTotal;
  $('btnHistManual').onclick=()=>{const d=prompt('Descreva a alteração:');if(d){addHist('Registro manual',d);renderHist()}};if($('familyKey'))$('familyKey').onchange=e=>{setFamilyKey(e.target.value);renderCloudStatus()};if($('btnCloudSave'))$('btnCloudSave').onclick=cloudSave;if($('btnCloudLoad'))$('btnCloudLoad').onclick=cloudLoad;
  $('btnHistLimpar').onclick=()=>{if(confirm('Limpar histórico?')){localStorage.setItem(HIST,'[]');renderHist()}};
  $('btnExportBackup2').onclick=backup;if($('btnImportBackup2'))$('btnImportBackup2').onclick=()=>$('backupFile')?.click();$('btnReset2').onclick=reset;if($('btnExportCSV'))$('btnExportCSV').onclick=exportCSV;
  if($('expenseTipo'))$('expenseTipo').onchange=syncExpenseModeFromTipo; if($('expenseValor'))$('expenseValor').oninput=updateExpensePreview; if($('expenseParcelas'))$('expenseParcelas').oninput=updateExpensePreview; if($('expenseMes'))$('expenseMes').onchange=updateExpensePreview; if($('expenseClose'))$('expenseClose').onclick=closeExpenseModal; if($('expenseCancel'))$('expenseCancel').onclick=closeExpenseModal; if($('expenseSave'))$('expenseSave').onclick=saveExpenseModal; if($('expenseModal'))$('expenseModal').onclick=e=>{if(e.target.id==='expenseModal')closeExpenseModal()};
  if($('modalClose'))$('modalClose').onclick=closeEditModal;
  if($('modalCancel'))$('modalCancel').onclick=closeEditModal;
  if($('modalSave'))$('modalSave').onclick=saveEditModal;
  if($('editModal'))$('editModal').onclick=e=>{if(e.target.id==='editModal')closeEditModal()};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeEditModal();closeChatExpense()}});
  document.addEventListener('click',e=>{
    const menuButton=e.target.closest('[data-purchase-menu]');
    if(menuButton){e.preventDefault();e.stopPropagation();openPurchaseMenu(menuButton,menuButton.dataset.purchaseMenu);return;}
    const menuCategory=e.target.closest('[data-menu-category],[data-change-card-category]');
    if(menuCategory){e.preventDefault();e.stopPropagation();const id=menuCategory.dataset.menuCategory||menuCategory.dataset.changeCardCategory;closePurchaseMenu();chooseCompraCategoria(id);return;}
    const menuDelete=e.target.closest('[data-menu-delete]');
    if(menuDelete){e.preventDefault();e.stopPropagation();const id=menuDelete.dataset.menuDelete;closePurchaseMenu();deleteCompra(id);return;}
    if(!e.target.closest('.purchaseContextMenu'))closePurchaseMenu();
    const shortcut=e.target.closest('[data-kpi-tab]');
    if(shortcut){e.preventDefault();e.stopPropagation();show(shortcut.dataset.kpiTab);return;}
    const delItem=e.target.closest('[data-delete-item]');
    if(delItem){e.preventDefault();e.stopPropagation();deleteDespesa(delItem.dataset.deleteItem,delItem.dataset.id);return;}
    const delCompra=e.target.closest('[data-delete-compra]');
    if(delCompra){e.preventDefault();e.stopPropagation();deleteCompra(delCompra.dataset.deleteCompra);return;}
    const item=e.target.closest('[data-edit-item]');
    if(item){e.preventDefault();e.stopPropagation();editDespesaField(item.dataset.editItem,item.dataset.id,item.dataset.field);return;}
    const compra=e.target.closest('[data-edit-compra]');
    if(compra){e.preventDefault();e.stopPropagation();editCompraField(compra.dataset.editCompra,compra.dataset.field);return;}
    const lim=e.target.closest('[data-edit-card-limit]');
    if(lim){e.preventDefault();e.stopPropagation();editCardLimit(lim.dataset.editCardLimit);return;}
    const cname=e.target.closest('[data-edit-card-name]');
    if(cname){e.preventDefault();e.stopPropagation();editCardName(cname.dataset.editCardName);return;}
  });
  show('dashboard')}
window.addEventListener('DOMContentLoaded',()=>{try{init()}catch(e){console.error(e);document.body.insertAdjacentHTML('afterbegin',`<div class="alert"><b>Erro ao iniciar:</b> ${esc(e.message||e)}</div>`)}});
})();
