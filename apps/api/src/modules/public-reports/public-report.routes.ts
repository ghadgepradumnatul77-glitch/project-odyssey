import { Router } from 'express';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { getPublicReport, listPublicReports, PublicReportNotFoundError } from './public-report.service';
import { createCitizenPublicReport } from './public-report.service';
import { acceptPublicReportAsCase, beginPublicReportReview, rejectPublicReport, routePublicReport, PublicReportConflictError, PublicReportValidationError } from './public-report.service';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { analyzePublicReport, getPublicReportAnalysis, PublicReportAnalysisNotFoundError } from './public-report-triage.service';

const router = Router();
const allowed = requireRole(SystemRole.OFFICER, SystemRole.SYSTEM_ADMIN);
const submissionLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:true,legacyHeaders:false,message:{success:false,error:{code:'RATE_LIMITED',message:'Too many reports were submitted. Please wait before trying again.'}}});
const submissionSchema=z.object({title:z.string().trim().min(5).max(160),description:z.string().trim().min(20).max(4000),category:z.enum(['ROAD_DAMAGE','BRIDGE_OR_FLYOVER','WATERLOGGING','STREETLIGHT','DRAINAGE','PUBLIC_BUILDING','OTHER']),locationText:z.string().trim().min(3).max(300),latitude:z.number().min(-90).max(90).optional(),longitude:z.number().min(-180).max(180).optional(),reporterName:z.string().trim().max(120).optional(),reporterContact:z.string().trim().max(200).optional()}).strict().refine((v)=>(v.latitude===undefined)===(v.longitude===undefined),{message:'Latitude and longitude must be supplied together.'});

router.post('/',submissionLimiter,async(req,res)=>{const parsed=submissionSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'The report information is invalid.'}});try{return res.status(201).json({success:true,data:await createCitizenPublicReport(parsed.data)});}catch(error){console.error('Failed to submit public report:',error);return res.status(500).json({success:false,error:{code:'PUBLIC_REPORT_CREATE_FAILED',message:'The report could not be submitted.'}});}});

const routingSchema=z.object({departmentId:z.string().uuid(),jurisdictionId:z.string().uuid(),assetId:z.string().uuid().nullable().optional()}).strict();
const rejectionSchema=z.object({reason:z.string().trim().min(10).max(1000)}).strict();
const acceptanceSchema=z.object({governmentSummary:z.string().trim().min(20).max(2000)}).strict();
function triageError(res:any,error:unknown){if(error instanceof PublicReportNotFoundError)return res.status(404).json({success:false,error:{code:'PUBLIC_REPORT_NOT_FOUND',message:'Public report not found.'}});if(error instanceof PublicReportConflictError)return res.status(409).json({success:false,error:{code:'PUBLIC_REPORT_STATE_CONFLICT',message:error.message}});if(error instanceof PublicReportValidationError)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:error.message}});console.error('Public report triage failed:',error);return res.status(500).json({success:false,error:{code:'PUBLIC_REPORT_TRIAGE_FAILED',message:'The public report could not be updated.'}});}
router.post('/:reportId/review',authenticate,allowed,async(req,res)=>{try{return res.status(200).json({success:true,data:await beginPublicReportReview(String(req.params.reportId),req.user!)});}catch(error){return triageError(res,error);}});
router.patch('/:reportId/routing',authenticate,allowed,async(req,res)=>{const parsed=routingSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'Valid routing selections are required.'}});try{return res.status(200).json({success:true,data:await routePublicReport(String(req.params.reportId),parsed.data,req.user!)});}catch(error){return triageError(res,error);}});
router.post('/:reportId/reject',authenticate,allowed,async(req,res)=>{const parsed=rejectionSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A meaningful rejection reason is required.'}});try{return res.status(200).json({success:true,data:await rejectPublicReport(String(req.params.reportId),parsed.data.reason,req.user!)});}catch(error){return triageError(res,error);}});
router.post('/:reportId/accept',authenticate,allowed,async(req,res)=>{const parsed=acceptanceSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A government-reviewed summary is required.'}});try{return res.status(201).json({success:true,data:await acceptPublicReportAsCase(String(req.params.reportId),parsed.data.governmentSummary,req.user!)});}catch(error){return triageError(res,error);}});
router.post('/:reportId/analyze',authenticate,allowed,async(req,res)=>{const reportId=String(req.params.reportId);if(!z.string().uuid().safeParse(reportId).success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A valid reportId is required.'}});try{return res.status(200).json({success:true,data:await analyzePublicReport(reportId,req.user!)});}catch(error){return triageError(res,error);}});
router.get('/:reportId/analysis',authenticate,allowed,async(req,res)=>{const reportId=String(req.params.reportId);if(!z.string().uuid().safeParse(reportId).success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A valid reportId is required.'}});try{return res.status(200).json({success:true,data:await getPublicReportAnalysis(reportId,req.user!)});}catch(error){if(error instanceof PublicReportAnalysisNotFoundError)return res.status(404).json({success:false,error:{code:'TRIAGE_ANALYSIS_NOT_FOUND',message:'Decision-support analysis is not available.'}});return triageError(res,error);}});

router.get('/', authenticate, allowed, async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await listPublicReports(req.user!) });
  } catch (error) {
    console.error('Failed to fetch public reports:', error);
    return res.status(500).json({ success: false, error: { code: 'PUBLIC_REPORT_FETCH_FAILED', message: 'Could not fetch public reports.' } });
  }
});

router.get('/:reportId', authenticate, allowed, async (req, res) => {
  const reportId = Array.isArray(req.params.reportId) ? '' : req.params.reportId.trim();
  if (!reportId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'reportId is required.' } });
  try {
    return res.status(200).json({ success: true, data: await getPublicReport(reportId, req.user!) });
  } catch (error) {
    if (error instanceof PublicReportNotFoundError) return res.status(404).json({ success: false, error: { code: 'PUBLIC_REPORT_NOT_FOUND', message: 'Public report not found.' } });
    console.error('Failed to fetch public report:', error);
    return res.status(500).json({ success: false, error: { code: 'PUBLIC_REPORT_FETCH_FAILED', message: 'Could not fetch public report.' } });
  }
});

export default router;
