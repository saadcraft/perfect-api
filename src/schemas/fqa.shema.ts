import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Fqa extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;
}

export const FqaSchema = SchemaFactory.createForClass(Fqa);