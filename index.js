import express from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));

// Static assets for icons (parking, rock, etc.)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/render', async (req, res) => {
    const leafletData = req.body;
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: 'new'
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        
        // Serve the HTML file via local Express to handle relative /assets correctly
        await page.goto(`http://localhost:3000/render-page`);
        
        await page.evaluate(async (data) => {
            await window.initMap(data);
        }, leafletData);

        const screenshot = await page.screenshot({ type: 'png' });
        res.type('image/png').send(screenshot);
    } catch (e) {
        res.status(500).send(e.message);
    } finally {
        await browser.close();
    }
});

app.get('/render-page', (req, res) => res.sendFile(path.join(__dirname, 'render.html')));

app.listen(3000, () => console.log('Renderer listening on 3000'));