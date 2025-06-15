import { Body, Controller, Get, Post } from '@nestjs/common';
import { DynamicService } from './dynamic.service';
import { DynamicDto } from './dto/dynamic.dto';

@Controller('dynamic')
export class DynamicController {
    constructor(private readonly dynamicService: DynamicService) { }

    @Get()
    findAll() {
        return this.dynamicService.findAll()
    }

    @Post()
    create(@Body() dynamikDto: DynamicDto) {
        return this.dynamicService.create(dynamikDto)
    }
}
