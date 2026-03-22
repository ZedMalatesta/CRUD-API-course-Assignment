import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/product.controller.js';

export async function productRoutes(fastify: FastifyInstance, controller: ProductController) {
  fastify.get('/api/products', controller.getAllProducts);
}
