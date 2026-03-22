import Fastify from 'fastify';
import { Product } from './models/Product.js';
import { ProductRepo } from './repository/repository.js';
import { ProductController } from './controllers/product.controller.js';
import { productRoutes } from './routes/product.routes.js';
import { StatusCodes } from './constants/constants.js';

export const repo = new ProductRepo([] as Array<Product>);

const fastify = Fastify({
  logger: process.env.NODE_ENV !== 'test',
});

const controller = new ProductController(repo);

productRoutes(fastify, controller);

fastify.setNotFoundHandler((_req, reply) => {
  reply.status(StatusCodes.NOT_FOUND).send({ message: 'Route not found. The requested resource does not exist.' });
});

fastify.setErrorHandler((error, _req, reply) => {
  fastify.log.error(error);
  reply.status(StatusCodes.INTERNAL_ERROR).send({ message: 'Internal server error. Please try again later.' });
});

export const app = fastify;
