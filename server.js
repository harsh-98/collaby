const server=require('node-http-server');

server.beforeServe=beforeServe;
let rootDir = __dirname+"/build/";
function beforeServe(request,response,body,encoding){
    // console.log(request.headers);
    return;
}

server.deploy(
    {
        port:8080,
        root:rootDir
    }
);
