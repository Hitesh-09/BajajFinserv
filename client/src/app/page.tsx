"use client"

import { FormEvent, useMemo, useState } from "react"
import { AlertCircle, AlertTriangle, Loader2, Send } from "lucide-react"

import { TreeView } from "@/components/TreeView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

type Hierarchy = {
  root: string
  tree: Record<string, string[]>
  depth?: number
  has_cycle?: boolean
}

type BFHLResponse = {
  is_success: boolean
  hierarchy?: Hierarchy[]
  hierarchies?: Hierarchy[]
  summary: {
    total_trees: number
    total_cycles: number
    largest_tree_root: string
  }
  invalid_entries: string[]
  duplicate_edges: string[]
}

const PLACEHOLDER = `["A->B", "hello", "A->C", "A->B", "B->C", "C->A"]`

export default function Dashboard() {
  const [rawEdgeArrayInput, setRawEdgeArrayInput] = useState(PLACEHOLDER)
  const [isRequestInFlight, setIsRequestInFlight] = useState(false)
  const [requestFailureMessage, setRequestFailureMessage] = useState<string | null>(null)
  const [graphProcessingResponse, setGraphProcessingResponse] = useState<BFHLResponse | null>(null)

  const hierarchyGroups = useMemo(() => {
    if (!graphProcessingResponse) {
      return []
    }
    return graphProcessingResponse.hierarchy ?? graphProcessingResponse.hierarchies ?? []
  }, [graphProcessingResponse])

  const submitEdgeTopologyRequest = async (formSubmitEvent: FormEvent<HTMLFormElement>) => {
    formSubmitEvent.preventDefault()
    setIsRequestInFlight(true)
    setRequestFailureMessage(null)

    try {
      const decodedInputArray = JSON.parse(rawEdgeArrayInput) as unknown
      if (!Array.isArray(decodedInputArray) || decodedInputArray.some((edgeToken) => typeof edgeToken !== "string")) {
        throw new Error("Input must be a JSON array of strings.")
      }

      const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL
      if (!configuredApiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.")
      }

      const backendResponse = await fetch(`${configuredApiBaseUrl}/bfhl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: decodedInputArray }),
      })

      if (!backendResponse.ok) {
        throw new Error(`Request failed with status ${backendResponse.status}.`)
      }

      const bfhlApiPayload = (await backendResponse.json()) as BFHLResponse
      setGraphProcessingResponse(bfhlApiPayload)
    } catch (requestFailure: unknown) {
      setGraphProcessingResponse(null)
      setRequestFailureMessage(
        requestFailure instanceof Error
          ? requestFailure.message
          : "Something went wrong while processing your graph."
      )
    } finally {
      setIsRequestInFlight(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Graph Processing Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Submit edge arrays, inspect invalid and duplicate entries, and visualize trees and cycles.
          </p>
        </section>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Input Graph Edges</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitEdgeTopologyRequest} className="space-y-4">
              <Textarea
                value={rawEdgeArrayInput}
                onChange={(inputEvent) => setRawEdgeArrayInput(inputEvent.target.value)}
                className="min-h-36 font-mono text-sm"
                placeholder={PLACEHOLDER}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isRequestInFlight}>
                  {isRequestInFlight ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isRequestInFlight ? "Processing..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {requestFailureMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Request Error</AlertTitle>
            <AlertDescription>{requestFailureMessage}</AlertDescription>
          </Alert>
        ) : null}

        {graphProcessingResponse?.invalid_entries?.length ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Invalid Entries</AlertTitle>
            <AlertDescription>
              {graphProcessingResponse.invalid_entries.join(", ")}
            </AlertDescription>
          </Alert>
        ) : null}

        {graphProcessingResponse?.duplicate_edges?.length ? (
          <Alert variant="warning">
            <AlertTriangle className="size-4" />
            <AlertTitle>Duplicate Edges Ignored</AlertTitle>
            <AlertDescription>{graphProcessingResponse.duplicate_edges.join(", ")}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Trees</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {graphProcessingResponse?.summary.total_trees ?? "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Cycles</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {graphProcessingResponse?.summary.total_cycles ?? "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Largest Tree Root</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {graphProcessingResponse?.summary.largest_tree_root || "—"}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tree Visualization</h2>
          <TreeView hierarchies={hierarchyGroups} />
        </section>
      </div>
    </main>
  )
}
