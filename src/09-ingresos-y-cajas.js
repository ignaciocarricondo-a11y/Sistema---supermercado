function vIng(){
 const ct=CTAS.filter(c=>T.some(t=>t.estado=="pendiente"&&t.cuenta==c)),ac=ct.includes(keep.ac)?keep.ac:(ct[0]||"");keep.ac=ac;
 const pt=T.filter(t=>t.estado=="pendiente"&&t.cuenta==ac).sort((a,b)=>a.fecha.localeCompare(b.fecha)),sb=pt.filter(t=>acSel[t.id]).reduce((s,t)=>s+t.monto,0);
 const ph=pt.map(t=>{const d=-daysTo(t.fecha);return `<div class="row" data-a="tj" data-id="${t.id}">${acSel[t.id]?"☑":"☐"} ${esc(t.fecha)} · ${esc(t.sucursal)} · <b>$ ${money(t.monto)}</b>${d>3?` <span class="b er">hace ${d} d</span>`:""} <button class="lk" data-a="tanular" data-id="${t.id}">Anular</button></div>`}).join("");
 const rec=I.slice(0,20).map(x=>`<div class="row ${x.estado=="anulado"?"an":""}">${esc(x.fecha)} · ${esc(x.sucursal)} · ${esc(x.medio=="Efectivo"?"Efectivo":x.cuenta)} · <b>$ ${money(x.monto)}</b>${x.tipo=="acred"?` · descuento $ ${money(x.desc)}`:""}${x.esperado!=null?` · sistema de ventas $ ${money(x.esperado)} · dif $ ${money(x.monto-x.esperado)}`:""}${x.caja?" · "+esc(x.caja)+" · "+esc(x.turno||"")+" · "+esc(x.cajero||""):""}${x.estado!="anulado"&&!x.cierre&&x.origen!="retcaja"?` <button class="lk" data-a="ianular" data-id="${x.id}">Anular</button>`:""}${mot(x)}</div>`).join("")||'<p class="mu">Todavía no hay ingresos.</p>';
 const fld=(id,t)=>`<label>${t}<input id="${id}" type="number" step="0.01" inputmode="decimal"></label>`;
 return vSaldos()+`<div class="card"><h3>Tarjetas por acreditar</h3>${ct.length?`<label>Cuenta donde se acredita<select id="ac">${opts(ct)}</select></label>${ph}<p>Marcadas: <b>$ ${money(sb)}</b></p><label>Fecha de acreditación<input id="af" type="date" value="${today()}"></label>${fld("an","Lo que realmente entró al banco (suma de los depósitos)")}<button class="pri" data-a="acred">Registrar acreditación</button>`:'<p class="mu">No hay tarjetas pendientes.</p>'}<div class="fl">${esc(flash)}</div></div>
${(()=>{const d0=addDays(today(),-60),G={};I.filter(x=>x.estado!="anulado"&&x.tipo=="acred"&&x.fecha>=d0).forEach(x=>{const g=G[x.cuenta]=G[x.cuenta]||{b:0,d:0,n:0};g.b+=x.bruto||0;g.d+=x.desc||0;g.n++});const ks=Object.keys(G).sort();
return ks.length?`<div class="card"><h3>Lo que descuentan las tarjetas, por cuenta (últimos 60 días)</h3><div class="sc"><table><tr><th>Cuenta (posnet)</th><th>Vendido</th><th>Descuento</th><th>%</th><th>Acreditaciones</th></tr>${ks.map(k=>`<tr><td>${esc(k)}</td><td>${money(G[k].b)}</td><td>${money(G[k].d)}</td><td><b>${G[k].b?(G[k].d/G[k].b*100).toFixed(2):"0,00"} %</b></td><td>${G[k].n}</td></tr>`).join("")}</table></div></div>`:""})()}
${vMov()}<div class="card"><h3>Saldo inicial o ajuste</h3><p class="mu">Para cargar con cuánta plata se arranca o corregir una diferencia (acepta montos negativos). Los cierres de caja se cargan en la pestaña Cajas.</p>
<label>Fecha<input id="if" type="date" value="${today()}"></label>${fld("ie","Efectivo")}${CTAS.map((c,i)=>fld("ic"+i,c)).join("")}
<button class="pri" data-a="isave">Guardar ajuste</button><div class="fl">${esc(flash)}</div></div><div class="card"><h3>Últimos ingresos</h3>${rec}</div>`}
let CAJAS=["Caja 1","Caja 2","Caja 3","Caja 4","Caja 5","Caja 6","Caja 7","Caja 8"],TURNOS=["Mañana","Tarde","Noche","Día completo"],DEST=["Queda en la caja central","Depósito en el banco","Para pagar a un proveedor","Para un gasto"];
const retTurno=(f,sc,ca,tu)=>r2(RC.filter(x=>x.estado!="anulado"&&x.fecha==f&&x.sucursal==sc&&x.caja==ca&&x.turno==tu).reduce((s,x)=>s+x.monto,0));
const cierreDe=(f,sc,ca,tu)=>CJ.find(x=>x.estado!="anulado"&&x.fecha==f&&x.sucursal==sc&&x.caja==ca&&x.turno==tu);
const difTx=x=>x.dif==null?'<span class="b">sin dato del sistema</span>':Math.abs(x.dif)<0.01?'<span class="b ok">cierra justa</span>':`<span class="b ${Math.abs(x.dif)>=UMB?"er":"wn"}">${x.dif<0?"faltan":"sobran"} $ ${money(Math.abs(x.dif))}${Math.abs(x.dif)>=UMB?"":" · solo aviso"}</span>`;
const ctaMP=()=>CTAS.find(c=>/mercado/i.test(c))||CTAS[0],ctaClover=()=>CTAS.find(c=>/naci/i.test(c))||CTAS[Math.min(1,CTAS.length-1)],ctaTr=()=>CTAS.find(c=>!/mercado/i.test(c))||CTAS[0];
async function diMov(tipo,delta,o){await colDI.add({tipo,monto:r2(delta),estado:"ok",por:uid,nombre:miNombre(),creado:Date.now(),...o});await colCfg.doc("diarco").set({saldo:firebase.firestore.FieldValue.increment(r2(delta))},{merge:true})}
async function dicanje(){if(!cajAdm())return;const gv=i=>(document.getElementById(i)||{value:""}).value.trim(),m=parseFloat(gv("dim")),f=gv("dif")||today();if(!(m>0))return say("Falta el importe canjeado");
 if(m>r2(DIA.saldo||0)+0.005)return say("No se puede: el crédito disponible en Diarco es $ "+money(DIA.saldo||0));
 await diMov("canje",-m,{fecha:f,detalle:gv("dix")});["dim","dix"].forEach(k=>delete keep[k]);await log("Canjeó crédito de Diarco","$ "+money(m));say("Canje guardado ✔ Quedan $ "+money(r2((DIA.saldo||0)-m))+" de crédito")}
