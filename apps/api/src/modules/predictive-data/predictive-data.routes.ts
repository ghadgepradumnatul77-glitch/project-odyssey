import { Router } from 'express';
import { z } from 'zod';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { getPredictiveReadiness, getTaskLatenessDataset, PredictiveDataError, voidOutcome, voidSnapshot } from './predictive-data.service';

const router=Router(),voidBody=z.object({reason:z.string().trim().min(3).max(1000),replacementId:z.string().uuid().optional()}).strict();
function fail(res:any,error:unknown){if(error instanceof PredictiveDataError)return res.status(error.status).json({success:false,error:{code:error.code,message:error.message}});console.error('Predictive data operation failed:',error);return res.status(500).json({success:false,error:{code:'PREDICTIVE_DATA_OPERATION_FAILED',message:'Predictive data readiness is currently unavailable.'}});}
router.get('/predictive-data/readiness',authenticate,requireRole(SystemRole.AUDITOR,SystemRole.SYSTEM_ADMIN),async(req,res)=>{try{return res.json({success:true,data:await getPredictiveReadiness(req.user!)});}catch(error){return fail(res,error);}});
router.get('/predictive-data/datasets/task-lateness',authenticate,requireRole(SystemRole.AUDITOR,SystemRole.SYSTEM_ADMIN),async(req,res)=>{const limit=Math.min(100,Math.max(1,Number(req.query.limit)||25)),offset=Math.max(0,Number(req.query.offset)||0),includeDemo=req.query.includeDemo==='true';try{return res.json({success:true,data:await getTaskLatenessDataset(req.user!,{limit,offset,includeDemo})});}catch(error){return fail(res,error);}});
router.post('/predictive-data/snapshots/:id/void',authenticate,requireRole(SystemRole.SYSTEM_ADMIN),async(req,res)=>{const parsed=voidBody.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A governed void reason is required.'}});try{return res.json({success:true,data:await voidSnapshot(String(req.params.id),parsed.data.reason,parsed.data.replacementId,req.user!)});}catch(error){return fail(res,error);}});
router.post('/predictive-data/outcomes/:id/void',authenticate,requireRole(SystemRole.SYSTEM_ADMIN),async(req,res)=>{const parsed=voidBody.safeParse(req.body);if(!parsed.success)return res.status(400).json({success:false,error:{code:'INVALID_INPUT',message:'A governed void reason is required.'}});try{return res.json({success:true,data:await voidOutcome(String(req.params.id),parsed.data.reason,parsed.data.replacementId,req.user!)});}catch(error){return fail(res,error);}});
export default router;
