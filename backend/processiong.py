import cv2 #type: ignore
import numpy as np #type: ignore
import rasterio #type: ignore

def make_overlay(tif_path, output_png):
    with rasterio.open(tif_path) as src:
        ndvi = src.read(1)

    scaled = ((ndvi + 1) / 2 * 255).astype(np.uint8)
    colored = cv2.applyColorMap(scaled, cv2.COLORMAP_JET)

    cv2.imwrite(output_png, colored)
    return output_png
