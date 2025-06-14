import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class HeroPictures extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    image: string;
}

export const HeroPicturesSchema = SchemaFactory.createForClass(HeroPictures);