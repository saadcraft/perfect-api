import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Users } from '../schemas/user.schema';
import { CreatUserDto } from './dto/creatUser.dto';
import { Profile } from '../schemas/profile.schema';
import * as bcrypt from 'bcrypt';
import { AuthPayloadDto } from './dto/authUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {


    constructor(@InjectModel(Users.name) private userModel: mongoose.Model<Users>,
        @InjectModel(Profile.name) private userProfile: mongoose.Model<Profile>,
        private jwtService: JwtService,
    ) { }

    async create({ profile, ...user }: CreatUserDto) {

        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Replace the plain password with the hashed password
        user.password = hashedPassword;

        if (profile) {
            const newProfil = await this.userProfile.create(profile)
            return this.userModel.create({
                ...user,
                profile: newProfil._id,
            })
        }
        return this.userModel.create(user)
    }

    async validateUser({ username, password }: AuthPayloadDto): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const userObject = user.toObject();
                const { password, ...result } = userObject;
                console.log(result)
                return {
                    access_token: this.jwtService.sign(result),
                };
            }
        }
        return null;
    }

    async getUser(id: string) {
        return this.userModel.findById(id);
    }

}
