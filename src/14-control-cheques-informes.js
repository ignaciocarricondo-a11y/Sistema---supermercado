function vCtl(){
 const S=saldos(),ks=Object.keys(S);
 const f=(k,i)=>{const id="rs"+i,v=parseFloat(keep[id]),d=isNaN(v)?null:Math.round((v-S[k])*100)/100;
  return `<label>${esc(k=="Efectivo"?"Efectivo contado (ambas cajas)":k+" · saldo real del banco")} — el sistema dice $ ${money(S[k])}<input id="${id}" type="number" step="0.01" inputmode="decimal"></label>${d==null?"":Math.abs(d)<0.01?'<p class="ok">✔ Coincide</p>':`<p class="er">Diferencia $ ${money(d)} ${d<0?"(el sistema tiene de más)":"(el sistema tiene de menos)"}</p>`}`};
 const h=K.slice(0,8).map(x=>{const bad=Object.keys(x.items).filter(k=>Math.abs(x.items[k].dif)>=0.01);return `<div class="row">${esc(x.fecha)} · ${bad.length?bad.map(k=>esc(k)+" $ "+money(x.items[k].dif)).join(" · "):"✔ todo coincide"}</div>`}).join("")||'<p class="mu">Todavía no hay controles.</p>';
 return `<div class="card"><h3>Control de saldo real</h3><p class="mu">Carga lo que dice cada banco y el efectivo contado. Si hay diferencia, falta cargar o corregir algún movimiento (ingreso, gasto, débito o acreditación).</p>${ks.map(f).join("")}<button class="pri" data-a="ksave">Guardar control</button><div class="fl">${esc(flash)}</div></div><div class="card"><h3>Controles anteriores</h3>${h}</div>`+vMes()+vAdmin()+`<div class="card"><h3>Usuarios y rangos</h3><p class="mu">Ahora tienen su propia pantalla.</p><button class="pri" data-t="usr">Ver usuarios</button></div>`+vCfg()+vHist()+vReset()}
async function ksave(){
 const S=saldos(),it={};
 Object.keys(S).forEach((k,i)=>{const v=parseFloat(keep["rs"+i]);if(!isNaN(v))it[k]={real:v,sistema:Math.round(S[k]*100)/100,dif:Math.round((v-S[k])*100)/100}});
 if(!Object.keys(it).length)return say("Carga al menos un saldo real");
 await colK.add({fecha:today(),items:it,por:uid,creado:Date.now()});Object.keys(S).forEach((k,i)=>delete keep["rs"+i]);await log("Guardó control de saldo real",Object.keys(it).filter(k=>Math.abs(it[k].dif)>=0.01).map(k=>k+" dif $ "+money(it[k].dif)).join(" · ")||"todo coincide");say("Control guardado ✔")}
