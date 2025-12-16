import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  fetchMeta,
  fetchAvailability,
  createBooking as createBookingApi,
  joinWaitlist,
} from '../services/api';
import usePriceQuote from '../hooks/usePriceQuote';
import AvailabilityGrid from '../components/AvailabilityGrid';
import PriceBreakdown from '../components/PriceBreakdown';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const { user } = useAuth();
  const [meta, setMeta] = useState({ courts: [], equipment: [], coaches: [] });
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [form, setForm] = useState({
    courtId: '',
    coachId: '',
    startTime: dayjs().minute(0).second(0).millisecond(0).add(1, 'hour').toISOString(),
    endTime: dayjs().minute(0).second(0).millisecond(0).add(2, 'hour').toISOString(),
    equipment: [],
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await fetchMeta();
      setMeta(data);
      if (data.courts.length) {
        setForm((prev) => ({ ...prev, courtId: data.courts[0]._id }));
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (form.courtId) {
      fetchAvailability(date, form.courtId).then(setAvailability);
    }
  }, [date, form.courtId]);

  const payload = useMemo(
    () => ({
      courtId: form.courtId,
      coachId: form.coachId || undefined,
      equipment: form.equipment,
      startTime: form.startTime,
      endTime: form.endTime,
    }),
    [form]
  );

  const { quote, loading: pricingLoading, error: pricingError } = usePriceQuote(payload);

  const handleInput = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleStartChange = (value) => {
    const start = dayjs(value);
    handleInput('startTime', start.toISOString());
    handleInput('endTime', start.add(1, 'hour').toISOString());
  };

  const toggleEquipment = (id, quantity) => {
    setForm((prev) => {
      const exists = prev.equipment.find((e) => e.equipmentId === id);
      let next = [];
      if (quantity === 0) {
        next = prev.equipment.filter((e) => e.equipmentId !== id);
      } else if (exists) {
        next = prev.equipment.map((e) => (e.equipmentId === id ? { ...e, quantity } : e));
      } else {
        next = [...prev.equipment, { equipmentId: id, quantity }];
      }
      return { ...prev, equipment: next };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setStatus('Booking...');
      await createBookingApi({
        ...form,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setStatus('Booking confirmed!');
      if (form.courtId) {
        fetchAvailability(date, form.courtId).then(setAvailability);
      }
    } catch (err) {
      setStatus('');
      const msg = err.response?.data?.message || err.message;
      setError(msg);
    }
  };

  const handleWaitlist = async () => {
    await joinWaitlist({
      courtId: form.courtId,
      startTime: form.startTime,
      endTime: form.endTime,
    });
    setStatus('Added to waitlist');
  };

  return (
    <>
      <div className="card">
        <h3>Create Booking</h3>
        <p className="muted">Logged in as {user?.name}</p>
        <form onSubmit={submit} className="row">
          <div style={{ flex: 1, minWidth: 250 }}>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                const start = dayjs(`${e.target.value}T06:00:00`);
                handleStartChange(start.toISOString());
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label>Court</label>
            <select value={form.courtId} onChange={(e) => handleInput('courtId', e.target.value)}>
              {meta.courts.map((court) => (
                <option value={court._id} key={court._id}>
                  {court.name} ({court.type})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label>Coach (optional)</label>
            <select value={form.coachId} onChange={(e) => handleInput('coachId', e.target.value)}>
              <option value="">No coach</option>
              {meta.coaches.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (₹{c.ratePerHour}/hr)
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label>Start Time</label>
            <input
              type="datetime-local"
              value={dayjs(form.startTime).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label>End Time</label>
            <input
              type="datetime-local"
              value={dayjs(form.endTime).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => handleInput('endTime', dayjs(e.target.value).toISOString())}
            />
          </div>
          <div style={{ width: '100%' }}>
            <label>Equipment</label>
            <div className="row">
              {meta.equipment.map((eq) => (
                <div key={eq._id} style={{ minWidth: 180 }}>
                  <div>{eq.name}</div>
                  <input
                    type="number"
                    min="0"
                    max={eq.quantity}
                    placeholder="Qty"
                    onChange={(e) => toggleEquipment(eq._id, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <button type="submit">Confirm Booking</button>
            {error && (
              <button type="button" style={{ marginLeft: 8 }} onClick={handleWaitlist}>
                Join Waitlist
              </button>
            )}
          </div>
          {status && <p className="badge success">{status}</p>}
          {error && <p className="badge danger">{error}</p>}
        </form>
      </div>

      {availability && <AvailabilityGrid availability={availability} />}
      <PriceBreakdown quote={quote} loading={pricingLoading} error={pricingError} />
    </>
  );
};

export default BookingPage;

