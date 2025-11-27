"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Polygon, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Import leaflet-draw CSS
import "leaflet-draw/dist/leaflet.draw.css"

// Dynamically import leaflet-draw JS only on client side
let leafletDrawLoaded = false

const loadLeafletDraw = async () => {
  if (typeof window === "undefined" || leafletDrawLoaded) return
  await import("leaflet-draw")
  leafletDrawLoaded = true
}

// Fix for default marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

interface CreateFieldMapProps {
  onGeometryChange: (geometry: { type: "Polygon"; coordinates: number[][][] } | null, center: { lat: number; lng: number } | null) => void
  initialCenter?: [number, number]
}

// Component to add draw controls
function DrawControls({ onGeometryChange }: { onGeometryChange: (geometry: any, center: any) => void }) {
  const map = useMap()
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup())
  const [drawLoaded, setDrawLoaded] = useState(false)

  useEffect(() => {
    if (!map) return

    // Load leaflet-draw
    loadLeafletDraw().then(() => {
      setDrawLoaded(true)
    })
  }, [map])

  useEffect(() => {
    if (!map || !drawLoaded) return

    // Add drawn items layer
    map.addLayer(drawnItemsRef.current)

    // Initialize draw control
    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    })

    map.addControl(drawControl)

    // Handle draw events
    map.on("draw:created", (e: any) => {
      const layer = e.layer
      drawnItemsRef.current.clearLayers()
      drawnItemsRef.current.addLayer(layer)

      const geoJSON = layer.toGeoJSON()
      if (geoJSON.geometry.type === "Polygon") {
        const coords = geoJSON.geometry.coordinates
        // Calculate center
        let sumLat = 0
        let sumLng = 0
        let count = 0
        coords[0].forEach((coord: number[]) => {
          sumLng += coord[0]
          sumLat += coord[1]
          count++
        })
        const center = {
          lat: sumLat / count,
          lng: sumLng / count,
        }
        onGeometryChange(geoJSON.geometry, center)
      }
    })

    map.on("draw:edited", (e: any) => {
      const layers = e.layers
      layers.eachLayer((layer: L.Layer) => {
        const geoJSON = (layer as any).toGeoJSON()
        if (geoJSON.geometry.type === "Polygon") {
          const coords = geoJSON.geometry.coordinates
          let sumLat = 0
          let sumLng = 0
          let count = 0
          coords[0].forEach((coord: number[]) => {
            sumLng += coord[0]
            sumLat += coord[1]
            count++
          })
          const center = {
            lat: sumLat / count,
            lng: sumLng / count,
          }
          onGeometryChange(geoJSON.geometry, center)
        }
      })
    })

    map.on("draw:deleted", () => {
      onGeometryChange(null, null)
    })

    return () => {
      if (drawControl) {
        map.removeControl(drawControl)
      }
      map.removeLayer(drawnItemsRef.current)
    }
  }, [map, onGeometryChange, drawLoaded])

  return null
}

export function CreateFieldMap({ onGeometryChange, initialCenter = [41.3, 69.2] }: CreateFieldMapProps) {
  const [mounted, setMounted] = useState(false)
  const [geometry, setGeometry] = useState<{ type: "Polygon"; coordinates: number[][][] } | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGeometryChange = (geo: any, cent: any) => {
    setGeometry(geo)
    setCenter(cent)
    onGeometryChange(geo, cent)
  }

  if (!mounted) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-neutral-200 overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] rounded-lg border border-neutral-200 overflow-hidden">
      <MapContainer
        center={initialCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        key={`create-map-${mounted}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControls onGeometryChange={handleGeometryChange} />
        {geometry && center && (
          <>
            <Polygon
              positions={geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number])}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
            <Marker position={[center.lat, center.lng]} />
          </>
        )}
      </MapContainer>
      {center && (
        <div className="mt-2 p-2 bg-neutral-50 rounded text-sm">
          <p className="font-medium">Center coordinates:</p>
          <p>Latitude: {center.lat.toFixed(6)}</p>
          <p>Longitude: {center.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  )
}

