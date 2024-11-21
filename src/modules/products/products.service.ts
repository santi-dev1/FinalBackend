import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService){}

  // Crea un nuevo producto
  async create(createProductDto: CreateProductDto)  {
    return await this.prisma.product.create({data: createProductDto})// Uso los datos del dto para crearlo
  }

  // Obtiene todos los productos
  async findAll() :  Promise<CreateProductDto[]> {
    const product = await this.prisma.product.findMany()

    if(product.length === 0) throw new NotFoundException('No se pudieron encontrar productos')

    return product;
  }

  // Obtiene un producto por id
  async findOne(id: number, getDeletes?: boolean) : Promise<CreateProductDto>{
    const where = { id, deletedAt: null };
    if (getDeletes) delete where['deletedAt'];
    const product = await this.prisma.product.findFirst({where});
    if (!product) throw new NotFoundException('Producto no encontrado');

    return product;
  }

  // Actualiza un producto por su id
  async update(id: number, updateUserDto: Partial<UpdateProductDto>, getDeletes?: boolean) {
    const product = await this.findOne(id, getDeletes);
    return await this.prisma.product.update({ where: { id }, data: updateUserDto });
  }

  // Elimina un producto
  async remove(id: number) {
    const product = await this.findOne(id, false)

    await this.update(id, { deletedAt: new Date() });
    return `${product.name} ha sido eliminado`;
  }

  // Restaura un producto
  async restore(id: number) {
    const product = await this.update(id, { deletedAt: null }, true);
    return product;
  }
}