import axios from 'axios';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

const getSpotifyToken = async (): Promise<string> => {
  const now = Date.now();

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Faltan las credenciales de Spotify en el archivo .env');
  }

  // ✅ Reutilizar token si aún es válido
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000;

  return accessToken!;
};

export const searchSpotifyTracks = async (search: string) => {
  const token = await getSpotifyToken();

  const response = await axios.get('https://api.spotify.com/v1/search', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: search,
      type: 'track',
      limit: 10,
    },
  });

  return response.data.tracks.items.map((track: any) => ({
    name: track.name,
    author: track.artists.map((a: any) => a.name).join(', '),
    album_logo: track.album.images[0]?.url || '',
    duration: msToTime(track.duration_ms),
    spotify_url: track.external_urls.spotify,
  }));
};

const msToTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
