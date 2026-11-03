import sys

with open("/tmp/india.ppm", "rb") as f:
    header = []
    while len(header) < 3:
        line = f.readline().strip()
        if not line or line.startswith(b"#"): continue
        header.extend(line.split())
    magic, w, h = header[0], int(header[1]), int(header[2])
    maxval = int(f.readline().strip())
    raw = bytearray(f.read())

def get_pixel(x, y):
    if x < 0 or x >= w or y < 0 or y >= h: return (255, 255, 255)
    idx = (y * w + x) * 3
    return (raw[idx], raw[idx+1], raw[idx+2])

def set_pixel(x, y, r, g, b):
    if x < 0 or x >= w or y < 0 or y >= h: return
    idx = (y * w + x) * 3
    raw[idx] = r
    raw[idx+1] = g
    raw[idx+2] = b

# 1. External white regions (remove text, pointer lines, and INDIA title)
white_boxes = [
    # (x1, y1, x2, y2)
    (420, 10, 502, 45),   # INDIA title + underline
    (195, 95, 265, 120),  # Chandigarh label and line
    (170, 158, 205, 175), # Delhi label and line
    (365, 172, 405, 195), # Sikkim label and line
    (375, 248, 422, 268), # Tripura label and line
    (5, 315, 80, 335),    # Daman and Diu label and line
    (5, 335, 95, 370),    # Dadra and Nagar Haveli label and line
    (60, 415, 100, 435),  # Goa label and line
    (100, 510, 145, 532), # Kerala label and line
    (230, 485, 290, 515), # Puducherry label and line
    (250, 485, 275, 570), # Long vertical Puducherry line
    (35, 520, 115, 545),  # Lakshadweep label
    (375, 500, 500, 525), # Andaman and Nicobar Islands label
]

for x1, y1, x2, y2 in white_boxes:
    for y in range(y1, y2):
        for x in range(x1, x2):
            set_pixel(x, y, 255, 255, 255)

# 2. Internal state labels: replace dark text pixels with the local state background color
internal_label_boxes = [
    # (x1, y1, x2, y2)
    (115, 42, 200, 68),   # Jammu - Kashmir
    (140, 85, 205, 115),  # Himachal Pradesh
    (118, 112, 160, 132), # Punjab
    (170, 126, 235, 146), # Uttarakhand
    (130, 146, 178, 164), # Haryana
    (70, 200, 150, 222),  # Rajasthan
    (190, 182, 270, 204), # Uttar Pradesh
    (298, 210, 340, 230), # Bihar
    (280, 248, 340, 268), # Jharkhand
    (325, 258, 375, 290), # West Bengal
    (285, 305, 340, 328), # Orissa
    (150, 258, 240, 280), # Madhya Pradesh
    (48, 265, 100, 288),  # Gujarat
    (105, 332, 180, 355), # Maharashtra
    (170, 352, 230, 374), # Telangana
    (225, 288, 295, 310), # Chhattisgarh
    (110, 430, 170, 452), # Karnataka
    (150, 420, 230, 444), # Andhra Pradesh
    (155, 492, 220, 514), # Tamil Nadu
    (400, 190, 445, 210), # Assam
    (375, 208, 435, 228), # Meghalaya
    (430, 140, 500, 172), # Arunachal Pradesh
    (455, 198, 502, 218), # Nagaland
    (450, 232, 495, 252), # Manipur
    (435, 265, 480, 286), # Mizoram
]

for x1, y1, x2, y2 in internal_label_boxes:
    # Sample background color in the box: collect non-dark, non-white pixels
    colors = []
    for y in range(y1, y2):
        for x in range(x1, x2):
            r, g, b = get_pixel(x, y)
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if 140 < lum < 252:
                colors.append((r, g, b))
    
    if not colors:
        continue
    
    # Average pastel background
    avg_r = int(sum(c[0] for c in colors) / len(colors))
    avg_g = int(sum(c[1] for c in colors) / len(colors))
    avg_b = int(sum(c[2] for c in colors) / len(colors))

    # Inpaint: any pixel that is dark (lum < 160) or close to black text, replace with avg color
    for y in range(y1, y2):
        for x in range(x1, x2):
            r, g, b = get_pixel(x, y)
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum < 160:
                set_pixel(x, y, avg_r, avg_g, avg_b)

with open("/tmp/india_clean.ppm", "wb") as f:
    f.write(b"P6\n" + str(w).encode() + b" " + str(h).encode() + b"\n255\n")
    f.write(raw)

print("Saved clean PPM successfully!")
