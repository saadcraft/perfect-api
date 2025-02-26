import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Users } from 'src/schemas/user.schema';
import { CreatUserDto } from './dto/Creatuser.dto';

@Injectable()
export class UsersService {

    constructor(@InjectModel(Users.name) private readonly userModel: mongoose.Model<Users>,) { }

    async create(user: CreatUserDto) {
        return this.userModel.create(user)
    }

}
