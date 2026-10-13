function armarPdf(J,o,BB,PP,hoy,NN,fi){
 NN=NN||[];fi=fi||{};
 const L=15,R=195,cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim(),f2=d=>String(d||"").split("-").reverse().join("/"),pe=n=>"$ "+money(n);
 const pagos=PP.filter(x=>x.orden==o.id&&x.estado!="anulado").sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha))),pagado=pagos.reduce((s,x)=>s+x.monto,0),falta=Math.round((o.total-pagado)*100)/100;
 const bols=o.boletas.map(i=>BB.find(z=>z.id==i)).filter(Boolean),ncs=(o.notas||[]).map(i=>NN.find(z=>z.id==i)).filter(Boolean);
 function dib(doc,y0,etq,largo){
  let y=y0;
  const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||9)};
  const tx=(s,x,a)=>doc.text(cl(s),x,y,a?{align:"right"}:{});
  const ln=()=>{doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y)};
  const st=n=>{y+=n;if(largo&&y>280){doc.addPage();y=15}};
  F(1,12);marca(doc,L,y);tx("COMPROBANTE DE PAGO",R,1);st(4.5);
  F(0,8.5);tx("X LAN S.A.S. - CUIT 30-71751719-5 - Av. Sarmiento 3050 - San Rafael, Mendoza",L);F(1,10);tx("Orden N° "+o.id,R,1);st(4);
  F(0,8.5);tx("Emitido el "+f2(hoy)+(falta>0.005?" - PAGO PARCIAL":""),L);F(1,8.5);tx(etq,R,1);st(2.5);ln();st(6);
  F(1,10);tx("Proveedor:",L);F(0,10);tx(o.proveedor+(fi.cuit?"  -  CUIT "+fi.cuit:""),L+22);st(7);
  F(1,8.5);tx("Boletas (sucursal)",L);tx("N° de boleta",L+60);tx("Fecha",L+115);tx("Importe",R,1);st(1.5);ln();st(4.3);F(0,9);
  bols.forEach(b=>{tx(b.sucursal,L);tx(b.nro,L+60);tx(f2(b.fecha),L+115);tx(pe(b.monto),R,1);st(4.6)});
  ncs.forEach(n=>{tx("Nota de crédito",L);tx(n.nro||"-",L+60);tx(f2(n.fecha),L+115);tx("- "+pe(n.monto),R,1);st(4.6)});
  st(-2.6);ln();st(4.3);F(1,9);tx(ncs.length?"Total a pagar":"Total de boletas",L+115);tx(pe(o.total),R,1);st(7.5);
  F(1,8.5);tx("Fecha de pago",L);tx("Medio",L+27);tx("Detalle",L+55);tx("Importe",R,1);st(1.5);ln();st(4.3);F(0,9);
  pagos.forEach(x=>{
   const det=x.medio=="Transferencia"?"Desde "+(x.cuenta||"")+(x.ref?" - operación "+x.ref:""):x.medio=="Cheque"?(x.banco||"")+" N° "+(x.ref||"")+(x.tipo?" ("+x.tipo+")":"")+" - fecha de pago "+f2(x.venc):"En efectivo";
   const ls=doc.splitTextToSize(cl(det),88);
   tx(f2(x.fecha),L);tx(x.medio,L+27);tx(pe(x.monto),R,1);ls.forEach((l,i)=>{if(i)st(4);tx(l,L+55)});st(4.6)});
  st(-2.6);ln();st(4.3);F(1,9);tx("Total pagado",L+115);tx(pe(pagado),R,1);st(4.6);
  if(falta>0.005){tx("Saldo pendiente",L+115);tx(pe(falta),R,1);st(4.6)}
  const qs=[...new Set(pagos.map(x=>x.pagador).filter(Boolean))];
  if(qs.length){F(0,8.5);tx("Pago entregado por: "+qs.join(", "),L);st(4.6)}
  st(3);F(0,9.5);tx(falta>0.005?"Recibí de conformidad el importe de "+pe(pagado)+" como pago parcial de las boletas detalladas.":"Recibí de conformidad el importe de "+pe(pagado)+" en pago total de las boletas detalladas.",L);st(15);
  doc.setDrawColor(0);doc.line(L,y,L+55,y);doc.line(L+63,y,L+123,y);doc.line(L+131,y,R,y);st(3.8);F(0,8);tx("Firma de quien recibe",L);tx("Aclaración",L+63);tx("DNI y fecha",L+131);
  return y}
 const alto=dib(new J({unit:"mm",format:"a4"}),0,"",false),doc=new J({unit:"mm",format:"a4"});
 if(alto<=128){dib(doc,12,"ORIGINAL - para el negocio",false);doc.setDrawColor(120);doc.setLineWidth(.2);if(doc.setLineDashPattern)doc.setLineDashPattern([2,2],0);doc.line(5,148.5,205,148.5);if(doc.setLineDashPattern)doc.setLineDashPattern([],0);dib(doc,160,"DUPLICADO - para el proveedor",false)}
 else{dib(doc,15,"ORIGINAL - para el negocio",true);doc.addPage();dib(doc,15,"DUPLICADO - para el proveedor",true)}
 return doc}
