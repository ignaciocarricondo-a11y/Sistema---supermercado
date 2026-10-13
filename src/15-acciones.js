document.addEventListener("click",async e=>{const hh=e.target.closest("#app>.card.acc>h3");if(hh&&!e.target.closest("[data-a],[data-t]")){const c=hh.parentNode,ab=c.classList.contains("pleg");ACT[tab]=ab?c.dataset.k:"∅";acordeon();if(ab&&!ANCHO())c.scrollIntoView({behavior:"smooth",block:"start"});return}
 const t=e.target.closest("[data-t],[data-a]");if(!t)return;
 if(t.dataset.t){tab=t.dataset.t;cmp=false;menuOpen=false;ayu=false;render();scrollTo(0,0);return}
 if(t.dataset.a=="menu"){menuOpen=!menuOpen;ayu=false;render();scrollTo(0,0);return}
 if(t.dataset.a=="recargar"){location.reload();return}
 if(t.dataset.a=="ayuda"){ayu=!ayu;menuOpen=false;clv=false;render();scrollTo(0,0);return}
 if(t.dataset.a=="guia"){irGuia(+t.dataset.id);return}
 if(t.dataset.a=="introok"){const k=t.dataset.id;VISTO[k]=1;DET["int_"+k]=false;try{localStorage.setItem("cpVisto",JSON.stringify(VISTO))}catch(e){}render();return}
 if(t.dataset.a=="vercomo"){const r0=yoReal();if(!r0||r0.rango!="Dueño")return;const id=t.dataset.id,u=id[0]=="@"?null:AU.find(z=>z.usuario==id),rg=id.slice(1),pm={};if(!u)(RANGOS[rg]||[]).forEach(k=>pm[k]=true);VER=u?{...u,directo:true}:{usuario:"vista-de-prueba",nombre:"Ejemplo",rango:rg,permisos:pm,empleado:"",estado:"ok",directo:true};tab="";menuOpen=false;clv=false;cur="";render();scrollTo(0,0);return}
 if(VER&&t.dataset.a!="ir"){if(t.dataset.a=="verfin"){VER=null;tab="usr";menuOpen=false;render();scrollTo(0,0)}else say("Vista de prueba: acá no se carga ni se cambia nada");return}
 if(t.dataset.a=="ir"){const c=[...$("#app").children].filter(c=>c.classList.contains("card")&&c.querySelector("h3"))[+t.dataset.id];if(c)c.scrollIntoView({behavior:"smooth",block:"start"});return}
 const a=t.dataset.a,id=t.dataset.id;
 if(MODT[a]){anu={a,id};anuMsg="";delete keep.mot;render();return}
 if(ANU[a]){if(!puede(a=="crech"||a=="prech"?"autorizar":"anular"))return say("Tu usuario no tiene permiso para anular");anu={a,id};anuMsg="";delete keep.mot;render();return}
 if(a=="anuno"){anu=null;render();return}
 try{
  if(a=="anuok"){const m=(keep.mot||"").trim();if(m.length<4){anuMsg="Escribe al menos unas palabras";render();return}
   const X={motivo:m,anuladoPor:uid,anuladoNombre:miNombre(),anuladoEl:Date.now()},q=anu;anu=null;delete keep.mot;render();if(MODT[q.a])await MODT[q.a].f(q.id,m);else await anularCon(q.a,q.id,X)}
  else if(a=="lgin")await lgin();
  else if(a=="lgnew")await lgnew();
  else if(a=="lgsw"){lgNew=!lgNew;lgMsg="";render()}
  else if(a=="lgout"){try{await AUTH.signOut()}catch(e){}location.reload()}
  else if(a=="aued"){if(!esDueno)return;if(edU==id)edU="";else{edU=id;const u=AU.find(z=>z.usuario==id)||{};edP={};const pz=u.rango?Object.keys(u.permisos||{}).filter(k=>u.permisos[k]):RANGOS.Empleado;pz.forEach(k=>edP[k]=true);keep.rgp=u.rango||"Empleado";keep.rge=u.empleado||"";delete keep.rgw}render()}
  else if(a=="ausave"){if(!esDueno||!edU)return;const u=AU.find(z=>z.usuario==edU),rg=keep.rgp||"Empleado";if(!u)return;if(u.rango=="Dueño"&&rg!="Dueño"&&false)return say("Tiene que quedar al menos un dueño");
   if(rg!="Dueño"){let e=String(keep.rge||"").trim().replace(/\s+/g," ");if(e&&!dosPal(e))return say("Escribe nombre y apellido del empleado");if(!e&&!dosPal(u.nombre))return say(u.nombre+" se registró sin apellido: escribe su nombre y apellido en ¿Qué empleado es?");if(e){const c=nomEmp().find(x=>key(x)==key(e));e=c||e;const otro=AU.find(z=>z.usuario!=u.usuario&&z.estado!="baja"&&z.rango&&key(z.empleado||z.nombre)==key(e));if(otro)return say(e+" ya está vinculado al usuario "+otro.usuario+". Cada empleado puede tener un solo usuario");keep.rge=key(e)==key(u.nombre)?"":e}}
   const pm={};if(rg!="Dueño")PERMS.forEach(([k])=>{if(edP[k])pm[k]=true});await colAU.doc(edU).update({rango:rg,permisos:pm,empleado:rg=="Dueño"?"":(keep.rge||""),sinPagos:rg=="Administrativo"});const q=u.nombre;edU="";await log("Asignó rango",q+": "+rg);say("Rango de "+q+" guardado ✔ ("+rg+")")}
  else if(a=="aubaja"||a=="aualta"){if(!esDueno||!edU)return;const u=AU.find(z=>z.usuario==edU);if(!u)return;if(a=="aubaja"&&u.rango=="Dueño"&&false)return say("Tiene que quedar al menos un dueño");await colAU.doc(edU).update({estado:a=="aubaja"?"baja":"ok"});await log(a=="aubaja"?"Dio de baja un usuario":"Volvió a habilitar un usuario",u.nombre);say(a=="aubaja"?"Usuario dado de baja ✔":"Usuario habilitado ✔")}
  else if(a=="paut")await autorizarPago(id);
  else if(a=="rsave")await rsave();
  else if(a=="rcsave")await rcsave();
  else if(a=="dfalt")await dfalt(id);
  else if(a=="fjsave")await fjsave();
  else if(a=="fjpay")await fjpay(id);
  else if(a=="fjdel"){await colFJ.doc(id).update({estado:"baja"});say("Quitado de la lista ✔")}
  else if(a=="cmsave")await cerrarMes();
  else if(a=="cmarch")await archivar(id);
  else if(a=="arver")await verArchivo();
  else if(a=="cmopen"){if(!esDueno)return;const c=CM.find(z=>z.mes==id);if(c&&!c.archivado){await colCM.doc(id).delete();await log("Reabrió el mes",mesTx(id));say("Mes reabierto ✔")}}
  else if(a=="asave")await asave();
  else if(a=="lsave")await lsave();
  else if(a=="lqpay")await lqpay(id);
  else if(a=="adpdf"||a=="lqpdf")await pdfEmp(a,id);
  else if(a=="lver"){keep.le=id;delete keep.ls;render()}
  else if(a=="xquitar"){rfoto=null;rmsg="";render()}
  else if(a=="fsave")await fsave();
  else if(a=="nsave")await nsave();
  else if(a=="rsem")await resumenPdf();
  else if(a=="vercta"){keep.cc=id;FK.forEach(k=>delete keep[k]);render()}
  else if(a=="tn"){nsel[id]=!nsel[id];render()}
  else if(a=="limsave"){if(!esDueno)return;const v=parseFloat(keep.lim);if(isNaN(v)||v<0)return say("Escribe un monto (0 para no usar límite)");await colCfg.doc("general").set({...cfgBase(),limite:v,por:uid,creado:Date.now()});delete keep.lim;await log("Cambió el límite por pago",v>0?"$ "+money(v):"sin límite");say("Límite guardado ✔")}
  else if(a=="rged"){if(!esDueno)return;if(edU==id)edU="";else{edU=id;const r=RG.find(z=>z.id==id);edP={};if(r)Object.keys(r.permisos||{}).forEach(k=>{if(r.permisos[k])edP[k]=true});else PRE.Empleada.forEach(k=>edP[k]=true);keep.rgp=r?(r.rango in PRE?r.rango:"Otro"):"Empleada";keep.rgn=r&&!(r.rango in PRE)?r.rango:""}render()}
  else if(a=="rgt"){edP[id]=!edP[id];render()}
  else if(a=="rgsave"){if(!esDueno||!edU)return;const nm=keep.rgp=="Otro"?(keep.rgn||"").trim():(keep.rgp||"Empleada");if(!nm)return say("Escribe el nombre del rango");const pm={};PERMS.forEach(([k])=>{if(edP[k])pm[k]=true});const q=edU;await colR.doc(q).set({rango:nm,permisos:pm,por:uid,creado:Date.now()});edU="";await log("Cambió rango",nombreDe(q)+": "+nm);say("Rango guardado ✔")}
  else if(a=="rgdel"){if(!esDueno||!edU)return;const q=edU;await colR.doc(q).delete();edU="";await log("Quitó rango",nombreDe(q));say("Rango quitado ✔")}
  else if(a=="save")await save();
  else if(a=="bsave")await bsave();
  else if(a=="qsave")await qsave();
  else if(a=="comp")await comprobante();
  else if(a=="cdia")await cdia();
  else if(a=="brev")await brev(id,true);else if(a=="brech")await brev(id,false);
  else if(a=="caut"){if(puede("autorizar")){const b=B.find(z=>z.id==id);await colB.doc(id).update({estado:"pendiente",autorizada:true,autorizadaPor:miNombre()});if(b)await log("Autorizó boleta con fecha anterior",b.proveedor+" N° "+b.nro+" $ "+money(b.monto))}}
  else if(a=="cquit"){if(puede("autorizar")){for(const c of AD.filter(c=>c.proveedor==id))await colA.doc(c.id).delete();await log("Quitó la marca de al día",id)}}
  else if(a=="bquitar"){bfoto=null;bitems=[];bmsg="";render()}
  else if(a=="nueva")await nueva();
  else if(a=="isave")await isave();else if(a=="cjok"||a=="cjokp")await cjok(id,a=="cjokp");else if(a=="cjpdf")await cjpdf(CJ.find(z=>z.id==id));else if(a=="cjreab")await cjreab(id);else if(a=="dicanje")await dicanje();else if(a=="tkcaja")await tkcaja();else if(a=="bpagar"||a=="ppagar"){const pv=a=="bpagar"?(B.find(b=>b.id==id)||{}).proveedor:id;if(!pv)return;keep.pv=pv;sel={};nsel={};cur="";(a=="bpagar"?[{id}]:B.filter(b=>b.estado=="pendiente"&&b.proveedor==pv&&!obsB(b))).forEach(b=>sel[b.id]=true);tab="reg";menuOpen=false;render();scrollTo(0,0)}
  else if(a=="clave"){clv=!clv;clvMsg="";["clo","cln","cln2"].forEach(k=>delete keep[k]);render();scrollTo(0,0)}else if(a=="clvsave")await clvsave();else if(a=="cjcarg")await cjcarg(id);else if(a=="cjsel"){cjSel=cjSel==id?"":id;delete keep.kv;render()}
  else if(a=="tj"){acSel[id]=!acSel[id];render()}
  else if(a=="acred")await acred();
  else if(a=="esave")await esave();
  else if(a=="ksave")await ksave();
  else if(a=="bkp")await backup();
  else if(a=="tg"){const tb=B.find(z=>z.id==id);if(tb&&obsB(tb)&&!sel[id])return say("Esa boleta tiene un faltante sin resolver: resuélvelo en Boletas antes de pagarla");sel[id]=!sel[id];render()}
  else if(a=="obsok"){if(!puede("autorizar"))return;const tb=B.find(z=>z.id==id);await colB.doc(id).update({obsOk:true,obsOkPor:miNombre()});if(tb)await log("Dio por resuelto un faltante",tb.proveedor+" N° "+tb.nro);say("Faltante resuelto ✔")}
  else if(a=="mmsave")await mmsave();
  else if(a=="fisave")await fisave();
  else if(a=="cfsave")await cfsave();
  else if(a=="fafirma"){const q=String(id).split("|");await marcarFirma(q[0],q[1])}
  else if(a=="mvsave")await mvsave();
  else if(a=="vrsave")await vrsave();
  else if(a=="tradd"){if(trAgrega(trI,"trp","trc","tru","trpr")){render();setTimeout(()=>{const z=$("#trp");if(z)z.focus()},40)}}
  else if(a=="trdir"){keep.tro=id;render()}else if(a=="trtipo"){keep.trt=id;render()}else if(a=="trpago"){keep.trcp=id;render()}else if(a=="trsaleall")await trsaleAll(id);else if(a=="trrend"){const t=TR.find(z=>z.id==id);if(!t||!cajAdm()||!t.cobro||t.rendido)return;await colTR.doc(id).update({rendido:true,rendidoPor:miNombre(),rendidoEl:Date.now()});await log("Recibió cobro de un pedido",t.nro+" · $ "+money(t.cobro.monto)+" · "+t.cobro.medio);say("Marcado como rendido ✔")}else if(a=="trent")await trent(id);else if(a=="firmaclr"){firmaData="";render()}else if(a=="trmas"||a=="trmen"){const x=trI[+id];if(!x)return;x.c=Math.round((x.c+(a=="trmas"?1:-1))*1000)/1000;if(x.c<=0)trI.splice(+id,1);render()}
  else if(a=="trdel"){trI.splice(parseInt(id),1);render()}
  else if(a=="trsave")await trsave();
  else if(a=="trpdf"){const t=TR.find(z=>z.id==id);if(!t||!trVe(t))return;if(!dl)return say("Aquí no se pueden descargar archivos. Abre la app desde el navegador");if(!window.jspdf)return say("No se pudo preparar el PDF. Recarga la página y prueba de nuevo");await bajarPdf((t.tipo=="cliente"?armarRemito:armarTraslado)(window.jspdf.jsPDF,t,today(),cuando),(t.tipo=="cliente"?"remito_":"traslado_")+(t.nro||"")+".pdf")}
  else if(a=="trsale"){const t=TR.find(z=>z.id==id);if(!t||t.estado!="preparado")return;await colTR.doc(id).update({estado:"en viaje",chofer:miNombre(),choferU:uid,choferEl:Date.now(),viaje:"V-"+Date.now().toString(36).slice(-4).toUpperCase()});await log("Salió con traslado",t.nro+" · "+t.origen+" → "+t.destino);say("Firmado ✔ "+t.nro+" queda en viaje hacia "+t.destino)}
  else if(a=="trabrir"){trR=id;trX=[];firmaData="";render();scrollTo(0,0)}
  else if(a=="trvolver"){trR="";render()}
  else if(a=="trxadd"){if(trAgrega(trX,"trxp","trxc","trxu")){render();setTimeout(()=>{const z=$("#trxp");if(z)z.focus()},40)}}
  else if(a=="trxdel"){trX.splice(parseInt(id),1);render()}
  else if(a=="trrec")await trrec(id);
  else if(a=="smtrajo"){const x=SM.find(z=>z.id==id);if(!x||!x.pendiente||x.estado=="anulado")return;const ing=(await colI.add({fecha:today(),sucursal:"General",monto:x.monto,medio:"Efectivo",cuenta:"",tipo:"cambio",origen:"cambio",estado:"ok",por:uid,creado:Date.now()})).id;await colSM.doc(id).update({pendiente:false,ingreso:ing,traidoEl:today(),recibio:miNombre()});await log("Recibió el efectivo de un cambio de dueño",x.socio+" $ "+money(x.monto));say("Listo ✔ Entraron $ "+money(x.monto)+" al efectivo")}
  else if(a=="bus")render();
  else if(a=="ircta"){keep.cc=id;FK.forEach(k=>delete keep[k]);tab="bol";render()}
  else if(a=="irord"){if(O.some(o=>o.id==id)){cur=id;tab="reg";render()}else say("Esa orden ya no está en la app: búscala en el archivo, en Control")}
  else if(a=="ssave")await ssave(id);else if(a=="ssel"){socSel=socSel==id?"":id;["Efectivo"].concat(CTAS).forEach((x,i)=>delete keep["sp"+i]);render()}
  else if(a=="sresto"){const f=socCalc().filas.find(x=>x.n==socSel);if(!f)return;const FU=["Efectivo"].concat(CTAS),ot=r2(FU.reduce((q,x,i)=>q+(i==+id?0:(parseFloat(keep["sp"+i])||0)),0)),r=r2(Math.max(0,f.pagar)-ot);keep["sp"+id]=r>0?String(r):"";render()}
  else if(a=="tksave")await tksave();
  else if(a=="tkquitar"){tfoto=null;tmsg="";render()}
  else if(a=="csave")await csave();
  else if(a=="fiver"){keep.fcv=id;render()}
  else if(a=="fipdf"){const x=FI.find(z=>z.id==id);if(!x)return;if(!dl)return say("Aquí no se pueden descargar archivos. Abre la app desde el navegador");if(!window.jspdf)return say("No se pudo preparar el PDF. Recarga la página y prueba de nuevo");await bajarPdf(armarRecibo(window.jspdf.jsPDF,x,FI.filter(z=>z.estado!="anulado"&&key(z.cliente)==key(x.cliente)).reduce((s,z)=>s+z.monto,0),today()),"recibo_"+(x.nro||"")+".pdf")}
  else if(a=="ecsave")await ecsave();
  else if(a=="nvsave")await nvsave();
  else if(a=="libro")await libroCsv();
  else if(a=="mmnc")await mmnc(id);
  else if(a=="evsave")await evsave();
  else if(a=="abrir"){cur=id;render()}
  else if(a=="salir"){cur="";render()}
  else if(a=="cobrado"||a=="rechazado"){const x=P.find(z=>z.id==id);if(!x)return;const cu={estado:a};if(a=="cobrado"){cu.cobradoFecha=today();cu.cobroEgreso=(await colE.add({fecha:today(),tipo:"Cheque cobrado",fuente:x.banco||"",sucursal:"General",monto:x.monto,detalle:x.proveedor+" · N° "+(x.ref||""),estado:"ok",origen:"cheque",pago:id,por:uid,creado:Date.now()})).id}await col.doc(id).update(cu);if(x)await log("Marcó cheque como "+a,(x.banco||"")+" N° "+(x.ref||"")+" $ "+money(x.monto))}
  else if(a=="cmp"){cmp=true;render()}
  else if(a=="foto"){view=id;render()}
  else if(a=="cerrar"){view="";render()}
  else if(a=="csv"){if(!dl)return say("Tu navegador no permite descargas aquí");
   const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"',H=["Orden","Banco","N° cheque","Tipo","Proveedor","Sucursal","Fecha emisión","Fecha de pago","Importe","Estado","Pagó"];
   const csv="\ufeff"+[H].concat(chqList().map(x=>[x.orden,x.banco,x.ref,x.tipo,x.proveedor,x.sucursal,x.emision,x.venc,x.monto,x.estado,x.pagador])).map(r=>r.map(q).join(";")).join("\r\n");
   await dl.save({filename:"planilla_cheques.csv",data:csv})}
  else if(a=="conc"){const ids=pairIds.slice();for(const i of ids)await col.doc(i).update({conciliado:true});say("Conciliados: "+ids.length)}
 }catch(err){say("Error: "+(err.message||err))}
});
let firmaData="",fDib=false,fUlt=null;
const firmaPos=(c,e)=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
function firmaIni(){const c=document.getElementById("firma");if(!c)return;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);if(firmaData){const im=new Image();im.onload=()=>x.drawImage(im,0,0);im.src=firmaData}else{x.fillStyle="#b9b0b2";x.font="20px system-ui,sans-serif";x.textAlign="center";x.fillText("Firmar acá",c.width/2,c.height/2+6)}}
document.addEventListener("pointerdown",e=>{const c=e.target.closest&&e.target.closest("#firma");if(!c||VER)return;e.preventDefault();try{c.setPointerCapture(e.pointerId)}catch(z){}if(!firmaData){const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}fDib=true;fUlt=firmaPos(c,e)});
document.addEventListener("pointermove",e=>{if(!fDib)return;const c=document.getElementById("firma");if(!c)return;const p=firmaPos(c,e),x=c.getContext("2d");x.strokeStyle="#16110f";x.lineWidth=3.2;x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(fUlt[0],fUlt[1]);x.lineTo(p[0],p[1]);x.stroke();fUlt=p;firmaData="1"});
["pointerup","pointercancel"].forEach(ev=>document.addEventListener(ev,()=>{if(!fDib)return;fDib=false;const c=document.getElementById("firma");if(c&&firmaData)firmaData=c.toDataURL("image/png")}));
let pendW=0,netT=0;
function netShow(){clearTimeout(netT);netT=setTimeout(()=>{let e=document.getElementById("net");if(!e){e=document.createElement("div");e.id="net";e.setAttribute("role","status");document.body.appendChild(e)}const off=navigator.onLine===false;e.className=off?"off":pendW>0?"on":"";e.textContent=off?"📴 Sin conexión · lo que cargues se envía solo cuando vuelva"+(pendW>0?" ("+pendW+" pendientes)":""):pendW>0?"⏳ Enviando…":""},pendW>0&&navigator.onLine!==false?700:0)}
window.addEventListener("online",netShow);window.addEventListener("offline",netShow);
function dbRapida(raw){const tr=(p,q)=>{pendW++;netShow();Promise.resolve(p).then(()=>{pendW--;netShow()},e=>{pendW--;netShow();const c=(e&&e.code)||"";say((c=="permission-denied"?"No se guardó: tu usuario no tiene permiso para "+q:"No se pudo guardar ("+(c||(e&&e.message)||"error")+")")+". Avísale a un dueño")})},R=Promise.resolve.bind(Promise);
 const wd=(d,n)=>({id:d.id,get:(...a)=>d.get(...a),onSnapshot:(...a)=>d.onSnapshot(...a),set:(v,o)=>{tr(o?d.set(v,o):d.set(v),"guardar en "+n);return R()},update:v=>{tr(d.update(v),"cambiar "+n);return R()},delete:()=>{tr(d.delete(),"borrar en "+n);return R()}});
 return{collection:n=>{const c=raw.collection(n);return{doc:id=>wd(id?c.doc(id):c.doc(),n),add:v=>{const d=c.doc();tr(d.set(v),"guardar en "+n);return R(wd(d,n))},where:(...a)=>c.where(...a),orderBy:(...a)=>c.orderBy(...a),limit:(...a)=>c.limit(...a),onSnapshot:(...a)=>c.onSnapshot(...a),get:(...a)=>c.get(...a)}}}}
