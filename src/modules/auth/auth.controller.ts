import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto } from "./dto/login-dto";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register-dto";
import { Roles } from "./decorators/roles.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles('superadmin')
  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }


  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
