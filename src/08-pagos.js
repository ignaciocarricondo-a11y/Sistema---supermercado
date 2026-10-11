function vRes(){
 const m=/^\d{4}-\d{2}$/.test(keep.rmm||"")?keep.rmm:today().slice(0,7),X=resultado(m+"-01",finMes(m)),t=o=>X.cols.reduce((s,c)=>s+o[c],0),fila=(n,o,b,k)=>`<tr><td>${b?"<b>":""}${n}${b?"</b>":""}</td>${X.cols.map(c=>`<td class="${k&&o[c]<0?"er":""}">${b?"<b>":""}${money(o[c])}${b?"</b>":""}</td>`).join("")}<td class="${k&&t(o)<0?"er":""}"><b>${money(t(o))}</b></td></tr>`,tv=t(X.R.ventas);
 return `<div class="card"><h3>Resultado del mes y comparación entre sucursales</h3><label>Mes<input id="rmm" type="month" value="${m}"></label>
<div class="sc"><table><tr><th>Concepto</th>${X.cols.map(c=>`<th>${esc(c.replace("Sucursal ",""))}</th>`).join("")}<th>Total</th></tr>${fila("Ventas",X.R.ventas)}${fila("− Compras (boletas)",X.R.compras)}${fila("− Gastos y sueldos",X.R.gastos)}${fila("= Resultado",X.res,1,1)}${fila("Mermas",X.R.mermas)}${fila("Consumo interno",X.R.consumo)}${fila("Diferencias de caja",X.R.dif,0,1)}</table></div>
<p class="mu">${tv>0?"El resultado es el "+(t(X.res)/tv*100).toFixed(1)+" % de las ventas. ":""}Es una estimación: toma las ventas cargadas en los cierres de caja, las boletas por su fecha y los gastos cargados. No tiene en cuenta la mercadería que quedó en stock; las mermas y el consumo ya están dentro de las compras. Los sueldos y gastos sin sucursal van en General.</p></div>`}
async function libroCsv(){
 if(!dl)return say("Aquí no se pueden descargar archivos. Abre la app desde el navegador");
 const m=/^\d{4}-\d{2}$/.test(keep.lcm||"")?keep.lcm:today().slice(0,7);let L=B.filter(b=>mesDe(b.fecha)==m);
 try{const s=await colAR.where("mes","==",m).where("col","==","boletas").get();s.docs.forEach(d=>(d.data().filas||[]).forEach(b=>{if(mesDe(b.fecha)==m&&!L.some(z=>z.id==b.id))L.push(b)}))}catch(e){}
 L=L.filter(b=>b.estado!="anulada"&&b.estado!="por autorizar").sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));if(!L.length)return say("No hay boletas en "+mesTx(m));
 const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"',n=v=>String(Number(v||0).toFixed(2)).replace(".",","),H=["Fecha","Tipo de comprobante","Número","Proveedor","CUIT","Neto gravado","IVA","Percepciones y otros","Total","Sucursal","Rubro"];
 const csv="\ufeff"+[H.map(q).join(";")].concat(L.map(b=>[fmt(b.fecha),b.tipoC||"",b.nro,b.proveedor,b.cuit||(fichaDe(b.proveedor)||{}).cuit||"",n(b.neto),n(b.iva),n(b.perc),n(b.monto),b.sucursal,b.rubro||""].map(q).join(";"))).join("\r\n");
 try{await dl.save({filename:"libro_compras_"+m+".csv",data:csv});say("Libro de compras descargado ✔ ("+L.length+" comprobantes)")}catch(e){if(e&&e.code!="declined")say("No se pudo descargar ("+((e&&e.code)||"error")+")")}}
