import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Dynamic } from 'src/schemas/dynamic.shema';
import { Fqa } from 'src/schemas/fqa.shema';
import { HeroPictures } from 'src/schemas/heroPictures.shema';
import { DynamicDto, FqaDto } from './dto/dynamic.dto';

@Injectable()
export class DynamicService {

    constructor(
        @InjectModel(Dynamic.name) private readonly DynamicModel: mongoose.Model<Dynamic>,
        @InjectModel(Fqa.name) private readonly FaqModel: mongoose.Model<Fqa>,
        @InjectModel(HeroPictures.name) private readonly HeroPicturesModel: mongoose.Model<HeroPictures>
    ) { }

    async findAll() {
        return this.DynamicModel.find().populate({ path: 'fqa', model: 'Fqa' });
    }

    async create({ fqa, ...dynamikDto }: DynamicDto) {
        const addDynamo = await this.DynamicModel.create(dynamikDto)

        const addFqa = await this.FaqModel.insertMany(fqa.map(pre => ({ ...pre })))


        addDynamo.fqa = addFqa.map(v => v._id as mongoose.Types.ObjectId);

        await addDynamo.save()

        return addDynamo

    }

}
