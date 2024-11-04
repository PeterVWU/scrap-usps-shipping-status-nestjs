import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
    imports: [HttpModule],
    controllers: [TrackingController],
    providers: [TrackingService]
})
export class TrackingModule { }
