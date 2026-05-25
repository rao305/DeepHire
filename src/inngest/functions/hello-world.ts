import { inngest } from '../client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello' },
  async ({ event, step }) => {
    await step.run('log-greeting', async () => {
      const name =
        typeof event.data === 'object' && event.data && 'name' in event.data
          ? String((event.data as { name?: unknown }).name ?? 'world')
          : 'world';

      console.log(`[hello-world] Received test/hello for ${name}`);
      return { greeted: name };
    });

    return { ok: true };
  }
);
