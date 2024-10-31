import { Controller, Post, Body } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post()
    async getTrackingStatus(@Body() body: { trackingNumbers: string[] }) {
        return this.trackingService.getTrackingStatus(body.trackingNumbers);
    }
}