function vDiarco(){const L=DI.slice(0,15).map(x=>`<div class="row">${fmt(x.fecha)} · ${x.tipo=="canje"?"Canje por mercadería":x.tipo=="anulacion"?"Cierre anulado":"Posnet Diarco"} · <b class="${x.monto<0?"er":""}">${x.monto<0?"− ":"+ "}$ ${money(Math.abs(x.monto))}</b><br><span class="mu">${esc([x.sucursal,x.caja,x.turno,x.cajero,x.detalle].filter(Boolean).join(" · "))}${x.nombre?" · cargó "+esc(x.nombre):""}</span></div>`).join("")||'<p class="mu">Todavía no hay movimientos.</p>';
 return `<div class="card"><h3>Crédito en Diarco</h3><p class="mu">Lo que se cobra con el posnet a nombre de Diarco no entra a la caja ni a los bancos: se junta acá como crédito para canjear por mercadería.</p><p style="font-size:17px">Crédito disponible: <b>$ ${money(DIA.saldo||0)}</b></p>
<label>Fecha del canje<input id="dif" type="date" value="${today()}"></label><label>Importe canjeado por mercadería<input id="dim" type="number" step="0.01" inputmode="decimal"></label><label>Detalle (boleta, qué se trajo)<input id="dix"></label><button class="pri" data-a="dicanje">Guardar canje</button>
<h3 style="margin-top:14px">Últimos movimientos</h3>${L}</div>`}
const tkDe=(f,sc,ca,tu)=>RT.filter(x=>x.origen=="caja"&&x.estado!="anulado"&&x.fecha==f&&x.sucursal==sc&&x.caja==ca&&x.turno==tu),tkTurno=(f,sc,ca,tu)=>r2(tkDe(f,sc,ca,tu).reduce((s,x)=>s+x.monto,0));
async function tkcaja(){const gv=i=>(document.getElementById(i)||{value:""}).value.trim(),{f,sc,ca,tu,cj}=turnoSel(),m=parseFloat(gv("tkm")),e0=gv("tke"),L=[...new Set(noms().concat(emps()))],e=L.find(x=>key(x)==key(e0))||(cajAdm()?empNom(e0):"");
 if(!e0||!(m>0))return say("Falta el empleado o el importe del ticket");if(!e)return say("Ese empleado no está en la lista: elige uno de los que aparecen o pide a administración que lo cargue");
 if(!f)return say("Falta la fecha");if(cerrado(f))return say(MC);if(cierreDe(f,sc,ca,tu))return say("Esa caja y turno ya tienen cierre: anula el cierre para agregar tickets");
 if(liqDe(e,mesDe(f)))return say("Ese mes ya está liquidado para "+e+": avisa a administración");
 const hoyN=RT.filter(x=>x.estado!="anulado"&&x.fecha==f&&key(x.empleado)==key(e)).length;if(hoyN>=TKMAX&&!esDueno)return say("No se puede: "+e+" ya tiene "+hoyN+" tickets cargados el "+fmt(f)+". El máximo es "+TKMAX+" por día; solo un dueño puede cargar otro");
 const tp=cfgDe(e).tope;if(tp>0){const ya=cuentaMes(e,mesDe(f)).merc;if(ya+m>tp+0.005&&!puede("autorizar"))return say("Supera el tope mensual de "+e+" ($ "+money(tp)+"; ya lleva $ "+money(ya)+"). Tiene que autorizarlo un responsable")}
 const n=gv("tkn");await colRT.add({empleado:e,fecha:f,monto:r2(m),detalle:"Ticket en caja"+(n?" N° "+n:""),estado:"ok",por:uid,cargo:miNombre(),creado:Date.now(),origen:"caja",sucursal:sc,caja:ca,turno:tu,cajero:cj});
 ["tke","tkm","tkn"].forEach(k=>delete keep[k]);await log("Cargó ticket de empleado en caja",e+" $ "+money(m)+" · "+sc+" · "+ca+" · "+tu);say("Ticket de "+e+" guardado ✔ $ "+money(m))}