function resumenDatos(d1,d2){
 const pe=n=>"$ "+money(n),en=x=>x.fecha>=d1&&x.fecha<=d2,S=[],sum=(a,f)=>a.reduce((s,x)=>s+(f?f(x):x.monto),0);
 const Rp=P.filter(x=>x.estado!="anulado"&&en(x)),ps={};Rp.forEach(x=>{ps[x.sucursal]=(ps[x.sucursal]||0)+x.monto});
 S.push({t:"Pagos a proveedores",filas:MED.map(m=>["Con "+m.toLowerCase(),pe(sum(Rp.filter(x=>x.medio==m)))]).concat(Object.keys(ps).sort().map(k=>["Boletas de "+k,pe(ps[k])]),[["Total pagado",pe(sum(Rp)),1]])});
 const Ri=I.filter(x=>x.estado!="anulado"&&x.origen!="cambio"&&en(x)),is={};Ri.forEach(x=>{is[x.sucursal]=(is[x.sucursal]||0)+x.monto});
 const ac=Ri.filter(x=>x.tipo=="acred"),br=sum(ac,x=>x.bruto),ds=sum(ac,x=>x.desc);
 S.push({t:"Ingresos",filas:Object.keys(is).sort().map(k=>[k,pe(is[k])]).concat([["Total ingresado",pe(sum(Ri)),1],["Descuentos de tarjetas",pe(ds)+(br?" ("+(ds/br*100).toFixed(2)+" %)":"")]])});
 const Re=E.filter(x=>x.estado!="anulado"&&x.origen!="cheque"&&x.origen!="cambio"&&en(x)),et={};Re.forEach(x=>{et[x.tipo]=(et[x.tipo]||0)+x.monto});
 S.push({t:"Gastos y débitos",filas:Object.keys(et).sort().map(k=>[k,pe(et[k])]).concat([["Total de gastos",pe(sum(Re)),1]])});
 const df=Ri.filter(x=>x.esperado!=null&&x.medio=="Efectivo"&&Math.abs(x.monto-x.esperado)>=0.01);
 const dc=CJ.filter(x=>x.estado!="anulado"&&en(x)&&x.dif!=null&&Math.abs(x.dif)>=0.01).map(x=>[x.sucursal+" "+x.caja+" "+x.turno+" "+fmt(x.fecha)+" - "+x.cajero,pe(x.dif)]).concat(df.map(x=>[x.sucursal+" "+fmt(x.fecha)+" (contado menos sistema)",pe(x.monto-x.esperado)]));
 S.push({t:"Diferencias de caja (negativo = faltante)",filas:dc.length?dc.slice(0,25):[["Sin diferencias en el período",""]]});
 const cr={};B.filter(b=>b.estado!="anulada"&&b.estado!="por autorizar"&&en(b)).forEach(b=>{const k=b.rubro||"Sin rubro";cr[k]=(cr[k]||0)+b.monto});
 S.push({t:"Compras por rubro (boletas del período)",filas:Object.keys(cr).sort((a,b)=>cr[b]-cr[a]).map(k=>[k,pe(cr[k])]).concat([["Total comprado",pe(sum(Object.keys(cr),k=>cr[k])),1]])});
 const rn=rinde(d1,d2).filas.filter(f=>f.v&&f.c);if(rn.length)S.push({t:"Rinde por rubro (ventas - compras del período)",filas:rn.map(f=>[f.r+": vendió "+pe(f.v)+", compró "+pe(f.c),pe(f.dif)+" ("+(f.sc>0?"+":"")+f.sc.toFixed(1)+" %)"])});
 const Rm=MM.filter(x=>x.estado!="anulado"&&en(x));S.push({t:"Mermas, consumo interno y devoluciones",filas:CLA.map(c=>[c,pe(sum(Rm.filter(x=>x.clase==c)))])});
 const rx=resultado(d1,d2);S.push({t:"Resultado estimado del período (ventas - compras - gastos)",filas:rx.cols.map(c=>[c+": "+pe(rx.R.ventas[c])+" - "+pe(rx.R.compras[c])+" - "+pe(rx.R.gastos[c]),pe(rx.res[c])]).concat([["Resultado total",pe(sum(rx.cols,c=>rx.res[c])),1]])});
 const sa=saldos();S.push({t:"Dinero disponible hoy",filas:Object.keys(sa).map(k=>[k,pe(sa[k])]).concat([["Total",pe(sum(Object.values(sa),x=>x)),1]])});
 const dg={};B.filter(b=>b.estado=="pendiente"||b.estado=="en orden").forEach(b=>{dg[b.proveedor]=(dg[b.proveedor]||0)+b.monto});
 O.filter(o=>o.estado=="abierta").forEach(o=>{if(o.proveedor in dg)dg[o.proveedor]-=pagadoDe(o.id)+((o.bruto||o.total)-o.total)});
 const dk=Object.keys(dg).sort((a,b)=>dg[b]-dg[a]);
 S.push({t:"Lo que se debe a proveedores",filas:dk.slice(0,12).map(k=>[k,pe(dg[k])]).concat(dk.length>12?[["Otros "+(dk.length-12)+" proveedores",pe(sum(dk.slice(12),k=>dg[k]))]]:[],[["Total que se debe",pe(sum(dk,k=>dg[k])),1]])});
 const ch=P.filter(x=>x.medio=="Cheque"&&x.estado=="emitido"),cz=d=>sum(ch.filter(x=>daysTo(x.venc)<=d));
 S.push({t:"Cheques a cubrir",filas:[["En los próximos 7 días (incluye los ya vencidos)",pe(cz(7))],["En los próximos 15 días",pe(cz(15))],["En los próximos 30 días",pe(cz(30))],["Total emitido sin cobrar",pe(sum(ch)),1]]});
 const t1=new Date(d1+"T00:00:00").getTime(),t2=new Date(d2+"T23:59:59").getTime(),an=[P,B,I,E,T,NC,O].reduce((s,a)=>s+a.filter(x=>x.anuladoEl>=t1&&x.anuladoEl<=t2).length,0);
 const ab=O.filter(o=>o.estado=="abierta"),sf=O.filter(o=>o.estado=="cancelada"&&!o.firmado&&o.total>0),bv=B.filter(b=>b.vence&&(b.estado=="pendiente"||b.estado=="en orden")&&daysTo(b.vence)<0);
 S.push({t:"Para revisar",filas:[["Órdenes abiertas",ab.length+(ab.length?" - faltan "+pe(sum(ab,o=>faltaDe(o.id))):"")],["Órdenes pagadas sin comprobante firmado",String(sf.length)],["Boletas que esperan autorización",String(B.filter(b=>b.estado=="por autorizar").length)],["Pagos que esperan autorización",String(PE.length)],["Boletas vencidas sin pagar",bv.length+(bv.length?" - "+pe(sum(bv)):"")],["Anulaciones en el período",String(an)]]});
 return {d1:fmt(d1),d2:fmt(d2),hoy:fmt(today()),secciones:S}}
