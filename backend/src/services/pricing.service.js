const dayjs = require('dayjs');

const matchesRule = (rule, { startTime, court }) => {
  const criteria = rule.criteria || {};
  const hour = dayjs(startTime).hour();
  const day = dayjs(startTime).day();

  if (criteria.daysOfWeek?.length && !criteria.daysOfWeek.includes(day)) return false;
  if (criteria.startHour !== undefined && hour < criteria.startHour) return false;
  if (criteria.endHour !== undefined && hour >= criteria.endHour) return false;
  if (criteria.courtType && court?.type !== criteria.courtType) return false;
  return true;
};

const applyAdjustment = (base, adjustment) => {
  if (adjustment.type === 'multiplier') {
    return base * adjustment.value;
  }
  return base + adjustment.value;
};

const calculateDurationHours = (start, end) => {
  const ms = end.getTime() - start.getTime();
  return ms / (1000 * 60 * 60);
};

const calculatePricing = ({ court, coach, equipment = [], startTime, endTime, pricingRules = [] }) => {
  const duration = calculateDurationHours(startTime, endTime);
  if (duration <= 0) throw new Error('Invalid time range');

  let total = 0;
  const breakdown = [];

  // Court base
  let courtCost = (court?.baseRate || 0) * duration;
  pricingRules
    .filter((r) => r.isActive && (r.criteria?.appliesTo || 'court') === 'court')
    .sort((a, b) => (a.priority || 1) - (b.priority || 1))
    .forEach((rule) => {
      if (matchesRule(rule, { startTime, court })) {
        const before = courtCost;
        courtCost = applyAdjustment(courtCost, rule.adjustment);
        breakdown.push({
          label: `${rule.name} (court)`,
          amount: courtCost - before,
        });
      }
    });

  breakdown.push({ label: `Court (${court.name})`, amount: courtCost });
  total += courtCost;

  // Equipment
  let equipmentTotal = 0;
  equipment.forEach((item) => {
    const base = (item.equipment.feePerHour || 0) * item.quantity * duration;
    equipmentTotal += base;
    breakdown.push({
      label: `Equipment (${item.equipment.name} x${item.quantity})`,
      amount: base,
    });
  });

  pricingRules
    .filter((r) => r.isActive && r.criteria?.appliesTo === 'equipment')
    .sort((a, b) => (a.priority || 1) - (b.priority || 1))
    .forEach((rule) => {
      if (matchesRule(rule, { startTime, court })) {
        const before = equipmentTotal;
        equipmentTotal = applyAdjustment(equipmentTotal, rule.adjustment);
        breakdown.push({
          label: `${rule.name} (equipment)`,
          amount: equipmentTotal - before,
        });
      }
    });

  total += equipmentTotal;

  // Coach
  if (coach) {
    let coachCost = (coach.ratePerHour || 0) * duration;
    pricingRules
      .filter((r) => r.isActive && r.criteria?.appliesTo === 'coach')
      .sort((a, b) => (a.priority || 1) - (b.priority || 1))
      .forEach((rule) => {
        if (matchesRule(rule, { startTime, court })) {
          const before = coachCost;
          coachCost = applyAdjustment(coachCost, rule.adjustment);
          breakdown.push({
            label: `${rule.name} (coach)`,
            amount: coachCost - before,
          });
        }
      });
    breakdown.push({ label: `Coach (${coach.name})`, amount: coachCost });
    total += coachCost;
  }

  return { totalPrice: Number(total.toFixed(2)), priceBreakdown: breakdown };
};

module.exports = {
  calculatePricing,
};

