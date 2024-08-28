#!/bin/sh
npm run develop:client
while [ ! -f public/bundle.js ]
do
  sleep 1
done
nodemon --watch public/bundle.js public/bundle.js
