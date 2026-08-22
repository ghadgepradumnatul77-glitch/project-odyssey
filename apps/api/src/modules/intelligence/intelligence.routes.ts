import { Router } from 'express';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { ScopedResourceNotFoundError } from '../../security/organizational-scope';
import { getCaseIntelligenceHistory, requestCaseIntelligence } from './intelligence.service';
const router=Router();
const readers=requireRole(SystemRole.OFFICER,SystemRole.AUDITOR,SystemRole.SYSTEM_ADMIN);
function fail(res:any,error:unknown){if(error instanceof ScopedResourceNotFoundError)return res.status(404).json({success:false,error:{code:'CASE_NOT_FOUND',message:'Case not found.'}});const code=error instanceof Error?error.message:'INTELLIGENCE_FAILED';const known:Record<string,[number,string]>={INVALID_CASE_STATE:[409,'A closed Case cannot request new intelligence.'],NO_INSPECTION_FOUND:[409,'A current inspection is required.'],NO_RISK_ASSESSMENT_FOUND:[409,'A current deterministic Risk Assessment is required.'],STALE_RISK_ASSESSMENT:[409,'The current deterministic Risk Assessment does not reference the latest inspection.']};const item=known[code];if(item)return res.status(item[0]).json({success:false,error:{code,message:item[1]}});return res.status(500).json({success:false,error:{code:'INTELLIGENCE_FAILED',message:'Intelligence support could not be evaluated.'}});}
router.post('/cases/:caseId/intelligence-assessments',authenticate,requireRole(SystemRole.OFFICER),async(req,res)=>{try{return res.json({success:true,data:await requestCaseIntelligence(String(req.params.caseId),req.user!)});}catch(error){return fail(res,error);}});
router.get('/cases/:caseId/intelligence-assessments',authenticate,readers,async(req,res)=>{try{return res.json({success:true,data:await getCaseIntelligenceHistory(String(req.params.caseId),req.user!)});}catch(error){return fail(res,error);}});
export default router;
