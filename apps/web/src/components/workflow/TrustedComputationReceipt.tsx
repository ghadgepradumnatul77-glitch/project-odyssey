import { useEffect, useState } from 'react';
import { getComputationReceipt, verifyComputation, type ComputationReceiptResponse, type ComputationVerificationResponse } from '../../api/workflow.api';
import { useAuth } from '../../auth/useAuth';

export default function TrustedComputationReceipt({ assessmentId }: { assessmentId: string }) {
  const { token: accessToken } = useAuth();
  const [result,setResult]=useState<ComputationReceiptResponse|null>(null);
  const [verification,setVerification]=useState<ComputationVerificationResponse|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{ const controller=new AbortController(); if(accessToken) getComputationReceipt(assessmentId,accessToken,controller.signal).then(setResult).catch((cause)=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Receipt unavailable.');}); return()=>controller.abort(); },[accessToken,assessmentId]);
  if(error)return <p className="section-note" role="alert">Computation provenance unavailable: {error}</p>;
  if(!result)return <p className="section-note">Loading computation provenance…</p>;
  if(result.status==='RECEIPT_MISSING')return <div className="governance-note"><strong>Legacy assessment</strong><p>No computation receipt is available for this historical assessment.</p></div>;
  if(result.status!=='AVAILABLE'||!result.receipt)return <p className="section-note">Computation provenance unavailable.</p>;
  const receipt=result.receipt!;
  const verify=async()=>{if(!accessToken)return;setError('');try{setVerification(await verifyComputation(assessmentId,accessToken));}catch(cause){setError(cause instanceof Error?cause.message:'Verification unavailable.');}};
  return <details className="governance-note"><summary>Locally verified computation</summary><p>This result was reproducibly verified by ODYSSEY&apos;s local trusted-computation provider. Local verification is not hardware-backed TEE attestation.</p><dl><dt>Provider</dt><dd>{receipt.providerId}</dd><dt>Runtime trust</dt><dd>{receipt.runtimeTrustLevel}</dd><dt>Risk version</dt><dd>{receipt.computationVersion}</dd><dt>Input fingerprint</dt><dd><code>{receipt.inputFingerprint}</code></dd><dt>Result fingerprint</dt><dd><code>{receipt.resultFingerprint}</code></dd><dt>Hardware attestation</dt><dd>Not available</dd></dl><button type="button" className="secondary-button" onClick={verify}>Verify computation</button>{verification&&<p role="status">Verification: <strong>{verification.status}</strong></p>}</details>;
}
