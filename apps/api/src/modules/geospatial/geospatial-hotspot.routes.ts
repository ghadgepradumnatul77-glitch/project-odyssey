import { Router } from 'express';
import { PriorityLevel, RiskLevel } from '../../generated/prisma';
import { parseEnum, parseUuidQuery, queryError } from '../../lib/pagination';
import { authenticate } from '../../middleware/authenticate';
import { analyzeGeospatialHotspots } from './geospatial-hotspot.service';

const router=Router();
router.get('/geospatial/hotspots',authenticate,async(req,res)=>{try{const filters={departmentId:parseUuidQuery(req.query.departmentId,'departmentId'),jurisdictionId:parseUuidQuery(req.query.jurisdictionId,'jurisdictionId'),minimumPriority:parseEnum(req.query.minimumPriority,Object.values(PriorityLevel),'minimumPriority'),minimumRisk:parseEnum(req.query.minimumRisk,Object.values(RiskLevel),'minimumRisk')};return res.status(200).json({success:true,data:await analyzeGeospatialHotspots(req.user!,filters)});}catch(error){const invalid=queryError(res,error);if(invalid)return invalid;console.error('Geospatial hotspot analysis failed:',error);return res.status(500).json({success:false,error:{code:'GEOSPATIAL_ANALYSIS_FAILED',message:'Geospatial hotspot analysis is currently unavailable.'}});}});
export default router;
