function formatCurrency(amount) {
  if (amount === null || amount === undefined) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.0%";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

module.exports = {
  formatCurrency: formatCurrency,
  formatPercentage: formatPercentage,
};
