"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface Field {
  id: number
  name: string
  area_ha: number
  soil_type: string
  center_lat?: number
  center_lng?: number
  geometry?: {
    type: "Polygon"
    coordinates: number[][][]
  }
}

interface FieldsMapProps {
  fields: Field[]
}

// Component to fit map bounds to show all fields
function MapBounds({ fields }: { fields: Field[] }) {
  const map = useMap()

  useEffect(() => {
    if (fields.length === 0) return

    const bounds: L.LatLngTuple[] = []

    fields.forEach((field) => {
      if (field.geometry?.coordinates) {
        // Extract coordinates from GeoJSON Polygon
        const coords = field.geometry.coordinates[0]
        coords.forEach((coord) => {
          // GeoJSON format: [longitude, latitude]
          bounds.push([coord[1], coord[0]] as L.LatLngTuple)
        })
      } else if (field.center_lat && field.center_lng) {
        bounds.push([field.center_lat, field.center_lng] as L.LatLngTuple)
      }
    })

    if (bounds.length > 0) {
      const latLngBounds = L.latLngBounds(bounds)
      map.fitBounds(latLngBounds, { padding: [50, 50] })
    }
  }, [fields, map])

  return null
}

export function FieldsMap({ fields }: FieldsMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default center (Uzbekistan)
  const defaultCenter: [number, number] = [41.3, 69.2]
  const defaultZoom = 10

  // Calculate center from fields or use default
  const center: [number, number] = (() => {
    const fieldsWithCoords = fields.filter((f) => f.center_lat && f.center_lng)
    if (fieldsWithCoords.length > 0) {
      const avgLat =
        fieldsWithCoords.reduce((sum, f) => sum + (f.center_lat || 0), 0) / fieldsWithCoords.length
      const avgLng =
        fieldsWithCoords.reduce((sum, f) => sum + (f.center_lng || 0), 0) / fieldsWithCoords.length
      return [avgLat, avgLng]
    }
    return defaultCenter
  })()

  if (!mounted) {
    return (
      <div className="w-full h-[500px] rounded-lg border border-neutral-200 overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[500px] rounded-lg border border-neutral-200 overflow-hidden">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        key={`map-${mounted}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds fields={fields} />
        {fields.map((field) => {
          // Render polygon if geometry exists
          if (field.geometry?.coordinates) {
            const coords = field.geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number])
            return (
              <Polygon
                key={field.id}
                positions={coords}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{field.name}</h3>
                    <p>Area: {field.area_ha} ha</p>
                    {field.soil_type && <p>Soil: {field.soil_type}</p>}
                  </div>
                </Popup>
              </Polygon>
            )
          }
          // Render marker if only center coordinates exist
          else if (field.center_lat && field.center_lng) {
            return (
              <Marker key={field.id} position={[field.center_lat, field.center_lng]}>
                <Popup>
                  <div>
                    <h3 className="font-bold">{field.name}</h3>
                    <p>Area: {field.area_ha} ha</p>
                    {field.soil_type && <p>Soil: {field.soil_type}</p>}
                  </div>
                </Popup>
              </Marker>
            )
          }
          return null
        })}
      </MapContainer>
    </div>
  )
}

