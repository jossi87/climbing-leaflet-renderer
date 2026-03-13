A microservice for the **climbing** ecosystem. 
It renders Leaflet maps with custom markers and polygons into PNG images using headless Chrome (Puppeteer).

### Render Map
**Endpoint:** `POST /render`  
**Content-Type:** `application/json`

**Example Payload:**
```json
{
  "defaultCenter": [58.969975, 5.733107],
  "defaultZoom": 15,
  "showPhotoNotMap": false,
  "markers": [
    { "lat": 58.97, "lng": 5.73, "label": "Start", "iconType": "ROCK" }
  ],
  "outlines": [],
  "slopes": [],
  "legends": ["Legend text line 1"]
}
```

**Response:** Raw `image/png` binary data.

## Docker Integration
This image is built automatically via GitHub Actions and pushed to `jossi87/climbing-leaflet-renderer`.

To run locally for testing:
```bash
docker build -t climbing-leaflet-renderer .
docker run -p 3000:3000 climbing-leaflet-renderer
```
