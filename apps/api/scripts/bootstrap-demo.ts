import 'dotenv/config';
import { assertNonProductionMutation } from './runtime-safety';
import { pathToFileURL } from 'node:url';

export type TargetStage = 'NEW'|'INSPECTION_IN_PROGRESS'|'RISK_ONLY'|'AWAITING_REVIEW'|'APPROVED'|'EXECUTION'|'VERIFICATION'|'CLOSED';
export const TARGET_ORDER: TargetStage[] = ['NEW','INSPECTION_IN_PROGRESS','RISK_ONLY','AWAITING_REVIEW','APPROVED','EXECUTION','VERIFICATION','CLOSED'];
export const REQUIRED_SECRETS = [
  'ODYSSEY_DEMO_ADMIN_PASSWORD','ODYSSEY_DEMO_OFFICER_PRIMARY_PASSWORD','ODYSSEY_DEMO_OFFICER_VERIFIER_PASSWORD',
  'ODYSSEY_DEMO_OFFICER_CLOSER_PASSWORD','ODYSSEY_DEMO_POLICY_ADMIN_PASSWORD','ODYSSEY_DEMO_AUDITOR_PASSWORD'
] as const;

type InspectionInput = { structuralCondition:string; crackSeverity:string; corrosionLevel:string; trafficImportance:string; hospitalRoute:boolean; weatherRisk:string; heavyRainExpected:boolean; estimatedDailyUsers:number };
type Scenario = { asset:{assetCode:string;name:string;assetType:'BRIDGE'|'ROAD'|'FLYOVER'}; caseNumber:string; title:string; target:TargetStage; inspection:InspectionInput };
export const scenarios: Scenario[] = [
  {asset:{assetCode:'BR-101',name:'Pune River Bridge',assetType:'BRIDGE'},caseNumber:'CASE-BR101-001',title:'Structural Crack Observed on BR-101',target:'EXECUTION',inspection:{structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'MODERATE',trafficImportance:'HIGH',hospitalRoute:true,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:42000}},
  {asset:{assetCode:'BR-204',name:'Mula River Bridge',assetType:'BRIDGE'},caseNumber:'CASE-BR204-002',title:'Mula River Bridge critical review',target:'VERIFICATION',inspection:{structuralCondition:'CRITICAL',crackSeverity:'MODERATE',corrosionLevel:'HIGH',trafficImportance:'CRITICAL',hospitalRoute:false,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:55000}},
  {asset:{assetCode:'FL-301',name:'University Road Flyover',assetType:'FLYOVER'},caseNumber:'CASE-FL301-003',title:'University Road Flyover cracking',target:'APPROVED',inspection:{structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'HIGH',trafficImportance:'HIGH',hospitalRoute:false,weatherRisk:'MEDIUM',heavyRainExpected:false,estimatedDailyUsers:36000}},
  {asset:{assetCode:'RD-410',name:'Sassoon Hospital Approach Road',assetType:'ROAD'},caseNumber:'CASE-RD410-004',title:'Sassoon Hospital approach deterioration',target:'AWAITING_REVIEW',inspection:{structuralCondition:'FAIR',crackSeverity:'MODERATE',corrosionLevel:'LOW',trafficImportance:'HIGH',hospitalRoute:true,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:28000}},
  {asset:{assetCode:'BR-212',name:'Khadakwasla Bridge',assetType:'BRIDGE'},caseNumber:'CASE-BR212-005',title:'Khadakwasla Bridge maintenance condition',target:'INSPECTION_IN_PROGRESS',inspection:{structuralCondition:'FAIR',crackSeverity:'MINOR',corrosionLevel:'MODERATE',trafficImportance:'MEDIUM',hospitalRoute:false,weatherRisk:'MEDIUM',heavyRainExpected:false,estimatedDailyUsers:12000}},
  {asset:{assetCode:'RD-118',name:'Aundh Local Connector',assetType:'ROAD'},caseNumber:'CASE-RD118-006',title:'Aundh local connector pavement condition',target:'NEW',inspection:{structuralCondition:'GOOD',crackSeverity:'NONE',corrosionLevel:'LOW',trafficImportance:'MEDIUM',hospitalRoute:false,weatherRisk:'LOW',heavyRainExpected:false,estimatedDailyUsers:4500}},
  {asset:{assetCode:'FL-509',name:'Hadapsar Flyover',assetType:'FLYOVER'},caseNumber:'CASE-FL509-007',title:'Hadapsar Flyover deterioration',target:'CLOSED',inspection:{structuralCondition:'POOR',crackSeverity:'MODERATE',corrosionLevel:'HIGH',trafficImportance:'CRITICAL',hospitalRoute:true,weatherRisk:'SEVERE',heavyRainExpected:true,estimatedDailyUsers:50000}},
  {asset:{assetCode:'RD-330',name:'Sinhagad Road Drainage Corridor',assetType:'ROAD'},caseNumber:'CASE-RD330-008',title:'Sinhagad Road drainage damage',target:'RISK_ONLY',inspection:{structuralCondition:'FAIR',crackSeverity:'MODERATE',corrosionLevel:'MODERATE',trafficImportance:'MEDIUM',hospitalRoute:false,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:18000}}
];
export const publicReportScenarios=[
 {title:'Potholes near Nagar Road junction',description:'Multiple potholes are affecting normal traffic movement near the junction.',category:'ROAD_DAMAGE',locationText:'Nagar Road junction, Pune'},
 {title:'Waterlogging near Kharadi underpass',description:'Rainwater is collecting beneath the underpass and obstructing the carriageway.',category:'WATERLOGGING',locationText:'Kharadi underpass, Pune'},
 {title:'Streetlight outage on public road',description:'Several consecutive streetlights are not operating along the public road.',category:'STREETLIGHT',locationText:'Aundh Road, Pune'},
 {title:'Drainage blockage near Hadapsar',description:'A roadside drain appears blocked and water is overflowing during rainfall.',category:'DRAINAGE',locationText:'Hadapsar, Pune'},
 {title:'Flyover surface deterioration',description:'The flyover road surface has visible deterioration requiring government review.',category:'BRIDGE_OR_FLYOVER',locationText:'University Road flyover, Pune'},
 {title:'Public building maintenance issue',description:'Exterior plaster damage is visible on a publicly accessible municipal building.',category:'PUBLIC_BUILDING',locationText:'Shivajinagar, Pune'}
] as const;
export const publicReportDemoPlan = [
  { title:'Potholes near Nagar Road junction', target:'SUBMITTED' },
  { title:'Waterlogging near Kharadi underpass', target:'SUBMITTED' },
  { title:'Streetlight outage on public road', target:'UNDER_REVIEW' },
  { title:'Drainage blockage near Hadapsar', target:'ROUTED', assetCode:'RD-330' },
  { title:'Public building maintenance issue', target:'REJECTED', rejectionReason:'Insufficient location information to identify the affected public building.' },
  { title:'Flyover surface deterioration', target:'ACCEPTED', assetCode:'FL-301', governmentSummary:'Government review identified surface deterioration on the University Road Flyover requiring governed inspection and assessment.' }
] as const;

