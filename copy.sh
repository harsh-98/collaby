rm -rf tmp/node_modules
find tmp/ -type f -exec sed -i "s_http\://localhost\:1234_https\://websocket.cantilever10.hasura-app.io_" {} \;
rm -rf /home/harsh/BACKUP/hnodejs/microservices/api/src
cp -r tmp/ /home/harsh/BACKUP/hnodejs/microservices/api/src/
cp ../Dockerfile ../k8s.yaml /home/harsh/BACKUP/hnodejs/microservices/api/
cd /home/harsh/BACKUP/hnodejs/
git add .
git commit -m "commit"
#git remote add hasura ssh://hasura@cantilever10.hasura-app.io:2236/~/git/cogent62
git push  hasura master
