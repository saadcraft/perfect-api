import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Parsonalizer extends Document {
    @Prop({ required: true })
    height: number;

    @Prop({ required: true })
    Width: number;

    @Prop({ required: true })
    font: string;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    color: string;

    @Prop({ required: true })
    materiel: string;
}

export const ParsonalizerSchema = SchemaFactory.createForClass(Parsonalizer);