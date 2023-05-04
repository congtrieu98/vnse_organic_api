/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseInterface } from './type/userResponse.interface';
import { userFillter } from './dto/user.filter';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserDirector } from './decorators/user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { BackendValidationPipe } from 'src/share/pipes/backendValidation.pipe';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.usersService.createUser(createUserDto);
    return this.usersService.buildUserResponse(user)
  }

  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async login(
    @Body() loginDto: LoginUserDto
    ):Promise<UserResponseInterface> {
      // console.log('loginDto', loginDto)
      // return 'Login' as any
      const user = await this.usersService.login(loginDto);
      return this.usersService.buildUserResponse(user)
  }

  @Get('users')
  //Promise<{listUsers: string[]}>
  async findAll(@Query() filter: userFillter) { //@Query chính là cái param trên URL
    return await this.usersService.findAll(filter);
  }

  @Get('users/:id')
  async findOne(@Param('id') id: number) {
    const getUserById = await this.usersService.findOne(id);
    return {
      data: getUserById
    }
  }

  @Delete('users/:id')
  async remove(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.remove(id, updateUserDto);
  }


  // Middleware

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    // Chỗ này xử lý sau khi authen middleware xong thì sẽ cho phép chuyển hướng đến một bước xử lý tiếp theo.
    // Lưu ý: thằng middleware này nó sẽ k biết làm gì khi chạy tới hàm next(), vì vậy ta cần sd tới Guards để nó chui vào ExecutionContext
    // để xử lý các logic tiếp theo như ta mong muốn
    // Và khi 1 user nào đó login vào sẽ có id, nếu ta truyền id vào UserDirector thì lúc này ta sẽ lấy đc Id của nó để thực hiện logic
    @UserDirector() user: User // Thằng use này sẽ trả về cái id hoặc username tùy vào bước trên ta truyền vào cái gì
    ): Promise<UserResponseInterface> {
    return this.usersService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateCurrentUser(@UserDirector('id') currentUserId: number, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseInterface> {
    const user = await this.usersService.updateUser(currentUserId, updateUserDto);
    return this.usersService.buildUserResponse(user)
  }
}
