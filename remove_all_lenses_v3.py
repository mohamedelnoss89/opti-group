#!/usr/bin/env python3
"""
Remove ALL lenses from glasses images - combined approach.
1. Contour-based: finds lens interiors when frame has visible holes
2. Distance-transform: removes interior of solid blobs (lens+frame combined)
3. Color-based: for sunglasses, detects colored lens regions
"""

from PIL import Image
import numpy as np
import cv2
import os
import glob

def remove_lenses(image_path, output_path):
    img = Image.open(image_path).convert('RGBA')
    pixels = np.array(img)
    alpha = pixels[:, :, 3].copy()
    rgb = pixels[:, :, :3].copy()
    
    original_solid = np.sum(alpha > 0)
    
    # Binary mask of solid pixels
    _, mask = cv2.threshold(alpha, 5, 255, cv2.THRESH_BINARY)
    
    # Create removal mask
    remove_mask = np.zeros(alpha.shape, dtype=np.uint8)
    
    # === APPROACH 1: Contour-based (find holes in frame rings) ===
    contours, hierarchy = cv2.findContours(mask.copy(), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    
    if hierarchy is not None:
        hierarchy = hierarchy[0]
        for i in range(len(contours)):
            h = hierarchy[i]
            parent_idx = h[3]
            
            if parent_idx != -1:
                # This is an inner contour (hole) - this is a lens interior!
                # But check: is this a real hole (transparent area inside frame)?
                # Create a mask of just this contour
                temp_mask = np.zeros(alpha.shape, dtype=np.uint8)
                cv2.drawContours(temp_mask, contours, i, 255, -1)
                
                # Check if this area is already transparent (a real hole) or has lens content
                hole_pixels = np.sum((temp_mask > 0) & (alpha > 5))
                
                if hole_pixels > 100:
                    # This hole has solid content = lens inside frame ring
                    cv2.drawContours(remove_mask, contours, i, 255, -1)
                # If hole_pixels is small, it's already transparent - nothing to remove
    
    # === APPROACH 2: Distance transform on remaining solid areas ===
    # After approach 1, some lenses may still remain in solid blobs
    # Use distance transform to find deep interior pixels
    
    remaining_solid = (alpha > 5) & (remove_mask == 0)
    remaining_mask = remaining_solid.astype(np.uint8) * 255
    
    # Pad with zeros for border handling
    padded = np.pad(remaining_mask, 1, mode='constant', constant_values=0)
    
    # Distance transform
    from scipy.ndimage import distance_transform_edt
    dist = distance_transform_edt(padded)
    dist = dist[1:-1, 1:-1]
    
    # Find connected components in the remaining solid area
    # Each component might be a frame arm, bridge, or lens blob
    num_labels, labels = cv2.connectedComponents(remaining_mask)
    
    for label_id in range(1, num_labels):
        component_mask = (labels == label_id)
        component_area = np.sum(component_mask)
        
        if component_area < 500:
            # Very small component - likely a detail, keep it
            continue
        
        # Get distance values for this component
        component_dists = dist[component_mask]
        max_dist = np.max(component_dists) if len(component_dists) > 0 else 0
        
        if max_dist < 8:
            # All pixels are close to edge - this is a thin frame part (arm, bridge)
            # Keep it entirely
            continue
        
        # This component has interior pixels far from edge
        # It's likely a lens area (or frame+ lens combined)
        
        # Strategy: Find the "ring" shape
        # The frame rim is near the edge (dist < threshold)
        # The lens is the interior (dist > threshold)
        
        # Use adaptive threshold based on the component's max distance
        # For a thin frame + large lens: max_dist could be 50+
        # For a thick frame: max_dist could be 15-20
        # We want to keep the frame rim and remove the lens interior
        
        # Use a threshold that keeps about 15-20% of the max distance as frame
        # But minimum 6 pixels (for thin frames) and maximum 15 pixels
        threshold = max(6, min(15, int(max_dist * 0.15)))
        
        # Mark interior pixels as lens (to remove)
        interior = component_mask & (dist > threshold)
        
        # But wait - we should check if this component is actually a lens
        # or just a thick frame part. Lens areas tend to be larger and more circular.
        
        # Check: if the interior is more than 40% of the component, it's likely a lens
        interior_area = np.sum(interior)
        if interior_area > component_area * 0.4:
            # This is likely a lens - remove the interior
            remove_mask[interior] = 255
        elif component_area > 5000 and max_dist > 15:
            # Large component with deep interior but interior < 40%
            # Might still have a lens. Use more aggressive threshold.
            threshold2 = max(4, int(max_dist * 0.08))
            interior2 = component_mask & (dist > threshold2)
            interior2_area = np.sum(interior2)
            if interior2_area > component_area * 0.2:
                remove_mask[interior2] = 255
    
    # === APPROACH 3: Color-based detection for sunglasses ===
    # After approaches 1 & 2, check if any colored lens areas remain
    # Sunglasses lenses are typically dark colored (brown, gray, green, blue)
    # Frame rims are typically black, dark gray, or metallic
    
    # Check remaining solid pixels after removal
    post_solid = (alpha > 5) & (remove_mask == 0)
    
    # For each remaining connected component, check if it's a lens by color
    post_mask = post_solid.astype(np.uint8) * 255
    num_labels2, labels2 = cv2.connectedComponents(post_mask)
    
    for label_id in range(1, num_labels2):
        component_mask2 = (labels2 == label_id)
        component_area2 = np.sum(component_mask2)
        
        if component_area2 < 1000:
            continue
        
        # Get RGB values of this component
        comp_rgb = rgb[component_mask2]
        mean_r = np.mean(comp_rgb[:, 0])
        mean_g = np.mean(comp_rgb[:, 1])
        mean_b = np.mean(comp_rgb[:, 2])
        
        # Check color variance - lenses tend to be more uniform in color
        std_r = np.std(comp_rgb[:, 0])
        std_g = np.std(comp_rgb[:, 1])
        std_b = np.std(comp_rgb[:, 2])
        avg_std = (std_r + std_g + std_b) / 3
        
        # Check if this is a colored lens (not a typical frame color)
        # Frame colors: black (all channels low), brown/dark (all channels medium-low)
        # Lens colors: brown, blue, green, yellow - usually more saturated
        
        # Convert mean color to HSV for better analysis
        mean_color = np.uint8([[[int(mean_r), int(mean_g), int(mean_b)]]])
        hsv_color = cv2.cvtColor(mean_color, cv2.COLOR_RGB2HSV)
        h, s, v = hsv_color[0, 0]
        
        # Lens detection criteria:
        # 1. Has some saturation (colored, not gray/black) - s > 30
        # 2. Low color variance (uniform lens color) - avg_std < 40
        # 3. Not too dark (not black frame) and not too bright (not white)
        # 4. Component is large enough (lenses are big areas)
        
        is_colored_lens = (
            s > 30 and 
            avg_std < 50 and 
            v > 30 and v < 220 and
            component_area2 > 3000
        )
        
        # Also check for dark uniform lenses (sunglasses)
        is_dark_lens = (
            v < 80 and 
            avg_std < 30 and 
            component_area2 > 5000 and
            np.max(dist[component_mask2]) > 8
        )
        
        if is_colored_lens or is_dark_lens:
            # This looks like a lens - remove interior using distance transform
            comp_dists = dist[component_mask2]
            comp_max_dist = np.max(comp_dists) if len(comp_dists) > 0 else 0
            
            if comp_max_dist > 8:
                threshold3 = max(5, int(comp_max_dist * 0.12))
                interior3 = component_mask2 & (dist > threshold3)
                interior3_area = np.sum(interior3)
                if interior3_area > component_area2 * 0.2:
                    remove_mask[interior3] = 255
    
    # === Final cleanup: remove any remaining large interior areas ===
    # One more pass with distance transform on the final state
    final_solid = (alpha > 5) & (remove_mask == 0)
    final_mask = final_solid.astype(np.uint8) * 255
    padded_final = np.pad(final_mask, 1, mode='constant', constant_values=0)
    dist_final = distance_transform_edt(padded_final)[1:-1, 1:-1]
    
    # Find any remaining pixels very far from edge (definitely lens interior)
    deep_interior = final_solid & (dist_final > 20)
    deep_area = np.sum(deep_interior)
    if deep_area > 500:
        remove_mask[deep_interior] = 255
    
    # Apply removal
    pixels_removed = np.sum((remove_mask > 0) & (alpha > 0))
    removal_pct = (pixels_removed / original_solid * 100) if original_solid > 0 else 0
    
    result = pixels.copy()
    result[remove_mask > 0, 3] = 0
    
    # Also make any remaining semi-transparent lens pixels more transparent
    # (for prescription glasses with faint lens tint)
    remaining_alpha = result[:, :, 3]
    semi_transparent = (remaining_alpha > 0) & (remaining_alpha < 100)
    if np.sum(semi_transparent) > 0:
        # Check if these are in interior positions (likely faint lens remnants)
        padded_rem = np.pad((remaining_alpha > 0).astype(np.uint8) * 255, 1, mode='constant', constant_values=0)
        dist_rem = distance_transform_edt(padded_rem)[1:-1, 1:-1]
        faint_lens = semi_transparent & (dist_rem > 6)
        result[faint_lens, 3] = 0
        faint_removed = np.sum(faint_lens)
        if faint_removed > 0:
            pixels_removed += faint_removed
            removal_pct = (pixels_removed / original_solid * 100) if original_solid > 0 else 0
    
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
            px_removed, pct = remove_lenses(img_path, img_path)
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