let UMB=3000,TKMAX=2;const exced=x=>r2(Math.max(0,Math.abs(x.dif||0)-UMB));
async function cjcarg(id){const x=CJ.find(z=>z.id==id);if(!x||!cajAdm()||x.cargado)return;await colCJ.doc(id).update({cargado:true,cargadoPor:miNombre(),cargadoEl:Date.now()});await log(x.dif<0?"Marcó faltante de caja como cargado al cajero":"Marcó sobrante de caja como revisado",x.sucursal+" · "+x.caja+" · "+x.turno+" · "+x.cajero+" · "+fmt(x.fecha)+(x.dif<0?" · $ "+money(exced(x)):""));say(x.dif<0?"Marcado ✔ La alerta se cierra":"Revisado ✔")}
const DEN=[20000,10000,2000,1000,500,200,100,50,20,10];let cjSel="";
const cajAdm=()=>esDueno||puede("cajctl")||puede("ing");
const billTot=()=>r2(DEN.reduce((s,d,i)=>s+d*(Math.max(0,parseInt(keep["bq"+i])||0)),0)+(Math.max(0,parseFloat(keep.bmon))||0));
function billShow(){const e=document.getElementById("btot");if(e)e.textContent="$ "+money(billTot());DEN.forEach((d,i)=>{const z=document.getElementById("bs"+i);if(z){const n=Math.max(0,parseInt(keep["bq"+i])||0);z.textContent=n?"$ "+money(n*d):""}})}
const billTx=x=>x.billetes?DEN.filter(d=>x.billetes[d]).map(d=>x.billetes[d]+" × $ "+d.toLocaleString("es-AR")).concat(x.monedas?["monedas $ "+money(x.monedas)]:[]).join(" · "):"";
const sumO=o=>r2(Object.values(o||{}).reduce((a,b)=>a+b,0));
const difM=(t,v)=>v==null||Math.abs(v)<0.01?"":` <span class="b ${v<0?"er":"wn"}">${t}: ${v<0?"faltan":"sobran"} $ ${money(Math.abs(v))}</span>`;
function rowCJ(x,adm){const an=x.estado=="anulado",pend=x.control=="pendiente",mio=x.por==uid,tr=sumO(x.transf),tj=sumO(x.tarj);
 return `<div class="row ${an?"an":""}"><b>${esc(x.sucursal)} · ${esc(x.caja)} · ${esc(x.turno)}</b> · ${esc(x.cajero)} · ${fmt(x.fecha)}<br>Efectivo contado <b>$ ${money(x.contado)}</b>${x.retiros?` · retiros del turno $ ${money(x.retiros)}`:""}${x.ctacte?` · tickets de empleados $ ${money(x.ctacte)}`:""}${billTx(x)?`<br><span class="mu">${esc(billTx(x))}</span>`:""}
${Object.keys(x.transf||{}).map(c=>`<br>${/mercado/i.test(c)?"Mercado Pago (QR y posnet)":"Transferencias en "+esc(c)}: $ ${money(x.transf[c])}`).join("")}${Object.keys(x.tarj||{}).map(c=>`<br>Posnet Clover (acredita en ${esc(c)}): $ ${money(x.tarj[c])}`).join("")}${x.diarco>0?`<br>Posnet Diarco (crédito para mercadería): $ ${money(x.diarco)}`:""}
<br>${an?"":pend?'<span class="b wn">falta corroborar con el sistema</span>':`${x.declarado!=null?`Declaró $ ${money(x.declarado)} · sistema $ ${money(x.ventas||0)} · `:x.esperado?`Sistema: efectivo $ ${money(x.esperado)} · `:""}Desfasaje: ${difTx(x)}${difM("efectivo",x.difEf)}${difM("Mercado Pago y transferencias",x.difTr)}${difM("tarjetas",x.difTj)}${difM("Diarco",x.difDi)}${x.controlPor?` <span class="mu">· corroboró ${esc(x.controlPor)}</span>`:""}`}
${an?"":(adm&&pend?` <button class="lk" data-a="cjsel" data-id="${x.id}">${cjSel==x.id?"Cerrar":"Corroborar"}</button>`:"")+(adm&&!pend&&Math.abs(x.dif||0)>=UMB?(x.cargado?` <span class="b ok">${x.dif<0?"cargado al cajero":"revisado"} · ${esc(x.cargadoPor||"")}</span>`:(x.dif<0?`<br><b class="er">Corresponde cargarle al cajero $ ${money(exced(x))}</b> <span class="mu">(lo que pasa de $ ${money(UMB)}). Hagan el ticket a su nombre y, cuando esté cargado en su cuenta, márquenlo:</span>`:"")+` <button class="lk" data-a="cjcarg" data-id="${x.id}">${x.dif<0?"Ya se lo cargué al cajero":"Marcar como revisado"}</button>`):"")+(adm?` <button class="lk" data-a="cjanular" data-id="${x.id}">Anular</button>`:pend&&mio?' <span class="mu">· Si hay un error, pide a administración que lo anule.</span>':"")}${mot(x)}
${adm&&pend&&cjSel==x.id&&!an?`<div style="margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:10px"><p class="mu" style="margin-top:0">Pon solo el total de venta que computó el sistema para esta caja. La app lo compara con la suma de todo lo que cargó el cajero y avisa: en amarillo si es menor a $ ${money(UMB)} (no se descuenta) y en rojo si lo supera. Los retiros del turno y los tickets que se llevaron empleados cuentan a favor de la caja.</p>
<div class="tlist" style="margin-top:0"><div class="tlh">Lo que declaró el cajero</div>${[["Efectivo contado",x.contado],["Retiros de efectivo del turno",x.retiros],["Tickets de empleados a cuenta",x.ctacte],["Mercado Pago y transferencias",tr],["Tarjetas (Clover)",tj],["Posnet Diarco",x.diarco]].filter(q=>q[1]>0).map(q=>`<div class="trow"><span class="tn" style="font-weight:400">${q[0]}</span><span class="tq">$ ${money(q[1])}</span></div>`).join("")}<div class="trow"><span class="tn">TOTAL declarado</span><span class="tq"><b style="font-size:17px">$ ${money(cjDecl(x))}</b></span></div></div>
<label>Total de venta de esta caja según el sistema<input id="kv" type="number" step="0.01" inputmode="decimal" placeholder="Solo este número"></label>
<button class="pri" data-a="cjok" data-id="${x.id}">Guardar control de esta caja</button></div>`:""}</div>`}
const cjDecl=x=>r2((x.contado||0)+(x.retiros||0)+(x.ctacte||0)+sumO(x.transf)+sumO(x.tarj)+(x.diarco||0));
async function cjok(id){const x=CJ.find(z=>z.id==id);if(!x||!cajAdm()||x.estado=="anulado")return;if(cerrado(x.fecha))return say(MC);
 const raw=String(keep.kv==null?"":keep.kv).trim(),vt=parseFloat(raw);if(raw===""||isNaN(vt)||vt<0)return say("Falta el total de venta de esa caja según el sistema");
 const decl=cjDecl(x),dif=r2(decl-vt);
 await colCJ.doc(id).update({ventas:r2(vt),ventasEst:false,declarado:decl,dif,difEf:null,difTr:null,difTj:null,difDi:null,esperado:null,control:"ok",controlPor:miNombre(),controlEl:Date.now()});
 delete keep.kv;cjSel="";const res=Math.abs(dif)<0.01?"la caja cierra justa":(dif<0?"faltan $ "+money(-dif):"sobran $ "+money(dif))+(Math.abs(dif)>=UMB?" (supera los $ "+money(UMB)+")":" (menos de $ "+money(UMB)+": solo aviso)");
 await log("Corroboró cierre de caja",x.sucursal+" · "+x.caja+" · "+x.turno+" · "+x.cajero+" · "+res);say("Control guardado ✔ "+res.charAt(0).toUpperCase()+res.slice(1))}