async function resumenPdf(){
 if(!dl)return say("Aquí no se pueden descargar archivos. Abre la app desde el navegador");
 if(!window.jspdf)return say("No se pudo preparar el PDF. Recarga la página y prueba de nuevo");
 const d1=keep.d1||addDays(today(),-7),d2=keep.d2||today(),blob=armarResumen(window.jspdf.jsPDF,resumenDatos(d1,d2)).output("blob");
 try{await dl.save({filename:"resumen_"+d1+"_a_"+d2+".pdf",data:blob});say("Resumen descargado ✔")}
 catch(e){if(e&&e.code!="declined")say("No se pudo descargar el resumen ("+((e&&e.code)||"error")+")")}}
async function comprobante(){
 const o=O.find(z=>z.id==cur);if(!o)return;
 if(!dl)return say("Aquí no se pueden descargar archivos. Abre la app desde el navegador");
 if(!window.jspdf)return say("No se pudo preparar el PDF. Recarga la página y prueba de nuevo");
 const blob=armarPdf(window.jspdf.jsPDF,o,B,P,today(),NC,fichaDe(o.proveedor)).output("blob");
 try{await dl.save({filename:"comprobante_"+o.id+"_"+o.proveedor.replace(/[^\w]+/g,"_").slice(0,40)+".pdf",data:blob});say("Comprobante descargado ✔")}
 catch(e){if(e&&e.code!="declined")say("No se pudo descargar el comprobante ("+((e&&e.code)||"error")+")")}}
