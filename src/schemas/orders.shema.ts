import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Orders extends Document {
    @Prop({ type: Types.ObjectId, ref: "Variants" })
    variant: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "OrderInformation" })
    orderInfo: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);