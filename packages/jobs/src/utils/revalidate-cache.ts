import { BusinessConfig as config } from '@solomonai/platform-config';

export async function revalidateCache({
  tag,
  id,
}: {
  tag: string;
  id: string;
}) {
  return fetch(
    `${config.platformUrl}/api/webhook/cache/revalidate`,
    {
      headers: {
        Authorization: `Bearer ${config.cacheApiSecret}`,
      },
      method: 'POST',
      body: JSON.stringify({ tag, id }),
    }
  );
}
