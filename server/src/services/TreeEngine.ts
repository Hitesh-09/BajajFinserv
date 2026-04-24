import { HierarchyObject, SummaryObject } from '../types';

export class TreeEngine {
  public static processGraph(ingestedString: string) {
    let graphTopology: Record<string, string[]> = {};
    
    try {
        // Attempt to ingest JSON. If it fails or format isn't valid, parse it organically.
        const parsed = JSON.parse(ingestedString);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            graphTopology = parsed;
        }
    } catch {
        // Fallback for non-JSON strings (could be customized later)
        graphTopology = {}; 
    }

    let cyclicGroupings = 0;
    let totalTrees = 0;
    let largestTreeRoot = "";
    let maxDepthOverall = -1;

    // Map degrees to identify exact tree bases
    const allConstructedNodes = new Set<string>();
    const inDegreeMap: Record<string, number> = {};

    for (const [parentNode, childrenNodes] of Object.entries(graphTopology)) {
      allConstructedNodes.add(parentNode);
      if (inDegreeMap[parentNode] === undefined) inDegreeMap[parentNode] = 0;

      for (const child of childrenNodes) {
        allConstructedNodes.add(child);
        inDegreeMap[child] = (inDegreeMap[child] || 0) + 1;
      }
    }

    const potentialRoots = Array.from(allConstructedNodes).filter(node => inDegreeMap[node] === 0);
    const hierarchies: HierarchyObject[] = [];
    const globalVisited = new Set<string>();

    const evaluateStructuralIntegrity = (
      currentNode: string, 
      visitedSet: Set<string>, 
      recursionStack: Set<string>
    ): { depth: number, hasCycle: boolean } => {
      visitedSet.add(currentNode);
      recursionStack.add(currentNode);

      let maxChildDepth = 0;
      let cycleDetected = false;

      const ingestedEdges = graphTopology[currentNode] || [];
      
      for (const connectedEdge of ingestedEdges) {
        if (!visitedSet.has(connectedEdge)) {
          const edgeValidation = evaluateStructuralIntegrity(connectedEdge, visitedSet, recursionStack);
          maxChildDepth = Math.max(maxChildDepth, edgeValidation.depth);
          if (edgeValidation.hasCycle) cycleDetected = true;
        } else if (recursionStack.has(connectedEdge)) {
          cycleDetected = true;
        }
      }

      recursionStack.delete(currentNode);
      return { depth: maxChildDepth + 1, hasCycle: cycleDetected };
    };

    for (const rootCandidate of potentialRoots) {
      if (!globalVisited.has(rootCandidate)) {
        const layoutData = evaluateStructuralIntegrity(rootCandidate, globalVisited, new Set<string>());
        const discreteTreeStructure: Record<string, string[]> = {};
        
        const traversalQueue: string[] = [rootCandidate];
        const localizedPassBlock = new Set<string>();
        
        while (traversalQueue.length > 0) {
          const activeNodeElement = traversalQueue.shift()!;
          if (localizedPassBlock.has(activeNodeElement)) continue;
          
          localizedPassBlock.add(activeNodeElement);
          const activeChildConnections = graphTopology[activeNodeElement] || [];
          if (activeChildConnections.length > 0) {
              discreteTreeStructure[activeNodeElement] = activeChildConnections;
          }
          traversalQueue.push(...activeChildConnections);
        }

        const structuralDepthMap = layoutData.depth;
        const currentCyclicState = layoutData.hasCycle;

        hierarchies.push({
          root: rootCandidate,
          tree: discreteTreeStructure,
          depth: structuralDepthMap,
          has_cycle: currentCyclicState
        });

        totalTrees += 1;
        if (currentCyclicState) cyclicGroupings += 1;

        if (structuralDepthMap > maxDepthOverall) {
          maxDepthOverall = structuralDepthMap;
          largestTreeRoot = rootCandidate;
        }
      }
    }

    // Default bounds if no root was registered (e.g. fully disconnected graphs or pure cycle mapping)
    if (totalTrees === 0 && Array.from(allConstructedNodes).length > 0) {
        cyclicGroupings += 1;
    }

    const summaryData: SummaryObject = {
      total_trees: totalTrees,
      total_cycles: cyclicGroupings,
      largest_tree_root: largestTreeRoot || "N/A",
    };

    return { hierarchies, summaryData };
  }
}
