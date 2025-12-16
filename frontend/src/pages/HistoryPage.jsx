import { useEffect, useState } from 'react';
import { cancelBooking, fetchHistory } from '../services/api';
import BookingHistory from '../components/BookingHistory';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const data = await fetchHistory();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (id) => {
    await cancelBooking(id);
    load();
  };

  return (
    <>
      <div className="card">
        <h3>View Booking History</h3>
        <p className="muted">Signed in as {user?.email}</p>
        <button onClick={load}>Refresh</button>
        {error && <p className="badge danger" style={{ marginTop: 8 }}>{error}</p>}
      </div>
      <BookingHistory bookings={bookings} onCancel={cancel} />
    </>
  );
};

export default HistoryPage;

