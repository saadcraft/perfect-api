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
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'heroPictures', maxCount: 6 }], multerOptions),
    )
    async create(
        @Body() dynamikDto: DynamicDto,
        @Req() req: Request,
        @UploadedFiles() files?: { heroPictures?: Express.Multer.File[] }
    ) {
        // if (!files || !files.heroPictures || files.heroPictures.length <= 3) {
        //     throw new BadRequestException({
        //         status: 400,
        //         message: 'At least three image is required',
        //         error: 'Bad Request',
        //     });
        // }

        try {
            let images: { path: string; originalFilename: string; fileName: string }[] = [];

            if (files?.heroPictures?.length) {
                images = files.heroPictures.map((file) => ({
                    path: file.path,
                    originalFilename: file.originalname,
                    fileName: file.filename,
                }));
            }

            // console.log(images)

            const newDynamic = await this.dynamicService.create(images, dynamikDto, req);

            if (images.length > 0) {
                const productDir = `${process.env.UPLOAD_DIR}/magasin/${newDynamic.id}/`;
                fs.mkdirSync(productDir, { recursive: true });

                images.forEach(({ path: oldPath }) => {
                    const filename = path.basename(oldPath);
                    const newPath = path.join(productDir, filename);
                    fs.renameSync(oldPath, newPath);
                });
            }

            // return {
            //     newPath: `/uploads/magasin/${newDynamic._id}/${filename}`,
            //     originalFilename, // Keep the original filename for reference
            // };

            return newDynamic

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
    @Roles(Role.ADMIN, Role.MAGASINE)
    @Patch('Image/:id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 6 },
            { name: 'mainPicture', maxCount: 1 },    // single main picture
            { name: 'coverPicture', maxCount: 1 }
        ],
            multerOptions),
    )
    async updateImage(
        @Param('id') id: string,
        @Body() imageDto: UpdateImagesDto,
        @UploadedFiles() files?: {
            image?: Express.Multer.File[];
            mainPicture?: Express.Multer.File[];
            coverPicture?: Express.Multer.File[];
        }
    ) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid ID', 400);

        const images = await this.dynamicService.findImages(id);
        if (!images) throw new NotFoundException('image not found');

        let imagePaths = images.image || [];
        let mainPicture = images.mainPicture || null;
        let coverPicture = images.coverPicture || null;

        const productDir = `${process.env.UPLOAD_DIR}/magasin/${images.dynamic._id}`;
        fs.mkdirSync(productDir, { recursive: true });

        // Helper to move file and return path
        const saveFile = (file: Express.Multer.File) => {
            const filename = path.basename(file.path);
            const newPath = path.join(productDir, filename);
            fs.renameSync(file.path, newPath);
            return `uploads/magasin/${images.dynamic._id}/${filename}`;
        };

        // if (files && files.image && files.image.length > 0) {
        //     const productDir = `${process.env.UPLOAD_DIR}/magasin/${images.dynamic._id}`;
        //     fs.mkdirSync(productDir, { recursive: true });

        //     const newImages = files.image.map((file) => {
        //         const filename = path.basename(file.path);
        //         const newPath = path.join(productDir, filename);
        //         fs.renameSync(file.path, newPath);

        //         return {
        //             newPath: `uploads/magasin/${images.dynamic._id}/${filename}`,
        //             originalFilename: file.originalname,
        //         };
        //     });
        //     imagePaths = [...imagePaths, ...newImages.map((img) => img.newPath)];
        // }
        if (files?.image?.length) {
            const newImages = files.image.map(saveFile);
            imagePaths = [...imagePaths, ...newImages];
        }

        // ✅ handle mainPicture
        if (files?.mainPicture?.[0]) {
            mainPicture = saveFile(files.mainPicture[0]);
        }

        // ✅ handle coverPicture
        if (files?.coverPicture?.[0]) {
            coverPicture = saveFile(files.coverPicture[0]);
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
            mainPicture: mainPicture ?? undefined,
            coverPicture: coverPicture ?? undefined
        };

        return this.dynamicService.updateImage(id, updatePayload)


    }


}