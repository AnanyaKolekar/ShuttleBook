import { useEffect, useState } from 'react';
import { fetchPrice } from '../services/api';

const usePriceQuote = (payload) => {
  const [quote, setQuote] = useState({ totalPrice: 0, priceBreakdown: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!payload?.courtId || !payload?.startTime || !payload?.endTime) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPrice(payload);
        setQuote(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [payload]);

  return { quote, loading, error };
};

export default usePriceQuote;

