import { Router, Request, Response, NextFunction } from 'express';
import { BFHLRequest, BFHLResponse } from '../types';
import { TreeEngine } from '../services/TreeEngine';

const router = Router();

// Mock generation for the boilerplate API
router.post('/', (req: Request<{}, {}, BFHLRequest>, res: Response<BFHLResponse | { is_success: boolean, message: string }>, next: NextFunction) => {
  try {
    const activeIdentifier = process.env.USER_ID || 'john_doe_17091999';
    
    // Safety check on incoming payload
    const rawInputPayload = typeof req.body.data === 'string' 
      ? req.body.data 
      : JSON.stringify(req.body.data || {});

    // Offload heavy processing to isolated class file 
    const { hierarchies, summaryData } = TreeEngine.processGraph(rawInputPayload);

    const generatedResponse: BFHLResponse = {
      is_success: true,
      user_id: activeIdentifier,
      hierarchy: hierarchies,
      summary: summaryData
    };

    res.status(200).json(generatedResponse);
  } catch (backendFault) {
    next(backendFault);
  }
});

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ operation_code: 1 });
});

export default router;
