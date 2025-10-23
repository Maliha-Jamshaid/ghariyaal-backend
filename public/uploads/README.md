# Image Uploads Directory

This directory stores all uploaded product images.

## How to Access Images

Images can be accessed via:
- **Local**: `http://localhost:5000/uploads/filename.ext`
- **Network**: `http://192.168.0.103:5000/uploads/filename.ext`

## Example

If you have an image named `tomi.webp`, you can access it at:
- `http://localhost:5000/uploads/tomi.webp`
- `http://192.168.0.103:5000/uploads/tomi.webp`

## Usage in Products

When creating/updating products, use the image URL format:
```json
{
  "imageUrl": "http://localhost:5000/uploads/tomi.webp"
}
```

Or for network access:
```json
{
  "imageUrl": "http://192.168.0.103:5000/uploads/tomi.webp"
}
```

## Supported Formats

- `.jpg`, `.jpeg`
- `.png`
- `.webp`
- `.gif`
