export type ProcessHealthState='STARTING'|'READY'|'SHUTTING_DOWN';
let state:ProcessHealthState='STARTING';
export const getProcessHealthState=()=>state;
export const setProcessHealthState=(next:ProcessHealthState)=>{state=next};
export const resetProcessHealthStateForTests=()=>{state='STARTING'};
