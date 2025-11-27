// Fertilizer Recommendation Service - recommends fertilizers and calculates amounts
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

export function recommendFertilizers(soilData: any, fieldAreaHa = 10): FertilizerRecommendationResult {
  const nitrogen = soilData.nitrogen || 40
  const phosphorus = soilData.phosphorus || 20
  const potassium = soilData.potassium || 180

  const recommendations: FertilizerRecommendation[] = []

  // Nitrogen recommendations
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

  // Phosphorus recommendations
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

  // Potassium recommendations
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

  // Balanced recommendations
  if (nitrogen >= 35 && phosphorus >= 20 && potassium >= 180) {
    recommendations.push({
      type: "Balanced",
      name: "NPK 15-15-15",
      recommended: true,
      amountKgHa: 200,
      benefit: "Maintains optimal nutrient balance",
      reason: "Well-balanced soil profile",
    })
  }

  const totalN = recommendations.filter((r) => r.type === "Nitrogen").reduce((sum, r) => sum + r.amountKgHa, 0) || 80
  const totalP = recommendations.filter((r) => r.type === "Phosphorus").reduce((sum, r) => sum + r.amountKgHa, 0) || 50
  const totalK = recommendations.filter((r) => r.type === "Potassium").reduce((sum, r) => sum + r.amountKgHa, 0) || 40

  // Estimate cost (typical prices: N=40/kg, P=45/kg, K=35/kg)
  const estimatedCost = (totalN * 40 + totalP * 45 + totalK * 35) * fieldAreaHa

  return {
    recommendations:
      recommendations.length > 0
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
          ],
    totalNitrogenKgHa: totalN,
    totalPhosphorusKgHa: totalP,
    totalPotassiumKgHa: totalK,
    estimatedCost: Math.round(estimatedCost),
  }
}
