'use client';
import { useEffect } from 'react';
export default function StoreShell(){useEffect(()=>{const script=document.createElement('script');script.src='/store.js';script.async=true;document.body.appendChild(script);return()=>{script.remove()};},[]);return <><div id="app"><main className="loading">Abrindo a loja Anna Maria Coiffer…</main></div><div id="toast" role="status" aria-live="polite"/><dialog id="modal" aria-labelledby="modal-title"/></>}
