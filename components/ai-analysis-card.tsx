"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { analysesApi, soilsApi } from "@/lib/api"

interface AiAnalysisCardProps {
  analysisId?: number
  soilId?: number
  type: "analysis" | "soil"
}

export function AiAnalysisCard({ analysisId, soilId, type }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      let response: any

      if (type === "analysis" && analysisId) {
        response = (await analysesApi.getAiAnalysis(analysisId)) as any
      } else if (type === "soil" && soilId) {
        response = (await soilsApi.getAiAnalysis(soilId)) as any
      } else {
        throw new Error("Analysis ID or Soil ID is required")
      }

      const data = response?.data || response
      setAnalysis(data)
    } catch (e) {
      console.error("AI analysis error:", e)
      setError(e instanceof Error ? e.message : "AI tahlilida xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const renderMarkdown = (text: string) => {
    if (!text) return null

    const lines = text.split("\n")
    const elements: JSX.Element[] = []
    let currentList: string[] = []
    let listType: "ul" | "ol" | null = null
    let keyCounter = 0

    const processBold = (line: string) => {
      const parts: (string | JSX.Element)[] = []
      let lastIndex = 0
      const boldRegex = /\*\*(.*?)\*\*/g
      let match

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index))
        }
        parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{match[1]}</strong>)
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex))
      }

      return parts.length > 0 ? parts : [line]
    }

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === "ol" ? "ol" : "ul"
        elements.push(
          <ListTag key={`list-${keyCounter++}`} className={`${listType === "ol" ? "list-decimal" : "list-disc"} ml-6 mb-3 space-y-1`}>
            {currentList.map((item, idx) => (
              <li key={`item-${keyCounter++}-${idx}`} className="text-foreground">
                {processBold(item)}
              </li>
            ))}
          </ListTag>
        )
        currentList = []
        listType = null
      }
    }

    lines.forEach((line, i) => {
      const trimmed = line.trim()

      // Headers
      if (trimmed.startsWith("### ")) {
        flushList()
        elements.push(
          <h3 key={`h3-${keyCounter++}`} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {processBold(trimmed.replace("### ", ""))}
          </h3>
        )
        return
      }

      if (trimmed.startsWith("## ")) {
        flushList()
        elements.push(
          <h2 key={`h2-${keyCounter++}`} className="text-xl font-semibold mt-5 mb-3 text-foreground">
            {processBold(trimmed.replace("## ", ""))}
          </h2>
        )
        return
      }

      if (trimmed.startsWith("# ")) {
        flushList()
        elements.push(
          <h1 key={`h1-${keyCounter++}`} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {processBold(trimmed.replace("# ", ""))}
          </h1>
        )
        return
      }

      // List items
      if (trimmed.match(/^[-*]\s+/)) {
        flushList()
        listType = "ul"
        currentList.push(trimmed.replace(/^[-*]\s+/, ""))
        return
      }

      if (trimmed.match(/^\d+\.\s+/)) {
        if (listType !== "ol") {
          flushList()
          listType = "ol"
        }
        currentList.push(trimmed.replace(/^\d+\.\s+/, ""))
        return
      }

      // Empty line - flush list and add spacing
      if (!trimmed) {
        flushList()
        if (elements.length > 0 && elements[elements.length - 1].type !== "br") {
          elements.push(<br key={`br-${keyCounter++}`} />)
        }
        return
      }

      // Regular paragraph
      flushList()
      elements.push(
        <p key={`p-${keyCounter++}`} className="mb-3 text-foreground leading-relaxed">
          {processBold(trimmed)}
        </p>
      )
    })

    flushList()

    return <div className="space-y-2">{elements}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🤖</span>
            AI Tahlil
          </CardTitle>
          <Button
            onClick={handleAnalyze}
            disabled={loading || (!analysisId && !soilId)}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Tahlil qilinmoqda...
              </span>
            ) : (
              "✨ AI bilan tahlil qilish"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4 border border-red-200">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {analysis?.success && (
          <div className="prose prose-sm max-w-none">
            <div className="space-y-2">
              {type === "analysis" && analysis.ai_analysis && renderMarkdown(analysis.ai_analysis)}
              {type === "soil" && analysis.analysis && renderMarkdown(analysis.analysis)}
            </div>
            {analysis.generated_at && (
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                Tahlil vaqti: {new Date(analysis.generated_at).toLocaleString("uz-UZ")}
              </p>
            )}
          </div>
        )}

        {!analysis && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🧠</div>
            <p className="font-medium mb-1">Gemini AI yordamida tahlil qiling</p>
            <p className="text-sm">
              {type === "analysis"
                ? "Ekin uchun tavsiyalar va o'g'itlash rejasini oling"
                : "Ekin tavsiyalari va o'g'itlash rejasini oling"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

