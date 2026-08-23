const fs = require('node:fs');
const path = require('node:path');
const REQUIRED_RUNTIME_FILES = ['index.js','index.d.ts','package.json','schema.prisma','runtime/library.js'];
function validateRuntime(directory,label){for(const relative of REQUIRED_RUNTIME_FILES)if(!fs.existsSync(path.join(directory,relative)))throw new Error(label+' is incomplete: missing '+relative+' in '+directory+'.');}
function copyGeneratedPrisma(source=path.resolve(__dirname,'../src/generated/prisma'),target=path.resolve(__dirname,'../dist/generated/prisma')){
 validateRuntime(source,'Generated Prisma source');fs.mkdirSync(path.dirname(target),{recursive:true});
 const stamp=process.pid+'-'+Date.now(),staging=target+'.staging-'+stamp,previous=target+'.previous-'+stamp;let moved=false;
 try{
  fs.cpSync(source,staging,{recursive:true,force:false,errorOnExist:true,filter:(entry)=>!/[.]tmp\d+$/.test(path.basename(entry))});validateRuntime(staging,'Staged Prisma runtime');
  if(fs.existsSync(target)){try{fs.renameSync(target,previous);moved=true}catch(error){throw new Error('PRISMA_RUNTIME_IN_USE: cannot replace '+target+'. A process may be using that runtime. Stop only the confirmed JanSeva API process, then rebuild.',{cause:error})}}
  fs.renameSync(staging,target);validateRuntime(target,'Packaged Prisma runtime');if(moved)fs.rmSync(previous,{recursive:true,force:true});return target;
 }catch(error){fs.rmSync(staging,{recursive:true,force:true});if(moved&&!fs.existsSync(target)&&fs.existsSync(previous))fs.renameSync(previous,target);throw error}
}
if(require.main===module){const flag=process.argv.indexOf('--target'),target=flag>=0?path.resolve(process.argv[flag+1]):undefined;try{console.log('Prisma runtime copied to '+copyGeneratedPrisma(undefined,target)+'.')}catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1}}
module.exports={REQUIRED_RUNTIME_FILES,copyGeneratedPrisma,validateRuntime};
