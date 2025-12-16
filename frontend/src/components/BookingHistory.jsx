import dayjs from 'dayjs';

const BookingHistory = ({ bookings, onCancel }) => (
  <div className="card">
    <h3>Your Bookings</h3>
    <table className="table">
      <thead>
        <tr>
          <th>Court</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b._id}>
            <td>{b.court?.name || b.courtName || b.court}</td>
            <td>{dayjs(b.startTime).format('MMM D, HH:mm')}</td>
            <td>{dayjs(b.endTime).format('HH:mm')}</td>
            <td>
              <span className={`badge ${b.status === 'cancelled' ? 'danger' : 'success'}`}>
                {b.status}
              </span>
            </td>
            <td>₹{b.totalPrice?.toFixed(2)}</td>
            <td>
              {b.status === 'confirmed' && (
                <button onClick={() => onCancel(b._id)} style={{ padding: '6px 10px' }}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
        {!bookings.length && (
          <tr>
            <td colSpan="6">No bookings yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default BookingHistory;

