(()=>{const LS=k=>JSON.parse(localStorage.getItem(k)||"null"),SV=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let D=LS("fsdb")||{},subs=[];const save=()=>{SV("fsdb",D);subs.forEach(f=>f())};window.__denied=[];
// espejo de firestore.rules
const A=()=>LS("fsu"),U=()=>{const a=A();return a?a.email.split("@")[0]:""},yo=()=>(D.cuentas||{})[U()]||null;
const principal=()=>!!A()&&!!(D.config&&D.config.dueno)&&D.config.dueno.uid==A().uid,activo=()=>{const m=yo();return !!A()&&!!m&&m.estado=="ok"&&m.rango!=""};
const dueno=()=>principal()||(activo()&&yo().rango=="Dueño"),tiene=l=>activo()&&Object.keys(yo().permisos||{}).some(k=>l.includes(k));
const fin=()=>dueno()||tiene(['hoy','bus','reg','ing','gas','cli','emp','ctl','chq','sem','cajctl']),caja=()=>tiene(['caj']),bole=()=>tiene(['bol']),depo=()=>tiene(['tra','mer']),mio=()=>"a_"+U();
function can(op,c,id,data,old,fs){ // op: get|list|create|update|delete
 const rd=op=="get"||op=="list";
 if(c=="config"){if(id=="dueno")return op=="get"?!!A():op=="create"?!!A()&&data.uid==A().uid:(rd&&(activo()||dueno()));if(rd)return activo()||dueno();return fin()||(id=="diarco"&&caja())}
 if(c=="cuentas"){if(op=="get"&&A()&&id==U())return true;if(rd)return activo()||dueno();if(op=="create")return !!A()&&id==U()&&data.uid==A().uid&&data.estado=="ok"&&Object.keys(data.permisos).length==0&&(data.rango==""||(data.rango=="Dueño"&&principal()));if(op=="update")return dueno();return false}
 if(fin())return true;
 if(rd&&['cajas','retcaja','retiros','personas','cierresmes'].includes(c)&&caja())return true;
 if(op=="create"&&['cajas','retcaja','ingresos','tarjetas','retiros','diarco','historial'].includes(c)&&caja()&&data.por==mio())return true;
 if(op=="update"&&c=="retiros"&&caja()&&old.por==mio()&&old.origen=="caja")return true;
 if(rd&&['traslados','mermas','envases','proveedores','personas','cierresmes'].includes(c)&&depo())return true;
 if((op=="create"||op=="update")&&['traslados','mermas','envases'].includes(c)&&depo())return true;
 if(op=="create"&&c=="historial"&&activo()&&data.por==mio())return true;
 if(c=="proveedores"&&bole()){if(rd)return true;if(op=="create")return data.por==mio();if(op=="update")return Object.keys({...data,...old}).every(k=>data[k]===old[k]||k=="rubro"||k=="cuit")}
 if(c=="boletas"&&bole()){if(op=="get")return !!old&&old.por==mio();if(op=="list")return (fs||[]).some(([f,o,v])=>f=="por"&&o=="=="&&v==mio());if(op=="create")return data.por==mio()&&data.estado=="por revisar"}
 if(rd&&['retiros','adelantos','liquidaciones','descuentos','novedades'].includes(c)&&activo()){const m=yo();if(op=="get")return old&&(old.empleado==m.nombre||old.empleado==m.empleado);return (fs||[]).some(([f,o,v])=>f=="empleado"&&o=="=="&&(v==m.nombre||v==m.empleado))}
 return false}
const deny=(op,c,id)=>{window.__denied.push(op+" "+c+(id?"/"+id:""));return Object.assign(new Error("Missing or insufficient permissions."),{code:"permission-denied"})};
const snapDoc=(c,id)=>({id,exists:!!(D[c]&&D[c][id]),data:()=>D[c]&&D[c][id]});
function Q(c,fs,ob,lim){this.c=c;this.fs=fs||[];this.ob=ob;this.lim=lim}
Q.prototype={where(f,o,v){return new Q(this.c,this.fs.concat([[f,o,v]]),this.ob,this.lim)},orderBy(f,d){return new Q(this.c,this.fs,[f,d],this.lim)},limit(n){return new Q(this.c,this.fs,this.ob,n)},
 run(){let a=Object.entries(D[this.c]||{}).map(([id,d])=>({id,d}));for(const[f,o,v]of this.fs)a=a.filter(x=>o=="=="?x.d[f]==v:o=="in"?v.includes(x.d[f]):o==">="?x.d[f]>=v:true);if(this.ob){const[f,d]=this.ob;a=a.filter(x=>x.d[f]!==undefined).sort((x,y)=>(x.d[f]>y.d[f]?1:x.d[f]<y.d[f]?-1:0)*(d=="desc"?-1:1))}if(this.lim)a=a.slice(0,this.lim);return{docs:a.map(x=>({id:x.id,exists:true,data:()=>x.d}))}},
 async get(){if(!can("list",this.c,null,null,null,this.fs))throw deny("list",this.c);return this.run()},
 onSnapshot(f,er){if(!can("list",this.c,null,null,null,this.fs)){window.__denied.push("list "+this.c);setTimeout(()=>er&&er(deny("list",this.c)),0);return()=>{}}const g=()=>f(this.run());subs.push(g);setTimeout(g,0);return()=>{}},
 doc(id){const c=this.c;id=id||Math.random().toString(36).slice(2);const cur=()=>D[c]&&D[c][id];return{id,
  async get(){if(!can("get",c,id,null,cur()))throw deny("get",c,id);return snapDoc(c,id)},
  async set(v,o){const ex=cur(),op=ex?"update":"create";let nv=v;if(o&&o.merge){nv={...(ex||{})};for(const k in v)nv[k]=v[k]&&v[k].__inc!=null?(nv[k]||0)+v[k].__inc:v[k]}if(!can(op,c,id,nv,ex))throw deny(op,c,id);(D[c]=D[c]||{})[id]=nv;save();if(window.__lag)await new Promise(r=>setTimeout(r,window.__lag))},
  async update(v){const ex=cur();if(!ex)throw Error("no doc");if(!can("update",c,id,{...ex,...v},ex))throw deny("update",c,id);Object.assign(ex,v);save()},
  async delete(){if(!can("delete",c,id,null,cur()))throw deny("delete",c,id);if(D[c])delete D[c][id];save()},
  onSnapshot(f,er){if(!can("get",c,id,null,cur())){setTimeout(()=>er&&er(deny("get",c,id)),0);return}const g=()=>f(snapDoc(c,id));subs.push(g);setTimeout(g,0)}}},
 async add(v){const r=this.doc();await r.set(v);return r}};
const auth={get currentUser(){const u=LS("fsu");return u&&{...u,async reauthenticateWithCredential(c){const US=LS("fsus")||{};if(!US[u.email]||US[u.email].p!=c.p)throw{code:"auth/wrong-password"}},async updatePassword(p){if(p.length<6)throw{code:"auth/weak-password"};const US=LS("fsus");US[u.email].p=p;SV("fsus",US)}}},onAuthStateChanged(f){setTimeout(()=>f(LS("fsu")),0);return()=>{}},
 async createUserWithEmailAndPassword(e,p){const U=LS("fsus")||{};if(U[e])throw{code:"auth/email-already-in-use"};U[e]={p,uid:"u"+Object.keys(U).length};SV("fsus",U);const user={uid:U[e].uid,email:e};SV("fsu",user);return{user}},
 async signInWithEmailAndPassword(e,p){const U=LS("fsus")||{};if(!U[e]||U[e].p!=p)throw{code:"auth/invalid-credential"};SV("fsu",{uid:U[e].uid,email:e})},async signOut(){localStorage.removeItem("fsu")}};
const fsf=()=>({collection:c=>new Q(c),async enablePersistence(){}});fsf.FieldValue={increment:n=>({__inc:n})};const af=()=>auth;af.EmailAuthProvider={credential:(e,p)=>({e,p})};
window.firebase={initializeApp(){},firestore:fsf,auth:af};window.__raw=()=>D;window.__seed=(c,id,v)=>{(D[c]=D[c]||{})[id]=v;save()}})();
