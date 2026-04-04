import 'dotenv/config';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOrders() {
  console.log('Creating sample orders...');

  // First, create a test user if not exists
  let user = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Cliente Prueba',
        email: 'test@example.com',
        password: 'password123',
        role: 'CLIENT',
      }
    });
    console.log(`Created user with ID: ${user.id}`);
  } else {
    console.log(`Using existing user with ID: ${user.id}`);
  }

  const products = await prisma.product.findMany({
    take: 50,
    select: { id: true, price: true, name: true }
  });

  if (products.length === 0) {
    console.log('No products found. Run seed-products.ts first.');
    await prisma.$disconnect();
    return;
  }

  const months = 12;
  const ordersPerMonth = 8;

  let ordersCreated = 0;

  for (let monthOffset = 0; monthOffset < months; monthOffset++) {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();

    for (let i = 0; i < ordersPerMonth; i++) {
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const randomHour = Math.floor(Math.random() * 24);
      const createdAt = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), randomDay, randomHour);

      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let totalAmount = 0;

      const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, numItems);

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Number(product.price);
        orderItems.push({
          productId: product.id,
          quantity,
          priceAtPurchase: price
        });
        totalAmount += price * quantity;
      }

      const rand = Math.random();
      let randomStatus: OrderStatus;
      if (rand < 0.7) {
        randomStatus = OrderStatus.ENTREGADO;
      } else if (rand < 0.85) {
        randomStatus = OrderStatus.ENVIADO;
      } else if (rand < 0.95) {
        randomStatus = OrderStatus.PENDIENTE;
      } else {
        randomStatus = OrderStatus.CANCELADO;
      }

      try {
        await prisma.order.create({
          data: {
            userId: user.id,
            totalAmount,
            status: randomStatus,
            createdAt,
            items: {
              create: orderItems
            }
          }
        });
        ordersCreated++;
      } catch (error) {
        console.log(`Error creating order:`, error);
      }
    }
  }

  console.log(`Created ${ordersCreated} orders with items!`);
  await prisma.$disconnect();
}

seedOrders();