import { HierarchyObject, SummaryObject } from '../types';

type DirectedEdgeToken = {
  sourceVertex: string;
  destinationVertex: string;
  canonicalEdge: string;
};

export interface GraphProcessResult {
  hierarchy: HierarchyObject[];
  summary: SummaryObject;
  invalid_entries: string[];
  duplicate_edges: string[];
}

export class GraphProcessor {
  public static process(ingestedPayload: unknown): GraphProcessResult {
    const invalidEntries: string[] = [];
    const duplicateEdges: string[] = [];
    const networkTopology: Record<string, string[]> = {};
    const discoveredVertices = new Set<string>();
    const childOwnershipIndex = new Map<string, string>();
    const uniqueEdgeRegistry = new Set<string>();
    const incomingEdgeCountByVertex = new Map<string, number>();
    const connectivityMap = new Map<string, Set<string>>();

    const submittedEntries = Array.isArray(ingestedPayload) ? ingestedPayload : [];

    for (const rawEntry of submittedEntries) {
      const normalizedEntry = typeof rawEntry === 'string' ? rawEntry.trim() : String(rawEntry);
      const extractedEdge = this.extractValidatedEdgeToken(normalizedEntry);

      if (!extractedEdge) {
        invalidEntries.push(normalizedEntry);
        continue;
      }

      if (uniqueEdgeRegistry.has(extractedEdge.canonicalEdge)) {
        duplicateEdges.push(extractedEdge.canonicalEdge);
        continue;
      }
      uniqueEdgeRegistry.add(extractedEdge.canonicalEdge);

      if (childOwnershipIndex.has(extractedEdge.destinationVertex)) {
        continue;
      }

      childOwnershipIndex.set(extractedEdge.destinationVertex, extractedEdge.sourceVertex);
      discoveredVertices.add(extractedEdge.sourceVertex);
      discoveredVertices.add(extractedEdge.destinationVertex);

      if (!networkTopology[extractedEdge.sourceVertex]) {
        networkTopology[extractedEdge.sourceVertex] = [];
      }
      networkTopology[extractedEdge.sourceVertex].push(extractedEdge.destinationVertex);
    }

    for (const vertexLabel of discoveredVertices) {
      incomingEdgeCountByVertex.set(vertexLabel, 0);
      connectivityMap.set(vertexLabel, new Set<string>());
    }

    for (const [sourceVertex, adjacentVertices] of Object.entries(networkTopology)) {
      for (const destinationVertex of adjacentVertices) {
        incomingEdgeCountByVertex.set(
          destinationVertex,
          (incomingEdgeCountByVertex.get(destinationVertex) ?? 0) + 1
        );
        connectivityMap.get(sourceVertex)?.add(destinationVertex);
        connectivityMap.get(destinationVertex)?.add(sourceVertex);
      }
    }

    const hierarchy: HierarchyObject[] = [];
    let nonCyclicTreeCount = 0;
    let cyclicGroupCount = 0;
    let deepestTreeRoot = '';
    let deepestTreeDepth = -1;

    const visitedConnectivityVertices = new Set<string>();
    const sortedVertices = Array.from(discoveredVertices).sort();

    for (const componentEntryVertex of sortedVertices) {
      if (visitedConnectivityVertices.has(componentEntryVertex)) {
        continue;
      }

      const weaklyConnectedVertices = this.collectWeaklyConnectedVertices(
        componentEntryVertex,
        connectivityMap,
        visitedConnectivityVertices
      );
      const cycleVertices = this.locateCycleVerticesWithinComponent(
        weaklyConnectedVertices,
        networkTopology
      );

      if (cycleVertices.size > 0) {
        cyclicGroupCount += 1;
        const cycleRoot = Array.from(cycleVertices).sort()[0];
        hierarchy.push({
          root: cycleRoot,
          tree: {},
          has_cycle: true
        });
        continue;
      }

      const componentRoots = weaklyConnectedVertices
        .filter((vertexLabel) => (incomingEdgeCountByVertex.get(vertexLabel) ?? 0) === 0)
        .sort();

      if (componentRoots.length === 0) {
        continue;
      }

      const selectedRootVertex = componentRoots[0];
      const componentAdjacencySubset = this.constructComponentTopologySubset(
        weaklyConnectedVertices,
        networkTopology
      );
      const computedDepth = this.measureRootedTreeDepth(
        selectedRootVertex,
        componentAdjacencySubset
      );

      hierarchy.push({
        root: selectedRootVertex,
        tree: componentAdjacencySubset,
        depth: computedDepth
      });

      nonCyclicTreeCount += 1;
      if (
        computedDepth > deepestTreeDepth ||
        (computedDepth === deepestTreeDepth &&
          (deepestTreeRoot === '' || selectedRootVertex < deepestTreeRoot))
      ) {
        deepestTreeDepth = computedDepth;
        deepestTreeRoot = selectedRootVertex;
      }
    }

    return {
      hierarchy,
      summary: {
        total_trees: nonCyclicTreeCount,
        total_cycles: cyclicGroupCount,
        largest_tree_root: deepestTreeRoot
      },
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges
    };
  }

