function render(){
 sync();const me=yo(),w=$("#who"),rk=()=>{for(const k in keep){const el=document.getElementById(k);if(el&&k!="ph"&&el.type!="file")el.value=keep[k]}};
 if(w)w.innerHTML=me?`${esc(me.nombre)} · ${esc(me.rango||"sin rango todavía")} <button class="lk" data-a="recargar" title="Buscar si hay una versión nueva y actualizar" aria-label="Actualizar">⟳<span class="lb"> Actualizar</span></button>${me.rango?' · <button class="lk" data-a="ayuda">Ayuda</button>':""}${me.directo?"":' · <button class="lk" data-a="clave">Mi clave</button> · <button class="lk" data-a="lgout">Salir</button>'}`:"";
 if(!auOk){$("#tabs").innerHTML="";$("#app").innerHTML='<div class="card">Cargando…</div>';return}
 if(!me){$("#tabs").innerHTML="";$("#app").innerHTML=vLogin();rk();return}
 if(!me.rango){$("#tabs").innerHTML="";$("#app").innerHTML=`<div class="card"><h3>Hola, ${esc(me.nombre)}</h3><p>Tu usuario <b>${esc(me.usuario)}</b> ya está creado. Falta que un dueño te asigne el rango para que puedas entrar.</p><p class="mu">Avísale y vuelve a abrir la app: apenas lo haga, esta pantalla cambia sola.</p></div>`;return}
 const vis=TABS.filter(t=>puede(t[0])&&(!SOLO()||SOLOK.includes(t[0])));if(!vis.some(t=>t[0]==tab))tab=vis.length?(vis.find(t=>t[0]!="mio")||vis[0])[0]:"reg";
 const bar=(SOLO()?["pgc","pgd"].concat(NAVP.filter(k=>k!="pgc"&&k!="pgd")):NAVP).filter(k=>vis.some(t=>t[0]==k)),mas=bar.length>5,b4=mas?bar.slice(0,4):bar;
 $("#tabs").innerHTML=vis.length<2?"":bar.map(k=>`<button class="${!menuOpen&&tab==k?"on":""}${b4.includes(k)?"":" dk"}" data-t="${k}"><span class="ic">${NAV[k][0]}</span>${NAV[k][1]}</button>`).join("")+(mas?`<button class="mb ${menuOpen||!b4.includes(tab)?"on":""}" data-a="menu"><span class="ic">☰</span>${menuOpen||b4.includes(tab)?"Menú":NAV[tab][1]}</button>`:"");
 if(clv){$("#app").innerHTML=`<div class="card"><h3>Cambiar mi contraseña</h3><p class="mu">Usuario: <b>${esc(ses)}</b></p><label>Contraseña actual<input id="clo" type="password" autocomplete="current-password"></label><label>Contraseña nueva (6 o más)<input id="cln" type="password" autocomplete="new-password"></label><label>Repite la nueva<input id="cln2" type="password" autocomplete="new-password"></label>${clvMsg?`<p class="er">${esc(clvMsg)}</p>`:""}<button class="pri" data-a="clvsave">Guardar contraseña nueva</button><p><button class="lk" data-a="clave">Volver sin cambiar</button></p></div>`;rk();postRender();return}
 if(ayu){$("#app").innerHTML=vAyuda(true);rk();postRender();return}
 if(menuOpen){$("#app").innerHTML=vAyuda(false)+vMenu(vis)+vModal();rk();postRender();return}
 $("#app").innerHTML=vIntro(tab)+(tab=="hoy"?vRapido()+vHoy():tab=="pgd"?vPgd():tab=="pgc"?vPgc():tab=="mio"?vMio():tab=="bus"?vBus():tab=="caj"?vCaj():tab=="tra"?vTra():tab=="bol"?vBol():tab=="ing"?vIng():tab=="gas"?vGas():tab=="cli"?vCli():tab=="mer"?vMer():tab=="emp"?vEmp():tab=="ctl"?vCtl():tab=="usr"?vAdmin("u"):tab=="reg"?vReg():tab=="chq"?vChq():vSem())+(view?`<div class="ov" data-a="cerrar"><img src="/_blob/${esc(view)}" alt="Comprobante"></div>`:"")+vModal();
 for(const k in keep){const el=document.getElementById(k);if(el&&k!="ph"&&el.type!="file")el.value=keep[k]}
 postRender()
}
let CTAS=["Mercado Pago","ICBC","Banco Nación","Banco Galicia"],BCOS=["ICBC","Banco Nación","Banco Galicia","Otro"];
const opts=a=>a.map(o=>`<option>${o}</option>`).join("");
function nextOrden(){const n=O.reduce((m,x)=>Math.max(m,parseInt(String(x.id).replace(/\D/g,""))||0),CM.reduce((m,c)=>Math.max(m,c.ultOrden||0),0))+1;return"OP-"+String(n).padStart(5,"0")}
const FOTOS=false,foto=x=>!FOTOS?"":x.foto?` <button class="lk" data-a="foto" data-id="${esc(x.foto)}">📎 ver foto</button>`:"";
async function shrink(f){try{const b=await createImageBitmap(f),k=Math.min(1,1200/Math.max(b.width,b.height)),c=document.createElement("canvas");c.width=b.width*k;c.height=b.height*k;c.getContext("2d").drawImage(b,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(r,"image/jpeg",.72))}catch(e){return f}}
const pagadoDe=o=>P.filter(x=>x.orden==o&&x.estado!="anulado").reduce((s,x)=>s+x.monto,0);
const faltaDe=o=>{const r=O.find(x=>x.id==o);return r?Math.round((r.total-pagadoDe(o))*100)/100:0};
const provs=()=>[...new Set(B.filter(b=>b.estado=="pendiente").map(b=>b.proveedor))].sort();
const fmt=d=>String(d||"").split("-").reverse().join("/");
const hastaDe=p=>AD.filter(c=>c.proveedor.toLowerCase()==String(p).toLowerCase()).map(c=>c.hasta).sort().pop()||"";