/*FIN*/
function vOrden(o){
 const falta=faltaDe(o.id),md=keep.md||"Transferencia";
 const partes=P.filter(x=>x.orden==o.id).map(p=>`<div class="row ${p.estado=="anulado"?"an":""}">$ ${money(p.monto)} · ${esc(p.medio)}${p.cuenta?" · "+esc(p.cuenta):""}${p.medio=="Transferencia"&&p.ref?" · operación "+esc(p.ref):""}${p.banco?" · "+esc(p.banco)+" N° "+esc(p.ref):""}${p.venc?" · pago "+esc(p.venc):""}${p.pagador?" · pagó "+esc(p.pagador):""}${p.autorizadoPor?" · autorizó "+esc(p.autorizadoPor):""}${foto(p)}${p.estado!="anulado"?` <button class="lk" data-a="anular" data-id="${p.id}">Anular</button>`:""}${mot(p)}</div>`).join("")||'<p class="mu">Todavía no se pagó nada.</p>';
 const bols=o.boletas.map(i=>{const b=B.find(z=>z.id==i);return b?esc(b.sucursal)+" N° "+esc(b.nro)+" ($ "+money(b.monto)+")":""}).join(" · ");
 return `<div class="card"><h3>${esc(o.id)} · ${esc(o.proveedor)}</h3><p class="mu">Boletas: ${bols}${(o.notas||[]).length?"<br>Notas de crédito descontadas: "+o.notas.map(i=>{const n=NC.find(z=>z.id==i);return n?(n.nro?"N° "+esc(n.nro)+" ":"")+"($ "+money(n.monto)+")":""}).join(" · "):""}${(f=>f&&(f.cbu||f.retira||f.tel||f.dpp>0)?"<br>"+[f.cbu?"CBU o alias: "+esc(f.cbu):"",f.retira?"Retira: "+esc(f.retira):"",f.tel?"Tel.: "+esc(f.tel):"",f.dpp>0?"Descuento por pronto pago: "+f.dpp+" %":""].filter(Boolean).join(" · "):"")(fichaDe(o.proveedor))}</p>
<p>Total <b>$ ${money(o.total)}</b> · Pagado <b>$ ${money(pagadoDe(o.id))}</b> · ${falta>0.005?`<span class="b er">Falta $ ${money(falta)}</span>`:'<span class="b ok">Cancelada</span>'}</p>${partes}${pagadoDe(o.id)>0?`<p><button class="pri" data-a="comp">🖨 Descargar comprobante para firmar (PDF)</button></p>${falta>0.005?'<p class="mu">Todavía falta pagar: si lo descargas ahora sale como pago parcial.</p>':`<div class="fl">${esc(flash)}</div>`}${o.firmado?`<p class="fl">✔ Comprobante firmado y archivado${o.firmadoPor?" · lo marcó "+esc(o.firmadoPor):""}</p>`:`<p class="wn">Falta que el proveedor firme el comprobante.</p><p><button class="lk" data-a="fafirma" data-id="ordenes|${o.id}">Marcar como firmado y archivado</button></p>`}`:o.estado=="abierta"?`<p><button class="lk" data-a="oanular" data-id="${o.id}">Anular esta orden</button> <span class="mu">(las boletas vuelven a quedar pendientes)</span></p>`:""}<p><button class="lk" data-a="salir">← Volver</button></p></div>${vEspera(o.id)}
${falta>0.005&&o.estado=="abierta"?vSaldos()+vQuien()+`<div class="card"><h3>Agregar pago</h3>
<label>Fecha<input id="f" type="date" value="${today()}"></label>
<label>Medio de pago<select id="md">${opts(MED)}</select></label>${detalle(md,falta)}
<label>Nota<input id="n"></label><button class="pri" data-a="save">Guardar pago</button><div class="fl">${esc(flash)}</div></div>`:""}`}
function vEspera(ord){const L=PE.filter(x=>!ord||x.orden==ord);if(!L.length)return"";
 return `<div class="card"><h3>Pagos que esperan autorización (${L.length})</h3><p class="mu">Superan el límite de $ ${money(CFG.limite||0)} por pago. No descuentan saldo ni cancelan la orden hasta que un responsable los autorice.</p>${L.map(x=>`<div class="row"><b>${esc(x.proveedor)}</b> · ${esc(x.orden)} · $ ${money(x.monto)} · ${esc(x.medio)}${x.banco?" · "+esc(x.banco)+" N° "+esc(x.ref):""}${x.cuenta?" · "+esc(x.cuenta):""} · cargó ${esc(x.pagador||"")}${foto(x)} ${puede("autorizar")?`<button class="lk" data-a="paut" data-id="${x.id}">Autorizar</button><button class="lk" data-a="prech" data-id="${x.id}">Rechazar</button>`:'<span class="b wn">espera autorización</span>'}</div>`).join("")}</div>`}
