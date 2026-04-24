import { Router, Request, Response, NextFunction } from 'express';
import { BFHLRequest, BFHLResponse } from '../types';
import { GraphProcessor } from '../services/GraphProcessor';

const router = Router();

router.post('/', (requestContext: Request<{}, {}, BFHLRequest>, responseSender: Response<BFHLResponse | { is_success: boolean; message: string }>, next: NextFunction) => {
  try {
    const {
      hierarchy,
      summary,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges
    } = GraphProcessor.process(requestContext.body.data);

    const bfhlPayload: BFHLResponse = {
      is_success: true,
      user_id: 'hitesh_rajesh_shimpi_09062005',
      email_id: 'hs4621@srmist.edu.in',
      college_roll_number: 'RA2311003011239',
      hierarchy,
      summary,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges
    };

    responseSender.status(200).json(bfhlPayload);
  } catch (processingFailure: unknown) {
    next(processingFailure);
  }
});

router.get('/', (_requestContext: Request, responseSender: Response) => {
  responseSender.status(200).json({ operation_code: 1 });
});

export default router;
