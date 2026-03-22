import { FastifyRequest, FastifyReply } from 'fastify';
import { Product } from '../models/Product.js';
import { ProductRepo } from '../repository/repository.js';
import { StatusCodes, ResponseMessages } from '../constants/constants.js';
import { isUUID } from '../helpers/isUUID.js';

type IdParams = { productId: string };

interface IProductController {
  dbManager: ProductRepo;
  getAllProducts(req: FastifyRequest, reply: FastifyReply): Promise<void>;
  getProductById(req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply): Promise<void>;
  createProduct(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export class ProductController implements IProductController {
  dbManager: ProductRepo;

  constructor(db: ProductRepo) {
    this.dbManager = db;
  }

  getAllProducts = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const result = await this.dbManager.getAll();
      reply.status(StatusCodes.OK).send(result);
    } catch {
      reply.status(StatusCodes.INTERNAL_ERROR).send({ message: ResponseMessages.INTERNAL_ERROR_MESSAGE });
    }
  };

  getProductById = async (req: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply): Promise<void> => {
    try {
      const { productId } = req.params;

      if (!isUUID(productId)) {
        return reply.status(StatusCodes.INVALID_DATA).send({ message: ResponseMessages.INVALID_DATA });
      }

      const result = await this.dbManager.getById(productId);

      if (!result) {
        return reply.status(StatusCodes.NOT_FOUND).send({ message: ResponseMessages.NOT_FOUND_ERROR_MESSAGE });
      }

      reply.status(StatusCodes.OK).send(result);
    } catch {
      reply.status(StatusCodes.INTERNAL_ERROR).send({ message: ResponseMessages.INTERNAL_ERROR_MESSAGE });
    }
  };

  createProduct = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const body = req.body;

      if (!Product.validate(body)) {
        return reply.status(StatusCodes.INVALID_DATA).send({ message: ResponseMessages.INVALID_DATA });
      }

      const newProduct = new Product(body);
      const result = await this.dbManager.createProduct(newProduct);
      reply.status(StatusCodes.CREATED).send(result);
    } catch {
      reply.status(StatusCodes.INTERNAL_ERROR).send({ message: ResponseMessages.INTERNAL_ERROR_MESSAGE });
    }
  };
}
