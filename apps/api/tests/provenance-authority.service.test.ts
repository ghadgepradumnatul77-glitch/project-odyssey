import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({create:vi.fn(),duplicate:vi.fn(),event:vi.fn()}));
vi.mock('../src/lib/prisma',()=>({default:{user:{findUnique:async()=>({id:'u',departmentId:'d',jurisdictionId:'j'})},department:{findUnique:async()=>({id:'d'})},jurisdiction:{findUnique:async()=>({id:'j',departmentId:'d'})},$transaction:async(fn:any)=>fn({approvalAuthority:{findFirst:m.duplicate,create:m.create}})}}));
vi.mock('../src/modules/integrity/integrity.service',()=>({appendIntegrityEvent:m.event}));
import {createApprovalAuthority} from '../src/modules/authorities/authority.service';
beforeEach(()=>{vi.clearAllMocks();m.duplicate.mockResolvedValue(null);m.create.mockImplementation(async({data})=>({...data,id:'g',createdAt:new Date()}));});
it.each([{}, {canDeclareOperationalProvenance:true},{canDeclareNonOperationalProvenance:true}])('creates only explicitly granted capabilities',async capabilities=>{
 const result=await createApprovalAuthority({userId:'u',departmentId:'d',jurisdictionId:'j',canApprove:true,...capabilities},{id:'admin',role:'SYSTEM_ADMIN'} as any);
 expect(result.canDeclareOperationalProvenance).toBe('canDeclareOperationalProvenance' in capabilities);
 expect(result.canDeclareNonOperationalProvenance).toBe('canDeclareNonOperationalProvenance' in capabilities);
 expect(result.canApprove).toBe(true);expect(result.canCloseCase).toBe(false);
 expect(m.event.mock.calls[0][1].facts).toMatchObject({canDeclareOperationalProvenance:result.canDeclareOperationalProvenance,canDeclareNonOperationalProvenance:result.canDeclareNonOperationalProvenance});
});
it('does not silently upgrade an existing active grant',async()=>{m.duplicate.mockResolvedValue({id:'old'});await expect(createApprovalAuthority({userId:'u',departmentId:'d',jurisdictionId:'j',canDeclareOperationalProvenance:true},{id:'admin'} as any)).rejects.toMatchObject({code:'ACTIVE_AUTHORITY_EXISTS'});expect(m.create).not.toHaveBeenCalled();});
