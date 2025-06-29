import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";



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

    @Prop({ type: Date, required: false })
    birthday: Date;

    @Prop({ required: false })
    avatar: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);