export const demoUsers = [
  {key:'primary',employeeCode:'ODY-EE-001',name:'Arjun Deshmukh',email:'arjun.deshmukh@odyssey.local',designation:'Executive Engineer',role:'OFFICER',passwordVariable:'ODYSSEY_DEMO_OFFICER_PRIMARY_PASSWORD'},
  {key:'verifier',employeeCode:'ODY-AE-002',name:'Meera Kulkarni',email:'meera.kulkarni@odyssey.local',designation:'Assistant Engineer',role:'OFFICER',passwordVariable:'ODYSSEY_DEMO_OFFICER_VERIFIER_PASSWORD'},
  {key:'closer',employeeCode:'ODY-SE-003',name:'Vikram Joshi',email:'vikram.joshi@odyssey.local',designation:'Superintending Engineer',role:'OFFICER',passwordVariable:'ODYSSEY_DEMO_OFFICER_CLOSER_PASSWORD'},
  {key:'policy',employeeCode:'ODY-PA-001',name:'Ananya Rao',email:'ananya.rao@odyssey.local',designation:'Policy Administrator',role:'POLICY_ADMIN',passwordVariable:'ODYSSEY_DEMO_POLICY_ADMIN_PASSWORD'},
  {key:'auditor',employeeCode:'ODY-AU-001',name:'Kabir Shah',email:'kabir.shah@odyssey.local',designation:'Infrastructure Auditor',role:'AUDITOR',passwordVariable:'ODYSSEY_DEMO_AUDITOR_PASSWORD'}
] as const;

