import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
    console.log('--- RENDERING REQUEST ---');
    console.log(JSON.stringify(req.body, null, 2));

    const { 
        markers = [], outlines = [], slopes = [], 
        defaultCenter = { lat: 59, lng: 6 }, defaultZoom = 13, 
        showPhotoNotMap = false, width = 800, height = 600
    } = req.body;

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.goto('file:///app/render.html');

        await page.evaluate(async (data) => {
            await window.initMap(data);
        }, { markers, outlines, slopes, defaultCenter, defaultZoom, showPhotoNotMap });

        const imageBuffer = await page.screenshot({ type: 'png' });
        res.set('Content-Type', 'image/png').send(imageBuffer);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed');
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(3000, () => console.log('Renderer running on port 3000'));