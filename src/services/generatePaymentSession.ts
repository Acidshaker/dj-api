import { stripe } from '../config/stripe';

export const createStripeSession = async ({
  applicant,
  eventId,
  type,
  description,
  tip,
  stripeAccountId,
  spotify_url,
  name,
  author,
  album_logo,
  duration,
}: {
  applicant: string;
  eventId: string;
  type: 'song' | 'mention';
  description?: string;
  tip: number;
  stripeAccountId: string;
  spotify_url?: string;
  name?: string;
  author?: string;
  album_logo?: string;
  duration?: string;
}) => {
  // 🎯 Construir metadata según tipo
  const baseMetadata = {
    applicant,
    eventId,
    type,
  };

  const metadata =
    type === 'mention'
      ? {
          ...baseMetadata,
          description: description || 'Mención sin texto',
        }
      : {
          ...baseMetadata,
          name: name || 'Canción sin nombre',
          author: author || 'Desconocido',
          album_logo: album_logo || '',
          duration: duration || '00:00',
          spotify_url: spotify_url || '',
        };

  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Solicitud musical (${type === 'song' ? 'Canción' : 'Mención'})`,
            },
            unit_amount: Math.round(tip * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/client/event/${eventId}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/client/event/${eventId}?status=cancel`,
      metadata,
    },
    {
      stripeAccount: stripeAccountId,
    }
  );

  return session.url;
};
