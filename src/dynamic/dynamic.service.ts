import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Dynamic } from 'src/schemas/dynamic.shema';
import { Fqa } from 'src/schemas/fqa.shema';
import { HeroPictures } from 'src/schemas/heroPictures.shema';
import { DynamicDto } from './dto/dynamic.dto';
import { Users } from 'src/schemas/user.schema';
import { updateDynamicDto, UpdateImagesDto } from './dto/updateDynamic.dto';

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
        return this.DynamicModel.find().populate([
            { path: 'fqa', model: 'Fqa' },
            { path: 'heroPictures', model: 'HeroPictures' }
        ]);
    }

    async findOne(id: string) {
        return this.DynamicModel.findById({ _id: id }).populate([
            { path: 'fqa', model: 'Fqa' },
            { path: 'heroPictures', model: 'HeroPictures' },
            { path: 'categories', model: 'Categories' }
        ]);
    }

    async findImages(id: string) {
        return this.HeroPicturesModel.findById({ _id: id }).populate({ path: 'dynamic', model: 'Dynamic' });
    }

    async create(images: ImagesType[], { fqa, ...dynamikDto }: DynamicDto, req: any) {
        // Get user id from request (assuming JWT or session)
        const userId = req.user?.id || req.user?._id;

        const addDynamo = await this.DynamicModel.create({ ...dynamikDto, owner: userId });

        const addFqa = await this.FaqModel.insertMany(fqa.map(pre => ({ ...pre })));

        const addImage = await this.HeroPicturesModel.create({
            image: images.map(pre => `/uploads/magasin/${addDynamo.id}/${pre.fileName}`),
            dynamic: addDynamo.id
        });

        addDynamo.fqa = addFqa.map(v => v._id as mongoose.Types.ObjectId);
        addDynamo.heroPictures = addImage.id as mongoose.Types.ObjectId;


        await addDynamo.save();

        await this.Usermodel.updateOne({ _id: userId }, { dynamics: addDynamo._id });

        // Optionally update user document if needed

        return addDynamo;
    }

    async updateDynamo(id: string, { fqa, removeFqa, ...updateDynamo }: updateDynamicDto) {

        const dynamo = await this.DynamicModel.findById(id);
        if (!dynamo) throw new NotFoundException('magasin not found');

        if (removeFqa && removeFqa.length > 0) {
            // Also delete the fqa from the fqa collection
            await this.FaqModel.deleteMany({
                _id: { $in: removeFqa.map(ids => new mongoose.Types.ObjectId(ids)) }
            });
        }

        const fqaIds: mongoose.Types.ObjectId[] = [];
        for (const fqas of fqa || []) {
            if (fqas.id) {
                // Update existing variant
                await this.FaqModel.findByIdAndUpdate(new mongoose.Types.ObjectId(fqas.id), fqas);  // Update the variant
                fqaIds.push(new mongoose.Types.ObjectId(fqas.id));  // Add ObjectId to updatedVariantIds
            } else {
                // Create a new variant
                const created = await this.FaqModel.create(fqas);
                fqaIds.push(created._id as mongoose.Types.ObjectId);  // Add ObjectId of the newly created variant
            }
        }

        // 3. Merge existing variants with the new updated ones and remove the variants that need to be removed
        const existingVariantIds = dynamo.fqa.map((id) => id.toString());  // Get current variant IDs in string form

        // Filter out the variants that should be removed and that already exist in the product's variants
        const finalVariantIds = [
            ...existingVariantIds.filter((id) => !(removeFqa ?? []).includes(id)),  // Remove the variants that are being removed
            ...fqaIds.map(id => id.toString()).filter(id => !existingVariantIds.includes(id)) // Add new updated variants if not already present
        ];

        // Convert all string IDs to ObjectId instances
        const objectIds = finalVariantIds.map(id => new mongoose.Types.ObjectId(id));  // Convert to ObjectId using `new Types.ObjectId(id)`

        // Update the product's variants array with the new list of ObjectId[]s
        dynamo.fqa = objectIds;
        await dynamo.save();

        return await this.DynamicModel.findByIdAndUpdate({ _id: id }, updateDynamo, { new: true })

    }

    async updateImage(id: string, images: UpdateImagesDto) {
        return await this.HeroPicturesModel.findByIdAndUpdate({ _id: id }, images, { new: true });
    }

    async findAllMagasineDynamics() {
        return this.DynamicModel
            .find()
            .populate({
                path: 'owner',
                match: { role: 'MAGASINE' }, // Only users with MAGASINE role
                select: '_id' // Select only specific fields
            })
            .populate({
                path: 'heroPictures',
                model: 'HeroPictures'
            })
            .then(dynamics => dynamics.filter(d => d.owner)); // remove dynamics with no matching owner
    }

}