async function autorizarPago(id){
 if(!puede("autorizar"))return;const x=PE.find(z=>z.id==id);if(!x)return;const o=O.find(z=>z.id==x.orden),falta=faltaDe(x.orden);
 if(!o||o.estado!="abierta")return say("La orden ya no está abierta: rechaza este pago");
 if(x.monto>falta+0.005)return say("El pago supera lo que falta en la orden ($ "+money(falta)+"): recházalo");
 const d={...x};delete d.id;d.autorizadoPor=miNombre();d.creado=Date.now();
 await col.add(d);await colPE.doc(id).delete();await log("Autorizó pago",x.proveedor+" $ "+money(x.monto)+" ("+x.orden+")");say(await trasPago(o,d,falta))}
async function subirFirmado(f){
 if(!assets)return say("Tu usuario no puede subir fotos: pide permiso de edición");
 const o=O.find(z=>z.id==cur);if(!o)return;firmando=true;render();
 try{const a=await assets.upload(await shrink(f));await colO.doc(o.id).update({firmado:a.id,firmadoPor:miNombre(),firmadoEl:Date.now()});await log("Subió comprobante firmado",o.proveedor+" "+o.id);firmando=false;say("Comprobante firmado guardado ✔")}
 catch(e){firmando=false;say("No se pudo subir la foto: "+((e&&(e.message||e.code))||"error"))}}
