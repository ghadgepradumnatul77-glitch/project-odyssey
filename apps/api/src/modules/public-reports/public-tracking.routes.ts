import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getPublicTracking, PUBLIC_REPORT_REFERENCE_PATTERN, PublicTrackingNotFoundError } from './public-tracking.service';

const router = Router();
const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many tracking requests. Please wait before trying again.' } }
});

router.get('/:reference', trackingLimiter, async (req, res) => {
  res.set('Cache-Control', 'no-store, private');
  const reference = String(req.params.reference ?? '').trim().toUpperCase();
  if (!PUBLIC_REPORT_REFERENCE_PATTERN.test(reference)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_REFERENCE', message: 'Enter a valid report reference.' } });
  }
  try {
    return res.status(200).json({ success: true, data: await getPublicTracking(reference) });
  } catch (error) {
    if (error instanceof PublicTrackingNotFoundError) {
      return res.status(404).json({ success: false, error: { code: 'TRACKING_NOT_FOUND', message: 'No report was found for that reference.' } });
    }
    console.error('Public tracking lookup failed:', error);
    return res.status(500).json({ success: false, error: { code: 'TRACKING_UNAVAILABLE', message: 'Tracking is temporarily unavailable.' } });
  }
});

export default router;