function armarResumen(J,D){
 const doc=new J({unit:"mm",format:"a4"}),L=15,R=195;let y=16;
 const cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim();
 const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||9.5)};
 const tx=(s,x,a)=>doc.text(cl(s),x,y,a?{align:"right"}:{});
 const st=n=>{y+=n;if(y>283){doc.addPage();y=16}};
 F(1,13);marca(doc,L,y);tx("RESUMEN DE PAGOS",R,1);st(5);F(0,9.5);tx("Del "+D.d1+" al "+D.d2,L);tx("Emitido el "+D.hoy,R,1);st(1);
 D.secciones.forEach(s=>{if(y>262){doc.addPage();y=16}st(5.5);F(1,10.5);tx(s.t,L);st(1.5);doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y);st(4.6);
  s.filas.forEach(f=>{F(f[2],9.5);tx(f[0],L);tx(f[1],R,1);st(4.5)})});
 return doc}
function armarAdelanto(J,a,hoy){
 const doc=new J({unit:"mm",format:"a4"}),L=15,R=195,cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim(),f2=d=>String(d||"").split("-").reverse().join("/"),pe=n=>"$ "+money(n);let y=0;
 const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||10)},tx=(s,x,r)=>doc.text(cl(s),x,y,r?{align:"right"}:{});
 const copia=(y0,etq)=>{y=y0;
  F(1,12);marca(doc,L,y);tx("ADELANTO DE SUELDO",R,1);y+=4.5;F(0,8.5);tx("X LAN S.A.S. - CUIT 30-71751719-5 - Av. Sarmiento 3050 - San Rafael, Mendoza",L);F(1,10);tx("Comprobante N° "+(a.nro||""),R,1);y+=4;
  F(0,8.5);tx("Emitido el "+f2(hoy),L);F(1,8.5);tx(etq,R,1);y+=2.5;doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y);y+=9;
  [["Empleado:",a.empleado],["Fecha:",f2(a.fecha)],["Importe:",pe(a.monto)],["Forma de entrega:",a.medio=="Transferencia"?"Transferencia desde "+(a.cuenta||""):"En efectivo"],["Entregado por:",a.entrego||""],["Nota:",a.nota||""]].filter(k=>k[1]).forEach(k=>{F(1,10);tx(k[0],L);F(0,10);tx(k[1],L+40);y+=6});
  y+=4;F(0,10);doc.splitTextToSize(cl("Recibí de X LAN S.A.S. la suma de "+pe(a.monto)+" en concepto de adelanto de sueldo. Acepto que este importe se descuente de mi liquidación de sueldo del mes."),180).forEach(l=>{tx(l,L);y+=5});
  y+=18;doc.setDrawColor(0);doc.line(L,y,L+55,y);doc.line(L+63,y,L+123,y);doc.line(L+131,y,R,y);y+=3.8;F(0,8);tx("Firma del empleado",L);tx("Aclaración",L+63);tx("DNI y fecha",L+131)};
 copia(12,"ORIGINAL - para el negocio");doc.setDrawColor(120);if(doc.setLineDashPattern)doc.setLineDashPattern([2,2],0);doc.line(5,148.5,205,148.5);if(doc.setLineDashPattern)doc.setLineDashPattern([],0);copia(160,"DUPLICADO - para el empleado");
 return doc}