  private static extractValidatedEdgeToken(candidateEdge: string): DirectedEdgeToken | null {
    if (!/^[A-Z]->[A-Z]$/.test(candidateEdge)) {
      return null;
    }

    const sourceVertex = candidateEdge[0];
    const destinationVertex = candidateEdge[3];

    if (sourceVertex === destinationVertex) {
      return null;
    }

    return {
      sourceVertex,
      destinationVertex,
      canonicalEdge: candidateEdge
    };
  }

  private static collectWeaklyConnectedVertices(
    componentSeedVertex: string,
    connectivityMap: Map<string, Set<string>>,
    visitedConnectivityVertices: Set<string>
  ): string[] {
    const traversalQueue: string[] = [componentSeedVertex];
    visitedConnectivityVertices.add(componentSeedVertex);
    const connectedVertices: string[] = [];

    while (traversalQueue.length > 0) {
      const activeVertex = traversalQueue.shift();
      if (!activeVertex) {
        continue;
      }
      connectedVertices.push(activeVertex);
      for (const neighborVertex of connectivityMap.get(activeVertex) ?? []) {
        if (visitedConnectivityVertices.has(neighborVertex)) {
          continue;
        }
        visitedConnectivityVertices.add(neighborVertex);
        traversalQueue.push(neighborVertex);
      }
    }

    return connectedVertices;
  }

  private static locateCycleVerticesWithinComponent(
    componentVertices: string[],
    networkTopology: Record<string, string[]>
  ): Set<string> {
    const componentVertexSet = new Set(componentVertices);
    const exploredVertices = new Set<string>();
    const activeRecursionStack = new Set<string>();
    const traversalPath: string[] = [];
    const cycleVertexRegistry = new Set<string>();

    const detectCyclesByDepthFirstTraversal = (activeVertex: string): void => {
      exploredVertices.add(activeVertex);
      activeRecursionStack.add(activeVertex);
      traversalPath.push(activeVertex);

      for (const downstreamVertex of networkTopology[activeVertex] ?? []) {
        if (!componentVertexSet.has(downstreamVertex)) {
          continue;
        }

        if (!exploredVertices.has(downstreamVertex)) {
          detectCyclesByDepthFirstTraversal(downstreamVertex);
          continue;
        }

        if (activeRecursionStack.has(downstreamVertex)) {
          const cycleEntryIndex = traversalPath.lastIndexOf(downstreamVertex);
          for (let cycleCursor = cycleEntryIndex; cycleCursor < traversalPath.length; cycleCursor += 1) {
            cycleVertexRegistry.add(traversalPath[cycleCursor]);
          }
        }
      }

      traversalPath.pop();
      activeRecursionStack.delete(activeVertex);
    };

    for (const componentVertex of componentVertices) {
      if (!exploredVertices.has(componentVertex)) {
        detectCyclesByDepthFirstTraversal(componentVertex);
      }
    }

    return cycleVertexRegistry;
  }

  private static constructComponentTopologySubset(
    componentVertices: string[],
    networkTopology: Record<string, string[]>
  ): Record<string, string[]> {
    const componentVertexSet = new Set(componentVertices);
    const componentTopology: Record<string, string[]> = {};

    for (const componentVertex of componentVertices) {
      const validChildren = (networkTopology[componentVertex] ?? []).filter((childVertex) =>
        componentVertexSet.has(childVertex)
      );
      if (validChildren.length > 0) {
        componentTopology[componentVertex] = validChildren;
      }
    }

    return componentTopology;
  }

  private static measureRootedTreeDepth(
    rootVertex: string,
    componentTopology: Record<string, string[]>
  ): number {
    const downstreamVertices = componentTopology[rootVertex] ?? [];
    if (downstreamVertices.length === 0) {
      return 1;
    }

    let longestDownstreamDepth = 0;
    for (const childVertex of downstreamVertices) {
      longestDownstreamDepth = Math.max(
        longestDownstreamDepth,
        this.measureRootedTreeDepth(childVertex, componentTopology)
      );
    }

    return longestDownstreamDepth + 1;
  }
}
