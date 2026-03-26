import ee
import json
from datetime import datetime

def get_ndvi(aoi_geojson, start_date, end_date):
    # Initialize Earth Engine
    ee.Initialize(project='epics-gee-ndvi-project')


    # Convert AOI GeoJSON to EE Geometry
    aoi = ee.Geometry(aoi_geojson)

    # Load Sentinel-2 data
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR")
        .filterBounds(aoi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    # Take median image
    image = collection.median()

    # Compute NDVI
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    # Create thumbnail visualization
    url = ndvi.getThumbURL({
    "min": -0.1,
    "max": 0.5,
    "palette": ["red", "yellow", "green"],
    "region": aoi,
    "dimensions": 512   # much smaller image
})



    return url

