/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ExpressRequest } from "../type/expressRequest.interface";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean {
        const request = context.switchToHttp().getRequest<ExpressRequest>();
        // console.log(request)
        if (request.user) {
            return true;
        }

        throw new HttpException('Tai khoan chua xac thuc', HttpStatus.UNAUTHORIZED)
    }
}