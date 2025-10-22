import { Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/spotifyService';
import { successResponse, errorResponse } from '../utils/response'; // si tienes helpers

export const searchMusic = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
      return errorResponse({
        res,
        status: 400,
        message: 'Debes proporcionar un parámetro "search" válido',
      });
    }

    const results = await searchSpotifyTracks(search);
    return successResponse({
      res,
      message: 'Resultados obtenidos desde Spotify',
      data: results,
    });
  } catch (error) {
    console.error('❌ Error al buscar en Spotify:', error);
    return errorResponse({
      res,
      status: 500,
      message: 'Error al buscar canciones en Spotify',
      error,
    });
  }
};
