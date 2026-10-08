"""Crop in-app illustrations out of the concept mockups in assets/concept/.

Usage (from the repo root):  python3 scripts/crop_concept_images.py

Boxes are (left, top, right, bottom) in pixels of the 1536x1024 mockups.
All results are AI concept imagery and are labelled as such in src/data/media.ts.
"""
import os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'concept', 'concept-{}.webp')
OUT = os.path.join(ROOT, 'assets', 'images')
C = {
 # image 2 bottom strip — site "photos"
 'site-hatch':      (2, (22, 790, 205, 955)),
 'site-kitchen':    (2, (214, 778, 398, 960)),
 'site-termite':    (2, (412, 778, 594, 955)),
 'site-well':       (2, (602, 775, 788, 945)),
 'site-meeting':    (2, (797, 780, 968, 955)),
 'site-medical':    (2, (978, 780, 1158, 950)),
 'site-bomb':       (2, (1174, 776, 1338, 955)),
 # image 1
 'companion-cook':  (1, (268, 152, 326, 212)),
 'companion-liaison':(1,(268, 228, 326, 290)),
 'companion-medic': (1, (268, 308, 326, 370)),
 'companion-villager':(1,(268, 388, 326, 450)),
 'archive-kitchen': (1, (930, 170, 1115, 320)),
 'vr-interior':     (1, (936, 664, 1288, 806)),
 'ar-leaves':       (1, (700, 90, 905, 300)),
 # image 3
 'ar-kitchen-real': (3, (16, 526, 222, 716)),
 'ar-kitchen-ghost':(3, (232, 526, 372, 716)),
 'ar-hatch-real':   (3, (568, 516, 718, 718)),
  # image 4/5
 'hero-tunnel':     (3, (22, 92, 226, 236)),
 'ar-meeting-ghost':(4, (648, 105, 890, 395)),
 'story-witness':   (4, (938, 105, 1180, 240)),
}
for name,(img,box) in C.items():
    im = Image.open(SRC.format(img)).convert('RGB').crop(box)
    w,h = im.size
    s = max(1, 800/ max(w,h))
    if s>1: im = im.resize((int(w*s), int(h*s)), Image.LANCZOS)
    im.save(os.path.join(OUT, f'{name}.jpg'), quality=86)

# Seamless 360° strip for the VR screen: the interior plus its mirror image.
im = Image.open(os.path.join(OUT, 'vr-interior.jpg'))
h = 900
im = im.resize((int(im.width * h / im.height), h))
pano = Image.new('RGB', (im.width * 2, h))
pano.paste(im, (0, 0))
pano.paste(ImageOps.mirror(im), (im.width, 0))
pano.save(os.path.join(OUT, 'vr-pano.jpg'), quality=84)
print(f'{len(C) + 1} images written to {OUT}')
