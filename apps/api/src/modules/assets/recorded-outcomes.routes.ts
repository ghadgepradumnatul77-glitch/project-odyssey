import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createRecordedOutcomesService, RecordedOutcomeServiceError } from './recorded-outcomes.service';
export function createRecordedOutcomesRouter(service=createRecordedOutcomesService()) {
  const router=Router();
  const handle=(detail:boolean)=>async(req:import('express').Request,res:import('express').Response)=>{
    try {return res.json({success:true,data:detail?await service.detail(req.user!,String(req.params.assetId),req.query):await service.summary(req.user!,req.query)});}
    catch(error) {return res.status(error instanceof RecordedOutcomeServiceError?error.status:503).json({success:false,error:{code:error instanceof RecordedOutcomeServiceError?error.code:'OUTCOMES_UNAVAILABLE',message:'Recorded outcomes could not be loaded.'}});}
  };
  router.get('/outcomes/summary',authenticate,handle(false));
  router.get('/:assetId/outcomes',authenticate,handle(true));
  return router;
}
export default createRecordedOutcomesRouter();
