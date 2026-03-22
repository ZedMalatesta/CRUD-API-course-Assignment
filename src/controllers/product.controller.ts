import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductRepo } from '../repository/repository.js';
import { StatusCodes, ResponseMessages } from '../constants/constants.js';

interface IProductController {
  dbManager: ProductRepo;
  getAllProducts(req: FastifyRequest, reply: FastifyReply): Promise<void>;
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
}
