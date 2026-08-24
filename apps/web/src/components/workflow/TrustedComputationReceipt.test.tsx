import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../../auth/AuthProvider';
import TrustedComputationReceipt from './TrustedComputationReceipt';

const auth:AuthContextValue={user:{id:'u',name:'Officer',email:'o@test',employeeCode:'E',designation:'Engineer',role:'OFFICER',status:'ACTIVE',departmentId:'d',jurisdictionId:'j'},token:'token',organization:null,isAuthenticated:true,authStatus:'authenticated',sessionMessage:null,login:vi.fn(),logout:vi.fn()};
const response=(data:unknown,ok=true)=>Promise.resolve(new Response(JSON.stringify(ok?{success:true,data}:{success:false,error:{message:'Denied'}}),{status:ok?200:403,headers:{'Content-Type':'application/json'}}));
afterEach(()=>vi.unstubAllGlobals());

describe('TrustedComputationReceipt',()=>{
  it('renders truthful local provenance and verifies without a hardware claim',async()=>{
    const receipt={status:'AVAILABLE',assessmentId:'a',receipt:{id:'r',receiptVersion:'ODYSSEY_TRUSTED_COMPUTATION_RECEIPT_V1',computationType:'DETERMINISTIC_RISK_ASSESSMENT',inputContractVersion:'ODYSSEY_RISK_TRUSTED_INPUT_V1',inputFingerprint:`sha256:${'a'.repeat(64)}`,computationVersion:'ODYSSEY_RISK_V1',providerId:'ODYSSEY_LOCAL_VERIFIED_V1',runtimeTrustLevel:'LOCAL_VERIFIED',resultFingerprint:`sha256:${'b'.repeat(64)}`,executedAt:'2026-08-24',attestationState:'NOT_AVAILABLE',attestationReference:null,createdAt:'2026-08-24'}};
    vi.stubGlobal('fetch',vi.fn((_url:string,init?:RequestInit)=>init?.method==='POST'?response({status:'VALID',assessmentId:'a',verifiedAt:'2026-08-24'}):response(receipt)));
    render(<AuthContext.Provider value={auth}><TrustedComputationReceipt assessmentId="a"/></AuthContext.Provider>);
    fireEvent.click(await screen.findByText('Locally verified computation'));
    expect(screen.getByText('LOCAL_VERIFIED')).toBeInTheDocument();
    expect(screen.getByText(/Local verification is not hardware-backed TEE attestation/)).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Verify computation'}));
    await waitFor(()=>expect(screen.getByRole('status')).toHaveTextContent('VALID'));
  });
  it('renders a controlled legacy missing-receipt state',async()=>{
    vi.stubGlobal('fetch',vi.fn(()=>response({status:'RECEIPT_MISSING',assessmentId:'a',receipt:null})));
    render(<AuthContext.Provider value={auth}><TrustedComputationReceipt assessmentId="a"/></AuthContext.Provider>);
    expect(await screen.findByText('Legacy assessment')).toBeInTheDocument();
  });
  it('renders controlled API failure',async()=>{
    vi.stubGlobal('fetch',vi.fn(()=>response({},false)));
    render(<AuthContext.Provider value={auth}><TrustedComputationReceipt assessmentId="a"/></AuthContext.Provider>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Computation provenance unavailable');
  });
});
