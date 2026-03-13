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

    const rockCount = markers.filter(m => m.iconType === 'ROCK').length;
    const dynamicFontSize = Math.max(13 - (rockCount * 0.1), 8);

    console.log(`Rendering ${rockCount} rocks. Font size: ${dynamicFontSize}px`);

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        await page.goto('file:///app/render.html');

        await page.evaluate(async (payload) => {
            await window.initMap(payload.data, payload.fontSize);
        }, { data: { markers, outlines, slopes, defaultCenter, defaultZoom, showPhotoNotMap }, fontSize: dynamicFontSize });

        const imageBuffer = await page.screenshot({ type: 'png' });
        res.set('Content-Type', 'image/png').send(imageBuffer);
    } catch (err) {
        console.error('Render Error:', err);
        res.status(500).send('Failed');
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(3000, () => console.log('Renderer Online'));