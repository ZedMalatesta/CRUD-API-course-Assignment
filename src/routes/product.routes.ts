import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/product.controller.js';

type IdParams = { productId: string };

export async function productRoutes(fastify: FastifyInstance, controller: ProductController) {
  fastify.get('/api/products', controller.getAllProducts);
  fastify.get<{ Params: IdParams }>('/api/products/:productId', controller.getProductById);
  fastify.post('/api/products', controller.createProduct);
}
