import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createMaintenanceScenarioService, MaintenanceServiceError } from './maintenance-scenario.service';

export function createMaintenanceScenarioRouter(service = createMaintenanceScenarioService()) {
  const router = Router();
  router.post('/portfolio/maintenance-scenarios/compare', authenticate, async (req, res) => {
    try {
      return res.status(200).json({ success: true, data: await service.compare(req.user!, req.body) });
    } catch (error) {
      const known = error instanceof MaintenanceServiceError;
      return res.status(known ? error.status : 503).json({ success: false, error: {
        code: known ? error.code : 'MAINTENANCE_COMPARISON_UNAVAILABLE',
        message: 'The maintenance comparison could not be completed.'
      } });
    }
  });
  return router;
}
export default createMaintenanceScenarioRouter();
