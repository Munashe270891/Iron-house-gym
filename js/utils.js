export const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

export const calculateMembershipTotal = (monthlyPrice, months) => {
  const m = Number(months);
  let discountRate = 0;
  let monthsPaidFor = m;
  let savingText = "No discount";
  if (m === 3) { discountRate = 0.05; savingText = "You save 5%!"; }
  if (m === 6) { discountRate = 0.10; savingText = "You save 10%!"; }
  if (m === 12) { discountRate = 0.20; monthsPaidFor = 11; savingText = "You save 20% + 1 month FREE!"; }
  // For 12 months: Pay for 11 months at discounted rate? OR pay 600 - 20% = 480.
  // We use: subtotal = price * 12, discount = 20%, total = 480. That is 12 months paid, 1 month free already included as extra value.
  // Alternative: subtotal = price * 11 = 550. Both are valid if you explain. We use 600-120=480 to match task: "20% + 1 month free" = 480.
  const subtotal = monthlyPrice * m;
  const discount = subtotal * discountRate;
  const total = subtotal - discount;
  return { subtotal, discount, total, monthsPaidFor, savingText, discountRate };
};

export const calculateBMI = (weightKg, heightCm) => {
  const heightM = Number(heightCm) / 100;
  const bmiRaw = Number(weightKg) / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;
  let category = "", color = "";
  if (bmi < 18.5) { category = "Underweight"; color = "blue"; }
  else if (bmi < 25) { category = "Normal"; color = "green"; }
  else if (bmi < 30) { category = "Overweight"; color = "amber"; }
  else { category = "Obese"; color = "red"; }
  return { bmi, category, color };
};

export const getToday = () => new Date().toISOString().split("T")[0];
export const generateBookingId = () => `IH-${Date.now().toString().slice(-6)}`;
*Self-Test:*
console.log(calculateMembershipTotal(50, 1).total === 50);
console.log(calculateMembershipTotal(50, 3).total === 142.5); // 150 - 7.5
console.log(calculateMembershipTotal(50, 6).total === 270); // 300 - 30
console.log(calculateMembershipTotal(50, 12).total === 480); // 600 - 120
console.log(calculateBMI(80, 175).bmi === 26.1);
console.log(calculateBMI(80, 175).category === "Overweight");
