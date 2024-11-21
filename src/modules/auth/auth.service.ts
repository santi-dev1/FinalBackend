import { Injectable, UnauthorizedException} from "@nestjs/common";
import { LoginDto } from "./dto/login-dto";
import { UsersService } from "../users/users.service";
import { checkPassword } from "src/helpers/bcrypt.helper";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register-dto";
  
  @Injectable()
  export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}
  
    // Registrar un usuario
    async register({ password, email }: RegisterDto) {
      await this.usersService.create({email, password}); // Llama al servicio de usuarios para crearlo
      return {
        message: "Usuario creado con éxito",
      };
    }

    // Login de usuario
    async login({ email, password }: LoginDto) {
        const user = await this.usersService.findOneByEmail(email); // Busca el usuario por el correo
    
        if (!user) {
          throw new UnauthorizedException("Correo electrónico no válido");
        }
    
        const isPasswordValid = await checkPassword(password, user.password); //Verifica si la contraseña coincide  
    
        if (!isPasswordValid) {
          throw new UnauthorizedException("Contraseña no válida");
        }
    
        const payload = { email: user.email, role: user.role };
    
        const token = await this.jwtService.signAsync(payload);
    
        return {
          token: token,
          email: user.email,
        };
      }
  }
  