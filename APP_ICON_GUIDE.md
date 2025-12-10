# App Icon Setup Guide

## Overview

AuthorCompanion now includes a professional app icon featuring:
- 📖 Open book representing learning and vocabulary
- ✍️ Quill pen symbolizing writing and authorship
- 🎨 Purple gradient (#667eea to #764ba2) matching the app theme
- ✨ Sparkle elements representing knowledge and growth

## Icon Files

The icon is available in multiple formats and sizes:

### SVG Source (Master File)
- **Location**: `frontend/public/icon.svg`
- **Format**: Scalable Vector Graphics
- **Use**: Edit this file to modify the design
- **Best for**: Web, displays, documentation

### PNG Files (Generated)
Generated in two variants:

**Standard Icons** (used by most devices)
- `icon-192.png` - For Android home screen, PWA
- `icon-512.png` - For PWA installation, splash screens

**Maskable Icons** (adaptive icons on Android 8+)
- `icon-maskable-192.png` - For masked display (device permitting)
- `icon-maskable-512.png` - For masked display (large screens)

## Generate PNG Icons

### Option 1: Python (Recommended)

**Requirements:**
```bash
pip install cairosvg pillow
```

**Windows:**
```powershell
cd AuthorCompanion
python scripts\generate-icons.py
```

**macOS/Linux:**
```bash
cd AuthorCompanion
python3 scripts/generate-icons.py
# or
bash scripts/generate-icons.sh
```

### Option 2: PowerShell (Windows)

**Requirements:**
- ImageMagick: https://imagemagick.org/download/binaries/
- OR Python with cairosvg/pillow

**Usage:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\scripts\generate-icons.ps1
```

### Option 3: ImageMagick

**Installation:**

*macOS:*
```bash
brew install imagemagick
```

*Linux:*
```bash
sudo apt-get install imagemagick
```

*Windows:*
Download from: https://imagemagick.org/download/binaries/

**Generate:**
```bash
# Single size
convert -background none -density 150 -resize 192x192 frontend/public/icon.svg frontend/public/icon-192.png

# All sizes (from scripts/generate-icons.sh)
bash scripts/generate-icons.sh
```

## Icon Design Details

### Color Palette
- **Primary Purple**: `#667eea`
- **Secondary Purple**: `#764ba2`
- **Background**: `#f5f7ff` (light blue)
- **White Accents**: For text/lines on pages

### Design Elements
1. **Book** - Open book representing learning and knowledge
   - Left page with text lines (learning input)
   - Right page with text lines (knowledge output)
   - Pages slightly curved for 3D effect

2. **Quill Pen** - Diagonal across the book
   - Represents writing and authorship
   - Purple gradient shaft
   - Detailed nib with feather elements

3. **Decorative Elements**
   - Sparkles in corners (knowledge/growth theme)
   - Soft shadows for depth
   - Gradient background for visual interest

### Adaptive Icon Specs
Maskable icons follow Android Adaptive Icon specs:
- Safe zone: Center circle with 66dp radius
- Design fits within safe zone for proper masking
- Transparent background support

## Web Integration

### Manifest.json
Already configured in `frontend/public/manifest.json`:
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### HTML Meta Tags
Already in `frontend/index.html`:
```html
<!-- App Icon for iOS -->
<link rel="apple-touch-icon" href="/icon-192.png">

<!-- App Icon for Android PWA -->
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">

<!-- Favicon -->
<link rel="icon" href="/icon-192.png">
```

## Mobile App Setup

### iOS (Xcode)

1. Generate high-res versions:
   ```bash
   python3 scripts/generate-icons.py
   # Creates 192x192 and 512x512
   ```

2. In Xcode:
   - Open project
   - Select "App" target
   - Go to "General" tab
   - Under "App Icons and Launch Screen"
   - Click "App Icon" in Assets
   - Drag PNG files to appropriate slots:
     - 1x (192×192) → 60pt slots
     - 2x (384×384) → 120pt slots
     - 3x (576×576) → 180pt slots

3. Required sizes for iOS:
   ```
   20×20 (notification)
   40×40 (icon + notification)
   60×60 (home screen)
   29×29 (settings)
   58×58 (settings)
   87×87 (settings)
   120×120 (home screen)
   180×180 (home screen)
   ```

### Android (Android Studio)

1. Generate PNG icons:
   ```bash
   python3 scripts/generate-icons.py
   ```

2. In Android Studio:
   - Right-click `res` folder → New → Image Asset
   - Choose "PNG" for image type
   - Select source file: `icon.svg` or `icon-512.png`
   - Configure for different densities:
     - ldpi: 18×18
     - mdpi: 24×24
     - hdpi: 36×36
     - xhdpi: 48×48
     - xxhdpi: 72×72
     - xxxhdpi: 96×96
   - Generated to: `res/mipmap-*/ic_launcher.png`

3. Update `AndroidManifest.xml`:
   ```xml
   <application
     android:icon="@mipmap/ic_launcher"
     android:label="@string/app_name">
   ```

## Customization

### Edit the SVG

Open `frontend/public/icon.svg` in any SVG editor:
- **Figma**: Drag & drop the SVG
- **Inkscape**: Free, open-source vector editor
- **Adobe Illustrator**: Professional option
- **VS Code**: With SVG extension

### Common Modifications

**Change Colors:**
```xml
<!-- Find and replace gradient colors -->
<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />

<!-- To your new colors, e.g., #2563eb (blue) and #1e40af (dark blue) -->
```

**Add Text:**
```xml
<text x="256" y="380" font-size="32" font-weight="bold" 
      text-anchor="middle" fill="#667eea">
  AC
</text>
```

**Change Styles:**
- Modify `<circle>`, `<rect>`, `<path>` elements
- Adjust `opacity`, `stroke-width`, `fill`
- Update filter effects for shadows

### Generate Custom Sizes

Modify `generate-icons.py`:
```python
success = generate_icons(
    str(svg_path),
    str(output_dir),
    sizes=[72, 96, 144, 192, 384, 512]  # Add custom sizes
)
```

Then regenerate:
```bash
python3 scripts/generate-icons.py
```

## Verification Checklist

- [ ] `frontend/public/icon.svg` exists
- [ ] PNG files generated:
  - [ ] `icon-192.png`
  - [ ] `icon-512.png`
  - [ ] `icon-maskable-192.png`
  - [ ] `icon-maskable-512.png`
- [ ] `frontend/public/manifest.json` has icon references
- [ ] `frontend/index.html` has icon meta tags
- [ ] Build succeeds: `npm run build`
- [ ] PWA installs correctly with icon visible
- [ ] Icon displays properly on:
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Desktop browsers

## Troubleshooting

### PNG Generation Fails

**Error:** `No module named 'cairosvg'`
```bash
# Install required package
pip install cairosvg pillow

# Try again
python3 scripts/generate-icons.py
```

**Error:** `convert: command not found`
```bash
# Install ImageMagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux
```

### Icons Don't Show in App

1. Clear browser cache:
   ```bash
   # Hard refresh in browser
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (macOS)
   ```

2. Rebuild app:
   ```bash
   npm run build
   ```

3. Check manifest references:
   ```bash
   grep "icon-192" frontend/public/manifest.json
   ```

### Blurry Icons on High-DPI

- Ensure 512×512 PNG is generated
- Use high `density` parameter (150 dpi)
- Check `manifest.json` has all required sizes

## Resources

- **SVG Editor**: https://editor.method.ac/
- **Figma SVG**: https://www.figma.com/
- **ImageMagick Docs**: https://imagemagick.org/
- **PWA Icons Guide**: https://web.dev/add-manifest/#icons
- **Android Adaptive Icons**: https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive
- **iOS App Icon**: https://developer.apple.com/design/human-interface-guidelines/app-icons

---

**Next Steps:**
1. Run icon generation: `python3 scripts/generate-icons.py`
2. Verify PNG files exist in `frontend/public/`
3. Build and test: `npm run build && npm run dev`
4. Check PWA installation shows icon correctly

Questions? Check the [SETUP_GITHUB_ACTIONS.md](./SETUP_GITHUB_ACTIONS.md) for related setup guidance.
