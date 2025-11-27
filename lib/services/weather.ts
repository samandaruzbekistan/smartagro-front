// Weather Service - fetches/generates weather data for field coordinates
export interface WeatherData {
  fieldId: number
  fieldName: string
  temperature: number
  humidity: number
  windSpeed: number
  rainfall: number
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  day: string
  high: number
  low: number
  condition: string
  precipitation: number
}

export function getWeatherData(field: any): WeatherData {
  // Simulate weather based on coordinates (in real app, use API)
  const temp = 22 + Math.sin(field.center_lat / 10) * 8
  const humidity = 55 + Math.cos(field.center_lng / 10) * 20

  const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"]

  const forecast: WeatherForecast[] = [
    { day: "Today", high: 28, low: 18, condition: "Sunny", precipitation: 0 },
    { day: "Tomorrow", high: 26, low: 16, condition: "Cloudy", precipitation: 5 },
    { day: "Day 3", high: 24, low: 14, condition: "Rainy", precipitation: 25 },
    { day: "Day 4", high: 25, low: 15, condition: "Partly Cloudy", precipitation: 10 },
    { day: "Day 5", high: 27, low: 17, condition: "Sunny", precipitation: 0 },
  ]

  return {
    fieldId: field.id,
    fieldName: field.name || "Field",
    temperature: Math.round(temp * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round((Math.random() * 15 + 5) * 10) / 10,
    rainfall: Math.round(Math.random() * 30),
    forecast,
  }
}