function armarLiq(J,q,rs,as,hoy,ds,nov){ds=ds||[];
 const doc=new J({unit:"mm",format:"a4"}),L=15,R=195,cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim(),f2=d=>String(d||"").split("-").reverse().join("/"),pe=n=>"$ "+money(n);let y=0;
 const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||9.5)},tx=(s,x,r)=>doc.text(cl(s),x,y,r?{align:"right"}:{});
 const st=n=>{y+=n;if(y>282){doc.addPage();y=16}},ln=()=>{doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y)};
 const sec=t=>{st(4);F(1,10.5);tx(t,L);st(1.5);ln();st(5)},kv=(k,v,b,z)=>{F(b,z||9.5);tx(k,L+80);tx(v,R,1);st(z?7:5)};
 const copia=etq=>{y=16;
  F(1,13);marca(doc,L,y);tx("LIQUIDACIÓN DE SUELDO",R,1);st(5);F(0,8.5);tx("X LAN S.A.S. - CUIT 30-71751719-5 - Av. Sarmiento 3050 - San Rafael, Mendoza",L);F(1,10);tx("Mes "+String(q.mes||"").split("-").reverse().join("/"),R,1);st(4);
  F(0,8.5);tx("Emitido el "+f2(hoy),L);F(1,8.5);tx(etq,R,1);st(2.5);ln();st(8);F(1,11);tx("Empleado:",L);F(0,11);tx(q.empleado,L+24);st(4);if(nov){st(1.5);F(0,9);tx("Novedades del mes: "+nov,L);st(3.5)}
  sec("Mercadería retirada en el mes");
  if(!rs.length){F(0,9.5);tx("Sin retiros de mercadería.",L);st(5)}
  rs.forEach(x=>{F(0,9.5);tx(f2(x.fecha),L);tx(doc.splitTextToSize(cl(x.detalle||"Mercadería"),105)[0],L+26);tx(pe(x.monto),R,1);st(4.8)});
  st(1);kv("Total de mercadería",pe(q.merc));kv("Descuento del "+(q.pct||10)+" %","- "+pe(q.desc));kv("Mercadería a descontar",pe(q.aDesc),1);
  sec("Adelantos de dinero");
  if(!as.length){F(0,9.5);tx("Sin adelantos.",L);st(5)}
  as.forEach(x=>{F(0,9.5);tx(f2(x.fecha),L);tx((x.nro?x.nro+" - ":"")+(x.medio=="Transferencia"?"Transferencia desde "+(x.cuenta||""):"En efectivo"),L+26);tx(pe(x.monto),R,1);st(4.8)});
  st(1);kv("Total de adelantos",pe(q.adel),1);
  if(ds.length){sec("Faltantes de caja");ds.forEach(x=>{F(0,9.5);tx(f2(x.fecha),L);tx(doc.splitTextToSize(cl(x.motivo||"Faltante de caja"),105)[0],L+26);tx(pe(x.monto),R,1);st(4.8)});st(1);kv("Total de faltantes",pe(q.otros||0),1)}
  sec("Resumen");kv("Sueldo del mes",pe(q.sueldo));kv("Mercadería (con "+(q.pct||10)+" % de descuento)","- "+pe(q.aDesc));kv("Adelantos de dinero","- "+pe(q.adel));if(q.otros)kv("Faltantes de caja","- "+pe(q.otros));st(1);ln();st(6);kv(q.neto<0?"SALDO A FAVOR DEL NEGOCIO":"NETO A COBRAR",pe(Math.abs(q.neto)),1,12);
  if(y>232){doc.addPage();y=16}
  st(4);F(0,10);doc.splitTextToSize(cl("Declaro que revisé esta liquidación y que estoy de acuerdo con los retiros de mercadería, los adelantos de dinero y el importe a cobrar que se detallan. No tengo nada que reclamar por estos conceptos."),180).forEach(l=>{tx(l,L);st(5)});
  st(20);doc.setDrawColor(0);doc.line(L,y,L+55,y);doc.line(L+63,y,L+123,y);doc.line(L+131,y,R,y);st(3.8);F(0,8);tx("Firma del empleado",L);tx("Aclaración",L+63);tx("DNI y fecha",L+131)};
 copia("ORIGINAL - para el negocio");doc.addPage();copia("DUPLICADO - para el empleado");
 return doc}
