import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';
import { Users } from '../schemas/user.schema';
import { CreatUserDto, ProfileDto } from './dto/creatUser.dto';
import { Profile } from '../schemas/profile.schema';
import * as bcrypt from 'bcrypt';
import { AuthPayloadDto } from './dto/authUser.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {


    constructor(@InjectModel(Users.name) private userModel: mongoose.Model<Users>,
        @InjectModel(Profile.name) private userProfile: mongoose.Model<Profile>,
        private jwtService: JwtService,
    ) { }

    async create({ profile, ...user }: CreatUserDto) {

        const hashedPassword = await bcrypt.hash(user.password, 10);
        // Replace the plain password with the hashed password
        user.password = hashedPassword;

        if (profile) {
            const newProfil = await this.userProfile.create(profile)
            return this.userModel.create({
                ...user,
                profile: newProfil._id,
            })
        }
        try {
            return await this.userModel.create(user)
        } catch (error) {
            if (error instanceof MongoServerError && error.code === 11000) {
                throw new ConflictException(`Username or email already exists.`);
            }
            throw new InternalServerErrorException('Something went wrong');
        }
    }

    async creatProfile(id: string, profileDto: ProfileDto) {
        const user = await this.userModel.findById(id)
        if (!user) throw new NotFoundException('User not found');

        const profile = await this.userProfile.create({ ...profileDto, user: user._id })

        user.profile = profile._id as mongoose.Types.ObjectId

        await user.save()

        return profile;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userModel.findById(id).populate('profile');
        if (!user) throw new NotFoundException('User not found');
        if (updateUserDto.oldPassowrd && updateUserDto.password) {
            const isMatch = await bcrypt.compare(updateUserDto.oldPassowrd, user.password);
            if (!isMatch) throw new Error('Old password is incorrect');
            user.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // 🔹 Update simple user fields (email, number, etc.)
        const { oldPassowrd, password, profile, ...restUserFields } = updateUserDto;

        const definedUserFields = Object.fromEntries(
            Object.entries(restUserFields).filter(([_, value]) => value !== undefined)
        );

        Object.assign(user, definedUserFields);

        // 🔹 Update profile if provided
        if (profile && user.profile) {
            const definedProfileFields = Object.fromEntries(
                Object.entries(profile).filter(([_, value]) => value !== undefined)
            );

            Object.assign(user.profile, definedProfileFields);
            await (user.profile as any).save();
        }

        await user.save();
        return user.populate('profile');
    }

    async validateUser({ username, password }: AuthPayloadDto): Promise<any> {
        const user = await this.userModel.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const userObject = user.toObject();
                const { password, ...result } = userObject;
                const payload = {
                    id: result._id,
                    username: result.username,
                    email: result.email,
                    role: result.role,
                    dynamic: userObject.dynamic
                }
                return {
                    id: userObject._id,
                    username: userObject.username,
                    email: userObject.email,
                    role: userObject.role,
                    access_token: this.jwtService.sign(payload),
                    refresh_token: this.jwtService.sign(payload, {
                        secret: process.env.REFRESH_SECRET_KEY || "DEFAULT=c12fa829caac7fa815da4215ec13c8a2",
                        expiresIn: '7d',
                    })
                };
            }
        }
        return null;
    }

    async getUser(id: string) {
        return this.userModel.findById(id);
    }

    async getProfile(id: string) {
        const user = await this.userModel.findById(id) as unknown as UsersType;
        return this.userProfile.findById(user.profile)
    }

    async refreshUser(refresh_token: string) {
        try {
            const decoded = this.jwtService.verify(refresh_token, {
                secret: process.env.REFRESH_SECRET_KEY || "DEFAULT=c12fa829caac7fa815da4215ec13c8a2",
            });
            const payload = {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role,
                dynamic: decoded.dynamic
            };
            const newAccessToken = this.jwtService.sign(payload);
            const newRefreshToken = this.jwtService.sign(payload, {
                secret: process.env.REFRESH_SECRET_KEY || "DEFAULT=c12fa829caac7fa815da4215ec13c8a2",
                expiresIn: '7d',
            });

            return { access_token: newAccessToken, refresh_token: newRefreshToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
