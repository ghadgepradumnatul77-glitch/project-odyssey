const fs=require('node:fs');const path=require('node:path');const{spawnSync}=require('node:child_process');const{copyGeneratedPrisma,validateRuntime}=require('./copy-generated-prisma.cjs');
const apiRoot=path.resolve(__dirname,'..'),buildsRoot=path.join(apiRoot,'.runtime-builds');
function atomicWriteJson(target,value){const temporary=target+'.tmp-'+process.pid;fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx'});fs.renameSync(temporary,target)}
function buildRuntime(){
 fs.mkdirSync(buildsRoot,{recursive:true});const buildId=Date.now()+'-'+process.pid,staging=path.join(buildsRoot,'.staging-'+buildId),published=path.join(buildsRoot,buildId),tsc=path.join(apiRoot,'node_modules','typescript','bin','tsc');
 try{const compile=spawnSync(process.execPath,[tsc,'--outDir',staging],{cwd:apiRoot,stdio:'inherit',env:process.env});if(compile.error)throw compile.error;if(compile.status!==0)throw new Error('TypeScript compilation failed with exit code '+compile.status+'.');if(!fs.existsSync(path.join(staging,'server.js')))throw new Error('Compiled runtime is missing server.js.');
  copyGeneratedPrisma(undefined,path.join(staging,'generated','prisma'));validateRuntime(path.join(staging,'generated','prisma'),'Packaged Prisma runtime');fs.renameSync(staging,published);atomicWriteJson(path.join(buildsRoot,'current.json'),{buildId,createdAt:new Date().toISOString()});console.log('Published immutable API runtime '+buildId+'.');return published;
 }catch(error){fs.rmSync(staging,{recursive:true,force:true});throw error}
}
if(require.main===module)try{buildRuntime()}catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1}
module.exports={atomicWriteJson,buildRuntime,buildsRoot};