function turnoSel(){const gv=i=>(document.getElementById(i)||{value:""}).value.trim();return{f:gv("if"),sc:gv("is"),ca:gv("ica"),tu:gv("itu"),cj:empNom(gv("icj")||quien())}}
async function isave(){
 const gv=i=>(document.getElementById(i)||{value:""}).value.trim(),g=i=>parseFloat(gv(i))||0,f=gv("if"),aj=tab=="ing";
 if(!f)return say("Falta la fecha");if(cerrado(f))return say(MC);
 if(aj){const items=[["Efectivo","",g("ie")]].concat(CTAS.map((c,i)=>["Transferencia",c,g("ic"+i)])).filter(a=>a[2]);
  if(!items.length)return say("Carga al menos un monto");
  for(const [m,c,v] of items)await colI.add({fecha:f,sucursal:"Saldo inicial / ajuste",medio:m,cuenta:c,monto:v,estado:"ok",por:uid,creado:Date.now()});
  Object.keys(keep).filter(k=>k=="ie"||/^ic\d+$/.test(k)).forEach(k=>delete keep[k]);await log("Cargó saldo inicial o ajuste",fmt(f));return say("Ajuste guardado ✔")}
 const {sc,ca,tu,cj}=turnoSel(),ef=billTot(),ex=0,vt=0,bil={};DEN.forEach((d,i)=>{const n=Math.max(0,parseInt(keep["bq"+i])||0);if(n)bil[d]=n});const mon=Math.max(0,parseFloat(keep.bmon))||0;
 if(!cj)return say("Falta el nombre del cajero");
 const o1={},o2={},vm=g("imp"),vr=g("itr"),vc=g("icl"),ct=CTAS.includes(gv("itc"))?gv("itc"):ctaTr();if(vm>0)o1[ctaMP()]=r2(vm);if(vr>0)o1[ct]=r2((o1[ct]||0)+vr);if(vc>0)o2[ctaClover()]=r2(vc);const vd=r2(g("idi"));
 const tr=Object.entries(o1),tj=Object.entries(o2),st=a=>a.reduce((s,x)=>s+x[1],0);
 if(!(ef>0)&&!tr.length&&!tj.length&&!(vd>0))return say("Carga al menos un monto: los billetes contados o lo cobrado por otros medios");
 if(cierreDe(f,sc,ca,tu))return say("Ya hay un cierre de "+ca+" · "+tu+" en "+sc+" para esa fecha. Anúlalo si quieres corregirlo");
 const ret=retTurno(f,sc,ca,tu),dif=ex>0?r2(ef+ret-ex):null,cid="c"+Date.now().toString(36),base={fecha:f,sucursal:sc,caja:ca,turno:tu,cajero:cj,cierre:cid,estado:"ok",por:uid,creado:Date.now()};
 if(ef>0)await colI.add({...base,medio:"Efectivo",cuenta:"",monto:ef});
 for(const [c,v] of tr)await colI.add({...base,medio:"Transferencia",cuenta:c,monto:v});
 for(const [c,v] of tj)await colT.add({...base,cuenta:c,monto:v,estado:"pendiente"});
  await colCJ.doc(cid).set({...base,contado:ef,esperado:ex,retiros:ret,dif,ventas:vt>0?vt:r2((ex>0?ex:ef+ret)+st(tr)+st(tj)+vd),diarco:vd,ctacte:tkTurno(f,sc,ca,tu),ventasEst:!(vt>0),transf:o1,tarj:o2,cargo:miNombre(),billetes:bil,monedas:mon,control:"pendiente"});
 Object.keys(keep).filter(k=>["bmon","imp","itr","icl","idi"].includes(k)||/^bq\d+$/.test(k)).forEach(k=>delete keep[k]);if(vd>0)await diMov("posnet",vd,{fecha:f,sucursal:sc,caja:ca,turno:tu,cajero:cj,cierre:cid});try{localStorage.setItem("cpCaja",JSON.stringify({is:sc,ica:ca,itu:tu}))}catch(e){}
 await log("Cargó cierre de caja",sc+" · "+ca+" · "+tu+" · "+cj+(dif==null||Math.abs(dif)<0.01?"":dif<0?" · faltan $ "+money(-dif):" · sobran $ "+money(dif)));
 ACT.caj="Cierres del";say("Cierre guardado ✔ Efectivo $ "+money(ef)+". Administración lo corrobora con el sistema"+(dif==null?"":Math.abs(dif)<0.01?" La caja cierra justa":dif<0?" Faltan $ "+money(-dif):" Sobran $ "+money(dif)))}
