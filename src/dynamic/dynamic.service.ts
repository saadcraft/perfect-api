import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Dynamic } from 'src/schemas/dynamic.shema';
import { Fqa } from 'src/schemas/fqa.shema';
import { HeroPictures } from 'src/schemas/heroPictures.shema';
import { DynamicDto } from './dto/dynamic.dto';
import { Users } from 'src/schemas/user.schema';

type ImagesType = {
    path: string;
    originalFilename: string;
    fileName: string
}

@Injectable()
export class DynamicService {

    constructor(
        @InjectModel(Dynamic.name) private readonly DynamicModel: mongoose.Model<Dynamic>,
        @InjectModel(Fqa.name) private readonly FaqModel: mongoose.Model<Fqa>,
        @InjectModel(HeroPictures.name) private readonly HeroPicturesModel: mongoose.Model<HeroPictures>,
        @InjectModel(Users.name) private readonly Usermodel: mongoose.Model<Users>
    ) { }

    async findAll() {
        return this.DynamicModel.find().populate({ path: 'fqa', model: 'Fqa' });
    }

    async create(images: ImagesType[], { fqa, ...dynamikDto }: DynamicDto, req: any) {
        // Get user id from request (assuming JWT or session)
        const userId = req.user?.id || req.user?._id;

        const addDynamo = await this.DynamicModel.create({ ...dynamikDto });

        const addFqa = await this.FaqModel.insertMany(fqa.map(pre => ({ ...pre })));

        const addImage = await this.HeroPicturesModel.create({
            image: images.map(pre => `uploads/magasin/${addDynamo.id}/${pre.fileName}`)
        });

        addDynamo.fqa = addFqa.map(v => v._id as mongoose.Types.ObjectId);
        addDynamo.heroPictures = addImage.id as mongoose.Types.ObjectId;


        await addDynamo.save();

        await this.Usermodel.updateOne({ _id: userId }, { dynamics: addDynamo._id });

        // Optionally update user document if needed

        return addDynamo;
    }

}
