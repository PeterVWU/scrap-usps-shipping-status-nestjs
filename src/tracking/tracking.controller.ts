import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    @Post()
    async getTrackingStatus(@Body() body: { trackingNumbers: string[] }) {
        return this.trackingService.getTrackingStatus(body.trackingNumbers);
    }

    // @Get('shipstation')
    // async getShipStationStatuses(@Query('createDateStart') createDateStart: string) {
    //     return this.trackingService.getShipmentStatusesFromShipStation(createDateStart);
    // }
}
