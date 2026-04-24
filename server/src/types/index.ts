export interface HierarchyObject {
  root: string;
  tree: Record<string, string[]>;
  depth?: number;
  has_cycle?: boolean;
}

export interface SummaryObject {
  total_trees: number;
  total_cycles: number;
  largest_tree_root: string;
}

export interface BFHLRequest {
  data?: unknown;
}

export interface BFHLResponse {
  is_success: boolean;
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchy: HierarchyObject[];
  summary: SummaryObject;
  invalid_entries: string[];
  duplicate_edges: string[];
}
