import{Router}from'express';import rateLimit from'express-rate-limit';import{SystemRole}from'../generated/prisma';import{authenticate}from'../middleware/authenticate';import{requireRole}from'../middleware/require-role';import{evaluateHealth}from'./health.service';import{metrics}from'./metrics';import{getProcessHealthState}from'./state';
const router=Router(),operator=requireRole(SystemRole.SYSTEM_ADMIN,SystemRole.AUDITOR);
router.use(rateLimit({windowMs:60_000,limit:120,standardHeaders:true,legacyHeaders:false,message:{success:false,error:{code:'HEALTH_RATE_LIMITED',message:'Too many health requests. Please try again shortly.'}}}));
router.get('/health/live',(_req,res)=>res.status(getProcessHealthState()==='SHUTTING_DOWN'?503:200).json({success:true,data:{service:'odyssey-api',status:getProcessHealthState()==='SHUTTING_DOWN'?'SHUTTING_DOWN':'UP'}}));
router.get('/health/ready',async(_req,res)=>{const health=await evaluateHealth();return res.status(health.status==='NOT_READY'?503:200).json({success:health.status!=='NOT_READY',data:{service:'odyssey-api',status:health.status}})});
router.get('/system/health',authenticate,operator,async(_req,res)=>res.json({success:true,data:await evaluateHealth()}));
router.get('/system/metrics',authenticate,operator,(_req,res)=>res.json({success:true,data:metrics.snapshot()}));
export default router;
