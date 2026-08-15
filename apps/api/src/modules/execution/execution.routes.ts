import { Router } from 'express';
import { ExecutionEvidenceType, SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { ExecutionError } from './execution-error';
import { addEvidence, assignTask, changeTaskStatus, generateExecutionPlan, getExecutionPlan, hasClientActorFields, listCaseExecutionPlans, listExecutionTasks, submitCompletion, verifyTask } from './execution.service';

const router = Router();
const evidenceTypes = new Set(Object.values(ExecutionEvidenceType));
const actorFields = ['createdById', 'assignedById', 'assignedAt', 'submittedById', 'submittedAt', 'completionSubmittedById', 'verifiedById', 'cancelledById', 'startedAt'];
function id(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function fail(res: any, error: unknown) {
  if (error instanceof ExecutionError) return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  console.error('Execution workflow failed:', error);
  return res.status(500).json({ success: false, error: { code: 'EXECUTION_WORKFLOW_FAILED', message: 'Could not process execution workflow.' } });
}
function rejectActors(req: any, res: any) {
  if (hasClientActorFields(req.body || {})) { res.status(400).json({ success: false, error: { code: 'ACTOR_FIELDS_NOT_ALLOWED', message: `Actor fields (${actorFields.join(', ')}) are derived by the server.` } }); return true; }
  return false;
}

router.post('/orps/:orpId/execution-plan', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => {
  try { if (rejectActors(req, res)) return; const orpId = id(req.params.orpId); if (!orpId) throw new ExecutionError('INVALID_INPUT', 400, 'orpId is required.'); const result = await generateExecutionPlan(orpId, req.user!); return res.status(result.created ? 201 : 200).json({ success: true, data: result.plan, idempotent: !result.created }); } catch (error) { return fail(res, error); }
});
router.get('/cases/:caseId/execution-plans', authenticate, async (req, res) => { try { const caseId = id(req.params.caseId); if (!caseId) throw new ExecutionError('INVALID_INPUT', 400, 'caseId is required.'); return res.json({ success: true, data: await listCaseExecutionPlans(caseId, req.user!) }); } catch (error) { return fail(res, error); } });
router.get('/execution-plans/:planId', authenticate, async (req, res) => { try { const planId = id(req.params.planId); if (!planId) throw new ExecutionError('INVALID_INPUT', 400, 'planId is required.'); return res.json({ success: true, data: await getExecutionPlan(planId, req.user!) }); } catch (error) { return fail(res, error); } });
router.get('/execution-plans/:planId/tasks', authenticate, async (req, res) => { try { const planId = id(req.params.planId); if (!planId) throw new ExecutionError('INVALID_INPUT', 400, 'planId is required.'); return res.json({ success: true, data: await listExecutionTasks(planId, req.user!) }); } catch (error) { return fail(res, error); } });

router.patch('/execution-tasks/:taskId/assignment', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => { try { if (rejectActors(req, res)) return; const taskId = id(req.params.taskId), assigneeId = id(req.body.assigneeId); if (!taskId || !assigneeId || Object.prototype.hasOwnProperty.call(req.body, 'status')) throw new ExecutionError('INVALID_INPUT', 400, 'taskId and assigneeId are required; status is server controlled.'); return res.json({ success: true, data: await assignTask(taskId, assigneeId, req.user!) }); } catch (error) { return fail(res, error); } });
router.patch('/execution-tasks/:taskId/status', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => { try { if (rejectActors(req, res)) return; const taskId = id(req.params.taskId), status = req.body.status; if (!taskId || !['IN_PROGRESS', 'BLOCKED', 'CANCELLED'].includes(status)) throw new ExecutionError('INVALID_INPUT', 400, 'A valid taskId and status are required.'); return res.json({ success: true, data: await changeTaskStatus(taskId, status, req.body.reason, req.user!) }); } catch (error) { return fail(res, error); } });
router.post('/execution-tasks/:taskId/evidence', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => { try { if (rejectActors(req, res)) return; const taskId = id(req.params.taskId), description = id(req.body.description); if (!taskId || !description || !evidenceTypes.has(req.body.evidenceType)) throw new ExecutionError('INVALID_INPUT', 400, 'taskId, evidenceType, and description are required.'); let referenceUrl: string | undefined; if (req.body.referenceUrl !== undefined) { try { const parsed = new URL(req.body.referenceUrl); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); referenceUrl = parsed.toString(); } catch { throw new ExecutionError('INVALID_INPUT', 400, 'referenceUrl must be an HTTP(S) URL without embedded credentials.'); } } let capturedAt: Date | undefined; if (req.body.capturedAt !== undefined) { capturedAt = new Date(req.body.capturedAt); if (Number.isNaN(capturedAt.getTime())) throw new ExecutionError('INVALID_INPUT', 400, 'capturedAt must be a valid date.'); } return res.status(201).json({ success: true, data: await addEvidence(taskId, { evidenceType: req.body.evidenceType, description, referenceUrl, documentReference: id(req.body.documentReference) || undefined, measurementData: req.body.measurementData, capturedAt }, req.user!) }); } catch (error) { return fail(res, error); } });
router.post('/execution-tasks/:taskId/submit-completion', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => { try { if (rejectActors(req, res)) return; const taskId = id(req.params.taskId), note = id(req.body.completionNote); if (!taskId || !note) throw new ExecutionError('INVALID_INPUT', 400, 'taskId and completionNote are required.'); return res.json({ success: true, data: await submitCompletion(taskId, note, req.user!) }); } catch (error) { return fail(res, error); } });
router.post('/execution-tasks/:taskId/verify', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => { try { if (rejectActors(req, res)) return; const taskId = id(req.params.taskId), note = id(req.body.verificationNote); if (!taskId || !note) throw new ExecutionError('INVALID_INPUT', 400, 'taskId and verificationNote are required.'); return res.json({ success: true, data: await verifyTask(taskId, note, req.user!) }); } catch (error) { return fail(res, error); } });

export default router;
