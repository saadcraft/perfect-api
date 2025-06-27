import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class HeroPictures extends Document {
    @Prop({ required: false })
    title: string;

    @Prop({ required: true })
    image: string[];

    @Prop({ type: Types.ObjectId, ref: "Dynamic" })
    dynamic: Types.ObjectId;
}

export const HeroPicturesSchema = SchemaFactory.createForClass(HeroPictures);