function vReg(){
 if(cur){const o=O.find(x=>x.id==cur);if(o)return vOrden(o);cur=""}
 const pv=provs().includes(keep.pv)?keep.pv:(provs()[0]||"");keep.pv=pv;
 const bs=B.filter(b=>b.estado=="pendiente"&&b.proveedor==pv),ncs=NC.filter(n=>n.estado=="disponible"&&key(n.proveedor)==key(pv)),tot=bs.filter(b=>sel[b.id]).reduce((s,b)=>s+b.monto,0)-ncs.filter(n=>nsel[n.id]).reduce((s,n)=>s+n.monto,0);
 const ab=O.filter(o=>o.estado=="abierta").map(o=>`<div class="row"><b>${esc(o.id)} · ${esc(o.proveedor)}</b><br>Total $ ${money(o.total)} · <span class="er">Falta $ ${money(faltaDe(o.id))}</span> <button class="lk" data-a="abrir" data-id="${o.id}">Seguir pagando</button></div>`).join("");
 const pgd=O.filter(o=>o.estado=="cancelada").slice(0,15).map(o=>`<div class="row"><b>${esc(o.id)} · ${esc(o.proveedor)}</b> · $ ${money(o.total)} ${o.firmado?'<span class="b ok">firmado</span>':'<span class="b wn">falta firma</span>'} <button class="lk" data-a="abrir" data-id="${o.id}">Ver y descargar comprobante</button></div>`).join("");
 return vQuien()+vEspera()+vSaldos()+`${ab?`<div class="card"><h3>Órdenes abiertas</h3>${ab}</div>`:""}<div class="card"><h3>Nueva orden de pago</h3><p class="mu">Orden N° <b>${nextOrden()}</b></p>
<label>Proveedor<select id="pv">${provs().length?opts(provs()):"<option>(no hay boletas pendientes)</option>"}</select></label>
${bs.map(b=>`<div class="row" data-a="tg" data-id="${b.id}">${sel[b.id]?"☑":"☐"} ${esc(b.sucursal)} · N° ${esc(b.nro)} · ${esc(b.fecha)} · <b>$ ${money(b.monto)}</b>${venB(b)}${obsB(b)?' <span class="b er">con faltantes: no se puede pagar</span>':""}</div>`).join("")}${ncs.length?'<p class="mu">Notas de crédito a favor (toca para descontarlas):</p>':""}${ncs.map(n=>`<div class="row" data-a="tn" data-id="${n.id}">${nsel[n.id]?"☑":"☐"} Nota de crédito${n.nro?" N° "+esc(n.nro):""} · ${fmt(n.fecha)} · <b>− $ ${money(n.monto)}</b></div>`).join("")}
<p>Total a pagar: <b>$ ${money(tot)}</b></p><button class="pri" data-a="nueva">Crear orden de pago</button><div class="fl">${esc(flash)}</div></div>${pgd?`<div class="card"><h3>Órdenes pagadas (últimas 15)</h3>${pgd}</div>`:""}`}
const finMes=m=>{const a=m.split("-").map(Number);return m+"-"+String(new Date(a[0],a[1],0).getDate()).padStart(2,"0")};
const mesSig=m=>{const a=m.split("-").map(Number);return a[1]==12?(a[0]+1)+"-01":a[0]+"-"+String(a[1]+1).padStart(2,"0")};
const ultCierre=()=>CM.slice().sort((a,b)=>a.mes.localeCompare(b.mes)).pop()||null;
const cerrado=f=>{const c=ultCierre();return !!f&&!!c&&f<=c.hasta};
const MC="Ese mes ya está cerrado: no se pueden cargar ni anular movimientos con esa fecha";
function saldos(al){
 const c=ultCierre(),h=c?c.hasta:"",S={Efectivo:0};CTAS.forEach(k=>S[k]=0);
 if(c)Object.keys(S).forEach(k=>S[k]=(c.saldos||{})[k]||0);
 const en=f=>String(f||"")>h&&(!al||f<=al);
 I.filter(x=>x.estado!="anulado"&&en(x.fecha)).forEach(x=>{const k=x.medio=="Efectivo"?"Efectivo":x.cuenta;if(k in S)S[k]+=x.monto});
 P.filter(x=>x.estado!="anulado").forEach(x=>{
  if(x.medio=="Efectivo"){if(en(x.fecha))S.Efectivo-=x.monto}
  else if(x.medio=="Transferencia"){if(en(x.fecha)&&x.cuenta in S)S[x.cuenta]-=x.monto}
  else if(x.medio=="Cheque"&&x.estado=="cobrado"&&!x.cobroEgreso&&x.banco in S&&en(x.cobradoFecha||x.venc||x.fecha))S[x.banco]-=x.monto});
 E.filter(x=>x.estado!="anulado"&&en(x.fecha)).forEach(x=>{if(x.fuente in S)S[x.fuente]-=x.monto});
 return S}
let DET={},clv=false,clvMsg="";
function vSaldos(){if(!puede("saldos"))return"";if(tab=="hoy")return vSaldosF();const t=Object.values(saldos()).reduce((a,b)=>a+b,0);return `<details class="dsal" id="dts" ${DET.dts?"open":""}><summary>Dinero disponible: <b>$ ${money(t)}</b> <span class="mu">· ver detalle</span></summary>${vSaldosF()}</details>`}
function vSaldosF(){
 if(!puede("saldos"))return"";
 const S=saldos(),t=Object.values(S).reduce((a,b)=>a+b,0),r=(n,v,b)=>`<div class="row" style="display:flex;justify-content:space-between"><span>${esc(n)}</span><${b?"b":"span"} class="${v<0?"er":""}">$ ${money(v)}</${b?"b":"span"}></div>`;
 const cm=P.filter(x=>x.medio=="Cheque"&&x.estado=="emitido").reduce((s,x)=>s+x.monto,0);
 return `<div class="card"><h3>Dinero disponible (caja unificada)</h3>${Object.keys(S).map(k=>r(k,S[k])).join("")}${r("TOTAL",t,1)}<p class="mu">Cheques emitidos todavía sin cobrar: $ ${money(cm)} · Tarjetas por acreditar: $ ${money(T.filter(t=>t.estado=="pendiente").reduce((s,t)=>s+t.monto,0))}</p></div>`}