#!/usr/bin/env python3
"""Regenerate remaining bad glasses images."""
import subprocess, os, sys
from rembg import remove
from PIL import Image
import numpy as np

BASE = "/home/z/my-project/public/glasses"

REMAINING = [
    ("women-prescription", "women-prescription-2.png", "Pink cat-eye womens prescription glasses, thick stylish frame"),
    ("women-prescription", "women-prescription-3.png", "Purple oval womens prescription glasses, thick frame"),
    ("women-prescription", "women-prescription-4.png", "Gold round womens prescription glasses, thin metal frame"),
    ("women-prescription", "women-prescription-5.png", "Clear transparent womens prescription glasses, rectangular frame"),
    ("women-prescription", "women-prescription-6.png", "Pink round womens prescription glasses, thick frame"),
    ("women-prescription", "women-prescription-7.png", "Tortoiseshell cat-eye womens prescription glasses, thick frame"),
    ("women-prescription", "women-prescription-8.png", "Brown rectangular womens prescription glasses, classic frame"),
    ("women-prescription", "women-prescription-11.png", "Pink rectangular womens prescription glasses, thick frame"),
    ("women-sunglasses", "women-sunglasses-2.png", "Brown oversized womens sunglasses, thick frame"),
    ("women-sunglasses", "women-sunglasses-3.png", "Pink round womens sunglasses, thick frame"),
    ("women-sunglasses", "women-sunglasses-7.png", "Purple shield womens sunglasses, modern frame"),
    ("women-sunglasses", "women-sunglasses-10.png", "Matte black oversized womens sunglasses, thick frame"),
    ("women-sunglasses", "women-sunglasses-11.png", "Red retro womens sunglasses, thick frame"),
    ("women-sunglasses", "women-sunglasses-13.png", "Colorful multicolor womens sunglasses, thick frame"),
]

results = []
for i, (cat, fname, prompt) in enumerate(REMAINING):
    outpath = os.path.join(BASE, cat, fname)
    tmppath = outpath.replace(".png", "_raw.png")
    
    full_prompt = f"A pair of {prompt}, eyewear product photo on solid bright lime green chroma key background, high contrast between glasses and green, clear frame details visible, professional well-lit studio shot"
    
    print(f"[{i+1}/14] {cat}/{fname}...", end=" ", flush=True)
    
    try:
        r = subprocess.run(
            ["z-ai-generate", "-p", full_prompt, "-o", tmppath, "-s", "1024x1024"],
            capture_output=True, text=True, timeout=120
        )
        
        if not os.path.exists(tmppath):
            print("FAIL gen")
            results.append((f"{cat}/{fname}", "FAIL", 0))
            continue
        
        img = Image.open(tmppath)
        result = remove(img)
        
        w, h = result.size
        if w > 800 or h > 800:
            ratio = min(800/w, 800/h)
            result = result.resize((int(w*ratio), int(h*ratio)), Image.LANCZOS)
        
        result.save(outpath, "PNG", optimize=True)
        os.remove(tmppath)
        
        arr = np.array(result)
        frame_px = (arr[:,:,3] > 200).sum()
        pct = frame_px / arr.shape[0] / arr.shape[1] * 100
        print(f"OK {pct:.1f}%")
        results.append((f"{cat}/{fname}", "OK", pct))
    except Exception as e:
        print(f"FAIL {str(e)[:60]}")
        results.append((f"{cat}/{fname}", "FAIL", 0))
        if os.path.exists(tmppath):
            os.remove(tmppath)

print("\n=== REMAINING DONE ===")
for name, status, pct in results:
    if status == "OK":
        print(f"  {name}: {status} {pct:.1f}%")
    else:
        print(f"  {name}: {status}")
