import { app, repo } from '../app';
 
beforeEach(() => {
  repo.reset();
});
 
afterAll(async () => {
  await app.close();
});
 
describe('Scenario 1: full CRUD lifecycle', () => {
  it('GET /api/products returns empty array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });
 
  it('POST /api/products creates a new book', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'The Pragmatic Programmer', description: 'A book about software craftsmanship', price: 49, category: 'books', inStock: true },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.id).toBeDefined();
    expect(body.name).toBe('The Pragmatic Programmer');
  });
 
  it('GET /api/products/:id returns the created book', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'The Pragmatic Programmer', description: 'A book about software craftsmanship', price: 49, category: 'books', inStock: true },
    });
    const { id } = JSON.parse(created.body);
 
    const res = await app.inject({ method: 'GET', url: `/api/products/${id}` });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).id).toBe(id);
  });
 
  it('PUT /api/products/:id updates the book', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'The Pragmatic Programmer', description: 'A book about software craftsmanship', price: 49, category: 'books', inStock: true },
    });
    const { id } = JSON.parse(created.body);
 
    const res = await app.inject({
      method: 'PUT',
      url: `/api/products/${id}`,
      payload: { price: 39, inStock: false },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.id).toBe(id);
    expect(body.price).toBe(39);
    expect(body.inStock).toBe(false);
  });
 
  it('DELETE /api/products/:id deletes the book', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'The Pragmatic Programmer', description: 'A book about software craftsmanship', price: 49, category: 'books', inStock: true },
    });
    const { id } = JSON.parse(created.body);
 
    const res = await app.inject({ method: 'DELETE', url: `/api/products/${id}` });
    expect(res.statusCode).toBe(204);
  });
 
  it('GET /api/products/:id returns 404 after deletion', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'The Pragmatic Programmer', description: 'A book about software craftsmanship', price: 49, category: 'books', inStock: true },
    });
    const { id } = JSON.parse(created.body);
 
    await app.inject({ method: 'DELETE', url: `/api/products/${id}` });
 
    const res = await app.inject({ method: 'GET', url: `/api/products/${id}` });
    expect(res.statusCode).toBe(404);
  });
});
 
describe('Scenario 2: validation errors', () => {
  it('POST with missing fields returns 400', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/products', payload: { name: 'Clean Code' } });
    expect(res.statusCode).toBe(400);
  });
 
  it('POST with price = 0 returns 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'Clean Code', description: 'A handbook of agile software craftsmanship', price: 0, category: 'books', inStock: true },
    });
    expect(res.statusCode).toBe(400);
  });
 
  it('POST with negative price returns 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: { name: 'Clean Code', description: 'A handbook of agile software craftsmanship', price: -50, category: 'books', inStock: true },
    });
    expect(res.statusCode).toBe(400);
  });
 
  it('GET with invalid UUID returns 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products/not-a-uuid' });
    expect(res.statusCode).toBe(400);
  });
 
  it('GET with non-existing UUID returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/products/00000000-0000-0000-0000-000000000000' });
    expect(res.statusCode).toBe(404);
  });
 
  it('PUT with invalid UUID returns 400', async () => {
    const res = await app.inject({ method: 'PUT', url: '/api/products/bad-id', payload: { price: 29 } });
    expect(res.statusCode).toBe(400);
  });
 
  it('DELETE with invalid UUID returns 400', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/products/bad-id' });
    expect(res.statusCode).toBe(400);
  });
 
  it('DELETE with non-existing UUID returns 404', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/products/00000000-0000-0000-0000-000000000000' });
    expect(res.statusCode).toBe(404);
  });
});
 
describe('Scenario 3: non-existing routes', () => {
  it('GET unknown route returns 404 with message', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/unknown' });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toHaveProperty('message');
  });
 
  it('POST unknown route returns 404 with message', async () => {
    const res = await app.inject({ method: 'POST', url: '/some/random/path' });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toHaveProperty('message');
  });
});