// Verifica cálculos e renderização de HTML sem navegador; Node é opcional para este teste.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app={innerHTML:''};const sandbox={document:{querySelector:()=>app,addEventListener:()=>{}},window:{},location:{hash:''},history:{replaceState:()=>{}},fetch:()=>new Promise(()=>{}),URLSearchParams,Intl,Date,console,setTimeout,clearTimeout};
vm.createContext(sandbox);let source=fs.readFileSync(require('node:path').join(__dirname,'../public/store.js'),'utf8');source=source.slice(source.indexOf('\n')+1,source.lastIndexOf('})();'));vm.runInContext(source,sandbox);
vm.runInContext(`
state={settings:{open:0,contact:'',pickup:''},setup:false,user:{id:1,name:'Admin',email:'admin@example.com',role:'admin'},products:[{id:1,name:'Perfume',sku:'P1',category:'Perfumes',description:'',price:10000,cost:4000,stock:8,minimum:3,active:1,photo:''}],orders:[{id:1,customer_name:'Cliente',status:'paid',created:'2026-09-01',paid_at:'2026-09-01T12:00:00Z',total:20000,cost:8000,payment:'Pix',items:[{product_id:1,name:'Perfume',quantity:2,price:10000,cost:4000}]}],expenses:[{id:1,date:'2026-09-01',amount:40000,kind:'stock',category:'Fornecedor',description:'Perfumes',void:0},{id:2,date:'2026-09-01',amount:2000,kind:'operating',category:'Embalagens',description:'Sacolas',void:0}],users:[],movements:[]};month='2026-09';`,sandbox);
const s=vm.runInContext('statsFor(month)',sandbox);assert.equal(s.revenue,20000);assert.equal(s.cost,8000);assert.equal(s.spent,42000);assert.equal(s.cash,-22000);assert.equal(s.margin,10000);
for(const v of ['dashboard','catalog','products','orders','expenses','reports','users','settings']){vm.runInContext(`view='${v}';render()`,sandbox);assert(app.innerHTML.includes('Anna Maria'));assert(!app.innerHTML.includes('NaN'));}
vm.runInContext("state.orders[0].status='pending'",sandbox);assert.equal(vm.runInContext('statsFor(month).revenue',sandbox),0);
vm.runInContext("state.orders[0].status='cancelled';state.expenses[0].void=1",sandbox);assert.equal(vm.runInContext('statsFor(month).spent',sandbox),2000);
assert.equal(vm.runInContext(`esc('<img src=x onerror="evil">')`,sandbox),'&lt;img src=x onerror=&quot;evil&quot;&gt;');
console.log('OK: relatório mensal, pedido pendente/cancelado, gasto anulado, escape HTML e 8 telas.');

assert.equal(vm.runInContext("businessMonth('2026-10-01T01:30:00Z')",sandbox),"2026-09");
