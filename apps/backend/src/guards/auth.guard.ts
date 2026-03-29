import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { Request } from "express";



@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private jwtService: JwtService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        
        if(!token) {
            throw new UnauthorizedException('Invalid token');
        }
        
        try {
            const payload = this.jwtService.verify(token);
            // Assign user object from decoded payload
            request.user = payload.payload;
            request.email = payload.payload?.email;
        } catch (error) {
            Logger.error(error.message)
            throw new UnauthorizedException('Invalid token');
        }
        return true
        
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers.authorization?.split(' ')[1];
    }
}