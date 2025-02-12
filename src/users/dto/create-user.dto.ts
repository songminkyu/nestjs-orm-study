import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty()
  signupVerifyToken: string;
}
export class CreateUserDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;
}
export class UserLoginDDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}
