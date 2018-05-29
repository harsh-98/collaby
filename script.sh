rm -rf tmp
mkdir tmp
yarn build
mv build tmp/
cp server-websocket.js tmp/
cp ../package.json ../package-lock.json .eslintrc .babelrc server.js tmp/
#cp ../package.json  .eslintrc .babelrc tmp/
cd tmp
#npm install
#mv node_modules  package-lock.json ../..
ln -s /home/harsh/BACKUP/timepass/node_modules /home/harsh/BACKUP/timepass/hackathon/tmp/node_modules
npm run  server
