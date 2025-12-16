import dayjs from 'dayjs';

const AvailabilityGrid = ({ availability }) => {
  if (!availability?.availability?.length) return <p>No courts found.</p>;

  return (
    <div className="card">
      <h3>Available Slots</h3>
      {availability.availability.map((court) => (
        <div key={court.courtId} style={{ marginBottom: 12 }}>
          <strong>{court.courtName}</strong>
          <div className="row">
            {court.availableSlots.length ? (
              court.availableSlots.map((slot) => (
                <span className="badge" key={slot.startTime}>
                  {dayjs(slot.startTime).format('HH:mm')} - {dayjs(slot.endTime).format('HH:mm')}
                </span>
              ))
            ) : (
              <span className="badge danger">No slots</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityGrid;

