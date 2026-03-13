import express from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serves icons for the map
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/render', async (req, res) => {
    const { 
        markers = [], 
        outlines = [], 
        slopes = [], 
        defaultCenter = { lat: 59, lng: 6 }, 
        defaultZoom = 13, 
        showPhotoNotMap = false,
        width = 800,
        height = 600
    } = req.body;

    let browser;
    try {
        browser = await puppeteer.launch({
            // These flags are essential for running Puppeteer in a Docker container
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width, height });

        // Load the local HTML file using the file:// protocol
        await page.goto('file:///app/render.html');

        // Execute map initialization inside the browser context
        await page.evaluate(async (data) => {
            // Define icons here so they are available to initMap
            const icons = {
                parking: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5AgKDC0u669F7AAAAHlJREFUSMft0rENgDAMRFHOf8pYmYpZGIKloEBCInp06TMv99Is90pSSueat9Z6XclK805SOn9KWms9L0m9m6mEAnuA7mYqYcAeoLuZShjwS7C7mUoY8Euwu5lKGPBL8AtuXvC6u8B7H8H+S3L3gtfdBd77CPZf8AtuXvBvF68vL974G9S9AAAAAElFTkSuQmCC",
                rock: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAB7msXUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB8ElEQVR4nO2VvUvDQBTHf03SqqmDInYp6uLk6uTo6uTo6uTo6uTo6uTo6uTo6O7k6O7k6C7iYAdF7OAs9V8QtX8BaYv3yksuSdtA6AtvSXLv8+69u8shIsREAnRAn8Yt0K+L2/UeUOf6oN8CfaoN+u3G6A7789vA3wZ9A7SBeidA78AWA9shO7AL9Kk26D8I+0P18W3Qv98G/RboG6A7sMXAtske7AF9KgX9p8P+Un16G/Qv8HCH/f39XW8H9A3QFtjAtske7AE9igL9p8P+cv16G/RPBvszXv7W6S4D2yY7sAt0KA70nw7783XvbdC/C/szXv7W6C4B2yE7sAt0KB70nw7783XvbdA/Dft36N/f3/V2QN8AbYENbJvswR7QIyHof9jf9V69HdA3QFtgA9sme7AH9CgB+veG/V3v1tsBfQO0BTawbbIHe0CPmND/uL/rvXo7oG+AtSAGtki26BvQI2Lofz7s73q33g7oG2Ag2SIdoEcY9L8Y9ne9W28H9A1gyTboAD1Cof9Vf9v1W6CPZIsO0KMh9H897O96t94D+vSRbtEBejSM/v3+rvfq0/8A/ft97W3UPwBfM3vX78f69gAAAABJRU5ErkJggg=="
            };
            await window.initMap(data, icons);
        }, { markers, outlines, slopes, defaultCenter, defaultZoom, showPhotoNotMap });

        const imageBuffer = await page.screenshot({ type: 'png' });
        
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (err) {
        console.error('Rendering Error:', err);
        res.status(500).send('Map rendering failed');
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(3000, () => console.log('Renderer listening on port 3000 (ESM Mode)'));