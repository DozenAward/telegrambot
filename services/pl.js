export function calculatePosition(transactions, currentPrice) {
  let totalQty = 0;
  let totalCost = 0;

  for (const t of transactions) {
    const cost = t.price * t.quantity + (t.fee || 0) + (t.addition_fee || 0);

    if (t.type === 'BUY') {
      totalQty += t.quantity;
      totalCost += cost;
    }

    if (t.type === 'SELL') {
      totalQty -= t.quantity;
      totalCost -= cost; // đơn giản hóa
    }
  }

  if (totalQty <= 0) {
    return { totalQty: 0, avgPrice: 0, pl: 0, percent: 0 };
  }

  const avgPrice = totalCost / totalQty;
  const pl = (currentPrice * totalQty) - totalCost;
  const percent = (pl / totalCost) * 100;

  return { totalQty, avgPrice, pl, percent };
}