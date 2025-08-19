// Temporary auth stub to avoid build errors
export const auth = async () => ({ user: { id: 'test-user' } } as any);
export const signOut = async () => {};
export const signIn = async () => {};

export const handlers = {
  GET: async () => new Response('OK'),
  POST: async () => new Response('OK'),
};