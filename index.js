import { startFastify } from './src/app';
 
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const HOST = '0.0.0.0';
 
const start = async () => {
  const app = startFastify();
 
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
 
start();