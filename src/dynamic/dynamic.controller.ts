import { BadRequestException, Body, Controller, Get, HttpException, NotFoundException, Param, Patch, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { DynamicService } from './dynamic.service';
import { DynamicDto } from './dto/dynamic.dto';
import { JwtAuthGuard } from 'src/users/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/users/auth/role.guard';
import { Roles } from 'src/users/auth/auth.decorator';
import { Role } from 'src/schemas/user.schema';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from '@nestjs/common';
import { updateDynamicDto, UpdateImagesDto } from './dto/updateDynamic.dto';
import mongoose from 'mongoose';

@Controller('dynamic')
export class DynamicController {
    constructor(private readonly dynamicService: DynamicService) { }

    @Get()
    findAll() {
        return this.dynamicService.findAll()
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.dynamicService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'heroPictures', maxCount: 6 }], multerOptions),
    )
    async create(
        @Body() dynamikDto: DynamicDto,
        @Req() req: Request,
        @UploadedFiles() files?: { heroPictures?: Express.Multer.File[] }
    ) {
        if (!files || !files.heroPictures || files.heroPictures.length <= 3) {
            throw new BadRequestException({
                status: 400,
                message: 'At least three image is required',
                error: 'Bad Request',
            });
        }

        try {
            const images = files.heroPictures.map((file) => ({
                path: file.path,
                originalFilename: file.originalname, // Store the original filename
                fileName: file.filename
            }));

            // console.log(images)

            const newDynamic = await this.dynamicService.create(images, dynamikDto, req);

            const productDir = `./uploads/magasin/${newDynamic.id}/`;
            fs.mkdirSync(productDir, { recursive: true });

            images.map(({ path: oldPath }) => {
                const filename = path.basename(oldPath); // Get the generated filename
                const newPath = path.join(productDir, filename);
                fs.renameSync(oldPath, newPath); // Move the file to the new directory

                // return {
                //     newPath: `/uploads/magasin/${newDynamic._id}/${filename}`,
                //     originalFilename, // Keep the original filename for reference
                // };
            });

        } catch (error) {
            throw new BadRequestException({
                status: 500,
                message: error.message,
                error: 'Bad Request',
            });
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDynamo: updateDynamicDto) {
        return await this.dynamicService.updateDynamo(id, updateDynamo)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch('Image/:id')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'image', maxCount: 6 }], multerOptions),
    )
    async updateImage(
        @Param('id') id: string,
        @Body() imageDto: UpdateImagesDto,
        @UploadedFiles() files?: { image?: Express.Multer.File[] }
    ) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);

        const images = await this.dynamicService.findImages(id);
        if (!images) throw new NotFoundException('image not found');

        let imagePaths = images.image || [];

        if (files && files.image && files.image.length > 0) {
            const productDir = `./uploads/magasin/${images.dynamic._id}`;
            fs.mkdirSync(productDir, { recursive: true });

            const newImages = files.image.map((file) => {
                const filename = path.basename(file.path);
                const newPath = path.join(productDir, filename);
                fs.renameSync(file.path, newPath);

                return {
                    newPath: `uploads/magasin/${images.dynamic._id}/${filename}`,
                    originalFilename: file.originalname,
                };
            });
            imagePaths = [...imagePaths, ...newImages.map((img) => img.newPath)];
        }

        if (imageDto.remove && Array.isArray(imageDto.remove)) {
            imagePaths = imagePaths.filter((img) => !imageDto.remove?.includes(img))

            for (const imgPath of imageDto.remove) {
                const localPath = path.join('.', imgPath); // Make sure the path is correct
                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                }
            }
        }

        console.log(imagePaths)

        const updatePayload = {
            ...imageDto,
            image: imagePaths,
        };

        return this.dynamicService.updateImage(id, updatePayload)


    }


}