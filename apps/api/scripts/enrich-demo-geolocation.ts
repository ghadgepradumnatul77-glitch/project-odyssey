import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '../src/generated/prisma/index.js';
import { assertNonProductionMutation } from './runtime-safety';
const prisma = new PrismaClient();

export type DemoCoordinate = { latitude:number;longitude:number;rationale:string };
export type DemoAssetManifestItem = DemoCoordinate & { assetCode:string;name:string;assetType:'BRIDGE'|'ROAD'|'FLYOVER' };
export type DemoReportManifestItem = DemoCoordinate & { title:string;locationText:string;category:string };
export const DEMO_ASSET_COORDINATES:readonly DemoAssetManifestItem[]=[
  {assetCode:'BR-101',name:'Pune River Bridge',assetType:'BRIDGE',latitude:18.5204,longitude:73.8567,rationale:'Existing central Pune demonstration coordinate; retained unchanged.'},
  {assetCode:'BR-204',name:'Mula River Bridge',assetType:'BRIDGE',latitude:18.5635,longitude:73.8077,rationale:'Representative Mula river crossing in north-west Pune.'},
  {assetCode:'FL-301',name:'University Road Flyover',assetType:'FLYOVER',latitude:18.5535,longitude:73.8242,rationale:'Representative University Road corridor point.'},
  {assetCode:'RD-410',name:'Sassoon Hospital Approach Road',assetType:'ROAD',latitude:18.5284,longitude:73.8744,rationale:'Representative approach-road point near the Sassoon hospital district.'},
  {assetCode:'BR-212',name:'Khadakwasla Bridge',assetType:'BRIDGE',latitude:18.4399,longitude:73.7758,rationale:'Representative Khadakwasla-area crossing south-west of central Pune.'},
  {assetCode:'RD-118',name:'Aundh Local Connector',assetType:'ROAD',latitude:18.5590,longitude:73.8072,rationale:'Representative local connector point in Aundh.'},
  {assetCode:'FL-509',name:'Hadapsar Flyover',assetType:'FLYOVER',latitude:18.5018,longitude:73.9251,rationale:'Representative Hadapsar transport-corridor point.'},
  {assetCode:'RD-330',name:'Sinhagad Road Drainage Corridor',assetType:'ROAD',latitude:18.4770,longitude:73.8263,rationale:'Representative Sinhagad Road drainage-corridor point.'}
] as const;
export const DEMO_PUBLIC_REPORT_COORDINATES:readonly DemoReportManifestItem[]=[
  {title:'Potholes near Nagar Road junction',locationText:'Nagar Road junction, Pune',category:'ROAD_DAMAGE',latitude:18.5617,longitude:73.9140,rationale:'Representative Nagar Road junction point.'},
  {title:'Waterlogging near Kharadi underpass',locationText:'Kharadi underpass, Pune',category:'WATERLOGGING',latitude:18.5516,longitude:73.9394,rationale:'Representative Kharadi underpass point.'},
  {title:'Streetlight outage on public road',locationText:'Aundh Road, Pune',category:'STREETLIGHT',latitude:18.5700,longitude:73.8100,rationale:'Representative Aundh Road point.'},
  {title:'Drainage blockage near Hadapsar',locationText:'Hadapsar, Pune',category:'DRAINAGE',latitude:18.5080,longitude:73.9260,rationale:'Representative Hadapsar roadside-drain point; intentionally not moved to its separately routed demo Asset.'},
  {title:'Flyover surface deterioration',locationText:'University Road flyover, Pune',category:'BRIDGE_OR_FLYOVER',latitude:18.5538,longitude:73.8246,rationale:'Representative point close to, but not identical with, the linked University Road Flyover.'},
  {title:'Public building maintenance issue',locationText:'Shivajinagar, Pune',category:'PUBLIC_BUILDING',latitude:18.5312,longitude:73.8446,rationale:'Representative Shivajinagar civic-area point.'}
] as const;