function armarRecibo(J,x,saldo,hoy){
 const doc=new J({unit:"mm",format:"a4"}),L=15,R=195,cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim(),f2=d=>String(d||"").split("-").reverse().join("/"),pe=n=>"$ "+money(n);let y=0;
 const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||10)},tx=(s,q,r)=>doc.text(cl(s),q,y,r?{align:"right"}:{});
 const copia=(y0,etq)=>{y=y0;F(1,12);marca(doc,L,y);tx("RECIBO DE PAGO",R,1);y+=4.5;F(0,8.5);tx("X LAN S.A.S. - CUIT 30-71751719-5 - Av. Sarmiento 3050 - San Rafael, Mendoza",L);F(1,10);tx("N° "+(x.nro||""),R,1);y+=4;F(0,8.5);tx("Emitido el "+f2(hoy),L);F(1,8.5);tx(etq,R,1);y+=2.5;doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y);y+=9;
  [["Cliente:",x.cliente],["Fecha del pago:",f2(x.fecha)],["Importe recibido:",pe(Math.abs(x.monto))],["Forma de pago:",String(x.donde||"").startsWith("Transferencia")?x.donde:"En efectivo"],["Sucursal:",x.sucursal],["Detalle:",x.detalle||""],["Saldo que queda en la cuenta:",pe(Math.max(0,saldo))]].filter(k=>k[1]).forEach(k=>{F(1,10);tx(k[0],L);F(0,10);tx(k[1],L+58);y+=6});
  y+=4;F(0,10);doc.splitTextToSize(cl("Recibimos de "+x.cliente+" la suma de "+pe(Math.abs(x.monto))+" a cuenta de sus compras."),180).forEach(l=>{tx(l,L);y+=5});
  y+=18;doc.setDrawColor(0);doc.line(L,y,L+70,y);doc.line(L+90,y,R,y);y+=3.8;F(0,8);tx("Firma por X LAN S.A.S.",L);tx("Aclaración",L+90)};
 copia(12,"ORIGINAL - para el cliente");doc.setDrawColor(120);if(doc.setLineDashPattern)doc.setLineDashPattern([2,2],0);doc.line(5,148.5,205,148.5);if(doc.setLineDashPattern)doc.setLineDashPattern([],0);copia(160,"DUPLICADO - para el negocio");
 return doc}
