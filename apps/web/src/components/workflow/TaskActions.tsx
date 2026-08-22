import { useEffect, useState, type FormEvent } from 'react';
import {
  assignExecutionTask, changeExecutionTaskStatus, listEligibleExecutionAssignees, recordExecutionEvidence, submitTaskCompletion,
  verifyTaskCompletion, type EligibleAssigneeDto, type EvidenceType, type ExecutionTaskDto,
} from '../../api/workflow.api';
import { useAuth } from '../../auth/useAuth';
import { MutationFeedback } from './MutationFeedback';

type Mode = 'block' | 'cancel' | 'evidence' | 'complete' | 'verify';

export default function TaskActions({ task, onRecorded }: {
  task: ExecutionTaskDto; onRecorded(): Promise<void> | void;
}) {
  const { token, user } = useAuth();
  const [mode, setMode] = useState<Mode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<EligibleAssigneeDto[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [candidateLoading, setCandidateLoading] = useState(task.status === 'PENDING');
  const [candidateError, setCandidateError] = useState<unknown>(null);
  const canVerify = task.status === 'COMPLETION_SUBMITTED'
    && task.completionSubmittedBy?.id !== user?.id;

  useEffect(() => {
    if (!token || task.status !== 'PENDING') return;
    const controller = new AbortController();
    setCandidateLoading(true); setCandidateError(null);
    listEligibleExecutionAssignees(task.id, token, controller.signal)
      .then((items) => { setCandidates(items); setCandidateId(items[0]?.id ?? ''); })
      .catch((failure) => { if (!controller.signal.aborted) setCandidateError(failure); })
      .finally(() => { if (!controller.signal.aborted) setCandidateLoading(false); });
    return () => controller.abort();
  }, [task.id, task.status, token]);

  async function assign() {
    if (!token || !candidateId || submitting) return;
    setSubmitting(true); setError(null); setSuccess(null);
    try { await assignExecutionTask(task.id, candidateId, token); setSuccess('Task assigned to the selected officer.'); await onRecorded(); }
    catch (failure) { setError(failure); } finally { setSubmitting(false); }
  }

  async function status(nextStatus: 'IN_PROGRESS' | 'BLOCKED' | 'CANCELLED', reason?: string) {
    if (!token || submitting) return;
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      await changeExecutionTaskStatus(task.id, { status: nextStatus, reason }, token);
      setSuccess(nextStatus === 'IN_PROGRESS' ? 'Recorded work marked in progress.'
        : nextStatus === 'BLOCKED' ? 'Blocked state recorded.' : 'Optional task cancellation recorded.');
      setMode(null); await onRecorded();
    } catch (failure) { setError(failure); } finally { setSubmitting(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !mode || submitting) return;
    const selectedMode = mode;
    const data = new FormData(event.currentTarget);
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      if (selectedMode === 'block' || selectedMode === 'cancel') {
        await changeExecutionTaskStatus(task.id, {
          status: selectedMode === 'block' ? 'BLOCKED' : 'CANCELLED',
          reason: String(data.get('reason')).trim(),
        }, token);
      } else if (selectedMode === 'complete') {
        await submitTaskCompletion(task.id, String(data.get('note')).trim(), token);
      } else if (selectedMode === 'verify') {
        await verifyTaskCompletion(task.id, String(data.get('note')).trim(), token);
      } else {
        const rawMeasurement = String(data.get('measurementData') ?? '').trim();
        let measurementData: unknown;
        if (rawMeasurement) {
          try { measurementData = JSON.parse(rawMeasurement); }
          catch { setError(new Error('invalid json')); setSubmitting(false); return; }
        }
        await recordExecutionEvidence(task.id, {
          evidenceType: String(data.get('evidenceType')) as EvidenceType,
          description: String(data.get('description')).trim(),
          referenceUrl: String(data.get('referenceUrl') ?? '').trim() || undefined,
          documentReference: String(data.get('documentReference') ?? '').trim() || undefined,
          measurementData, capturedAt: String(data.get('capturedAt') ?? '') || undefined,
        }, token);
      }
      setSuccess(selectedMode === 'complete' ? 'Recorded completion submitted for independent verification.'
        : selectedMode === 'verify' ? 'Recorded completion independently verified.'
          : selectedMode === 'evidence' ? 'Evidence reference recorded.' : 'Task status recorded.');
      setMode(null); await onRecorded();
    } catch (failure) { setError(failure); } finally { setSubmitting(false); }
  }

  return <div className="task-actions">
    {task.status === 'PENDING' && <section className="task-assignment" aria-label="Task assignment">
      <label>Assignee<select value={candidateId} onChange={(event) => setCandidateId(event.target.value)} disabled={candidateLoading || submitting || candidates.length === 0}>
        <option value="">{candidateLoading ? 'Loading eligible officers…' : 'Select eligible officer'}</option>
        {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.designation} · {candidate.employeeCode}</option>)}
      </select></label>
      {candidateLoading && <p role="status">Loading eligible officers…</p>}
      {!candidateLoading && !candidateError && candidates.length === 0 && <p>No active officers are available within this Case scope.</p>}
      {candidateError !== null && <MutationFeedback error={candidateError} success={null} />}
      <button type="button" className="primary-action" onClick={assign} disabled={candidateLoading || submitting || !candidateId}>{submitting ? 'Assigning…' : 'Assign'}</button>
    </section>}
    <div className="action-row">
      {task.status === 'ASSIGNED' && <button onClick={() => status('IN_PROGRESS')} disabled={submitting}>Mark work started</button>}
      {task.status === 'BLOCKED' && <button onClick={() => status('IN_PROGRESS')} disabled={submitting}>Resume recorded work</button>}
      {['ASSIGNED', 'IN_PROGRESS'].includes(task.status) && <button disabled={submitting} onClick={() => setMode('block')}>Record blocked state</button>}
      {!task.isMandatory && ['PENDING', 'ASSIGNED'].includes(task.status) && <button disabled={submitting} className="danger-action" onClick={() => setMode('cancel')}>Cancel optional task</button>}
      {['IN_PROGRESS', 'BLOCKED'].includes(task.status) && <button disabled={submitting} onClick={() => setMode('evidence')}>Record evidence</button>}
      {task.status === 'IN_PROGRESS' && <button disabled={submitting} onClick={() => setMode('complete')}>Submit recorded completion</button>}
      {canVerify && <button disabled={submitting} onClick={() => setMode('verify')}>Verify recorded completion</button>}
    </div>
    {task.status === 'COMPLETION_SUBMITTED' && !canVerify &&
      <p className="assignment-limitation">Independent verification must be completed by a different eligible officer.</p>}
    <MutationFeedback error={error} success={success} />
    {mode && <form className="workflow-form inline-form" onSubmit={submit} aria-busy={submitting}
      role={mode === 'cancel' ? 'dialog' : undefined} aria-modal={mode === 'cancel' ? true : undefined}
      aria-label={mode === 'cancel' ? 'Confirm optional task cancellation' : undefined}>
      {mode === 'evidence' ? <EvidenceFields /> : <>
        <h4>{mode === 'block' ? 'Record blocked state' : mode === 'cancel' ? 'Confirm optional task cancellation'
          : mode === 'complete' ? 'Submit recorded completion' : 'Verify recorded completion'}</h4>
        {mode === 'verify' && <p>Verification must be performed independently from the officer who executed/submitted the work.</p>}
        <label>{mode === 'block' || mode === 'cancel' ? 'Reason' : 'Note'}
          <textarea autoFocus name={mode === 'block' || mode === 'cancel' ? 'reason' : 'note'} required rows={3} />
        </label>
        {mode === 'cancel' && <label className="check-label"><input type="checkbox" required />
          I confirm this records cancellation of this optional workflow task.</label>}
      </>}
      <div className="action-row"><button className="primary-action" disabled={submitting}>
        {submitting ? 'Recording…' : 'Confirm and record'}</button>
        <button type="button" disabled={submitting} onClick={() => setMode(null)}>Cancel</button></div>
    </form>}
  </div>;
}

function EvidenceFields() {
  return <><h4>Record evidence reference</h4>
    <p>This records metadata or references only. It does not upload a file or retrieve remote content.</p>
    <label>Evidence type<select name="evidenceType" required>
      {['PHOTO_REFERENCE', 'DOCUMENT_REFERENCE', 'MEASUREMENT', 'COMPLETION_NOTE', 'INSPECTION_REPORT', 'OTHER']
        .map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
    <label>Description<textarea name="description" required rows={3} /></label>
    <label>Reference URL<input name="referenceUrl" type="url" /></label>
    <label>Document reference<input name="documentReference" /></label>
    <label>Measurement data (valid JSON, optional)<textarea name="measurementData" rows={3} /></label>
    <label>Captured at<input name="capturedAt" type="datetime-local" /></label></>;
}
