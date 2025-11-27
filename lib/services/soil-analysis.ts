// Soil Analysis Service - calculates element statuses and pH classification
export interface ElementStatus {
  name: string
  value: number
  status: "low" | "optimal" | "high"
  unit: string
}

export interface SoilAnalysisResult {
  fieldName: string
  ph: number
  phClassification: string
  elements: ElementStatus[]
  overallHealth: number
}

export function analyzeSoil(soilData: any): SoilAnalysisResult {
  const ph = soilData.ph || 6.5

  // Determine pH classification
  let phClassification = "Neutral"
  if (ph < 5.5) phClassification = "Very Acidic"
  else if (ph < 6.5) phClassification = "Acidic"
  else if (ph < 7.5) phClassification = "Neutral"
  else if (ph < 8.5) phClassification = "Alkaline"
  else phClassification = "Very Alkaline"

  // Analyze elements
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

  // Calculate overall health (0-100)
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
