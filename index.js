import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());

let browser;

async function getBrowser() {
    if (!browser || !browser.connected) {
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
    }
    return browser;
}

app.post('/render', async (req, res) => {
    const { 
        markers = [], outlines = [], slopes = [], 
        defaultCenter = { lat: 59, lng: 6 }, defaultZoom = 13, 
        showPhotoNotMap = false, width = 800, height = 600
    } = req.body;

    const rockCount = markers.filter(m => m.iconType === 'ROCK').length;
    const dynamicFontSize = Math.max(12 - (rockCount * 0.15), 7);

    let page;
    try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        
        await page.setUserAgent('Buldreinfo/Brattelinjer-PDF-Generator (jostein.oygarden@gmail.com)');
        await page.setExtraHTTPHeaders({ 'Referer': 'https://buldreinfo.com/' });
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
        if (page) await page.close();
    }
});

app.listen(3000, () => console.log('Renderer Online'));
