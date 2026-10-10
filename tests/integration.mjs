import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {getPlatformProxy} from 'wrangler';
import worker from '../dist/index.js';
process.env.CLOUDFLARE_CF_FETCH_ENABLED='false';
const platform=await getPlatformProxy({persist:false,remoteBindings:false});
const env={...platform.env,SESSION_SECRET:'test-only-pepper-'.repeat(4),SETUP_TOKEN:'test-only-setup-'.repeat(4)};
const origin='https://loja.example';
let sequence=0;
const client=()=>({cookie:'',csrf:'',ip:'192.0.2.'+(++sequence)});
async function request(c,path,data,headers={}){
 const r=await worker.fetch(new Request(origin+'/api/'+path,{method:data?'POST':'GET',headers:{cookie:c.cookie,'cf-connecting-ip':c.ip,...(data?{'Content-Type':'application/json',Origin:origin,'X-CSRF-Token':c.csrf}:{}),...headers},body:data?JSON.stringify(data):undefined}),env);
 const cookie=r.headers.get('set-cookie');if(cookie)c.cookie=cookie.split(';')[0];
 const value=await r.json();if(value.csrf)c.csrf=value.csrf;
 return {status:r.status,value,headers:r.headers};
}
async function ok(c,path,data){const r=await request(c,path,data);assert.equal(r.status,200,JSON.stringify(r.value));return r.value}
try{
 for(const f of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){
  const sql=await readFile('drizzle/'+f,'utf8');
  for(const statement of sql.split(';').map(x=>x.replaceAll('--> statement-breakpoint','').trim()).filter(Boolean))await env.DB.prepare(statement).run();
 }
 const owner=client(),visitor=client(),other=client();
 assert.equal((await ok(visitor,'state')).user,null);
 assert.equal((await request(visitor,'products',{id:0})).status,403);
 assert.equal((await request(visitor,'settings',{}, {Origin:'https://evil.example'})).status,403);
 assert.equal((await request(visitor,'settings',{}, {'X-CSRF-Token':'wrong'})).status,403);
 await ok(owner,'state');
 assert.equal((await request(owner,'setup',{email:'owner@example.com',name:'Owner',password:'Owner-test-password!',setup_token:'wrong'})).status,403);
 const oldCookie=owner.cookie;
 await ok(owner,'setup',{email:'owner@example.com',name:'Owner',password:'Owner-test-password!',setup_token:env.SETUP_TOKEN});
 assert.notEqual(owner.cookie,oldCookie);
 assert.equal((await ok(owner,'state')).user.role,'admin');
 await ok(other,'state');
 assert.equal((await request(other,'setup',{email:'second@example.com',name:'Second',password:'Owner-test-password!',setup_token:env.SETUP_TOKEN})).status,409);
 await ok(owner,'settings',{contact:'5566999999999',pickup:'Retirada na loja',open:true});
 const product=await ok(owner,'products',{id:0,sku:'TEST',name:'Perfume',category:'Perfumes',price:'100.00',cost:'40.00',stock:2,minimum:1,active:true,photo:''});
 const state=await ok(visitor,'state');assert.equal(state.products[0].cost,undefined);assert.equal(state.users.length,0);
 const purchase={customer_name:'Cliente',phone:'66999999999',email:'',payment:'Pix',delivery:'Retirada',items:[{id:product.id,quantity:1}],request_id:crypto.randomUUID()};
 const order=await ok(visitor,'orders',purchase);
 assert.equal((await ok(visitor,'orders',purchase)).id,order.id);
 assert.equal((await ok(owner,'state')).products[0].stock,1);
 // Public registration must never accept an administrator role supplied by a visitor.
 await ok(visitor,'register',{name:'Cliente',email:'client@example.com',password:'Customer-test-password!',role:'admin'});
 const registered=await ok(visitor,'state');assert.equal(registered.user.role,'customer');assert.equal(registered.orders.length,1);
 assert.equal((await ok(other,'state')).orders.length,0);
 assert.equal((await request(other,'invoice-download?id='+order.id)).status,403);
 assert.equal((await request(visitor,'backup')).status,403);
 assert.equal((await request(other,'login',{email:'client@example.com',password:'Incorrect-test-password!'})).status,401);
 await ok(other,'login',{email:'client@example.com',password:'Customer-test-password!'});
 assert.equal((await ok(other,'state')).orders[0].id,order.id);
 await ok(visitor,'password',{current:'Customer-test-password!',password:'Customer-new-password!'});
 assert.equal((await ok(other,'state')).user,null);
 const pending=await Promise.all([request(visitor,'orders',{...purchase,request_id:crypto.randomUUID()}),request(other,'orders',{...purchase,request_id:crypto.randomUUID()})]);
 assert.equal(pending.filter(r=>r.status===200).length,1,'Only one purchase can take the last unit');
 assert.equal((await ok(owner,'state')).products[0].stock,0);
 await ok(owner,'cancel',{id:order.id});
 assert.equal((await ok(owner,'state')).products[0].stock,1);
 assert.notEqual((await request(owner,'cancel',{id:order.id})).status,200);
 assert.equal((await ok(owner,'state')).products[0].stock,1);
 const backup=await ok(owner,'backup');assert(!JSON.stringify(backup).includes('password_hash'));assert(!JSON.stringify(backup).includes('pbkdf2$'));
 await ok(owner,'users',{name:'Assistant',email:'assistant@example.com',role:'admin',password:'Assistant-test-password!'});
 const invited=client();await ok(invited,'state');
 assert.equal((await request(invited,'register',{name:'Hijack',email:'assistant@example.com',password:'Malicious-test-password!'})).status,409);
 await ok(invited,'login',{email:'assistant@example.com',password:'Assistant-test-password!'});
 const assistant=(await ok(invited,'state')).user;
 await ok(owner,'user-active',{id:assistant.id,active:false});
 assert.equal((await ok(invited,'state')).user,null);
 const limited=client();await ok(limited,'state');let last;
 for(let i=0;i<11;i++)last=await request(limited,'login',{email:'absent@example.com',password:'No-account-password!'});
 assert.equal(last.status,429);
 console.log('PASS: API real + D1/R2 locais; criação única do administrador, login, CSRF, rotação e revogação de sessão, isolamento de pedidos, permissões, limite de tentativas, reserva concorrente, cancelamento e exportação sem senhas.');
}finally{await platform.dispose()}