async function rcsave(){
 const gv=i=>(document.getElementById(i)||{value:""}).value.trim(),{f,sc,ca,tu,cj}=turnoSel(),m=parseFloat(gv("rcm")),de=gv("rcd")||DEST[0],dep=de==DEST[1],cta=dep?gv("rcb"):"";
 if(!f||!(m>0))return say("Falta el monto del retiro");if(!cj)return say("Falta el nombre del cajero");if(cerrado(f))return say(MC);
 if(cierreDe(f,sc,ca,tu))return say("Esa caja y turno ya tienen cierre: anula el cierre para agregar retiros");
 const base={fecha:f,sucursal:sc,caja:ca,turno:tu,cajero:cj,monto:r2(m),estado:"ok",por:uid,creado:Date.now()};
 const ing=(await colI.add({...base,medio:dep?"Transferencia":"Efectivo",cuenta:cta,tipo:"retcaja",origen:"retcaja"})).id;
 await colRC.add({...base,destino:de,cuenta:cta,detalle:gv("rcx"),retiro:miNombre(),hora:new Date().toTimeString().slice(0,5),ingreso:ing});
 ["rcm","rcx"].forEach(k=>delete keep[k]);await log("Retiró efectivo de caja",sc+" · "+ca+" · $ "+money(m)+" · "+de);
 say("Retiro guardado ✔"+(de==DEST[2]?" Acuérdate de cargar el pago en Pagar":de==DEST[3]?" Acuérdate de cargar el gasto en Gastos":""))}