let VER0=null,lastIn=Date.now(),updPend=false;
async function chkVer(){try{const r=await fetch(location.pathname+"?v="+Date.now(),{method:"HEAD",cache:"no-store"});if(!r.ok)return;const v=r.headers.get("etag")||r.headers.get("last-modified")||r.headers.get("content-length");if(!v)return;if(VER0==null){VER0=v;return}if(v!==VER0){updPend=true;aplicarUpd()}}catch(e){}}
function aplicarUpd(){if(!updPend)return;if(document.hidden||Date.now()-lastIn>40000){location.reload();return}if(!$("#upd")){const b=document.createElement("button");b.id="upd";b.innerHTML="<span>🔔 Hay una versión nueva de la app</span><b>Actualizar ahora</b>";b.onclick=()=>location.reload();document.body.appendChild(b)}}
setInterval(()=>{updPend?aplicarUpd():chkVer()},60000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)updPend?aplicarUpd():chkVer()});chkVer();
["input","keydown","pointerdown"].forEach(ev=>document.addEventListener(ev,()=>{lastIn=Date.now()},true));
let rzT=0;window.addEventListener("resize",()=>{clearTimeout(rzT);rzT=setTimeout(acordeon,150)});
document.addEventListener("keydown",e=>{if(e.key!="Enter")return;const id=e.target.id,sec=[["trp","trc","trpr"],["trxp","trxc"]].find(q=>q.includes(id));if(!sec)return;e.preventDefault();keep[id]=e.target.value;const ord=sec.filter(k=>document.getElementById(k)),nx=ord[ord.indexOf(id)+1];if(nx){if(e.target.value.trim())document.getElementById(nx).focus();return}const vac=ord.slice(0,2).find(k=>!document.getElementById(k).value.trim());if(vac){document.getElementById(vac).focus();return}e.target.blur();const b=document.querySelector(`[data-a=${sec[0]=="trp"?"tradd":"trxadd"}]`);if(b)b.click()});
document.addEventListener("toggle",e=>{if(e.target.id){DET[e.target.id]=e.target.open;const m=/^int_(.+)$/.exec(e.target.id);if(m&&!e.target.open&&!VISTO[m[1]]){VISTO[m[1]]=1;try{localStorage.setItem("cpVisto",JSON.stringify(VISTO))}catch(x){}}}},true);
document.addEventListener("input",e=>{if(e.target.type=="file")return;if(e.target.id){keep[e.target.id]=e.target.value;if(/^bq\d+$|^bmon$/.test(e.target.id))billShow();if(/^rq_\d+$/.test(e.target.id)){const z=$("#rqn");if(z)z.textContent=Object.keys(keep).filter(k=>/^rq_\d+$/.test(k)&&String(keep[k]).trim()!=="").length}if(/^sp\d+$/.test(e.target.id)){const f=socCalc().filas.find(x=>x.n==socSel);if(f){const r=r2(["Efectivo"].concat(CTAS).reduce((q,x,i)=>q+(parseFloat(keep["sp"+i])||0),0)),a=$("#sprep"),b=$("#spfal");if(a)a.textContent="$ "+money(r);if(b){b.textContent=spFalta(f.pagar,r);b.className=Math.abs(Math.max(0,f.pagar)-r)<0.01?"ok":"er"}}}if(e.target.id=="ayq"){const r=$("#ayr");if(r)r.innerHTML=vGuiaRes(ayu)}}});
document.addEventListener("change",e=>{if(e.target.id=="tru"){const z=document.getElementById("trpr");if(z)z.placeholder=prePh(e.target.value)}if(e.target.id=="mvph"){mphoto=e.target.files[0]||null;render();return}if(e.target.id=="tkph"||e.target.id=="tkpg"){const f=e.target.files[0];if(f&&!tley)leerTicket(f);return}if(e.target.dataset&&e.target.dataset.fa){const f=e.target.files[0],q=e.target.dataset.fa.split("|");if(f&&!firmando)subirFirmaDoc(q[0],q[1],f);return}if(e.target.id=="xph"||e.target.id=="xpg"){const f=e.target.files[0];if(f&&!rley)leerRetiro(f);return}if(e.target.id=="yph"){aphoto=e.target.files[0]||null;render();return}if(e.target.id=="fph"){const f=e.target.files[0];if(f&&!firmando)subirFirmado(f);return}if(e.target.id=="bph"||e.target.id=="bpg"){const f=e.target.files[0];if(f&&!leyendo)leerBoleta(f);return}if(e.target.id=="ph"){photo=e.target.files[0]||null;render();return}if(e.target.id){keep[e.target.id]=e.target.value;if(e.target.id=="le"||e.target.id=="lm"){delete keep.ls;["etp","esu","ein"].forEach(k=>delete keep[k])}if(e.target.id=="rgp"){const pz=RANGOS[e.target.value];if(pz){edP={};pz.forEach(k=>edP[k]=true)}}if(e.target.id=="pv"){sel={};nsel={}}if(e.target.id=="cc")FK.forEach(k=>delete keep[k]);if(e.target.id=="qp")registrar();if(e.target.id=="qp"&&e.target.value&&e.target.value!="__n")recordar(e.target.value);if(e.target.id=="ac")acSel={};if(["md","bco","fe","d1","d2","pv","ac","qp","cc","hp","rgp","ymd","lm","le","ls","if","is","ica","itu","cjm","cjw","rcd","brc","mcl","mmm","fmv","rmm","lcm","sd1","sd2","svb","sdm","mim","qb","cse","tro","rnd1","rnd2","trb","mvd"].includes(e.target.id)||/^rs\d/.test(e.target.id))render()}});