function hojaDoble(J,o){
 const doc=new J({unit:"mm",format:"a4"}),L=12,R=198,M=148.5,cl=s=>String(s==null?"":s).replace(/[^\x20-\xFF]/g,"").trim();let y=0,ymax=0,y0=0;
 const F=(b,z)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(z||9)},tx=(s,x,r)=>doc.text(cl(s),x,y,r?{align:"right"}:{}),ln=()=>{doc.setDrawColor(140);doc.setLineWidth(.2);doc.line(L,y,R,y)};
 const nd=o.datos.length,nn=o.notas.length,alto=16+nd*4.6+3+5.5+o.filas.length*4.2+4+(o.total?6:0)+nn*4.3+30,media=alto<=M-6;
 const cab=()=>{F(1,8);o.cols.forEach(c=>tx(c.h,c.x,c.r));y+=1.4;ln();y+=4},foot=()=>{const yf=y0+(media?M:297)-9;if(!media&&y>yf-20){doc.addPage();y0=0;}
  const yl=y0+(media?M:297)-9;F(0,7.5);const w=(R-L-12)/3;o.firmas.forEach((f,i)=>{const x=L+i*(w+6);y=yl-15;tx(f[0]+": "+(f[1]||"(falta)"),x);y+=3.3;if(f[2]){tx(f[2],x)}if(f[3]){try{doc.addImage(f[3],"PNG",x,yl-10.5,40,10)}catch(e){}}doc.setDrawColor(0);doc.setLineWidth(.25);doc.line(x,yl,x+w,yl);y=yl+3.3;tx("Firma "+f[0].toLowerCase(),x)})};
 const copia=(nom)=>{y=y0+9;F(1,11.5);tx(o.titulo+(o.nro?" N° "+o.nro:""),L);tx(nom,R,1);y+=4.6;F(0,7.5);tx(o.sub,L);F(1,7.5);tx(o.estado,R,1);y+=2.2;ln();y+=5;
  o.datos.forEach(r=>{let x=L;r.forEach(([k,v])=>{F(1,9);tx(k,x);const a=doc.getTextWidth?doc.getTextWidth(cl(k))+1.5:18;F(0,9);const vv=doc.splitTextToSize?doc.splitTextToSize(cl(v),(r.length>1?60:170)-a)[0]:v;tx(vv,x+a);x+=r.length>1?(R-L)/r.length:0});y+=4.6});y+=3;
  cab();o.filas.forEach(f=>{F(f.b,8.8);o.cols.forEach((c,i)=>tx(i==0&&doc.splitTextToSize?doc.splitTextToSize(cl(f.v[i]),c.w||80)[0]:f.v[i],c.x,c.r));y+=4.2;if(!media&&y>272){doc.addPage();y0=0;y=14;cab()}});
  y-=1;ln();y+=5;if(o.total){F(1,10.5);tx(o.total[0],o.total[1],1);tx(o.total[2],R,1);y+=6}
  o.notas.forEach(n=>{F(n.b,8.5);tx(n.t,L);y+=4.3});foot()};
 if(media){y0=0;copia("ORIGINAL");y0=M;copia("DUPLICADO");doc.setLineDashPattern&&doc.setLineDashPattern([2,1.6],0);doc.setDrawColor(110);doc.setLineWidth(.3);doc.line(4,M,206,M);doc.setLineDashPattern&&doc.setLineDashPattern([],0);y=M-1.2;F(0,6.5);tx("- - cortar por aquí - -",105-12)}
 else{y0=0;copia("ORIGINAL");doc.addPage();y0=0;copia("DUPLICADO")}
 return doc}
function armarRemito(J,t,hoy,cuandoF){
 const f2=d=>String(d||"").split("-").reverse().join("/"),c=t.cliente||{},cp=(t.items||[]).some(i=>i.pr>0),L=12,R=198;
 return hojaDoble(J,{titulo:"REMITO",nro:t.nro,sub:"Documento no válido como factura - Emitido el "+f2(hoy),estado:t.estado=="entregado"?"ENTREGADO":t.estado=="en viaje"?"EN VIAJE":"PREPARADO",
  datos:[[["Fecha:",f2(t.fecha)],["Sale de:",t.origen||""],["Pago:",(t.pago||"")+(t.cobro?" - cobrado "+(t.cobro.medio=="Efectivo"?"en efectivo":"por transferencia"):"")]],[["Cliente:",c.n||""]].concat(c.tel?[["Teléfono:",c.tel]]:[]),[["Entrega en:",c.dir||""]]],
  cols:[{h:"Producto",x:L,w:84},{h:"Unidad",x:L+88},{h:"Cantidad",x:L+126,r:1}].concat(cp?[{h:"Precio",x:L+155,r:1},{h:"Subtotal",x:R,r:1}]:[]),
  filas:(t.items||[]).map(i=>({v:[i.p,i.u||"",String(i.c)].concat(cp?[i.pr>0?"$ "+money(i.pr):"-",i.pr>0?"$ "+money(r2(i.c*i.pr)):"-"]:[])})),
  total:t.importe>0?["TOTAL",L+155,"$ "+money(t.importe)]:null,notas:t.obs?[{t:"Observación: "+t.obs}]:[],
  firmas:[["Preparó",t.prepara,t.preparaEl?cuandoF(t.preparaEl):""],["Llevó",t.chofer,t.choferEl?cuandoF(t.choferEl):""],["Recibió",t.recibe?t.recibe+(t.recibeDni?" (DNI "+t.recibeDni+")":""):"",t.recibeEl?cuandoF(t.recibeEl):"",t.firma||""]]})}
