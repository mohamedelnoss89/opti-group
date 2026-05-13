#!/usr/bin/env python3
"""
Remove all lenses from glasses images - make them frame-only.
Uses distance transform to identify interior (lens) pixels vs frame boundary pixels.
"""

from PIL import Image
import numpy as np
from scipy.ndimage import distance_transform_edt
import os
import glob

def remove_lenses(image_path, output_path, distance_threshold=4):
    """
    Remove lens areas from a glasses image, keeping only the frame.
    
    Strategy:
    1. Get alpha mask of non-transparent pixels
    2. Pad with zeros (transparent) at borders
    3. Compute distance transform = distance of each solid pixel to nearest transparent pixel
    4. Pixels with large distance = deep interior = lens pixels
    5. Make lens pixels transparent, keep frame boundary pixels
    """
    img = Image.open(image_path).convert('RGBA')
    pixels = np.array(img)
    alpha = pixels[:, :, 3]
    
    # Create binary mask: 1 for solid, 0 for transparent
    # Use a low threshold to catch semi-transparent lens pixels too
    mask = (alpha > 5).astype(np.float64)
    
    # Pad the mask with zeros to handle glasses that touch image borders
    padded = np.pad(mask, 1, mode='constant', constant_values=0)
    
    # Compute distance transform: distance of each 1-pixel to nearest 0-pixel
    dist = distance_transform_edt(padded)
    
    # Remove the padding
    dist = dist[1:-1, 1:-1]
    
    # Identify lens pixels: solid pixels that are far from the edge (interior)
    # These are the lens areas we want to remove
    is_solid = alpha > 5
    is_lens = is_solid & (dist > distance_threshold)
    
    # Count pixels removed for reporting
    pixels_removed = np.sum(is_lens)
    total_solid = np.sum(is_solid)
    
    if total_solid > 0:
        removal_pct = (pixels_removed / total_solid) * 100
    else:
        removal_pct = 0
    
    # Make lens pixels fully transparent
    result = pixels.copy()
    result[is_lens, 3] = 0  # Set alpha to 0 for lens pixels
    
    # Save result
    result_img = Image.fromarray(result)
    result_img.save(output_path)
    
    return pixels_removed, removal_pct

# Find all glasses images
base_dir = '/home/z/my-project/public/glasses'
categories = ['men-prescription', 'women-prescription', 'men-sunglasses', 'women-sunglasses', 'kids']

total_processed = 0
total_pixels_removed = 0

for category in categories:
    cat_dir = os.path.join(base_dir, category)
    if not os.path.exists(cat_dir):
        continue
    
    images = sorted(glob.glob(os.path.join(cat_dir, '*.png')))
    print(f"\n=== {category} ({len(images)} images) ===")
    
    for img_path in images:
        filename = os.path.basename(img_path)
        try:
            px_removed, pct = remove_lenses(img_path, img_path, distance_threshold=4)
            total_processed += 1
            total_pixels_removed += px_removed
            status = "✓" if px_removed > 0 else "="
            print(f"  {status} {filename}: removed {px_removed:,} pixels ({pct:.1f}%)")
        except Exception as e:
            print(f"  ✗ {filename}: ERROR - {e}")

print(f"\n{'='*50}")
print(f"Total processed: {total_processed}")
print(f"Total lens pixels removed: {total_pixels_removed:,}")
