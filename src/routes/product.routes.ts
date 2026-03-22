import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/product.controller';
import { IdParams } from '../types/types';

export async function productRoutes(fastify: FastifyInstance, controller: ProductController) {
  fastify.get('/api/products', controller.getAllProducts);
  fastify.get<{ Params: IdParams }>('/api/products/:productId', controller.getProductById);
  fastify.post('/api/products', controller.createProduct);
  fastify.put<{ Params: IdParams }>('/api/products/:productId', controller.updateProduct);
  fastify.delete<{ Params: IdParams }>('/api/products/:productId', controller.deleteProduct);
}
