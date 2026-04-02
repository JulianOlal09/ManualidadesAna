import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { Role } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';
export async function register(input) {
    const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
        data: {
            email: input.email,
            password: hashedPassword,
            name: input.name,
            role: Role.CLIENT,
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken({ userId: user.id, role: user.role });
    return { user: userWithoutPassword, token };
}
export async function login(input) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });
    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
        throw new Error('INVALID_CREDENTIALS');
    }
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken({ userId: user.id, role: user.role });
    return { user: userWithoutPassword, token };
}
export async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
//# sourceMappingURL=auth.service.js.map