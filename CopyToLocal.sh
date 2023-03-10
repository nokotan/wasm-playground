#!/bin/bash

cp index.html vscode/vscode-web
cd vscode/vscode-web
sed -i -e 's|wasm-playground.kamenokosoft.com|localhost:8080|g' index.html
sed -i -e "s|https://wasm-playground.kamenokosoft.com/callback|https://localhost:8080/callback|g" extensions/github-authentication/dist/browser/extension.js

if [ ! -e key.pem ]; then
    openssl genrsa 2048 > key.pem
    openssl req -new -key key.pem > cert.csr
    openssl x509 -days 3650 -req -sha256 -signkey key.pem < cert.csr > cert.pem
fi
