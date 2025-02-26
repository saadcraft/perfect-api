import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreatUserDto } from './dto/Creatuser.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body(ValidationPipe) user: CreatUserDto) {
        return this.usersService.create(user)
    }

}
