import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt.js';
import { Role } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare function verifyTokenMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function requireRole(...roles: Role[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map