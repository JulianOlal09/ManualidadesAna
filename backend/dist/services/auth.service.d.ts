import { User } from '@prisma/client';
export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface AuthResult {
    user: Omit<User, 'password'>;
    token: string;
}
export declare function register(input: RegisterInput): Promise<AuthResult>;
export declare function login(input: LoginInput): Promise<AuthResult>;
export declare function getUserById(userId: number): Promise<Omit<User, 'password'> | null>;
//# sourceMappingURL=auth.service.d.ts.map