async function backup(){
 if(!dl)return say("Tu navegador no permite descargas aquí");
 const q=v=>'"'+String(v==null?"":typeof v=="object"?JSON.stringify(v):v).replace(/"/g,'""')+'"',out=[];
 [["USUARIOS DE LA APP",AU.map(u=>({usuario:u.usuario,nombre:u.nombre,rango:u.rango,estado:u.estado,empleado:u.empleado}))],["PERSONAS",N],["USUARIOS",U],["AL DIA",AD],["NOTAS DE CREDITO",NC],["FICHAS DE PROVEEDORES",FP],["PAGOS EN ESPERA",PE],["MOVIMIENTOS ENTRE CUENTAS",MI],["VENTAS POR RUBRO",VR],["TRASLADOS",TR],["MOVIMIENTOS DE SOCIOS",SM],["CLIENTES A CUENTA",FI],["DATOS DE EMPLEADOS",EC],["NOVEDADES DE EMPLEADOS",NV],["MERMAS CONSUMO Y DEVOLUCIONES",MM],["ENVASES",EV],["CIERRES DE CAJA",CJ],["RETIROS DE CAJA",RC],["FALTANTES DESCONTADOS",DS],["GASTOS FIJOS",FJ],["CIERRES DE MES",CM],["RETIROS DE MERCADERIA",RT],["ADELANTOS",AV],["LIQUIDACIONES",LQ],["HISTORIAL",H],["BOLETAS",B],["ORDENES",O],["PAGOS",P],["INGRESOS",I],["TARJETAS",T],["GASTOS",E],["CONTROLES",K]].forEach(([n,a])=>{out.push(q(n));const ks=[...new Set(a.flatMap(x=>Object.keys(x)))];out.push(ks.map(q).join(";"));a.forEach(x=>out.push(ks.map(k=>q(x[k])).join(";")));out.push("")});
 await dl.save({filename:"respaldo_"+today()+".csv",data:"\ufeff"+out.join("\r\n")});
 try{const vj=RB.slice(2);await colRB.add({por:uid,nombre:miNombre(),creado:Date.now()});for(const x of vj)await colRB.doc(x.id).delete()}catch(e){}}
async function save(){
 const o=O.find(z=>z.id==cur);if(!o)return;
 const g=i=>(document.getElementById(i)||{value:""}).value.trim(),md=g("md"),monto=parseFloat(g("m")),falta=faltaDe(cur);
 if(!quien())return say("Elige quién hace el pago (arriba) antes de guardar");
 if(cerrado(g("f")))return say(MC);
 if(!(monto>0))return say("Falta el monto");
 const esp=PE.filter(x=>x.orden==cur).reduce((s,x)=>s+x.monto,0);
 if(monto>falta-esp+0.005)return say(esp?"Supera lo que falta, contando los pagos que esperan autorización ($ "+money(falta-esp)+")":"Supera lo que falta pagar ($ "+money(falta)+")");
 const S=saldos(),disp=md=="Efectivo"?S.Efectivo:md=="Transferencia"?S[g("ct")]:null;
 if(disp!=null&&monto>disp+0.005&&ovr!=cur+md+monto){ovr=cur+md+monto;return say(puede("saldos")?"⚠ Supera el saldo disponible ($ "+money(disp)+"). Toca Guardar otra vez para confirmar":"⚠ Supera el saldo disponible en el sistema. Toca Guardar otra vez para confirmar")}
 ovr="";
 const d={orden:cur,proveedor:o.proveedor,fecha:g("f"),sucursal:[...new Set(o.boletas.map(i=>(B.find(b=>b.id==i)||{}).sucursal))].filter(Boolean).join(" + "),monto,medio:md,nota:g("n"),estado:"pagado",conciliado:false,pagador:quien(),por:uid,creado:Date.now()};
 if(md=="Transferencia"){
  d.cuenta=g("ct");d.ref=g("r");if(!d.ref)return say("Escribe el número de operación de la transferencia");
  if(P.some(x=>x.estado!="anulado"&&x.medio=="Transferencia"&&x.cuenta==d.cuenta&&String(x.ref)==d.ref))return say("Ese número de operación ya está cargado en otro pago desde "+d.cuenta);
 }
 if(md=="Cheque"){
  Object.assign(d,{banco:g("bco")=="Otro"?g("bo"):g("bco"),tipo:g("tp"),ref:g("r"),emision:g("em"),venc:g("v"),estado:"emitido"});
  if(!d.banco||!d.ref||!d.emision||!d.venc)return say("Completa banco, número, fecha de emisión y fecha de pago");
 }
 const lim=()=>{["m","r","v","n","bo"].forEach(k=>delete keep[k]);photo=null};
 if(!puede("sinlimite")&&CFG.limite>0&&monto>CFG.limite){await colPE.add(d);await log("Cargó pago que espera autorización",o.proveedor+" $ "+money(monto)+" ("+cur+")");lim();return say("Supera el límite de $ "+money(CFG.limite)+": el pago quedó esperando autorización de un responsable")}
 await col.add(d);await log("Cargó pago",o.proveedor+" $ "+money(monto)+" · "+md+" ("+cur+")");lim();
 say(await trasPago(o,d,falta))}
async function cerrarOrden(o,fecha,pagador){
 await colO.doc(o.id).update({estado:"cancelada"});for(const i of o.boletas)await colB.doc(i).update({estado:"pagada"});
 const pl=key(o.proveedor),otras=B.some(b=>key(b.proveedor)==pl&&(b.estado=="pendiente"||b.estado=="en orden")&&!o.boletas.includes(b.id));
 if(otras)return "Orden cancelada por completo ✔ ("+o.proveedor+" todavía tiene otras boletas sin pagar)";
 const hf=[fecha].concat(o.boletas.map(i=>(B.find(b=>b.id==i)||{}).fecha||"")).sort().pop();
 await colA.add({proveedor:o.proveedor,hasta:hf,orden:o.id,por:uid,pagador:pagador||"",creado:Date.now()});
 return "Orden cancelada ✔ "+o.proveedor+" quedó al día hasta el "+fmt(hf)}
async function trasPago(o,d,falta){return falta-d.monto<=0.005?await cerrarOrden(o,d.fecha,d.pagador):"Guardado ✔ Todavía faltan $ "+money(falta-d.monto)}
async function bsave(){
 const g=i=>(document.getElementById(i)||{value:""}).value.trim(),monto=parseFloat(g("bm")),p=g("bp"),nro=g("bn");
 if(!p||!nro||!(monto>0))return say("Completa proveedor, número e importe");
 if(B.some(b=>b.estado!="anulada"&&b.proveedor.toLowerCase()==p.toLowerCase()&&String(b.nro)==nro))return say("Esa boleta ya está cargada");
 if(leyendo)return say("Espera a que termine de leer la foto");
 if(!(g("brb")||(fichaDe(p)||{}).rubro))return say("Elige a qué rubro corresponde la boleta (carne, verdura, fiambre, almacén…)");
 if(g("brc")=="Llegó con faltantes"&&!g("bro"))return say("Escribe qué faltó o llegó mal");
 const d={proveedor:p,sucursal:g("bs"),nro,fecha:g("bf"),monto,vence:g("bv")||((fichaDe(p)||{}).plazo>0?addDays(g("bf"),parseInt(fichaDe(p).plazo)):""),rubro:g("brb")||(fichaDe(p)||{}).rubro||"",recibio:miNombre(),recep:g("brc")=="Llegó con faltantes"?"faltantes":"completa",obs:g("bro"),tipoC:g("btc"),cuit:g("bcu")||(fichaDe(p)||{}).cuit||"",neto:parseFloat(g("bne"))||0,iva:parseFloat(g("biv"))||0,perc:parseFloat(g("bpe"))||0,estado:"pendiente",por:uid,creado:Date.now()};let sinFoto=false;
 const hh=hastaDe(p);
 if(hh&&d.fecha<=hh){
  if(puede("autorizar")){if(ovr!="b"+p+nro+d.fecha){ovr="b"+p+nro+d.fecha;return say("⚠ "+p+" quedó al día hasta el "+fmt(hh)+" y esta boleta es del "+fmt(d.fecha)+". Toca Guardar otra vez para autorizarla")}ovr="";d.autorizada=true}
  else d.estado="por autorizar"}
 if(bolSolo()){d.estado="por revisar";delete d.autorizada;ovr=""}
 if(bfoto){if(assets){try{d.foto=(await assets.upload(await shrink(bfoto))).id}catch(e){sinFoto=true}}else sinFoto=true}
 if(bitems.length&&ROL.fin){try{d.subas=await precios(p,bitems,d.fecha)}catch(e){}}
 if(d.rubro){const fr=fichaDe(p);try{if(!fr)await colFP.add({clave:key(p),nombre:p,rubro:d.rubro,por:uid,creado:Date.now()});else if(!fr.rubro)await colFP.doc(fr.id).update({rubro:d.rubro})}catch(e){}}
 if(d.cuit){const fc=fichaDe(p);try{if(!fc)await colFP.add({clave:key(p),nombre:p,cuit:d.cuit,por:uid,creado:Date.now()});else if(!fc.cuit)await colFP.doc(fc.id).update({cuit:d.cuit})}catch(e){}}
 await colB.add(d);await log(d.estado=="por autorizar"?"Cargó boleta que espera autorización":d.autorizada?"Cargó y autorizó boleta con fecha anterior":"Cargó boleta",p+" N° "+nro+" $ "+money(monto));
 ["bn","bm","bp","bv","bro","brc","brb","btc","bcu","bne","biv","bpe"].forEach(k=>delete keep[k]);bfoto=null;bitems=[];bmsg="";say((d.estado=="por revisar"?"Boleta guardada ✔ Queda pendiente hasta que la acepte Administración y pagos":d.estado=="por autorizar"?"Guardada, pero espera autorización de un responsable: "+p+" estaba al día hasta el "+fmt(hh):"Boleta guardada ✔")+(sinFoto?" (la foto no se pudo adjuntar)":""))}
async function nueva(){
 const ids=Object.keys(sel).filter(k=>sel[k]);if(!ids.length)return say("Elige al menos una boleta");
 const bs=ids.map(i=>B.find(b=>b.id==i)),pvn=bs[0].proveedor,bruto=bs.reduce((s,b)=>s+b.monto,0),nids=Object.keys(nsel).filter(k=>nsel[k]&&NC.some(n=>n.id==k&&n.estado=="disponible"&&key(n.proveedor)==key(pvn))),tnc=nids.reduce((s,i)=>s+NC.find(n=>n.id==i).monto,0),total=Math.max(0,Math.round((bruto-tnc)*100)/100);
 if(bruto-tnc<-0.005)return say("Las notas de crédito superan las boletas elegidas: desmarca alguna");
 let n=parseInt(nextOrden().slice(3)),id;
 for(let i=0;i<20;i++,n++){id="OP-"+String(n).padStart(5,"0");if(!(await colO.doc(id).get()).exists)break}
 await colO.doc(id).set({proveedor:pvn,boletas:ids,notas:nids,bruto,total,estado:"abierta",fecha:today(),armadaPor:quien(),por:uid,creado:Date.now()});
 for(const b of bs)await colB.doc(b.id).update({estado:"en orden",orden:id});
 for(const i of nids)await colNC.doc(i).update({estado:"aplicada",orden:id});
 await log("Armó orden de pago",pvn+" "+id+" $ "+money(total));
 sel={};nsel={};cur=id;
 if(total<=0.005)return say(await cerrarOrden({id,proveedor:pvn,boletas:ids},today(),quien()));
 render()}
async function anularPago(id,X){
 const x=P.find(p=>p.id==id);await col.doc(id).update({estado:"anulado",...(X||{})});if(x&&x.cobroEgreso)await colE.doc(x.cobroEgreso).update({estado:"anulado",...(X||{})});
 const o=x&&O.find(z=>z.id==x.orden);
 if(o&&o.estado=="cancelada"){await colO.doc(o.id).update({estado:"abierta"});for(const i of o.boletas)await colB.doc(i).update({estado:"en orden"});for(const c of AD.filter(c=>c.orden==o.id))await colA.doc(c.id).delete()}}
const ESTF={Pendientes:"emitido",Cobrados:"cobrado",Rechazados:"rechazado"};
function chqList(){const fe=keep.fe||"Pendientes";return P.filter(x=>x.medio=="Cheque"&&x.estado!="anulado"&&(fe=="Todos"||x.estado==ESTF[fe])).sort((a,b)=>(a.venc||"").localeCompare(b.venc||""))}
function vCal(){
 const S=saldos(),pend=P.filter(x=>x.medio=="Cheque"&&x.estado=="emitido"),nb=x=>x.banco||"(sin banco)",bs=[...new Set(pend.map(nb))].sort(),hz=[7,15,30],av=[];
 if(!pend.length)return '<div class="card"><h3>Calendario de lo que hay que cubrir</h3><p class="mu">No hay cheques emitidos pendientes de cobro.</p></div>';
 const su=(b,d)=>pend.filter(x=>nb(x)==b&&daysTo(x.venc)<=d).reduce((s,x)=>s+x.monto,0);
 const rows=bs.map(b=>{const sal=b in S?S[b]:null;return `<tr><td>${esc(b)}</td><td>${sal==null?"—":money(sal)}</td>${hz.map(d=>{const v=su(b,d),c=sal!=null&&v>sal+0.005;if(c&&!av.some(a=>a.b==b))av.push({b,d,f:v-sal});return `<td class="${c?"er":""}">${c?"<b>":""}${money(v)}${c?"</b>":""}</td>`}).join("")}</tr>`}).join("");
 const ven=pend.filter(x=>daysTo(x.venc)<0).length;
 return `<div class="card"><h3>Calendario de lo que hay que cubrir</h3><p class="mu">Cheques emitidos sin cobrar, por banco, contra el saldo que el sistema tiene hoy en esa cuenta. En rojo, lo que el saldo no alcanza a cubrir.</p>
<div class="sc"><table><tr><th>Banco</th><th>Saldo hoy</th><th>En 7 días</th><th>En 15 días</th><th>En 30 días</th></tr>${rows}<tr><td><b>TOTAL</b></td><td></td>${hz.map(d=>`<td><b>${money(pend.filter(x=>daysTo(x.venc)<=d).reduce((s,x)=>s+x.monto,0))}</b></td>`).join("")}</tr></table></div>
${av.map(a=>`<p class="er">⚠ ${esc(a.b)}: faltan $ ${money(a.f)} para cubrir los cheques de los próximos ${a.d} días.</p>`).join("")||'<p class="ok">✔ Los saldos alcanzan para los cheques de los próximos 30 días.</p>'}${av.length&&puede("ing")?'<p>Para cubrirlo, pasa plata desde otra cuenta o deposita efectivo: <button class="lk" data-t="ing">Mover plata entre cuentas</button></p>':""}${ven?`<p class="wn">${ven} cheque(s) con fecha de pago ya pasada siguen sin marcar como cobrados: están sumados en las tres columnas.</p>`:""}${bs.some(b=>!(b in S))?'<p class="mu">Los bancos con “—” no tienen cuenta cargada en el sistema, así que no se pueden comparar.</p>':""}</div>`}
function vChq(){
 const C=chqList(),pend=P.filter(x=>x.medio=="Cheque"&&x.estado=="emitido"),prox=pend.filter(x=>daysTo(x.venc)<=7).reduce((s,x)=>s+x.monto,0);
 const bd=x=>{const d=daysTo(x.venc);return x.estado=="cobrado"?'<span class="b ok">cobrado</span>':x.estado=="rechazado"?'<span class="b er">rechazado</span>':d<0?`<span class="b er">vencido ${-d} d</span>`:d<=7?`<span class="b wn">en ${d} d</span>`:`<span class="b ok">en ${d} d</span>`};
 return vCal()+`<div class="card"><h3>Planilla de cheques</h3><p class="mu">Pendientes: ${pend.length} por $ ${money(pend.reduce((s,x)=>s+x.monto,0))} · A pagar en 7 días o antes: <b>$ ${money(prox)}</b></p>
<label>Mostrar<select id="fe">${opts(["Pendientes","Cobrados","Rechazados","Todos"])}</select></label>
<div class="sc"><table class="ch"><tr><th>Orden</th><th>Banco</th><th>N° cheque</th><th>Tipo</th><th>Proveedor</th><th>Boletas de</th><th>Emisión</th><th>Fecha de pago</th><th>Importe</th><th>Estado</th><th>Pagó</th><th></th></tr>
${C.map(x=>`<tr><td>${esc(x.orden||"")}</td><td>${esc(x.banco||"")}</td><td>${esc(x.ref||"")}</td><td>${esc(x.tipo||"")}</td><td>${esc(x.proveedor)}</td><td>${esc(x.sucursal)}</td><td>${esc(x.emision||"")}</td><td>${esc(x.venc||"")}</td><td><b>${money(x.monto)}</b></td><td>${bd(x)}</td><td>${esc(x.pagador||"")}</td><td>${x.estado=="emitido"?`<button class="lk" data-a="cobrado" data-id="${x.id}">Cobrado</button><button class="lk" data-a="rechazado" data-id="${x.id}">Rechazado</button>`:""}</td></tr>`).join("")}</table></div>
${C.length?"":'<p class="mu">No hay cheques en esta vista.</p>'}<p><button class="pri" data-a="csv">Descargar planilla (Excel/CSV)</button></p><div class="fl">${esc(flash)}</div></div>`}
function compare(d1,d2){
 const rows=(keep.bk||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const t=l.match(/-?\$?\s?\d[\d.,]*/g);return{l,a:t?Math.abs(num(t[t.length-1])):NaN}}).filter(r=>r.a>0);
 const cand=P.filter(x=>x.medio!="Cheque"?(x.medio!="Efectivo"&&x.fecha>=d1&&x.fecha<=d2):(x.venc>=d1&&x.venc<=d2)).filter(x=>x.estado!="anulado"&&!x.conciliado&&x.medio!="Efectivo");
 const used=new Set();pairIds=[];
 rows.forEach(r=>{const c=cand.find(x=>!used.has(x.id)&&Math.abs(x.monto-r.a)<0.01);if(c){used.add(c.id);pairIds.push(c.id);r.ok=1}});
 const noNote=rows.filter(r=>!r.ok),miss=cand.filter(x=>!used.has(x.id));
 const li=a=>a.length?a.join(""):'<p class="mu">Ninguno ✔</p>';
 return `<div class="card"><h3>Resultado del cruce</h3><p>✅ Coinciden: <b>${pairIds.length}</b>${pairIds.length?` <button class="lk" data-a="conc">Marcar como conciliados</button>`:""}</p>
<p class="er"><b>Anotados que NO aparecen en el banco (${miss.length})</b></p>${li(miss.map(x=>`<div class="row">${esc(x.proveedor)} · ${esc(x.sucursal)} · ${esc(x.medio)} · $ ${money(x.monto)} · ${esc(x.medio=="Cheque"?x.venc:x.fecha)}</div>`))}
<p class="er"><b>En el banco y sin anotar (${noNote.length})</b></p>${li(noNote.map(r=>`<div class="row">${esc(r.l)}</div>`))}</div>`}
function vSem(){
 const d1=keep.d1||addDays(today(),-7),d2=keep.d2||today();
 const R=P.filter(x=>x.estado!="anulado"&&x.fecha>=d1&&x.fecha<=d2),T={},G={};
 const z=()=>({Transferencia:0,Cheque:0,Efectivo:0});
 R.forEach(x=>{T[x.sucursal]=T[x.sucursal]||z();T[x.sucursal][x.medio]+=x.monto});
 const row=(n,o)=>`<tr><td>${esc(n)}</td>${MED.map(m=>`<td>${money(o[m]||0)}</td>`).join("")}<td><b>${money(MED.reduce((s,m)=>s+(o[m]||0),0))}</b></td></tr>`;
 MED.forEach(m=>G[m]=Object.values(T).reduce((s,o)=>s+o[m],0));
 const g={};R.forEach(x=>{const k=(x.proveedor||"").toLowerCase()+"|"+x.monto+"|"+x.fecha;(g[k]=g[k]||[]).push(x)});
 const dup=Object.values(g).filter(a=>a.length>1);
 return `<div class="card"><h3>Resumen de la semana</h3>${(()=>{const T={};let tt=0;I.filter(x=>x.estado!="anulado"&&x.fecha>=(keep.d1||addDays(today(),-7))&&x.fecha<=(keep.d2||today())).forEach(x=>{T[x.sucursal]=(T[x.sucursal]||0)+x.monto;tt+=x.monto});return `<p>Ingresos del período: ${Object.keys(T).sort().map(k=>esc(k)+" $ "+money(T[k])).join(" · ")||"—"} · <b>Total $ ${money(tt)}</b></p>`})()}${(()=>{const r=I.filter(x=>x.estado!="anulado"&&x.fecha>=(keep.d1||addDays(today(),-7))&&x.fecha<=(keep.d2||today())),a=r.filter(x=>x.tipo=="acred"),br=a.reduce((s,x)=>s+x.bruto,0),ds=a.reduce((s,x)=>s+x.desc,0),df=r.filter(x=>x.esperado!=null&&x.medio=="Efectivo");return `<p>Descuentos de tarjetas: <b>$ ${money(ds)}</b>${br?" ("+(ds/br*100).toFixed(2)+" % de $ "+money(br)+")":""}</p>${df.map(x=>`<p class="${Math.abs(x.monto-x.esperado)<0.01?"mu":"er"}">Caja ${esc(x.sucursal)} ${esc(x.fecha)}: contado $ ${money(x.monto)} vs sistema $ ${money(x.esperado)} → dif $ ${money(x.monto-x.esperado)}</p>`).join("")}`})()}${(()=>{const ab=O.filter(o=>o.estado=="abierta");return `<p class="${ab.length?"wn":"mu"}">Órdenes abiertas: ${ab.length}${ab.length?" · faltan $ "+money(ab.reduce((s,o)=>s+faltaDe(o.id),0)):""}</p>`})()}
<label>Desde<input id="d1" type="date" value="${d1}"></label><label>Hasta<input id="d2" type="date" value="${d2}"></label>
<div class="sc"><table><tr><th>Boletas de</th><th>Transf.</th><th>Cheque</th><th>Efectivo</th><th>Total</th></tr>${Object.keys(T).sort().map(k=>row(k,T[k])).join("")}${row("TOTAL",G)}</table></div>
<p class="${dup.length?"er":"mu"}">${dup.length?"⚠ Posibles pagos duplicados: "+dup.map(a=>esc(a[0].proveedor)+" $ "+money(a[0].monto)+" ("+esc(a[0].fecha)+")").join(", "):"Sin posibles duplicados."}</p></div>
${(()=>{const G={};B.filter(b=>b.estado!="anulada"&&b.estado!="por autorizar"&&b.fecha>=d1&&b.fecha<=d2).forEach(b=>{const r=b.rubro||"Sin rubro";G[r]=G[r]||{};G[r][b.sucursal]=(G[r][b.sucursal]||0)+b.monto});const ks=Object.keys(G).sort(),t=k=>SUC.reduce((s,c)=>s+(G[k][c]||0),0);
return `<div class="card"><h3>Compras del período por rubro</h3>${ks.length?`<div class="sc"><table><tr><th>Rubro</th>${SUC.map(c=>`<th>${esc(c.replace("Sucursal ",""))}</th>`).join("")}<th>Total</th></tr>${ks.map(k=>`<tr><td>${esc(k)}</td>${SUC.map(c=>`<td>${money(G[k][c]||0)}</td>`).join("")}<td><b>${money(t(k))}</b></td></tr>`).join("")}<tr><td><b>TOTAL</b></td>${SUC.map(c=>`<td><b>${money(ks.reduce((s,k)=>s+(G[k][c]||0),0))}</b></td>`).join("")}<td><b>${money(ks.reduce((s,k)=>s+t(k),0))}</b></td></tr></table></div>`:'<p class="mu">Sin boletas en el período.</p>'}</div>`})()}
${vRinde()}${vRes()}${(()=>{const G={};cjNeed(d1,d2);CJ.filter(x=>x.estado!="anulado"&&x.fecha>=d1&&x.fecha<=d2).forEach(x=>{G[x.fecha]=G[x.fecha]||{};G[x.fecha][x.sucursal]=(G[x.fecha][x.sucursal]||0)+(x.ventas||0)});const ks=Object.keys(G).sort();
return ks.length?`<div class="card"><h3>Ventas por día (según los cierres de caja)</h3><div class="sc"><table><tr><th>Día</th>${SUC.map(c=>`<th>${esc(c.replace("Sucursal ",""))}</th>`).join("")}<th>Total</th></tr>${ks.map(k=>`<tr><td>${fmt(k)}</td>${SUC.map(c=>`<td>${money(G[k][c]||0)}</td>`).join("")}<td><b>${money(SUC.reduce((s,c)=>s+(G[k][c]||0),0))}</b></td></tr>`).join("")}</table></div></div>`:""})()}
<div class="card"><h3>Libro de compras para el contador</h3><p class="mu">Un archivo con todas las boletas del mes: fecha, tipo, número, proveedor, CUIT, neto, IVA, percepciones y total.</p><label>Mes<input id="lcm" type="month" value="${/^\d{4}-\d{2}$/.test(keep.lcm||"")?keep.lcm:today().slice(0,7)}"></label><button class="pri" data-a="libro">Descargar libro de compras (Excel/CSV)</button></div>
<div class="card"><h3>Cruce con el banco</h3><p class="mu">Pega los movimientos del extracto, una línea por movimiento y con el monto al final.</p>
<textarea id="bk" rows="6" placeholder="12/10/2026 Transferencia Proveedor SA 150000"></textarea><br><button class="pri" data-a="cmp">Comparar</button></div>
${cmp?compare(d1,d2):""}<div class="card"><p class="${O.some(o=>o.estado=="cancelada"&&!o.firmado&&o.total>0)?"wn":"mu"}">Órdenes pagadas sin comprobante firmado: ${O.filter(o=>o.estado=="cancelada"&&!o.firmado&&o.total>0).length}</p><button class="pri" data-a="rsem">Descargar resumen del período (PDF)</button></div><div class="card"><button class="pri" data-a="bkp">Descargar respaldo de todo (Excel/CSV)</button><div class="fl">${esc(flash)}</div></div>`}