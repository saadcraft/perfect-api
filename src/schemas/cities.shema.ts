import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class Cities extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: number;

    @Prop({ required: true, unique: true })
    code_city: string;

    @Prop({ required: false, type: [{ type: Types.ObjectId, ref: "Common" }] })
    common: Types.ObjectId[];

    @Prop({ default: true })
    available: boolean;
}

export const CitySchema = SchemaFactory.createForClass(Cities);