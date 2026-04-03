import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'Servilletas',
  'Cajas de Madera',
  'Ceramica',
  'Velas'
];

const productNames = [
  // Servilletas
  'Servilleta Flor de Loto', 'Servilleta Mariposa Azul', 'Servilleta Rosas Rojas',
  'Servilleta Paisaje Montaña', 'Servilleta Corazones Rosa', 'Servilleta Estrellas Doradas',
  'Servilleta Tropical Playa', 'Servilleta Jardín Primavera', 'Servilleta Cascada Agua',
  'Servilleta Vino y Uvas', 'Servilleta Navideña', 'Servilleta Boda Elegante',
  'Servilleta Abstracta Colores', 'Servilleta Mariposas Multicolor', 'Servilleta Pino Navideño',
  'Servilleta Flores Sakura', 'Servilleta Oceania', 'Servilleta Viaje París',
  'Servilleta Arte Moderno', 'Servilleta Frutas Tropicales', 'Servilleta Mariposa Real',
  'Servilleta Biblioteca Antigua', 'Servilleta Cielo Estrellado', 'Servilleta Brisa Marina',
  'Servilleta Soljamanay', 'Servilleta Colibri', 'Servilleta Orquidea',
  
  // Cajas de Madera
  'Caja Madera Chica 4x4', 'Caja Madera Mediana 6x6', 'Caja Madera Grande 8x8',
  'Caja Rectangular Madera', 'Caja Cuadrada Madera', 'Caja Ovalada Madera',
  'Caja Corazon Madera', 'Caja Estrella Madera', 'Caja Corazon Grande',
  'Caja Vintage Madera', 'Caja Rustica Madera', 'Caja Minimalista Blanca',
  'Caja Madera Natural', 'Caja Madera Oscura', 'Caja Reloj Madera',
  'Caja Joyero Madera', 'Caja Cofre Tesoro', 'Caja Baúl Antiguo',
  'Caja Casamiento Madera', 'Caja Borrador Madera', 'Caja Latón Combinada',
  'Caja Flotante Madera', 'Caja Colgante Pared', 'Caja Espejo Madera',
  'Caja Labrada Madera', 'Caja Pintada Mano', 'Caja Decoupage',
  
  // Cerámica
  'Base Yeso Margarita', 'Base Yeso Rosa', 'Base Yeso Girasol',
  'Base Yeso Mariposa', 'Base Yeso Flor Loto', 'Base Yeso Corazon',
  'Maceta Ceramica Roja', 'Maceta Ceramica Azul', 'Maceta Ceramica Blanca',
  'Maceta Ceramica Verde', 'Maceta Ceramica Morada', 'Maceta Ceramica Rosa',
  'Figura Yeso Angel', 'Figura Yeso Virgen', 'Figura Yeso Niño',
  'Figura Yeso Santa Lucia', 'Adorno Ceramica Perro', 'Adorno Ceramica Gato',
  'Adorno Ceramica Conejo', 'Adorno Ceramica Leon', 'Adorno Ceramica Elefante',
  'Portavela Ceramica', 'Portavela Ceramica Azul', 'Portavela Ceramica Blanca',
  'Cuenco Ceramica', 'Plato Ceramica Decorado', 'Azulejo Ceramica Pintado',
  
  // Velas
  'Vela Aromatica Lavanda', 'Vela Aromatica Vainilla', 'Vela Aromatica Rosa',
  'Vela Aromatica Canela', 'Vela Aromatica Coco', 'Vela Aromatica Limon',
  'Vela Decorativa Roja', 'Vela Decorativa Azul', 'Vela Decorativa Verde',
  'Vela Decorativa Morada', 'Vela Decorativa Dorada', 'Vela Decorativa Plateada',
  'Vela Forma Rosa', 'Vela Forma Corazon', 'Vela Forma Estrella',
  'Vela cilindrica grande', 'Vela cilindrica mediana', 'Vela cuadrada moderna',
  'Vela flotante', 'Vela pilares', 'Vela votiva',
  'Vela Navideña Rojiverde', 'Vela Boda Blanco', 'Vela Cumpleaños Colorida',
  'Vela Aromática Hierba Luisa', 'Vela Artesanal Miel'
];

