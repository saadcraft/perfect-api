import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class ProfileDto {
    @IsOptional()
    @IsString()
    wilaya: string
}

export class CreatUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid international number (e.g., +1234567890).',
    }) // Regex for international phone numbers
    number: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password: string;

    @Type(() => ProfileDto)
    profile: ProfileDto;
}