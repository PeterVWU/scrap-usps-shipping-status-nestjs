import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as puppeteer from 'puppeteer';

interface ShipStationResponse {
    shipments: Array<{
        orderNumber: string;
        trackingNumber: string;
        createDate: string;
    }>;
}

@Injectable()
export class TrackingService {
    constructor(private readonly httpService: HttpService) { }

    // async getShipStationShipments(createDateStart: string) {
    //     try {
    //         const { data } = await firstValueFrom(
    //             this.httpService.get<ShipStationResponse>(
    //                 `https://shipstation-proxy.info-ba2.workers.dev/shipments?createDateStart=${createDateStart}&pageSize=30`
    //             )
    //         );
    //         return data.shipments;
    //     } catch (error) {
    //         console.error('Error fetching shipments:', error);
    //         throw error;
    //     }
    // }

    async getTrackingStatus(trackingNumbers: string[]): Promise<any> {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ]
        });

        // Add random delay before navigation
        await this.randomDelay(2000, 5000);

        let results = []
        const trackingString = trackingNumbers.join('%2C');
        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
            // Enable JavaScript and cookies
            await page.setJavaScriptEnabled(true);
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br'
            });
            // Intercept request to modify headers
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const headers = request.headers();
                headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
                headers['Accept-Language'] = 'en-US,en;q=0.9';
                request.continue({ headers });
            });
            await page.setViewport({ width: 1280, height: 800 });

            // Enable request interception to optimize loading
            // await page.setRequestInterception(true);
            // page.on('request', (request) => {
            //     if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
            //         request.abort();
            //     } else {
            //         request.continue();
            //     }
            // });

            console.log('trackingString', trackingString)
            const url = `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${trackingString}`;
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });


            // Simulate human-like behavior
            await this.simulateHumanBehavior(page);

            // Wait for tracking results to load

            await page.waitForSelector('.track-bar-container', { timeout: 60000 });

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
            await page.close();
        }
        catch (error) {
            console.log('error', error)
        }
        finally {
            await browser.close();
        }
        return results;
    }

    // async getShipmentStatusesFromShipStation(createDateStart: string) {
    //     // Get shipments from ShipStation
    //     const shipments = await this.getShipStationShipments(createDateStart);

    //     // Extract tracking numbers and order numbers
    //     const trackingInfo = shipments.map(shipment => ({
    //         orderNumber: shipment.orderNumber,
    //         trackingNumber: shipment.trackingNumber
    //     }));

    //     // Get tracking status for all tracking numbers
    //     const trackingNumbers = trackingInfo.map(info => info.trackingNumber);
    //     const trackingStatuses = await this.getTrackingStatus(trackingNumbers);

    //     // Combine the results
    //     return trackingInfo.map(info => {
    //         const status = trackingStatuses.find(s => s.trackingNumber === info.trackingNumber);
    //         return {
    //             orderNumber: info.orderNumber,
    //             trackingNumber: info.trackingNumber,
    //             status: status?.status || 'Status not found',
    //             date: status?.date || 'Date not found'
    //         };
    //     });
    // }

    private async randomDelay(min: number, max: number) {
        const delay = Math.floor(Math.random() * (max - min + 1) + min);
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    private async simulateHumanBehavior(page: puppeteer.Page) {
        // Simulate mouse movement
        await page.mouse.move(100, 100);
        await this.randomDelay(500, 1000);
        await page.mouse.move(200, 200);

        // Simulate scroll
        await page.evaluate(() => {
            window.scrollBy(0, 200);
        });
        await this.randomDelay(1000, 2000);
    }
}
