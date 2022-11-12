npm i
npm run build
rm -f package.json
mv package_express.json package.json
zip -9 -r nodeMyAdmin.zip lib/ server.js package.json