export type GeoRecord={id:string;latitude:unknown;longitude:unknown;[key:string]:unknown};
export type GeoAction={kind:'asset'|'public-report';id:string;label:string;action:'REUSE'|'SET COORDINATES'|'SKIP'|'CONFLICT';latitude:number;longitude:number;message:string};
export type GeoPlan={actions:GeoAction[];assetsToEnrich:number;reportsToEnrich:number;alreadyMapped:number;skipped:number;conflicts:number};
export interface DemoGeoStore{listAssets():Promise<GeoRecord[]>;listReports():Promise<GeoRecord[]>;apply(updates:{kind:'asset'|'public-report';id:string;latitude:number;longitude:number}[]):Promise<void>}
const numberOrNull=(value:unknown)=>value===null||value===undefined?null:Number(value);
const same=(a:number,b:number)=>Math.abs(a-b)<0.0000005;
function coordinateAction(record:GeoRecord,expected:DemoCoordinate,base:Omit<GeoAction,'action'|'message'>):GeoAction{
  const latitude=numberOrNull(record.latitude),longitude=numberOrNull(record.longitude);
  if(latitude===null&&longitude===null)return{...base,action:'SET COORDINATES',message:expected.rationale};
  if(latitude!==null&&longitude!==null&&same(latitude,expected.latitude)&&same(longitude,expected.longitude))return{...base,action:'REUSE',message:'Existing coordinates match the synthetic demo manifest.'};
  return{...base,action:'CONFLICT',message:'Existing coordinates are incomplete or differ from the synthetic demo manifest; no overwrite is allowed.'};
}
export function assertGeoMutationAllowed(env:NodeJS.ProcessEnv,dryRun:boolean){assertNonProductionMutation(env,'synthetic demo geolocation enrichment',dryRun);}
export function createDemoGeoPlan(assets:GeoRecord[],reports:GeoRecord[]):GeoPlan{
  const actions:GeoAction[]=[];
  for(const expected of DEMO_ASSET_COORDINATES){const matches=assets.filter((item)=>item.assetCode===expected.assetCode);const base={kind:'asset' as const,id:matches[0]?.id??'',label:`${expected.assetCode} ${expected.name}`,latitude:expected.latitude,longitude:expected.longitude};if(matches.length!==1){actions.push({...base,action:matches.length?'CONFLICT':'SKIP',message:matches.length?'Multiple Assets use this controlled demo code.':'Expected demo Asset is missing.'});continue;}const record=matches[0];if(record.name!==expected.name||record.assetType!==expected.assetType){actions.push({...base,action:'CONFLICT',message:'Stable Asset name or type differs from the demo manifest.'});continue;}actions.push(coordinateAction(record,expected,base));}
  for(const expected of DEMO_PUBLIC_REPORT_COORDINATES){const matches=reports.filter((item)=>item.title===expected.title);const label=matches[0]?.reportNumber?`${String(matches[0].reportNumber)} ${expected.title}`:expected.title;const base={kind:'public-report' as const,id:matches[0]?.id??'',label,latitude:expected.latitude,longitude:expected.longitude};if(matches.length!==1){actions.push({...base,action:matches.length?'CONFLICT':'SKIP',message:matches.length?'Multiple Public Reports use this controlled demo title.':'Expected demo Public Report is missing.'});continue;}const record=matches[0];if(record.locationText!==expected.locationText||record.category!==expected.category){actions.push({...base,action:'CONFLICT',message:'Stable Public Report location or category differs from the demo manifest.'});continue;}actions.push(coordinateAction(record,expected,base));}
  return{actions,assetsToEnrich:actions.filter((x)=>x.kind==='asset'&&x.action==='SET COORDINATES').length,reportsToEnrich:actions.filter((x)=>x.kind==='public-report'&&x.action==='SET COORDINATES').length,alreadyMapped:actions.filter((x)=>x.action==='REUSE').length,skipped:actions.filter((x)=>x.action==='SKIP').length,conflicts:actions.filter((x)=>x.action==='CONFLICT').length};
}
export async function runDemoGeo(store:DemoGeoStore,{dryRun,env=process.env,write=console.log}:{dryRun:boolean;env?:NodeJS.ProcessEnv;write?:(line:string)=>void}){
  assertGeoMutationAllowed(env,dryRun);const plan=createDemoGeoPlan(await store.listAssets(),await store.listReports());
  write('SYNTHETIC DEMO COORDINATES — representative test locations only; not surveyed or operational GIS data.');
  for(const item of plan.actions)write(`${item.action} ${item.kind==='asset'?'Asset':'Public Report'} ${item.label} ${item.latitude.toFixed(4)},${item.longitude.toFixed(4)} — ${item.message}`);
  write(`Assets to enrich: ${plan.assetsToEnrich}`);write(`Public Reports to enrich: ${plan.reportsToEnrich}`);write(`Already mapped: ${plan.alreadyMapped}`);write(`Skipped: ${plan.skipped}`);write(`Conflicts: ${plan.conflicts}`);
  if(plan.conflicts)throw new Error('Demo geolocation conflict detected. No coordinates were changed.');
  if(!dryRun)await store.apply(plan.actions.filter((x)=>x.action==='SET COORDINATES').map(({kind,id,latitude,longitude})=>({kind,id,latitude,longitude})));
  return plan;
}
export const prismaDemoGeoStore:DemoGeoStore={
  listAssets:()=>prisma.asset.findMany({select:{id:true,assetCode:true,name:true,assetType:true,latitude:true,longitude:true}}),
  listReports:()=>prisma.publicReport.findMany({select:{id:true,reportNumber:true,title:true,locationText:true,category:true,latitude:true,longitude:true}}),
  apply:async(updates)=>{await prisma.$transaction(updates.map((item)=>item.kind==='asset'?prisma.asset.update({where:{id:item.id},data:{latitude:item.latitude,longitude:item.longitude},select:{id:true}}):prisma.publicReport.update({where:{id:item.id},data:{latitude:item.latitude,longitude:item.longitude},select:{id:true}})));}
};
async function main(){const dryRun=process.argv.includes('--dry-run');await runDemoGeo(prismaDemoGeoStore,{dryRun});if(dryRun)console.log('DRY RUN — zero database mutations performed.');else console.log('Synthetic demo geolocation enrichment completed.');}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch((error)=>{console.error(error instanceof Error?error.message:'Demo geolocation enrichment failed.');process.exitCode=1;}).finally(()=>prisma.$disconnect());
