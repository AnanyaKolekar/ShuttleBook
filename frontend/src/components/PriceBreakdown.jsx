const PriceBreakdown = ({ quote, loading, error }) => (
  <div className="card">
    <h3>Live Pricing</h3>
    {loading && <p>Calculating...</p>}
    {error && <p className="badge danger">{error}</p>}
    <ul>
      {quote.priceBreakdown?.map((item, idx) => (
        <li key={idx}>
          {item.label}: ₹{item.amount.toFixed(2)}
        </li>
      ))}
    </ul>
    <strong>Total: ₹{quote.totalPrice?.toFixed(2) || '0.00'}</strong>
  </div>
);

export default PriceBreakdown;

