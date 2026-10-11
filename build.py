#!/usr/bin/env python3
"""Arma index.html uniendo, en orden, las partes de src/. Uso: python3 build.py  (o --check para verificar)."""
import sys
partes=[l.strip() for l in open("src/ORDEN.txt",encoding="utf-8") if l.strip()]
out="\n".join(open("src/"+p,encoding="utf-8").read() for p in partes)
if "--check" in sys.argv:
    ok=open("index.html",encoding="utf-8").read()==out
    print("index.html al día" if ok else "index.html NO coincide con src/: correr python3 build.py");sys.exit(0 if ok else 1)
open("index.html","w",encoding="utf-8").write(out);print("index.html armado:",len(out),"caracteres,",len(partes),"partes")
