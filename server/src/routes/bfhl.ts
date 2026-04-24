import { Router, Request, Response, NextFunction } from 'express';
import { BFHLRequest, BFHLResponse, HierarchyObject, SummaryObject } from '../types';

const router = Router();

// Mock generation for the boilerplate API
router.post('/', (req: Request<{}, {}, BFHLRequest>, res: Response<BFHLResponse | { is_success: boolean, message: string }>, next: NextFunction) => {
  try {
    const userId = process.env.USER_ID || 'john_doe_17091999';

    // In a real application, you'd parse req.body.data to construct these objects.
    // For this boilerplate, returning mock structures matching requested types.
    const hierarchyMock: HierarchyObject[] = [
      {
        root: "A",
        tree: { "A": ["B", "C"], "B": [], "C": [] },
        depth: 2,
        has_cycle: false
      }
    ];

    const summaryMock: SummaryObject = {
      total_trees: 1,
      total_cycles: 0,
      largest_tree_root: "A"
    };

    const response: BFHLResponse = {
      is_success: true,
      user_id: userId,
      hierarchy: hierarchyMock,
      summary: summaryMock
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ operation_code: 1 });
});

export default router;
