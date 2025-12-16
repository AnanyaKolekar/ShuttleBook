import { useEffect, useState } from 'react';
import { admin } from '../services/api';

const AdminPage = () => {
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState('');

  const [courtForm, setCourtForm] = useState({ name: '', type: 'indoor', baseRate: 20 });
  const [equipmentForm, setEquipmentForm] = useState({ name: '', quantity: 0, feePerHour: 0 });
  const [coachForm, setCoachForm] = useState({
    name: '',
    bio: '',
    ratePerHour: 0,
    availabilityString: '1-8-12;3-14-20',
  });
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    criteria: { appliesTo: 'court' },
    adjustment: { type: 'multiplier', value: 1 },
    priority: 1,
  });

  const load = async () => {
    try {
      setError('');
      const [c, e, co, pr] = await Promise.all([
        admin.listCourts(),
        admin.listEquipment(),
        admin.listCoaches(),
        admin.listPricingRules(),
      ]);
      setCourts(c);
      setEquipment(e);
      setCoaches(co);
      setRules(pr);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveCourt = async () => {
    await admin.saveCourt(courtForm);
    setCourtForm({ name: '', type: 'indoor', baseRate: 20 });
    load();
  };

  const toggleCourt = async (court) => {
    await admin.updateCourt(court._id, { isActive: !court.isActive });
    load();
  };

  const saveEquipment = async () => {
    await admin.saveEquipment({ ...equipmentForm, quantity: Number(equipmentForm.quantity) });
    setEquipmentForm({ name: '', quantity: 0, feePerHour: 0 });
    load();
  };

  const toggleEquipment = async (item) => {
    await admin.updateEquipment(item._id, { isActive: !item.isActive });
    load();
  };

  const saveCoach = async () => {
    const availability = (coachForm.availabilityString || '')
      .split(';')
      .filter(Boolean)
      .map((chunk) => {
        const [d, s, e] = chunk.split('-').map((n) => Number(n));
        return { dayOfWeek: d, startHour: s, endHour: e };
      });
    await admin.saveCoach({ name: coachForm.name, bio: coachForm.bio, ratePerHour: coachForm.ratePerHour, availability });
    setCoachForm({ name: '', bio: '', ratePerHour: 0, availabilityString: '1-8-12;3-14-20' });
    load();
  };

  const toggleCoach = async (coach) => {
    await admin.updateCoach(coach._id, { isActive: !coach.isActive });
    load();
  };

  const saveRule = async () => {
    await admin.savePricingRule(ruleForm);
    setRuleForm({
      name: '',
      description: '',
      criteria: { appliesTo: 'court' },
      adjustment: { type: 'multiplier', value: 1 },
      priority: 1,
    });
    load();
  };

  const toggleRule = async (rule) => {
    await admin.updatePricingRule(rule._id, { isActive: !rule.isActive });
    load();
  };

  const updateCourtRate = async (court) => {
    const next = window.prompt('New base rate', court.baseRate);
    if (next) {
      await admin.updateCourt(court._id, { baseRate: Number(next) });
      load();
    }
  };

  const updateEquipmentQty = async (item) => {
    const next = window.prompt('New quantity', item.quantity);
    if (next !== null) {
      await admin.updateEquipment(item._id, { quantity: Number(next) });
      load();
    }
  };

  const updateCoachRate = async (coach) => {
    const next = window.prompt('New rate per hour', coach.ratePerHour);
    if (next) {
      await admin.updateCoach(coach._id, { ratePerHour: Number(next) });
      load();
    }
  };

  return (
    <div className="card">
      <h3>Admin Configuration</h3>
      {error && <p className="badge danger">{error}</p>}
      <div className="row">
        <div style={{ flex: 1, minWidth: 250 }}>
          <h4>Courts</h4>
          <input
            placeholder="Name"
            value={courtForm.name}
            onChange={(e) => setCourtForm({ ...courtForm, name: e.target.value })}
          />
          <select
            value={courtForm.type}
            onChange={(e) => setCourtForm({ ...courtForm, type: e.target.value })}
            style={{ marginTop: 6 }}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
          <input
            type="number"
            placeholder="Base rate"
            value={courtForm.baseRate}
            onChange={(e) => setCourtForm({ ...courtForm, baseRate: Number(e.target.value) })}
            style={{ marginTop: 6 }}
          />
          <button onClick={saveCourt} style={{ marginTop: 6 }}>
            Add Court
          </button>
          <ul>
            {courts.map((c) => (
              <li key={c._id}>
                {c.name} ({c.type}) ₹{c.baseRate}{' '}
                <span className={`badge ${c.isActive ? 'success' : 'danger'}`}>
                  {c.isActive ? 'active' : 'disabled'}
                </span>
                <button style={{ marginLeft: 8 }} onClick={() => updateCourtRate(c)}>
                  Edit rate
                </button>
                <button style={{ marginLeft: 8 }} onClick={() => toggleCourt(c)}>
                  {c.isActive ? 'Disable' : 'Enable'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <h4>Equipment</h4>
          <input
            placeholder="Name"
            value={equipmentForm.name}
            onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={equipmentForm.quantity}
            onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: e.target.value })}
            style={{ marginTop: 6 }}
          />
          <input
            type="number"
            placeholder="Fee per hour"
            value={equipmentForm.feePerHour}
            onChange={(e) => setEquipmentForm({ ...equipmentForm, feePerHour: Number(e.target.value) })}
            style={{ marginTop: 6 }}
          />
          <button onClick={saveEquipment} style={{ marginTop: 6 }}>
            Add Equipment
          </button>
          <ul>
            {equipment.map((eq) => (
              <li key={eq._id}>
                {eq.name} qty:{eq.quantity} fee:₹{eq.feePerHour}{' '}
                <span className={`badge ${eq.isActive ? 'success' : 'danger'}`}>
                  {eq.isActive ? 'active' : 'disabled'}
                </span>
                <button style={{ marginLeft: 8 }} onClick={() => updateEquipmentQty(eq)}>
                  Update qty
                </button>
                <button style={{ marginLeft: 8 }} onClick={() => toggleEquipment(eq)}>
                  {eq.isActive ? 'Disable' : 'Enable'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <h4>Coaches</h4>
          <input
            placeholder="Name"
            value={coachForm.name}
            onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
          />
          <input
            placeholder="Bio"
            value={coachForm.bio}
            onChange={(e) => setCoachForm({ ...coachForm, bio: e.target.value })}
            style={{ marginTop: 6 }}
          />
          <input
            type="number"
            placeholder="Rate per hour"
            value={coachForm.ratePerHour}
            onChange={(e) => setCoachForm({ ...coachForm, ratePerHour: Number(e.target.value) })}
            style={{ marginTop: 6 }}
          />
          <input
            placeholder="Availability (e.g. 1-8-12;3-14-20)"
            value={coachForm.availabilityString}
            onChange={(e) => setCoachForm({ ...coachForm, availabilityString: e.target.value })}
            style={{ marginTop: 6 }}
          />
          <button onClick={saveCoach} style={{ marginTop: 6 }}>
            Add Coach
          </button>
          <ul>
            {coaches.map((c) => (
              <li key={c._id}>
                {c.name} ₹{c.ratePerHour}{' '}
                <span className={`badge ${c.isActive ? 'success' : 'danger'}`}>
                  {c.isActive ? 'active' : 'disabled'}
                </span>
                <button style={{ marginLeft: 8 }} onClick={() => updateCoachRate(c)}>
                  Edit rate
                </button>
                <button style={{ marginLeft: 8 }} onClick={() => toggleCoach(c)}>
                  {c.isActive ? 'Disable' : 'Enable'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Pricing Rules</h4>
        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <input
              placeholder="Rule name"
              value={ruleForm.name}
              onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
            />
            <input
              placeholder="Description"
              value={ruleForm.description}
              onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
              style={{ marginTop: 6 }}
            />
            <select
              value={ruleForm.criteria.appliesTo}
              onChange={(e) => setRuleForm({ ...ruleForm, criteria: { appliesTo: e.target.value } })}
              style={{ marginTop: 6 }}
            >
              <option value="court">Court</option>
              <option value="equipment">Equipment</option>
              <option value="coach">Coach</option>
            </select>
            <select
              value={ruleForm.adjustment.type}
              onChange={(e) =>
                setRuleForm({ ...ruleForm, adjustment: { ...ruleForm.adjustment, type: e.target.value } })
              }
              style={{ marginTop: 6 }}
            >
              <option value="multiplier">Multiplier</option>
              <option value="flat">Flat</option>
            </select>
            <input
              type="number"
              placeholder="Value"
              value={ruleForm.adjustment.value}
              onChange={(e) =>
                setRuleForm({
                  ...ruleForm,
                  adjustment: { ...ruleForm.adjustment, value: Number(e.target.value) },
                })
              }
              style={{ marginTop: 6 }}
            />
            <button onClick={saveRule} style={{ marginTop: 6 }}>
              Add Rule
            </button>
          </div>
          <div style={{ flex: 2 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scope</th>
                  <th>Adjustment</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td>{r.criteria?.appliesTo}</td>
                    <td>
                      {r.adjustment.type} {r.adjustment.value}
                    </td>
                  <td>
                    {r.priority}{' '}
                    <span className={`badge ${r.isActive ? 'success' : 'danger'}`}>
                      {r.isActive ? 'active' : 'disabled'}
                    </span>
                    <button style={{ marginLeft: 8 }} onClick={() => toggleRule(r)}>
                      {r.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