export function missingSecrets(env:NodeJS.ProcessEnv,publicReportsOnly=false){const required=publicReportsOnly?REQUIRED_SECRETS.slice(0,1):REQUIRED_SECRETS;return required.filter((name)=>!env[name]?.trim());}
export function assertMutationAllowed(env:NodeJS.ProcessEnv,dryRun:boolean){assertNonProductionMutation(env,'governed demo bootstrap',dryRun);}
export function compatible(existing:Record<string,any>,expected:Record<string,any>,fields:string[]){return fields.every((field)=>existing[field]===expected[field]);}
export function stageAction(current:TargetStage,target:TargetStage){const a=TARGET_ORDER.indexOf(current),b=TARGET_ORDER.indexOf(target);return a>b?'AHEAD':a===b?'SKIP':'ADVANCE';}
export function hasMatchingEvidence(items:any[],type:string,description:string){return items.some((item)=>item.evidenceType===type&&item.description===description);}
export function assertFourEyes(primaryId:string,verifierId:string,closerId:string){if(new Set([primaryId,verifierId,closerId]).size!==3)throw new Error('Four-eyes actor separation requires three distinct officers.');}
export function shouldIssueMutation(dryRun:boolean,method:string,path:string){return !dryRun||method==='GET'||path==='/auth/login';}
export function createActorAuthenticator(login:(email:string,password:string)=>Promise<string>,env:NodeJS.ProcessEnv){
  const tokens:Record<string,string>={};
  return async (key:'primary'|'verifier'|'closer')=>{
    if(!tokens[key]){const spec=demoUsers.find((item)=>item.key===key)!;tokens[key]=await login(spec.email,env[spec.passwordVariable]!);}
    return tokens[key];
  };
}

