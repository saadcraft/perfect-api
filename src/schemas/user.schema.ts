import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}


@Schema({
    timestamps: true,
})
export class Users extends Document {

    @Prop({ unique: true, required: true, trim: true })
    username: string;

    @Prop({ unique: true, required: true, trim: true, lowercase: true })
    email: string;

    @Prop({ unique: true, required: true, trim: true })
    number: string;

    @Prop({ required: true }) // Password is required (will be hashed before saving)
    password: string;

    @Prop({ default: 'user' }) // Role of the user (e.g., 'user', 'admin')
    role: Role;

    @Prop({ default: false }) // Indicates if the user's email is verified
    isEmailVerified: boolean;

    @Prop({ default: false }) // Indicates if the user's phone number is verified
    isPhoneVerified: boolean;

    @Prop({ type: Types.ObjectId, ref: "Profile" })
    profile: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(Users);