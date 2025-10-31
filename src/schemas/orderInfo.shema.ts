import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Statue {
    PANDING = 'en attente',
    ACCEPTED = 'preparation',
    CANCELED = 'annulé',
    PICKUP = 'pickup',
    INWAY = 'en route',
    DELIVRED = 'completed',
    RETURNED = 'retour'
}

export type OrderWithTotal = OrderInformation & { total: number };

@Schema({
    timestamps: true,
})
export class OrderInformation extends Document {
    @Prop({ required: true, unique: true })
    orderId: string;

    @Prop({ required: false })
    fullname: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: false })
    wilaya: string;

    @Prop({ required: false })
    adresse: string;

    @Prop({ required: false })
    email: string;

    @Prop({ default: "en attente" })
    status: Statue;

    @Prop({ required: false })
    tracking: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Orders" }] })
    items: Types.ObjectId[];

    @Prop({ required: true })
    distance: number;

    @Prop({ type: Types.ObjectId, ref: "Profile", required: false })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Dynamic" })
    dynamic: Types.ObjectId;

    @Prop({ default: false })
    view: boolean;

    @Prop()
    total?: number;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const OrderInfoSchema = SchemaFactory.createForClass(OrderInformation);