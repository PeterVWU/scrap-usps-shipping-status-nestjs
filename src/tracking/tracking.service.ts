import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class TrackingService {

    async getTrackingStatus(trackingNumbers: string[]): Promise<any> {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        let results = []
        let data = ''
        const trackingString = trackingNumbers.join('%2C');
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            // Enable request interception to optimize loading
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            console.log('trackingString', trackingString)
            const url = `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${trackingString}`;
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            // Wait for tracking results to load
            data = await page.content();

            console.log(data);
            await page.waitForSelector('.track-bar-container', { timeout: 15000 });

            // Extract all tracking statuses
            results = await page.evaluate(() => {
                const trackingContainers = document.querySelectorAll('.track-bar-container');
                return Array.from(trackingContainers).map(container => {
                    const trackingNumber = container.querySelector('.tracking-number')?.textContent.trim() || '';
                    const status = container.querySelector('.tb-status')?.textContent.trim() || '';
                    const date = container.querySelector('.tb-date')?.textContent.trim() || '';

                    return {
                        trackingNumber: trackingNumber.replace(/^#\s*/, ''), // Remove leading # if present
                        status,
                        date
                    };
                });
            });
            console.log('before close')
            await page.close();

        }
        catch (error) {
            console.log('error', error)
        }
        finally {
            await browser.close();
        }
        console.log(results)

        return [results, data];
    }
}
