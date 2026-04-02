// Servicio de carrito local usando localStorage (para usuarios sin autenticar)

export interface LocalCartItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
}

const CART_KEY = 'guest_cart';

export const localCartService = {
  // Obtener todo el carrito
  getCart(): LocalCartItem[] {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Agregar o actualizar item
  addItem(item: LocalCartItem): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((i) => i.productId === item.productId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  // Actualizar cantidad
  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find((i) => i.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  },

  // Eliminar item
  removeItem(productId: number): void {
    const cart = this.getCart().filter((i) => i.productId !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  // Vaciar carrito
  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  // Obtener total
  getTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Obtener cantidad de items
  getItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },
};

export default localCartService;
