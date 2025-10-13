import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";



@Schema()
export class Profile extends Document {

    @Prop({ required: false })
    firstname: string;

    @Prop({ required: false })
    lastname: string;

    @Prop({ required: false })
    wilaya: string;

    @Prop({ required: false })
    address: string;

    @Prop({ required: false })
    phone: string;

    @Prop({ required: false })
    longitude: string;

    @Prop({ required: false })
    latitude: string;

    @Prop({ type: Date, required: false })
    birthday: Date;

    @Prop({ required: false })
    avatar: string;

    @Prop({ type: Types.ObjectId, ref: "Users" })
    user: Types.ObjectId;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);