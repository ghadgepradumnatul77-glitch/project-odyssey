export const SYNTHETIC_WARNING='SYNTHETIC DEMONSTRATION DATA — NOT AN OFFICIAL GOVERNMENT POLICY';
export const G6={
 scenario:'University Road Flyover — Structural Deterioration',assetCode:'DEMO-FLYOVER-001',assetName:'University Road Flyover — Demonstration Asset',reportTitle:'DEMO: University Road Flyover structural deterioration',
 policy:{code:'DEMO-INFRA-SAFETY-001',version:1,title:'DEMONSTRATION Infrastructure Safety Policy'},
 actions:[
  {code:'ACT_DEMO_STRUCTURAL_INSPECTION',title:'Conduct authorized engineering inspection',classification:'MANDATORY'},
  {code:'ACT_DEMO_TRAFFIC_ASSESSMENT',title:'Prepare traffic-management assessment',classification:'RECOMMENDED'},
  {code:'ACT_DEMO_REPAIR_PLANNING',title:'Prepare engineering repair proposal',classification:'OPTIONAL'},
  {code:'ACT_DEMO_UNGOVERNED_INTERVENTION',title:'Undocumented operational intervention',classification:'PROHIBITED'}
 ],
 templates:[
  {code:'EXEC_DEMO_STRUCTURAL_INSPECTION',actionCode:'ACT_DEMO_STRUCTURAL_INSPECTION',title:'Demonstration inspection workflow'},
  {code:'EXEC_DEMO_TRAFFIC_ASSESSMENT',actionCode:'ACT_DEMO_TRAFFIC_ASSESSMENT',title:'Demonstration traffic assessment workflow'}
 ]
} as const;
export function isSyntheticGovernanceCode(code:string){return code.startsWith('DEMO-')||code.startsWith('ACT_DEMO_')||code.startsWith('EXEC_DEMO_');}
