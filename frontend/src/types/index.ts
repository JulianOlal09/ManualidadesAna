export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  price: number | null;
  sku: string | null;
  stock: number;
  marginPercentage: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
}

export interface Supply {
  id: number;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
  products?: Array<{
    id: number;
    productId: number;
    supplyId: number;
    quantity: number;
    product?: { id: number; name: string };
  }>;
}

export interface ProductSupply {
  id: number;
  productId: number;
  supplyId: number;
  quantity: number;
}

export interface SuggestedPriceResult {
  totalCost: number;
  marginPercentage: number | null;
  suggestedPrice: number;
  supplies: Array<{
    supplyId: number;
    supplyName: string;
    quantity: number;
    cost: number;
    totalCost: number;
  }>;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  quantity: number;
  priceAtPurchase: number | null;
  createdAt: string;
  product?: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartUpdateRequest {
  quantity: number;
}

export interface CreateOrderResponse {
  order: Order;
}

export interface OrderStats {
  total: number;
  pendientes: number;
  enviados: number;
  entregados: number;
  cancelados: number;
  totalSales: number;
}

export type CustomOrderStatus = 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';

export interface CustomOrder {
  id: number;
  userId: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}
