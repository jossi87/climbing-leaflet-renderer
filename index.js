const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(express.json());
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
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width, height });

        // Load the local HTML file
        await page.goto(`file://${path.join(__dirname, 'renderer.html')}`);

        // Execute map initialization
        await page.evaluate(async (data) => {
            await window.initMap(data);
        }, { markers, outlines, slopes, defaultCenter, defaultZoom, showPhotoNotMap });

        const imageBuffer = await page.screenshot({ type: 'png' });
        
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Map rendering failed');
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(3000, () => console.log('Renderer listening on port 3000'));