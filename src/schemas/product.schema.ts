import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Category {
  FOODS = 'foods',
  FETES = 'fétes',
  MEDICAL = 'médical',
  BEAUTY = 'beauty',
  SPORT = 'sport',
  GAMING = 'gaming'
}

@Schema({
  timestamps: true,
})
export class Products extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: Category;

  @Prop({ required: true })
  lowPrice: number;

  @Prop({ type: Object })
  attributes: Record<string, string[]>;

  @Prop({ type: [String], required: true }) // Array of image filenames
  images: string[];

  @Prop({ required: true })
  primaryImage: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Variants" }] })
  variants: Types.ObjectId[];

  @Prop({ default: true })
  available: boolean;

  @Prop({ required: false })
  promotion: number;

  @Prop({ type: Types.ObjectId, ref: "Dynamic" })
  Dynamic: Types.ObjectId;

  @Prop({ default: 0 })
  rate: number;
}

export const ProductSchema = SchemaFactory.createForClass(Products);