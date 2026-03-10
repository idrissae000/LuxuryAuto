#!/usr/bin/env python3
"""Generate favicon files from logo.png by extracting the car icon."""

from PIL import Image, ImageDraw, ImageFilter
import os

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
LOGO_PATH = os.path.join(PUBLIC_DIR, "logo.png")

def extract_car_region(logo: Image.Image) -> Image.Image:
    """Extract the car portion from the logo (lower-center area, below the text)."""
    w, h = logo.size
    # The car occupies roughly the lower 60% of the image, centered
    # Looking at the logo: text is top ~40%, car is bottom ~60%
    crop_top = int(h * 0.42)
    crop_bottom = int(h * 0.92)
    crop_left = int(w * 0.05)
    crop_right = int(w * 0.95)

    car = logo.crop((crop_left, crop_top, crop_right, crop_bottom))
    return car


def create_favicon(car_img: Image.Image, size: int) -> Image.Image:
    """Create a square favicon with the car icon centered on a black background."""
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
    return favicon


def main():
    logo = Image.open(LOGO_PATH).convert("RGBA")
    print(f"Logo size: {logo.size}")

    car = extract_car_region(logo)
    print(f"Extracted car region: {car.size}")

    # Generate sizes
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
    import struct, io

    ico_sizes = [16, 32, 48]
    ico_images = [create_favicon(car, s).convert("RGBA") for s in ico_sizes]

    # Build ICO file manually for reliable multi-size support
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")

    # Convert each image to PNG bytes
    png_data_list = []
    for img in ico_images:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_data_list.append(buf.getvalue())

    num_images = len(ico_images)
    # ICO header: 6 bytes
    # Each directory entry: 16 bytes
    header_size = 6 + 16 * num_images
    offset = header_size

    with open(ico_path, "wb") as f:
        # ICONDIR header
        f.write(struct.pack("<HHH", 0, 1, num_images))

        # Write directory entries
        for i, (img, data) in enumerate(zip(ico_images, png_data_list)):
            w, h = img.size
            # Width/height: 0 means 256
            bw = 0 if w >= 256 else w
            bh = 0 if h >= 256 else h
            f.write(struct.pack("<BBBBHHII", bw, bh, 0, 0, 1, 32, len(data), offset))
            offset += len(data)

        # Write image data
        for data in png_data_list:
            f.write(data)

    print(f"Created favicon.ico (16, 32, 48)")


if __name__ == "__main__":
    main()
