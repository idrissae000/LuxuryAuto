#!/usr/bin/env python3
"""Generate favicon files from logo.png by extracting the car icon."""

from PIL import Image, ImageDraw
import struct
import io
import os

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
LOGO_PATH = os.path.join(PUBLIC_DIR, "logo.png")


def extract_car_region(logo: Image.Image) -> Image.Image:
    """Extract the car portion from the logo (lower-center area, below the text)."""
    w, h = logo.size
    crop_top = int(h * 0.42)
    crop_bottom = int(h * 0.92)
    crop_left = int(w * 0.05)
    crop_right = int(w * 0.95)

    car = logo.crop((crop_left, crop_top, crop_right, crop_bottom))
    return car


def round_corners(img: Image.Image, radius: int) -> Image.Image:
    """Apply rounded corners to an RGBA image using an antialiased mask."""
    # Work at 4x resolution for smooth antialiased corners
    scale = 4
    w, h = img.size
    big_w, big_h = w * scale, h * scale
    big_radius = radius * scale

    # Create high-res rounded rectangle mask
    mask = Image.new("L", (big_w, big_h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [(0, 0), (big_w - 1, big_h - 1)],
        radius=big_radius,
        fill=255,
    )
    # Downscale for antialiased edges
    mask = mask.resize((w, h), Image.LANCZOS)

    # Apply mask to alpha channel
    result = img.copy()
    result.putalpha(mask)
    return result


def create_favicon(car_img: Image.Image, size: int, corner_radius_pct: float = 0.18) -> Image.Image:
    """Create a square favicon with the car icon centered on a black background with rounded corners."""
    # Create black square background
    favicon = Image.new("RGBA", (size, size), (0, 0, 0, 255))

    # Scale car to fit within the square with padding
    car_w, car_h = car_img.size
    aspect = car_w / car_h

    padding = max(2, int(size * 0.1))
    available = size - 2 * padding

    if aspect > 1:
        new_w = available
        new_h = int(available / aspect)
    else:
        new_h = available
        new_w = int(available * aspect)

    # Use LANCZOS for high-quality downscaling
    resized = car_img.resize((new_w, new_h), Image.LANCZOS)

    # Center on the background
    x = (size - new_w) // 2
    y = (size - new_h) // 2

    favicon.paste(resized, (x, y), resized if resized.mode == "RGBA" else None)

    # Apply rounded corners
    radius = max(1, int(size * corner_radius_pct))
    favicon = round_corners(favicon, radius)

    return favicon


def main():
    logo = Image.open(LOGO_PATH).convert("RGBA")
    print(f"Logo loaded: {LOGO_PATH} ({logo.size})")

    car = extract_car_region(logo)
    print(f"Extracted car region: {car.size}")

    # Generate PNG sizes
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
    }

    for filename, size in sizes.items():
        fav = create_favicon(car, size)
        out_path = os.path.join(PUBLIC_DIR, filename)
        fav.save(out_path, "PNG")
        print(f"Created {filename} ({size}x{size})")

    # Create favicon.ico with multiple sizes
    ico_sizes = [16, 32, 48]
    ico_images = [create_favicon(car, s).convert("RGBA") for s in ico_sizes]

    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")

    # Build ICO file manually for reliable multi-size support
    png_data_list = []
    for img in ico_images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_data_list.append(buf.getvalue())

    num_images = len(ico_images)
    header_size = 6 + 16 * num_images
    offset = header_size

    with open(ico_path, "wb") as f:
        # ICONDIR header
        f.write(struct.pack("<HHH", 0, 1, num_images))

        # Directory entries
        for img, data in zip(ico_images, png_data_list):
            w, h = img.size
            bw = 0 if w >= 256 else w
            bh = 0 if h >= 256 else h
            f.write(struct.pack("<BBBBHHII", bw, bh, 0, 0, 1, 32, len(data), offset))
            offset += len(data)

        # Image data
        for data in png_data_list:
            f.write(data)

    print(f"Created favicon.ico ({', '.join(str(s) for s in ico_sizes)})")


if __name__ == "__main__":
    main()
