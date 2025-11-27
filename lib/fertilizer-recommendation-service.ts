// Fertilizer Recommendation Service
export interface FertilizerRecommendation {
  type: string
  name: string
  recommended: boolean
  amountKgHa: number
  benefit: string
  reason: string
}

export interface FertilizerRecommendationResult {
  recommendations: FertilizerRecommendation[]
  totalNitrogenKgHa: number
  totalPhosphorusKgHa: number
  totalPotassiumKgHa: number
  estimatedCost: number
}

export const fertilizerRecommendationService = {
  async getRecommendations(analyses: any[]): Promise<FertilizerRecommendation[]> {
    if (!analyses || analyses.length === 0) {
      return [
        {
          type: "Maintenance",
          name: "Standard NPK 10-10-10",
          recommended: false,
          amountKgHa: 100,
          benefit: "Maintenance nutrition",
          reason: "No analyses available",
        },
      ]
    }

    const recommendations: FertilizerRecommendation[] = []

    analyses.forEach((analysis: any) => {
      const nitrogen = analysis.nitrogen || 40
      const phosphorus = analysis.phosphorus || 20
      const potassium = analysis.potassium || 180

      if (nitrogen < 35) {
        recommendations.push({
          type: "Nitrogen",
          name: "Urea (46-0-0)",
          recommended: true,
          amountKgHa: 100,
          benefit: "Increases yield and protein content",
          reason: "Low nitrogen levels detected",
        })
      }

      if (phosphorus < 20) {
        recommendations.push({
          type: "Phosphorus",
          name: "Superphosphate (0-18-0)",
          recommended: true,
          amountKgHa: 80,
          benefit: "Improves root development",
          reason: "Low phosphorus levels detected",
        })
      }

      if (potassium < 180) {
        recommendations.push({
          type: "Potassium",
          name: "Potassium Chloride (0-0-60)",
          recommended: true,
          amountKgHa: 60,
          benefit: "Enhances disease resistance",
          reason: "Suboptimal potassium levels",
        })
      }
    })

    return recommendations.length > 0
      ? recommendations
      : [
          {
            type: "Maintenance",
            name: "Standard NPK 10-10-10",
            recommended: false,
            amountKgHa: 100,
            benefit: "Maintenance nutrition",
            reason: "Soil is in good condition",
          },
        ]
  },

  calculateAmounts(soilData: any, fieldAreaHa = 10): FertilizerRecommendationResult {
    const nitrogen = soilData.nitrogen || 40
    const phosphorus = soilData.phosphorus || 20
    const potassium = soilData.potassium || 180

    const recommendations: FertilizerRecommendation[] = []

    if (nitrogen < 35) {
      recommendations.push({
        type: "Nitrogen",
        name: "Urea (46-0-0)",
        recommended: true,
        amountKgHa: 100,
        benefit: "Increases yield",
        reason: "Low nitrogen",
      })
    }

    if (phosphorus < 20) {
      recommendations.push({
        type: "Phosphorus",
        name: "Superphosphate (0-18-0)",
        recommended: true,
        amountKgHa: 80,
        benefit: "Root development",
        reason: "Low phosphorus",
      })
    }

    if (potassium < 180) {
      recommendations.push({
        type: "Potassium",
        name: "Potassium Chloride (0-0-60)",
        recommended: true,
        amountKgHa: 60,
        benefit: "Disease resistance",
        reason: "Low potassium",
      })
    }

    const totalN = recommendations.filter((r) => r.type === "Nitrogen").reduce((sum, r) => sum + r.amountKgHa, 0) || 80
    const totalP =
      recommendations.filter((r) => r.type === "Phosphorus").reduce((sum, r) => sum + r.amountKgHa, 0) || 50
    const totalK = recommendations.filter((r) => r.type === "Potassium").reduce((sum, r) => sum + r.amountKgHa, 0) || 40

    const estimatedCost = (totalN * 40 + totalP * 45 + totalK * 35) * fieldAreaHa

    return {
      recommendations,
      totalNitrogenKgHa: totalN,
      totalPhosphorusKgHa: totalP,
      totalPotassiumKgHa: totalK,
      estimatedCost: Math.round(estimatedCost),
    }
  },
}
