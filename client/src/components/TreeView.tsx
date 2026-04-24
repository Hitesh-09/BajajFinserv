"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, GitBranch, Layers3 } from "lucide-react"

type TreeItem = {
  root: string
  tree: Record<string, string[]>
  depth?: number
  has_cycle?: boolean
}

type TreeViewProps = {
  hierarchies: TreeItem[]
}

type NodeRendererProps = {
  activeVertexLabel: string
  hierarchyTopology: Record<string, string[]>
  depthIndentLevel: number
}

function RecursiveHierarchyNodeRenderer({
  activeVertexLabel,
  hierarchyTopology,
  depthIndentLevel
}: NodeRendererProps) {
  const downstreamVertices = hierarchyTopology[activeVertexLabel] ?? []

  return (
    <div className="space-y-2">
      <div
        className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm font-medium"
        style={{ marginLeft: `${depthIndentLevel * 16}px` }}
      >
        {activeVertexLabel}
      </div>
      {downstreamVertices.length > 0 ? (
        <div className="space-y-2 border-l border-border/60">
          {downstreamVertices.map((downstreamVertexLabel) => (
            <RecursiveHierarchyNodeRenderer
              key={`${activeVertexLabel}-${downstreamVertexLabel}`}
              activeVertexLabel={downstreamVertexLabel}
              hierarchyTopology={hierarchyTopology}
              depthIndentLevel={depthIndentLevel + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function TreeView({ hierarchies }: TreeViewProps) {
  if (hierarchies.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers3 className="size-4" />
            Graph Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Submit graph edges to render trees and cycle groups here.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {hierarchies.map((hierarchyGroup, hierarchyIndex) => {
        const isCyclicGroup = Boolean(hierarchyGroup.has_cycle)
        return (
          <Card key={`${hierarchyGroup.root}-${hierarchyIndex}`} className="overflow-hidden">
            <CardHeader className={isCyclicGroup ? "bg-destructive/10" : "bg-muted/40"}>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="inline-flex items-center gap-2">
                  {isCyclicGroup ? <AlertTriangle className="size-4 text-destructive" /> : <GitBranch className="size-4" />}
                  Root: {hierarchyGroup.root}
                </span>
                {isCyclicGroup ? (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                    Cycle Detected
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Depth: {hierarchyGroup.depth ?? 0}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {isCyclicGroup ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  This group is cyclic. Child rendering is intentionally disabled.
                </div>
              ) : (
                <RecursiveHierarchyNodeRenderer
                  activeVertexLabel={hierarchyGroup.root}
                  hierarchyTopology={hierarchyGroup.tree}
                  depthIndentLevel={0}
                />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