async function dfalt(id){
 const x=CJ.find(z=>z.id==id);if(!x||!(x.dif<=-UMB)||!puede("emp"))return;const e=empNom(x.cajero);
 if(DS.some(d=>d.cierre==id&&d.estado!="anulado"))return say("Ese faltante ya se pasó a la liquidación");
 if(liqDe(e,mesDe(x.fecha)))return say("Ese mes ya está liquidado para "+e+": anula la liquidación para sumar el faltante");
 await colDS.add({empleado:e,fecha:x.fecha,monto:r2(-x.dif),motivo:"Faltante de caja · "+x.sucursal+" · "+x.caja+" · "+x.turno,cierre:id,estado:"ok",por:uid,creado:Date.now()});
 await log("Pasó faltante de caja a la liquidación",e+" $ "+money(-x.dif));say("Faltante de $ "+money(-x.dif)+" sumado a la liquidación de "+e+" ✔")}
function vCaj(){
 const adm=cajAdm(),f=keep.if||today(),sc=keep.is||SUC[0],ca=keep.ica||CAJAS[0],tu=keep.itu||TURNOS[0],ret=retTurno(f,sc,ca,tu),tks=tkDe(f,sc,ca,tu),tkt=r2(tks.reduce((s,x)=>s+x.monto,0)),ya=cierreDe(f,sc,ca,tu),de=keep.rcd||DEST[0],m=/^\d{4}-\d{2}$/.test(keep.cjm||"")?keep.cjm:today().slice(0,7);
 const fld=(id,t)=>`<label>${t}<input id="${id}" type="number" step="0.01" inputmode="decimal"></label>`;
 const dlc=`<datalist id="dlc">${[...new Set(emps().concat(noms(),CJ.map(x=>x.cajero)))].filter(Boolean).map(n=>`<option value="${esc(n)}">`).join("")}</datalist>`;
 const lc=CJ.filter(x=>x.fecha==f&&(adm||x.por==uid)).map(x=>rowCJ(x,adm)).join("")||'<p class="mu">Todavía no hay cierres en esa fecha.</p>',pen=adm?CJ.filter(x=>x.estado!="anulado"&&x.control=="pendiente"&&x.fecha!=f).sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha))):[];
 const lr=RC.filter(x=>x.fecha==f&&(adm||x.por==uid)).map(x=>`<div class="row ${x.estado=="anulado"?"an":""}">${esc(x.hora||"")} · ${esc(x.sucursal)} · ${esc(x.caja)} · ${esc(x.turno)} · ${esc(x.cajero)} · <b>$ ${money(x.monto)}</b><br><span class="mu">${esc(x.destino)}${x.cuenta?" "+esc(x.cuenta):""} · retiró ${esc(x.retiro||"")} ${esc(x.detalle||"")}</span>${x.estado!="anulado"?` <button class="lk" data-a="rcanular" data-id="${x.id}">Anular</button>`:""}${mot(x)}</div>`).join("")||'<p class="mu">Sin retiros en esa fecha.</p>';
 const G={};CJ.filter(x=>x.estado!="anulado"&&mesDe(x.fecha)==m&&x.dif!=null).forEach(x=>{const g=G[x.cajero]=G[x.cajero]||{n:0,fa:0,so:0};g.n++;if(x.dif<0)g.fa+=-x.dif;else g.so+=x.dif});
 const tm=Object.keys(G).sort((a,b)=>G[b].fa-G[a].fa).map(k=>`<tr><td>${esc(k)}</td><td>${G[k].n}</td><td class="${G[k].fa>0?"er":""}">${money(G[k].fa)}</td><td>${money(G[k].so)}</td><td><b>${money(G[k].so-G[k].fa)}</b></td></tr>`).join("");
 return vQuien("¿Quién está cargando?")+dlc+`<div class="card" data-fijo="1"><h3>Caja y turno</h3><label>Fecha<input id="if" type="date" value="${today()}"></label><label>Sucursal<select id="is">${opts(SUC)}</select></label><label>Caja<select id="ica">${opts(CAJAS)}</select></label><label>Turno<select id="itu">${opts(TURNOS)}</select></label>${adm?`<label>Cajero o cajera<input id="icj" list="dlc" placeholder="${esc(quien()||"Nombre y apellido")}"></label>`:`<p>Cajero: <b>${esc(quien())}</b></p>`}
${ya?'<p class="er">Esta caja y turno ya tienen el cierre cargado.</p>':`<p class="mu">Retiros de efectivo de esta caja en el turno: <b>$ ${money(ret)}</b><br>Tickets de empleados a cuenta en el turno: <b>$ ${money(tkt)}</b></p>`}</div>
<div class="card"><h3>Ticket que se lleva un empleado</h3><p class="mu">Cuando un empleado se lleva mercadería a su cuenta: sale el ticket pero no se cobra. Cárgalo acá para que no figure como faltante al cerrar la caja y se le descuente del sueldo.</p>
<label>Empleado que se lo lleva<input id="tke" list="dlc" autocomplete="off" placeholder="Nombre y apellido"></label>${fld("tkm","Importe del ticket")}<label>N° de ticket (opcional)<input id="tkn" inputmode="numeric"></label>
<button class="pri" data-a="tkcaja">Guardar ticket</button>
${tks.length?`<p class="mu" style="margin-top:12px">Tickets de este turno:</p>`+tks.map(x=>`<div class="row"><b>${esc(x.empleado)}</b> · $ ${money(x.monto)} <span class="mu">${esc(x.detalle||"")} · cargó ${esc(x.cargo||"")}</span>${!ya&&(adm||x.por==uid)?` <button class="lk" data-a="ranular" data-id="${x.id}">Anular</button>`:""}</div>`).join(""):""}</div>
<div class="card"><h3>Retiro de efectivo de la caja</h3><p class="mu">Cada vez que se saca plata de la caja durante el turno. Al cerrar, los retiros se suman al efectivo contado para comparar con el sistema.</p>
${fld("rcm","Monto que se retira")}<label>Para qué<select id="rcd">${opts(DEST)}</select></label>${de==DEST[1]?`<label>En qué cuenta se deposita<select id="rcb">${opts(CTAS.slice(1))}</select></label>`:""}<label>Detalle<input id="rcx"></label>
<button class="pri" data-a="rcsave">Guardar retiro</button><div class="fl">${esc(flash)}</div></div>
<div class="card"><h3>Cierre de la caja</h3>${ya?'<p class="ok">✔ Esta caja y turno ya tienen el cierre cargado. Lo ves más abajo, en los cierres del día.</p>':`<p class="mu">Cuenta la plata de la caja y anota cuántos billetes hay de cada uno. La app suma sola.</p>
<div class="sc"><table><tr><th style="text-align:left">Billete</th><th>Cantidad</th><th>Suma</th></tr>${DEN.map((d,i)=>`<tr><td style="text-align:left"><b>$ ${d.toLocaleString("es-AR")}</b></td><td><input id="bq${i}" type="number" min="0" step="1" inputmode="numeric" style="width:92px;text-align:right" aria-label="Cantidad de billetes de ${d}"></td><td id="bs${i}"></td></tr>`).join("")}<tr><td style="text-align:left"><b>Monedas</b> (importe)</td><td><input id="bmon" type="number" min="0" step="0.01" inputmode="decimal" style="width:92px;text-align:right" aria-label="Importe en monedas"></td><td></td></tr></table></div>
<p style="font-size:17px">Efectivo contado: <b id="btot">$ ${money(billTot())}</b></p>
<h3 style="margin-top:14px">Cobrado por otros medios</h3><p class="mu">Saca el resumen de Mercado Pago y el cierre de lote del Clover, suma los tickets del posnet de Diarco, y copia cada importe. Deja vacío lo que no hubo.</p>
${fld("imp","Mercado Pago (QR y posnet): importe del resumen")}${fld("icl","Posnet Clover: importe del cierre de lote")}${fld("idi","Posnet Diarco: suma de los tickets")}${fld("itr","Transferencias recibidas")}<label>¿A qué cuenta llegaron las transferencias?<select id="itc">${[ctaTr()].concat(CTAS.filter(c=>c!=ctaTr())).map(c=>`<option>${esc(c)}</option>`).join("")}</select></label>
<button class="pri" data-a="isave">Guardar cierre de esta caja</button>`}</div>
${pen.length?`<div class="card"><h3>Cierres por corroborar (${pen.length})</h3><p class="mu">Cierres de otros días que todavía no se compararon con el sistema de ventas.</p>${pen.map(x=>rowCJ(x,adm)).join("")}</div>`:""}<div class="card"><h3>Cierres del ${fmt(f)}</h3>${lc}<h3 style="margin-top:14px">Retiros del ${fmt(f)}</h3>${lr}</div>
${adm?vDiarco()+vVR()+`<div class="card"><h3>Faltantes y sobrantes por cajero</h3><label>Mes<input id="cjm" type="month" value="${m}"></label>${tm?`<div class="sc"><table><tr><th>Cajero</th><th>Cierres</th><th>Faltantes</th><th>Sobrantes</th><th>Neto</th></tr>${tm}</table></div>`:'<p class="mu">Sin cierres con dato del sistema en este mes.</p>'}</div>`:""}`}
async function acred(){
 const ids=Object.keys(acSel).filter(k=>acSel[k]),neto=parseFloat(keep.an);
 if(!ids.length)return say("Marca las ventas de tarjeta que cubre el depósito");
 if(cerrado(keep.af||today()))return say(MC);
 if(!(neto>0))return say("Carga lo que entró al banco");
 const ts=ids.map(i=>T.find(t=>t.id==i)),bruto=ts.reduce((s,t)=>s+t.monto,0),desc=Math.round((bruto-neto)*100)/100;
 if(desc<0)return say("Entró más de lo vendido: revisa los montos o las ventas marcadas");
 await colI.add({fecha:keep.af||today(),sucursal:"Acreditación de tarjetas",medio:"Transferencia",cuenta:keep.ac,monto:neto,tipo:"acred",bruto,desc,tarjetas:ids,estado:"ok",por:uid,creado:Date.now()});
 for(const t of ts)await colT.doc(t.id).update({estado:"acreditada"});
 acSel={};delete keep.an;await log("Registró acreditación de tarjetas","$ "+money(neto)+" · descuento $ "+money(desc));say("Acreditado ✔ Descuento $ "+money(desc)+" ("+(bruto?desc/bruto*100:0).toFixed(2)+" %)")}
async function ianular(id,X){const x=I.find(z=>z.id==id);await colI.doc(id).update({estado:"anulado",...(X||{})});if(x&&x.tipo=="acred")for(const t of x.tarjetas)await colT.doc(t).update({estado:"pendiente"})}
const TG=["Sueldos","Alquiler","Servicios","Impuestos","Cuota de préstamo","Débito automático","Compra con débito","Comisiones bancarias","Gasto menor","Otro"];