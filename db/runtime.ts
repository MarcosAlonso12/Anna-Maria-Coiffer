import {env} from 'cloudflare:workers';
export function db(){if(!env.DB)throw new Error('Banco de dados indisponível.');return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error('Armazenamento indisponível.');return env.BUCKET;}
export function config(){return env as unknown as {OWNER_EMAIL?:string;SESSION_SECRET?:string};}
