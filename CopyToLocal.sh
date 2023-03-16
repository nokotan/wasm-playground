#!/bin/bash

cd dist
sed -i -e 's|wasm-playground.kamenokosoft.com|localhost:8080|g' index.html
sed -i -e 's|wasm-playground.kamenokosoft.com|localhost:8080|g' config.js
sed -i -e "s|https://wasm-playground.kamenokosoft.com/callback|https://localhost:8080/callback|g" extensions/github-authentication/dist/browser/extension.js
