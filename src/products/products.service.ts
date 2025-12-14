import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    console.log(createProductDto);
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPage = await this.prisma.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalPage / limit!);
    return {
      data: await this.prisma.product.findMany({
        take: limit,
        skip: (page! - 1) * limit!,
        where: { available: true },
      }),
      meta: {
        total: totalPage,
        page,
        totalPerPage: limit,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    return updatedProduct;
  }

  async remove(id: number) {
    await this.findOne(id);
    // return this.prisma.product.delete({
    //   where: { id },
    // });

    const product = await this.prisma.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }
}
