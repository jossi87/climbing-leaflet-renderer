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
            await window.initMap(data);
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