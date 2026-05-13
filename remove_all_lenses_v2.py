#!/usr/bin/env python3
"""
Remove all lenses from glasses images using contour detection.
Finds frame rims (ring shapes) and removes only the interior (lens) area.
Much more precise than distance-transform approach.
"""

from PIL import Image
import numpy as np
import cv2
import os
import glob

def remove_lenses_contour(image_path, output_path):
    """
    Remove lens areas using contour-based detection.
    
    Strategy:
    1. Get binary mask of all non-transparent pixels
    2. Find contours with hierarchy (RETR_CCOMP for 2-level: outer + holes)
    3. For each outer contour that has inner contours (holes), the area between
       outer and inner = frame rim. The area inside the inner contour = lens.
    4. For solid regions without holes (arms, bridge), keep everything.
    5. Fill all detected lens interiors with transparent pixels.
    
    Additionally, handle the case where lens and rim are the same solid blob:
    - If a contour has no holes but is large, try to detect the "ring" shape
      by finding if it encloses a significant area.
    """
    img = Image.open(image_path).convert('RGBA')
    pixels = np.array(img)
    alpha = pixels[:, :, 3]
    
    # Binary mask: 255 for solid, 0 for transparent
    _, mask = cv2.threshold(alpha, 5, 255, cv2.THRESH_BINARY)
    
    # Find contours with hierarchy
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    
    if hierarchy is None:
        # No contours found
        img.save(output_path)
        return 0, 0.0
    
    hierarchy = hierarchy[0]  # Shape: (N, 4) - [next, prev, child, parent]
    
    # Create a mask for pixels to remove (lens areas)
    remove_mask = np.zeros(alpha.shape, dtype=np.uint8)
    
    # Process each contour
    for i, contour in enumerate(contours):
        h = hierarchy[i]
        parent_idx = h[3]  # Parent contour index
        
        if parent_idx == -1:
            # This is an outer contour (top-level)
            # Check if it has children (holes)
            child_idx = h[2]  # First child index
            
            if child_idx != -1:
                # This outer contour has holes - the holes are the lens interiors
                # Fill each hole (child contour) in the remove mask
                child = child_idx
                while child != -1:
                    # Draw filled child contour = lens interior to remove
                    cv2.drawContours(remove_mask, contours, child, 255, -1)
                    child = hierarchy[child][0]  # Next sibling
            else:
                # No holes - this is a solid region (could be arm, bridge, or solid lens)
                # If it's a small region, it's probably a frame part (keep it)
                # If it's a large region, it might be a solid lens area
                area = cv2.contourArea(contour)
                if area > 5000:
                    # Large solid region without holes - likely a lens+rim combined
                    # Try to find the "ring" by erosion
                    # Create a mask for just this contour
                    single_mask = np.zeros(alpha.shape, dtype=np.uint8)
                    cv2.drawContours(single_mask, contours, i, 255, -1)
                    
                    # Erode to find interior
                    kernel_size = max(3, int(np.sqrt(area) * 0.04))  # Adaptive kernel
                    kernel_size = min(kernel_size, 15)
                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
                    eroded = cv2.erode(single_mask, kernel, iterations=3)
                    
                    # The eroded part = interior = lens
                    interior = cv2.bitwise_and(single_mask, cv2.bitwise_not(eroded))
                    # Wait, we want the eroded region (that survived) to be removed? No.
                    # After erosion, what remains is the deep interior (lens)
                    # What was removed by erosion is the frame boundary
                    # So: lens = eroded, frame = original - eroded
                    
                    # Actually: eroded = what's left after removing outer layers = interior
                    # We want to remove the interior (lens)
                    interior_mask = eroded.copy()
                    
                    # But we also need to check if the eroded region is actually lens
                    # (not just a thick frame part)
                    # If the eroded area is more than 30% of the original, it's likely lens
                    eroded_area = np.sum(interior_mask > 0)
                    if eroded_area > area * 0.3:
                        remove_mask = cv2.bitwise_or(remove_mask, interior_mask)
    
    # Also try: for the entire glasses mask, find enclosed regions
    # Sometimes the lens area is a separate solid blob inside the frame ring
    # Use flood fill from image borders to find "outside" transparent region
    # Then any transparent pixel NOT reachable from outside = inside hole = keep transparent
    # Any solid pixel inside a hole = lens
    
    # Alternative approach: use RETR_TREE to find all nested contours
    contours2, hierarchy2 = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if hierarchy2 is not None:
        hierarchy2 = hierarchy2[0]
        # Find contours that are at depth >= 2 (inside a ring inside the outer shape)
        for i, contour in enumerate(contours2):
            depth = 0
            parent = hierarchy2[i][3]
            while parent != -1:
                depth += 1
                parent = hierarchy2[parent][3]
            
            if depth >= 2:
                # This contour is inside a hole inside the outer shape
                # This is likely a lens interior or part of it
                # Actually, depth 2 means it's inside a hole - these are SOLID regions
                # inside holes (like a lens that fills the frame ring's interior)
                cv2.drawContours(remove_mask, contours2, i, 255, -1)
    
    # Apply removal
    pixels_removed = np.sum((remove_mask > 0) & (alpha > 0))
    total_solid = np.sum(alpha > 0)
    removal_pct = (pixels_removed / total_solid * 100) if total_solid > 0 else 0
    
    # Make lens pixels transparent
    result = pixels.copy()
    result[remove_mask > 0, 3] = 0
    
    result_img = Image.fromarray(result)
    result_img.save(output_path)
    
    return int(pixels_removed), removal_pct

# Process all glasses
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
            px_removed, pct = remove_lenses_contour(img_path, img_path)
            total_processed += 1
            total_pixels_removed += px_removed
            status = "✓" if px_removed > 0 else "="
            print(f"  {status} {filename}: removed {px_removed:,} pixels ({pct:.1f}%)")
        except Exception as e:
            print(f"  ✗ {filename}: ERROR - {e}")
            import traceback
            traceback.print_exc()

print(f"\n{'='*50}")
print(f"Total processed: {total_processed}")
print(f"Total lens pixels removed: {total_pixels_removed:,}")
