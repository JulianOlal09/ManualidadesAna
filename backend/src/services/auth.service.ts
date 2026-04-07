import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { Role, User } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
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
      phone: input.phone,
      role: Role.CLIENT,
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  const token = generateToken({ userId: user.id, role: user.role });

  return { user: userWithoutPassword, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
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

export async function getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function updateUser(userId: number, input: UpdateUserInput): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (input.email && input.email !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }

  if (input.currentPassword && input.newPassword) {
    const validPassword = await bcrypt.compare(input.currentPassword, user.password);
    if (!validPassword) {
      throw new Error('INVALID_CURRENT_PASSWORD');
    }
  }

  const updateData: Partial<{ name: string; email: string; phone: string; password: string }> = {};

  if (input.name) {
    updateData.name = input.name;
  }
  if (input.email) {
    updateData.email = input.email;
  }
  if (input.phone) {
    updateData.phone = input.phone;
  }
  if (input.newPassword && input.currentPassword) {
    updateData.password = await bcrypt.hash(input.newPassword, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function deleteUser(userId: number, password: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('INVALID_PASSWORD');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: `deleted_${user.id}_${Date.now()}@deleted.com`, name: 'Usuario eliminado' },
  });
}