function armarTraslado(J,t,hoy,cuandoF){
 const f2=d=>String(d||"").split("-").reverse().join("/"),L=12,R=198,rec=t.estado=="recibido",filas=rec?(t.difs||[]):(t.items||[]).map(i=>({p:i.p,u:i.u,sale:i.c})),mal=rec?filas.filter(d=>Math.abs(d.dif)>=0.001).length:0;
 const notas=[{b:1,t:rec?(mal?"Hay diferencias en "+mal+(mal==1?" producto":" productos")+" (negativo = llegó de menos)":"Lo que llegó coincide con lo que salió"):"Todavía no se recibió en destino"}].concat(t.revisado?[{t:("Diferencia revisada por "+(t.revPor||"")+": "+(t.revNota||"")).slice(0,120)}]:[]).concat(t.choferU&&t.choferU==t.recibeU?[{t:"Atención: lo recibió la misma persona que lo llevó."}]:[]);
 return hojaDoble(J,{titulo:"TRASLADO",nro:t.nro,sub:"Entre sucursales - Emitido el "+f2(hoy),estado:rec?(mal?"CON DIFERENCIAS":"COINCIDE TODO"):t.estado=="en viaje"?"EN VIAJE":"PREPARADO",
  datos:[[["Fecha:",f2(t.fecha)],["Sale de:",t.origen||""],["Va a:",t.destino||""]]].concat(t.rubro?[[["Rubro:",t.rubro+" - valor a precio de costo $ "+money(t.valor||0)]]]:[]),
  cols:[{h:"Producto",x:L,w:88},{h:"Unidad",x:L+92},{h:"Salió",x:L+130,r:1}].concat(rec?[{h:"Llegó",x:L+156,r:1},{h:"Diferencia",x:R,r:1}]:[]),
  filas:filas.map(d=>({b:rec&&Math.abs(d.dif)>=0.001,v:[d.p,d.u||"",String(d.sale)].concat(rec?[String(d.llega),Math.abs(d.dif)<0.001?"ok":(d.dif>0?"+":"")+d.dif]:[])})),
  total:null,notas,firmas:[["Preparó",t.prepara,t.preparaEl?cuandoF(t.preparaEl):""],["Llevó",t.chofer,t.choferEl?cuandoF(t.choferEl):""],["Recibió",t.recibe,t.recibeEl?cuandoF(t.recibeEl):""]]})}
/*CORTE*/
function resultado(d1,d2){cjNeed(d1,d2);
 const en=x=>x.fecha>=d1&&x.fecha<=d2,cols=SUC.concat(["General"]),z=()=>{const o={};cols.forEach(c=>o[c]=0);return o},R={ventas:z(),compras:z(),gastos:z(),mermas:z(),consumo:z(),dif:z()},cc=s=>SUC.includes(s)?s:"General";
 CJ.filter(x=>x.estado!="anulado"&&en(x)).forEach(x=>{R.ventas[cc(x.sucursal)]+=x.ventas||0;if(x.dif!=null)R.dif[cc(x.sucursal)]+=x.dif});
 B.filter(b=>b.estado!="anulada"&&b.estado!="por autorizar"&&en(b)).forEach(b=>R.compras[cc(b.sucursal)]+=b.monto);
 TR.filter(t=>(t.estado=="recibido"||t.estado=="en viaje")&&t.rubro&&t.valor>0&&en(t)).forEach(t=>{R.compras[cc(t.origen)]-=t.valor;R.compras[cc(t.destino)]+=t.valor});
 E.filter(x=>x.estado!="anulado"&&x.origen!="cheque"&&x.origen!="cambio"&&en(x)).forEach(x=>R.gastos[cc(x.sucursal)]+=x.monto);
 MM.filter(x=>x.estado!="anulado"&&en(x)).forEach(x=>{if(x.clase==CLA[0])R.mermas[cc(x.sucursal)]+=x.monto;else if(x.clase==CLA[1])R.consumo[cc(x.sucursal)]+=x.monto});
 const res=z();cols.forEach(c=>res[c]=R.ventas[c]-R.compras[c]-R.gastos[c]);return{cols,R,res}}