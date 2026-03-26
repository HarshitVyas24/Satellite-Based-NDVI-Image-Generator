// Updated NDVI Frontend with Option 1 (Paste GeoJSON) + Option 2 (Draw AOI on Map)
// Full React component ready for Vite + React
// Uses Leaflet for map drawing

import React, { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

export default function NdviFrontend() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:5000');
  const [geojsonInput, setGeojsonInput] = useState('');
  const [drawnGeoJSON, setDrawnGeoJSON] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrawCreate = (e) => {
    const layer = e.layer;
    const gj = layer.toGeoJSON();
    setDrawnGeoJSON(gj.geometry);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResultUrl(null);

    let finalAOI = null;

    if (drawnGeoJSON) {
      finalAOI = drawnGeoJSON;
    } else if (geojsonInput.trim()) {
      try {
        finalAOI = JSON.parse(geojsonInput);
      } catch {
        setError('Invalid GeoJSON');
        return;
      }
    } else {
      setError('Please paste GeoJSON or draw an AOI.');
      return;
    }

    if (!start || !end) {
      setError('Start and End dates required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/ndvi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi: finalAOI, start, end })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');

      setResultUrl(json.thumb_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-4">NDVI Generator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2">Option 1: Paste GeoJSON</h2>
            <textarea
              className="w-full h-40 border p-2 rounded"
              placeholder="Paste GeoJSON here..."
              value={geojsonInput}
              onChange={(e) => setGeojsonInput(e.target.value)}
            />
          </div>

          <div>
            <h2 className="font-semibold mb-2">Option 2: Draw AOI on Map</h2>
            <MapContainer
              center={[20.59, 78.96]}
              zoom={5}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={handleDrawCreate}
                  draw={{
                    circle: false,
                    marker: false,
                    circlemarker: false,
                    polyline: false
                  }}
                />
              </FeatureGroup>
            </MapContainer>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-3 gap-4">
          <div>
            <label>Start Date</label>
            <input type="date" className="w-full border p-2" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" className="w-full border p-2" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
              {loading ? 'Generating…' : 'Generate NDVI'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {resultUrl && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Result:</h2>
            <img src={resultUrl} alt="NDVI" className="max-w-full border" />
          </div>
        )}
      </div>
    </div>
  );
}