class Api {
  private base:string; private dryRun:boolean; private log:(s:string)=>void;
  constructor(base:string,dryRun:boolean,log:(s:string)=>void){this.base=base;this.dryRun=dryRun;this.log=log;}
  private async request(method:string,path:string,token?:string,body?:unknown){
    if(!shouldIssueMutation(this.dryRun,method,path)){this.log(`PLAN ${method} ${path}`);return null;}
    const response=await fetch(`${this.base}${path}`,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    const payload:any=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(`${method} ${path} failed (${response.status}): ${payload?.error?.code??'UNKNOWN_ERROR'} ${payload?.error?.message??''}`.trim());
    return payload.data;
  }
  get(path:string,token:string){return this.request('GET',path,token);} post(path:string,token:string|undefined,body:unknown={}){return this.request('POST',path,token,body);} patch(path:string,token:string,body:unknown){return this.request('PATCH',path,token,body);}
  async login(email:string,password:string){const data=await this.request('POST','/auth/login',undefined,{email,password});return data.accessToken as string;}
}

type Counts={created:number;reused:number;advanced:number;skipped:number;conflicts:number};
const inspectionFields=['structuralCondition','crackSeverity','corrosionLevel','trafficImportance','hospitalRoute','weatherRisk','heavyRainExpected','estimatedDailyUsers'];
function inferStage(item:any,inspections:any[],risks:any[],orps:any[],decisions:any[],plans:any[],closure:any):TargetStage{
  if(closure||item.status==='CLOSED')return'CLOSED'; if(item.status==='VERIFICATION')return'VERIFICATION'; if(plans.length||item.status==='EXECUTION')return'EXECUTION'; if(decisions.some((x)=>x.decisionType==='APPROVED')||item.status==='APPROVED')return'APPROVED'; if(orps.some((x)=>x.status==='AWAITING_REVIEW'))return'AWAITING_REVIEW'; if(risks.length)return'RISK_ONLY'; if(inspections.length)return'INSPECTION_IN_PROGRESS'; return'NEW';
}

async function main(){
  const dryRun=process.argv.includes('--dry-run'); const publicReportsOnly=process.argv.includes('--public-reports-only'); assertMutationAllowed(process.env,dryRun);
  const missing=missingSecrets(process.env,publicReportsOnly); if(missing.length)throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  const base=(process.env.ODYSSEY_API_BASE_URL||'http://localhost:4000/api/v1').replace(/\/$/,'');
  const output:string[]=[]; const say=(s:string)=>{output.push(s);console.log(s);}; const api=new Api(base,dryRun,say); const counts:Counts={created:0,reused:0,advanced:0,skipped:0,conflicts:0};
  say('ODYSSEY DEMO BOOTSTRAP'); say(dryRun?'Mode: DRY RUN':'Mode: MUTATION ENABLED');
  const adminEmail=process.env.ODYSSEY_DEMO_ADMIN_EMAIL?.trim()||'admin@odyssey.local';
  const admin=await api.login(adminEmail,process.env.ODYSSEY_DEMO_ADMIN_PASSWORD!);
  const departments:any[]=await api.get('/departments',admin); let department=departments.find((x)=>x.code==='PWD');
  if(department&&!compatible(department,{name:'Public Works Department',code:'PWD'},['name','code']))throw new Error('CONFLICT department PWD does not match Public Works Department.');
  if(!department){say('CREATE department PWD');department=await api.post('/departments',admin,{name:'Public Works Department',code:'PWD'})??{id:'dry-department',name:'Public Works Department',code:'PWD'};counts.created++;}else{say('REUSE department PWD');counts.reused++;}
  const jurisdictions:any[]=await api.get('/jurisdictions',admin); let jurisdiction=jurisdictions.find((x)=>x.name==='Pune Division'&&x.departmentId===department.id);
  if(!jurisdiction){say('CREATE jurisdiction Pune Division');jurisdiction=await api.post('/jurisdictions',admin,{name:'Pune Division',type:'DIVISION',departmentId:department.id})??{id:'dry-jurisdiction',name:'Pune Division',type:'DIVISION',departmentId:department.id};counts.created++;}else{if(jurisdiction.type!=='DIVISION')throw new Error('CONFLICT jurisdiction Pune Division has an incompatible type.');say('REUSE jurisdiction Pune Division');counts.reused++;}
  let assets:any[]=[];
  if(publicReportsOnly){assets=await api.get('/assets',admin);for(const code of ['RD-330','FL-301']){const asset=assets.find((item)=>item.assetCode===code);if(!asset||asset.departmentId!==department.id||asset.jurisdictionId!==jurisdiction.id)throw new Error(`CONFLICT required existing asset ${code} was not found in the expected organizational scope.`);say(`REUSE asset ${code}`);counts.reused++;}await reconcilePublicReports();finishPublicReports();return;}
  let users:any[]=await api.get('/users',admin); const actors:Record<string,any>={};
  for(const spec of demoUsers){let user=users.find((x)=>x.employeeCode===spec.employeeCode||x.email===spec.email);if(user&&!compatible(user,spec as any,['employeeCode','name','email','designation','role']))throw new Error(`CONFLICT user ${spec.employeeCode} has incompatible identity attributes.`);if(user&&(user.departmentId!==department.id||user.jurisdictionId!==jurisdiction.id))throw new Error(`CONFLICT user ${spec.employeeCode} has incompatible scope.`);if(!user){say(`CREATE user ${spec.employeeCode}`);user=await api.post('/users',admin,{employeeCode:spec.employeeCode,name:spec.name,email:spec.email,designation:spec.designation,role:spec.role,password:process.env[spec.passwordVariable],departmentId:department.id,jurisdictionId:jurisdiction.id})??{...spec,id:`dry-${spec.key}`,departmentId:department.id,jurisdictionId:jurisdiction.id};counts.created++;}else{say(`REUSE user ${spec.employeeCode}`);counts.reused++;}actors[spec.key]=user;}
  assertFourEyes(actors.primary.id,actors.verifier.id,actors.closer.id);
  const authorities:any[]=await api.get('/approval-authorities',admin);
  for(const grant of [{user:actors.verifier,canApprove:true,canCloseCase:false},{user:actors.closer,canApprove:false,canCloseCase:true}]){const active=authorities.find((x)=>x.userId===grant.user.id&&x.departmentId===department.id&&x.jurisdictionId===jurisdiction.id&&x.isActive);if(active){if(active.canApprove!==grant.canApprove||active.canCloseCase!==grant.canCloseCase||active.maxPriorityLevel!=='CRITICAL')throw new Error(`CONFLICT authority for ${grant.user.employeeCode} is insufficient or broader than the manifest.`);say(`REUSE authority ${grant.user.employeeCode}`);counts.reused++;}else{say(`CREATE authority ${grant.user.employeeCode}`);await api.post('/approval-authorities',admin,{userId:grant.user.id,departmentId:department.id,jurisdictionId:jurisdiction.id,canApprove:grant.canApprove,canCloseCase:grant.canCloseCase,maxPriorityLevel:'CRITICAL'});counts.created++;}}
  const actorToken=createActorAuthenticator((email,password)=>api.login(email,password),process.env);
  assets=await api.get('/assets',admin); for(const scenario of scenarios){let asset=assets.find((x)=>x.assetCode===scenario.asset.assetCode);if(asset&&!compatible(asset,scenario.asset,['assetCode','name','assetType']))throw new Error(`CONFLICT asset ${scenario.asset.assetCode}.`);if(asset&&(asset.departmentId!==department.id||asset.jurisdictionId!==jurisdiction.id))throw new Error(`CONFLICT asset ${scenario.asset.assetCode} scope.`);if(!asset){say(`CREATE asset ${scenario.asset.assetCode}`);asset=await api.post('/assets',admin,{...scenario.asset,departmentId:department.id,jurisdictionId:jurisdiction.id})??{...scenario.asset,id:`dry-${scenario.asset.assetCode}`,departmentId:department.id,jurisdictionId:jurisdiction.id};counts.created++;assets.push(asset);}else{say(`REUSE asset ${scenario.asset.assetCode}`);counts.reused++;}}
  await reconcilePublicReports();
  if(publicReportsOnly){finish();return;}
  let cases:any[]=await api.get('/cases',admin); for(const scenario of scenarios){const asset=assets.find((x)=>x.assetCode===scenario.asset.assetCode);let item=cases.find((x)=>x.caseNumber===scenario.caseNumber);if(item&&(!compatible(item,{caseNumber:scenario.caseNumber,title:scenario.title},['caseNumber','title'])||item.assetId!==asset.id))throw new Error(`CONFLICT case ${scenario.caseNumber}.`);if(!item){say(`CREATE case ${scenario.caseNumber}`);item=await api.post('/cases',admin,{caseNumber:scenario.caseNumber,assetId:asset.id,title:scenario.title,description:`Demonstration case for ${scenario.asset.name}.`,emergencyFlag:scenario.inspection.structuralCondition==='CRITICAL'})??{id:`dry-${scenario.caseNumber}`,caseNumber:scenario.caseNumber,title:scenario.title,assetId:asset.id,status:'NEW'};counts.created++;cases.push(item);if(dryRun){for(const stage of TARGET_ORDER.slice(1,TARGET_ORDER.indexOf(scenario.target)+1))say(`ADVANCE ${scenario.caseNumber} -> ${stage}`);continue;}}else{say(`REUSE case ${scenario.caseNumber}`);counts.reused++;}await advance(item,scenario);}
  finish();

  async function advance(item:any,scenario:Scenario){
    let inspections:any[]=await api.get(`/cases/${item.id}/inspections`,admin);let risks:any[]=await api.get(`/cases/${item.id}/risk-assessments`,admin);let orps:any[]=await api.get(`/cases/${item.id}/orps`,admin);let decisions:any[]=await api.get(`/cases/${item.id}/decisions`,admin);let plans:any[]=await api.get(`/cases/${item.id}/execution-plans`,admin);let closure:any=null;try{closure=await api.get(`/cases/${item.id}/closure`,admin);}catch(error){if(!String(error).includes('(404)'))throw error;}
    const current=inferStage(item,inspections,risks,orps,decisions,plans,closure), action=stageAction(current,scenario.target);if(action==='AHEAD'){say(`AHEAD ${scenario.caseNumber}: ${current}; target ${scenario.target}; no rewind`);counts.skipped++;return;}if(action==='SKIP'){say(`SKIP ${scenario.caseNumber}: already ${current}`);counts.skipped++;return;}if(dryRun){for(const stage of TARGET_ORDER.slice(TARGET_ORDER.indexOf(current)+1,TARGET_ORDER.indexOf(scenario.target)+1))say(`ADVANCE ${scenario.caseNumber} -> ${stage}`);return;}
    if(TARGET_ORDER.indexOf(scenario.target)>=1){let inspection=inspections.at(-1);if(inspection&&!compatible(inspection,scenario.inspection as any,inspectionFields))throw new Error(`CONFLICT inspection ${scenario.caseNumber}.`);if(!inspection){say(`ADVANCE ${scenario.caseNumber} -> inspection`);inspection=await api.post('/inspections',await actorToken('primary'),{caseId:item.id,inspectionDate:'2026-08-01T09:00:00.000Z',...scenario.inspection,inspectionNotes:`Governed demo inspection — ${scenario.title}.`});counts.advanced++;inspections=[inspection];}}
    if(TARGET_ORDER.indexOf(scenario.target)>=2){let risk=risks.find((x)=>x.inspectionId===inspections.at(-1).id);if(!risk){say(`ADVANCE ${scenario.caseNumber} -> risk assessment`);risk=await api.post(`/cases/${item.id}/assess-risk`,await actorToken('primary'));counts.advanced++;risks=[risk];}say(`RISK ${scenario.caseNumber}: ${risk.riskScore} ${risk.riskLevel} ${risk.priorityLevel}`);}
    if(TARGET_ORDER.indexOf(scenario.target)>=3){let orp=orps.find((x)=>x.riskAssessmentId===risks.at(-1).id);if(!orp){say(`ADVANCE ${scenario.caseNumber} -> ORP`);orp=await api.post(`/cases/${item.id}/orps`,await actorToken('primary'));counts.advanced++;orps=[orp];}}
    if(TARGET_ORDER.indexOf(scenario.target)>=4){const orp=orps.at(-1);let decision=decisions.find((x)=>x.orpId===orp.id);if(decision&&decision.decisionType!=='APPROVED')throw new Error(`CONFLICT decision ${scenario.caseNumber}.`);if(!decision){say(`ADVANCE ${scenario.caseNumber} -> approved decision`);decision=await api.post(`/orps/${orp.id}/decisions`,await actorToken('verifier'),{decisionType:'APPROVED',remarks:'Governed demo approval after review of persisted evidence and deterministic recommendations.'});counts.advanced++;decisions=[decision];}}
    if(TARGET_ORDER.indexOf(scenario.target)>=5){const orp=orps.at(-1);let plan=plans.find((x)=>x.orpId===orp.id);if(!plan){say(`ADVANCE ${scenario.caseNumber} -> execution plan`);plan=await api.post(`/orps/${orp.id}/execution-plan`,await actorToken('primary'));counts.advanced++;plans=[plan];}plan=await api.get(`/execution-plans/${plan.id}`,admin);if(scenario.target==='EXECUTION'){const task=plan.tasks.find((x:any)=>x.status==='PENDING');if(task){await api.patch(`/execution-tasks/${task.id}/assignment`,await actorToken('primary'),{assigneeId:actors.primary.id});await api.patch(`/execution-tasks/${task.id}/status`,await actorToken('primary'),{status:'IN_PROGRESS'});counts.advanced++;}return;}if(TARGET_ORDER.indexOf(scenario.target)>=6){for(let task of plan.tasks){if(task.status==='PENDING')task=await api.patch(`/execution-tasks/${task.id}/assignment`,await actorToken('primary'),{assigneeId:actors.primary.id});if(task.status==='ASSIGNED'||task.status==='BLOCKED')task=await api.patch(`/execution-tasks/${task.id}/status`,await actorToken('primary'),{status:'IN_PROGRESS'});const description=`Demo execution evidence — ${task.titleSnapshot} completed.`;if(!hasMatchingEvidence(task.evidence||[],'COMPLETION_NOTE',description))await api.post(`/execution-tasks/${task.id}/evidence`,await actorToken('primary'),{evidenceType:'COMPLETION_NOTE',description,documentReference:`DEMO-${scenario.caseNumber}-${task.sequenceNumber}`});if(task.status==='IN_PROGRESS')task=await api.post(`/execution-tasks/${task.id}/submit-completion`,await actorToken('primary'),{completionNote:'Demonstration completion submitted with persisted evidence.'});if(task.status==='COMPLETION_SUBMITTED'){if(task.assignedToId===actors.verifier.id||task.completionSubmittedById===actors.verifier.id)throw new Error(`Four-eyes violation for ${scenario.caseNumber}.`);await api.post(`/execution-tasks/${task.id}/verify`,await actorToken('verifier'),{verificationNote:'Independent demonstration verification completed.'});}counts.advanced++;}}}
    if(scenario.target==='CLOSED'){const plan=(await api.get(`/cases/${item.id}/execution-plans`,admin)).at(-1);const detail=await api.get(`/execution-plans/${plan.id}`,admin);if(detail.tasks.some((x:any)=>x.isMandatory&&(x.assignedToId===actors.closer.id||x.completionSubmittedById===actors.closer.id)))throw new Error(`Closure independence violation for ${scenario.caseNumber}.`);await api.post(`/cases/${item.id}/close`,await actorToken('closer'),{closureReason:'EXECUTION_VERIFIED',closureSummary:'Governed demonstration closure following completed execution, persisted evidence, and independent verification.'});counts.advanced++;}
  }
  function finish(){say('Lifecycle distribution:');for(const target of TARGET_ORDER)say(`${target}: ${scenarios.filter((x)=>x.target===target).map((x)=>x.caseNumber).join(', ')||'none'}`);say(`Created: ${counts.created}`);say(`Reused: ${counts.reused}`);say(`Advanced: ${counts.advanced}`);say(`Skipped: ${counts.skipped}`);say(`Conflicts: ${counts.conflicts}`);}
  function finishPublicReports(){say('Public Report lifecycle distribution:');for(const target of ['SUBMITTED','UNDER_REVIEW','ROUTED','REJECTED','ACCEPTED'])say(`${target}: ${publicReportDemoPlan.filter((item)=>item.target===target).map((item)=>item.title).join(', ')||'none'}`);say(`Created: ${counts.created}`);say(`Reused: ${counts.reused}`);say(`Advanced: ${counts.advanced}`);say(`Skipped: ${counts.skipped}`);say(`Conflicts: ${counts.conflicts}`);}

  async function reconcilePublicReports(){
    let existing:any[]=await api.get('/public-reports',admin);
    for(const expected of publicReportScenarios){
      const plan=publicReportDemoPlan.find((item)=>item.title===expected.title)!;let report=existing.find((item)=>item.title===expected.title);
      if(report){const detail=await api.get(`/public-reports/${report.id}`,admin);if(!compatible(detail,expected as any,['title','description','category','locationText'])){counts.conflicts++;throw new Error(`CONFLICT public report ${expected.title} has incompatible stable attributes.`);}report=detail;say(`REUSE public report ${expected.title}`);counts.reused++;}
      else{say(`CREATE public report ${expected.title}`);const receipt=await api.post('/public-reports',undefined,expected);counts.created++;if(dryRun)report={id:`dry-${expected.title}`,status:'SUBMITTED',department:null,jurisdiction:null,asset:null,createdCase:null};else{existing=await api.get('/public-reports',admin);const summary=existing.find((item)=>item.reportNumber===receipt.reportNumber);if(!summary)throw new Error(`CONFLICT created public report ${expected.title} could not be reconciled.`);report=await api.get(`/public-reports/${summary.id}`,admin);}}
      await advancePublicReport(report,plan);
    }
  }

  async function advancePublicReport(report:any,plan:(typeof publicReportDemoPlan)[number]){
    if(plan.target==='SUBMITTED'){if(report.status==='SUBMITTED')say(`SKIP public report ${plan.title}: remains submitted`);else say(`SKIP public report ${plan.title}: already ${report.status}; no rewind`);counts.skipped++;return;}
    if(report.status==='ACCEPTED'||report.status==='REJECTED'){if(report.status!==plan.target){counts.conflicts++;throw new Error(`CONFLICT public report ${plan.title} is terminal ${report.status}, expected ${plan.target}.`);}say(`SKIP public report ${plan.title}: already ${report.status}`);counts.skipped++;return;}
    if(report.status==='SUBMITTED'){say(`ADVANCE public report ${plan.title} -> UNDER_REVIEW`);const updated=await api.post(`/public-reports/${report.id}/review`,admin);counts.advanced++;if(updated)report=updated;else report={...report,status:'UNDER_REVIEW'};}
    if(plan.target==='UNDER_REVIEW'){say(`SKIP public report ${plan.title}: under review without routing`);counts.skipped++;return;}
    if(plan.target==='REJECTED'){say(`ADVANCE public report ${plan.title} -> REJECTED`);await api.post(`/public-reports/${report.id}/reject`,admin,{reason:plan.rejectionReason});counts.advanced++;return;}
    const asset=assets.find((item)=>item.assetCode===plan.assetCode);if(!asset)throw new Error(`CONFLICT required existing asset ${plan.assetCode} was not found.`);
    if(!report.department||!report.jurisdiction||report.asset?.id!==asset.id){say(`ADVANCE public report ${plan.title} -> ROUTED (${asset.assetCode})`);const updated=await api.patch(`/public-reports/${report.id}/routing`,admin,{departmentId:department.id,jurisdictionId:jurisdiction.id,assetId:asset.id});counts.advanced++;if(updated)report=updated;else report={...report,department,jurisdiction,asset};}
    if(plan.target==='ROUTED'){say(`SKIP public report ${plan.title}: routed and awaiting decision`);counts.skipped++;return;}
    say(`ADVANCE public report ${plan.title} -> ACCEPTED + governed Case`);await api.post(`/public-reports/${report.id}/accept`,admin,{governmentSummary:plan.governmentSummary});counts.advanced++;
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){main().catch((error)=>{console.error(error instanceof Error?error.message:'Demo bootstrap failed.');process.exitCode=1;});}
