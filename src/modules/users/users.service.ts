import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { hashPassword } from 'src/helpers/bcrypt.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService){}

  async create(createUserDto: CreateUserDto) : Promise<CreateUserDto> {
    const {email} = createUserDto

    //Hasheo la contraseña del usuario
    createUserDto.password = await hashPassword(createUserDto.password)
    
    //Verifico si el usuario ya existe
    const user = await this.prisma.user.findUnique({where: {email}})
    if(user) throw new BadRequestException('El usuario ya existe')

    //Creo el usuario
    return await this.prisma.user.create({data: {...createUserDto}})
  }

  async findAll() :  Promise<CreateUserDto[]> {
    const users = await this.prisma.user.findMany({where: {deletedAt: null}}) // Busca los usuarios que no esten marcado como eliminado

    //Verifico si hay usuarios
    if(users.length === 0) throw new NotFoundException('No se pudieron encontrar usuarios')

    return users; //Devuelve lista de usuarios
  }

  // Obtiene usuario por id
  async findOne(id: number, getDeletes?: boolean) : Promise<CreateUserDto>{
    const where = { id, deletedAt: null };
    if (getDeletes) delete where['deletedAt'];
    const user = await this.prisma.user.findFirst({where});
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user;
  }

  async findOneByEmail(email: string, getDeletes?: boolean) : Promise<CreateUserDto>{
    const where = { email, deletedAt: null };
    if (getDeletes) delete where['deletedAt'];
    const user = await this.prisma.user.findFirst({where});
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user;
  }

  // actualiza usuario por id
  async update(id: number, updateUserDto: Partial<UpdateUserDto>, getDeletes?: boolean) {
    const user = await this.findOne(id, getDeletes);

    //Verifica si el correo esta en uso
    if(updateUserDto.email !== undefined){
      const isUsed = await this.prisma.user.findFirst({where: {email: updateUserDto.email}})
      if(isUsed) throw new BadRequestException('El correo electrónico ya está en uso')
    }

    return await this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async changeToAdmin(id: number) {
    const user = await this.update(id, { role: "admin" }, false);
    return user;
  }

  async changeToUser(id: number) {
    const user = await this.update(id, { role: "user" }, false);
    return user;
  }


  async remove(id: number) {
    const user = await this.findOne(id, false)

    await this.update(id, { deletedAt: new Date() });
    return `${user.email} ha sido eliminado`;
  }

  async restore(id: number) {
    const user = await this.update(id, { deletedAt: null }, true);
    return user;
  }
}