const descriptions = [
  'Hermoso producto decorativo hecho a mano',
  'Excelente calidad y acabado artesanal',
  'Producto único ideal para regalos',
  'Decoración perfecta para cualquier espacio',
  'Piezas exclusivas de alta calidad',
  'Artículo artesanal con materiales premium',
  'Diseño exclusivo y elegante',
  'Producto natural sin químicos',
  'Acabado profesional y detallado',
  'Excelente para decoración del hogar'
];

const imageUrls = [
  'https://http2.mlstatic.com/D_NQ_NP_605582-MLM86529390115_062025-O.webp',
  'https://i.etsystatic.com/26241480/r/il/c157fc/2835792734/il_fullxfull.2835792734_hj9m.jpg',
  'https://m.media-amazon.com/images/I/A1-YqoPccTL.jpg',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
];

function generateSKU(name: string): string {
  const words = name.trim().split(/\s+/);
  let acronym = '';
  for (let i = 0; i < Math.min(words.length, 3); i++) {
    if (words[i].length > 0) {
      acronym += words[i].charAt(0).toUpperCase();
    }
  }
  const random = Math.floor(Math.random() * 900 + 100).toString();
  return `${acronym}-${random}`;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPrice(): number {
  return Math.floor(Math.random() * 400) + 10;
}

function getRandomStock(): number {
  return Math.floor(Math.random() * 50) + 1;
}

async function seed() {
  console.log('Starting seed...');
  
  // Get category IDs
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });
  
  const categoryMap = new Map(cats.map(c => [c.name, c.id]));
  
  // Filter products by category
  const servilletasNames = productNames.filter(n => n.includes('Servilleta'));
  const cajasNames = productNames.filter(n => n.includes('Caja'));
  const ceramicaNames = productNames.filter(n => n.includes('Base') || n.includes('Maceta') || n.includes('Figura') || n.includes('Adorno') || n.includes('Portavela') || n.includes('Cuenco') || n.includes('Plato') || n.includes('Azulejo'));
  const velasNames = productNames.filter(n => n.includes('Vela'));
  
  const allProducts: Array<{ name: string; categoryName: string }> = [];
  
  // Add base products
  servilletasNames.forEach(n => allProducts.push({ name: n, categoryName: 'Servilletas' }));
  cajasNames.forEach(n => allProducts.push({ name: n, categoryName: 'Cajas de Madera' }));
  ceramicaNames.forEach(n => allProducts.push({ name: n, categoryName: 'Ceramica' }));
  velasNames.forEach(n => allProducts.push({ name: n, categoryName: 'Velas' }));
  
  // Generate more products to reach 100
  const extraProducts = [
    { name: 'Kit Servilletas Pack x10', categoryName: 'Servilletas' },
    { name: 'Set Cajas Madera x3', categoryName: 'Cajas de Madera' },
    { name: 'Centro Mesa Ceramica', categoryName: 'Ceramica' },
    { name: 'Pack Velas Aromaticas x5', categoryName: 'Velas' },
    { name: 'Servilleta Personalizada', categoryName: 'Servilletas' },
    { name: 'Caja Especial Eventos', categoryName: 'Cajas de Madera' },
    { name: 'Maceta Colgante Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela Souvenir Boda x20', categoryName: 'Velas' },
    { name: 'Servilleta Infantil', categoryName: 'Servilletas' },
    { name: 'Caja Expositora Madera', categoryName: 'Cajas de Madera' },
    { name: 'Figura Yeso Grande', categoryName: 'Ceramica' },
    { name: 'Vela Gitana Grande', categoryName: 'Velas' },
    { name: 'Servilleta Vintage', categoryName: 'Servilletas' },
    { name: 'Caja Luxe Madera', categoryName: 'Cajas de Madera' },
    { name: 'Jarrón Cerámica Artesanal', categoryName: 'Ceramica' },
    { name: 'Set Velas Colores', categoryName: 'Velas' },
    { name: 'Servilleta Premium', categoryName: 'Servilletas' },
    { name: 'Caja Romántica Madera', categoryName: 'Cajas de Madera' },
    { name: 'Bowl Ceramica Sopa', categoryName: 'Ceramica' },
    { name: 'Vela Magica Transparente', categoryName: 'Velas' },
    { name: 'Servilleta Boda Pack', categoryName: 'Servilletas' },
    { name: 'Caja Sorpresa Madera', categoryName: 'Cajas de Madera' },
    { name: 'Cenicero Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela LED Simulada', categoryName: 'Velas' },
    { name: 'Servilleta Gourmet', categoryName: 'Servilletas' },
    { name: 'Caja Acrilico Madera', categoryName: 'Cajas de Madera' },
    { name: 'Taza Ceramica Decorada', categoryName: 'Ceramica' },
    { name: 'Vela Sanativa Hierbas', categoryName: 'Velas' },
    { name: 'Servilleta Pack Familiar', categoryName: 'Servilletas' },
    { name: 'Caja Memoria Madera', categoryName: 'Cajas de Madera' },
    { name: 'Buda Ceramica Decor', categoryName: 'Ceramica' },
    { name: 'Vela Paket x12', categoryName: 'Velas' },
    { name: 'Servilleta Colores Surtidos', categoryName: 'Servilletas' },
    { name: 'Caja Collage Madera', categoryName: 'Cajas de Madera' },
    { name: 'Florero Ceramica Alto', categoryName: 'Ceramica' },
    { name: 'Vela Citronela Exterior', categoryName: 'Velas' },
    { name: 'Servilleta Premium Pack', categoryName: 'Servilletas' },
    { name: 'Caja LED Madera', categoryName: 'Cajas de Madera' },
    { name: 'Plato Postre Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela Personalizada Texto', categoryName: 'Velas' },
    { name: 'Servilleta Ecologica', categoryName: 'Servilletas' },
    { name: 'Caja Revista Madera', categoryName: 'Cajas de Madera' },
    { name: 'Cruz Ceramica Pared', categoryName: 'Ceramica' },
    { name: 'Vela Romantica Pack', categoryName: 'Velas' },
    { name: 'Servilleta Doble Cara', categoryName: 'Servilletas' },
    { name: 'Caja Espejo Madera', categoryName: 'Cajas de Madera' },
    { name: 'Caneca Ceramica Bathroom', categoryName: 'Ceramica' },
    { name: 'Vela Massage Aromatica', categoryName: 'Velas' },
    { name: 'Servilleta Pack Bodas', categoryName: 'Servilletas' },
    { name: 'Caja Calendario Advento', categoryName: 'Cajas de Madera' },
    { name: 'Dispensador Jabon Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela Festiva Colores', categoryName: 'Velas' },
    { name: 'Servilleta Dinosaurios', categoryName: 'Servilletas' },
    { name: 'Caja Musical Madera', categoryName: 'Cajas de Madera' },
    { name: 'Letras Ceramica Nombre', categoryName: 'Ceramica' },
    { name: 'Vela Eco Friendly', categoryName: 'Velas' },
    { name: 'Servilleta Mickey Mouse', categoryName: 'Servilletas' },
    { name: 'Caja Chocolate Madera', categoryName: 'Cajas de Madera' },
    { name: 'Campana Ceramica Peru', categoryName: 'Ceramica' },
    { name: 'Vela Cuma Semilla', categoryName: 'Velas' },
    { name: 'Servilleta Frozen', categoryName: 'Servilletas' },
    { name: 'Caja Infinitos Madera', categoryName: 'Cajas de Madera' },
    { name: 'Mate Ceramica Argentina', categoryName: 'Ceramica' },
    { name: 'Vela Yoga Relajacion', categoryName: 'Velas' },
    { name: 'Servilleta Unicornio', categoryName: 'Servilletas' },
    { name: 'Caja Puzzle Madera', categoryName: 'Cajas de Madera' },
    { name: 'Maceta Bonsai Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela Noche Estrellada', categoryName: 'Velas' },
    { name: 'Servilleta Pokemon', categoryName: 'Servilletas' },
    { name: 'Caja Bijouterie Madera', categoryName: 'Cajas de Madera' },
    { name: 'Buda Meditacion Ceramica', categoryName: 'Ceramica' },
    { name: 'Vela Pack Wedding', categoryName: 'Velas' },
  ];
  
  allProducts.push(...extraProducts);
  
  // Create products
  let created = 0;
  for (const p of allProducts) {
    const categoryId = categoryMap.get(p.categoryName);
    if (!categoryId) {
      console.log(`Category not found: ${p.categoryName}`);
      continue;
    }
    
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          description: getRandomElement(descriptions),
          categoryId,
          imageUrl: getRandomElement(imageUrls),
          price: getRandomPrice(),
          stock: getRandomStock(),
          sku: generateSKU(p.name),
          isActive: true,
        }
      });
      created++;
    } catch (error) {
      console.log(`Error creating ${p.name}:`, error);
    }
  }
  
  console.log(`Created ${created} products!`);
  await prisma.$disconnect();
}

seed();