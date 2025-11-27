// Soil Analysis Service - calculates element statuses and pH classification
export function calculateElementStatus(soils: any[]): { [key: string]: string } {
  if (!soils || soils.length === 0) {
    return {
      Nitrogen: "Unknown",
      Phosphorus: "Unknown",
      Potassium: "Unknown",
      "Organic Matter": "Unknown",
    }
  }

  const avgNitrogen = soils.reduce((sum, s) => sum + (s.nitrogen || 40), 0) / soils.length
  const avgPhosphorus = soils.reduce((sum, s) => sum + (s.phosphorus || 20), 0) / soils.length
  const avgPotassium = soils.reduce((sum, s) => sum + (s.potassium || 180), 0) / soils.length
  const avgOrganicMatter = soils.reduce((sum, s) => sum + (s.organic_matter || 3.0), 0) / soils.length

  const getStatus = (value: number, low: number, high: number) => {
    if (value < low) return "Low"
    if (value > high) return "High"
    return "Optimal"
  }

  return {
    Nitrogen: getStatus(avgNitrogen, 30, 60),
    Phosphorus: getStatus(avgPhosphorus, 15, 30),
    Potassium: getStatus(avgPotassium, 150, 250),
    "Organic Matter": getStatus(avgOrganicMatter, 2, 4),
  }
}

export interface ElementStatus {
  name: string
  value: number
  status: "low" | "optimal" | "high"
  unit: string
}

export function analyzeSoil(soilData: any) {
  const ph = soilData.ph || 6.5

  let phClassification = "Neutral"
  if (ph < 5.5) phClassification = "Very Acidic"
  else if (ph < 6.5) phClassification = "Acidic"
  else if (ph < 7.5) phClassification = "Neutral"
  else if (ph < 8.5) phClassification = "Alkaline"
  else phClassification = "Very Alkaline"

  const nitrogen = soilData.nitrogen || 40
  const phosphorus = soilData.phosphorus || 20
  const potassium = soilData.potassium || 180
  const organicMatter = soilData.organic_matter || 3.0

  const elements: ElementStatus[] = [
    {
      name: "Nitrogen (N)",
      value: nitrogen,
      status: nitrogen < 30 ? "low" : nitrogen > 60 ? "high" : "optimal",
      unit: "mg/kg",
    },
    {
      name: "Phosphorus (P)",
      value: phosphorus,
      status: phosphorus < 15 ? "low" : phosphorus > 30 ? "high" : "optimal",
      unit: "mg/kg",
    },
    {
      name: "Potassium (K)",
      value: potassium,
      status: potassium < 150 ? "low" : potassium > 250 ? "high" : "optimal",
      unit: "mg/kg",
    },
    {
      name: "Organic Matter",
      value: organicMatter,
      status: organicMatter < 2 ? "low" : organicMatter > 4 ? "high" : "optimal",
      unit: "%",
    },
  ]

  const optimalCount = elements.filter((e) => e.status === "optimal").length
  const overallHealth = (optimalCount / elements.length) * 100

  return {
    fieldName: soilData.field_name || "Field",
    ph,
    phClassification,
    elements,
    overallHealth: Math.round(overallHealth),
  }
}
