import Fastify from 'fastify';
 
export function startFastify() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });
 
  fastify.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ message: 'Route not found. The requested resource does not exist.' });
  });
 
  fastify.setErrorHandler((error, _req, reply) => {
    fastify.log.error(error);
    reply.status(500).send({ message: 'Internal server error. Please try again later.' });
  });
 
  return fastify;
}