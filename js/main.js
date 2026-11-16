import { plans, trainers, classes, ptPacks, testimonials, fallbackQuotes } from "./data.js";
import { renderPlans, renderClasses, renderTrainers, renderPTPacks, renderTestimonials } from "./render.js";
import { formatMoney, calculateMembershipTotal, calculateBMI, getToday, generateBookingId } from "./utils.js";
import { getBookings, saveBooking, deleteBooking, clearBookings, getClassSpotsLeft, isClassFull } from "./bookings.js";

// ===== INITIAL RENDER =====
let currentMonths = 1;
renderPlans(plans, currentMonths);
renderClasses(classes);
renderTrainers(trainers);
renderPTPacks(ptPacks);
renderTestimonials(testimonials);

// ===== DARK MODE =====
const darkBtn = document.querySelector("#darkModeBtn");
if (localStorage.getItem("ironHouseTheme") === "dark") document.documentElement.classList.add("dark");
darkBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("ironHouseTheme", isDark ? "dark" : "light");
  darkBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
});

// ===== OPEN NOW BADGE =====
function updateOpenNow() {
  const badge = document.querySelector("#openNowBadge");
  if (!badge) return;
  const now = new Date();
  const day = now.getDay(); // 0 Sun, 6 Sat
  const hour = now.getHours() + now.getMinutes() / 60;
  let open = false, closeText = "";
  if (day >= 1 && day <= 5) { open = hour >= 5 && hour < 21; closeText = "Closes 9pm"; }
  else if (day === 6) { open = hour >= 6 && hour < 18; closeText = "Closes 6pm"; }
  else { open = hour >= 7 && hour < 12; closeText = "Closes 12pm"; }
  badge.textContent = open ? `● OPEN NOW - ${closeText}` : "● CLOSED - See hours in footer";
  badge.className = `badge ${open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`;
}
updateOpenNow();
setInterval(updateOpenNow, 60000);

// ===== WEATHER + QUOTE =====
async function loadWeather() {
  const el = document.querySelector("#weatherWidget");
  if (!el) return;
  try {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-17.8252&longitude=31.0335&current=temperature_2m&timezone=Africa%2FHarare");
    if (!res.ok) throw new Error("Weather failed");
    const data = await res.json();
    const temp = data.current.temperature_2m;
    el.textContent = `Harare now: ${temp}°C - ${temp > 20 ? "Perfect for morning run 🏃" : "Gym is warm, come inside 🔥"}`;
  } catch { el.textContent = "Harare weather unavailable - Gym is open!"; }
}
loadWeather();

async function loadQuote() {
  const el = document.querySelector("#quoteWidget");
  if (!el) return;
  try {
    const res = await fetch("https://dummyjson.com/quotes/random");
    if (!res.ok) throw new Error("Quote failed");
    const data = await res.json();
    el.innerHTML = `"${data.quote}" - ${data.author} - <button id="newQuoteBtn" class="underline font-bold">New Quote ↻</button>`;
  } catch {
    const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    el.innerHTML = `"${q}" - Iron House - <button id="newQuoteBtn" class="underline font-bold">New Quote ↻</button>`;
  }
  document.querySelector("#newQuoteBtn")?.addEventListener("click", loadQuote);
}
loadQuote();

// ===== PLANS - BILLING =====
const billingSelect = document.querySelector("#billingPeriod");
billingSelect.addEventListener("change", (e) => {
  currentMonths = Number(e.target.value);
  renderPlans(plans, currentMonths);
  // Sync join form months
  const joinMonths = document.querySelector('[name="months"]');
  if (joinMonths) { joinMonths.value = String(currentMonths); updateJoinPreview(); }
});

// ===== CLASSES FILTERS =====
const classSearch = document.querySelector("#classSearch");
const intensityFilter = document.querySelector("#classFilterIntensity");
const dayFilter = document.querySelector("#classFilterDay");
const categoryFilter = document.querySelector("#classFilterCategory");
const beginnerOnly = document.querySelector("#beginnerOnly");

function applyClassFilters() {
  let filtered = [...classes];
  const q = classSearch.value.toLowerCase().trim();
  if (q) filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.trainer.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  if (intensityFilter.value !== "All") filtered = filtered.filter(c => c.intensity === intensityFilter.value);
  if (dayFilter.value !== "All") filtered = filtered.filter(c => c.days.includes(dayFilter.value));
  if (categoryFilter.value !== "All") filtered = filtered.filter(c => c.category === categoryFilter.value);
  if (beginnerOnly.checked) filtered = filtered.filter(c => c.beginnerFriendly);
  renderClasses(filtered);
}
let searchTimeout;
classSearch.addEventListener("input", () => { clearTimeout(searchTimeout); searchTimeout = setTimeout(applyClassFilters, 300); });
[intensityFilter, dayFilter, categoryFilter].forEach(el => el.addEventListener("change", applyClassFilters));
beginnerOnly.addEventListener("change", applyClassFilters);

// ===== TRAINER FILTER =====
document.querySelector("#trainerFilter").addEventListener("change", (e) => {
  const val = e.target.value;
  const filtered = val === "All" ? trainers : trainers.filter(t => t.specialty.includes(val));
  renderTrainers(filtered);
});

// ===== TABLE / CARD TOGGLE =====
let isTableView = false;
document.querySelector("#toggleViewBtn").addEventListener("click", (e) => {
  isTableView = !isTableView;
  document.querySelector("#classesGrid").classList.toggle("hidden", isTableView);
  document.querySelector("#classesTableWrap").classList.toggle("hidden", !isTableView);
  e.target.textContent = isTableView ? "Switch to Card View" : "Switch to Table View";
  applyClassFilters();
});

// ===== JOIN FORM =====
const joinForm = document.querySelector("#joinForm");
const planSelect = document.querySelector('[name="planId"]');
const monthsSelect = document.querySelector('[name="months"]');
const joinPreview = document.querySelector("#joinPricePreview");
const joinError = document.querySelector("#joinError");

planSelect.innerHTML = plans.map(p => `<option value="${p.id}">${p.name} - ${p.period === "day" ? formatMoney(p.price) + "/day" : formatMoney(p.price) + "/month"}</option>`).join("");
document.querySelector('[name="startDate"]').min = getToday();

function updateJoinPreview() {
  const data = Object.fromEntries(new FormData(joinForm));
  const plan = plans.find(p => p.id === Number(data.planId));
  if (!plan) return;
  if (plan.period === "day") { joinPreview.textContent = `${plan.name}: ${formatMoney(plan.price)} - First visit FREE for new members!`; return; }
  const months = Number(data.months);
  const { subtotal, discount, total, savingText } = calculateMembershipTotal(plan.price, months);
  joinPreview.textContent = `${plan.name} - ${months} month(s) • Subtotal ${formatMoney(subtotal)} • Discount ${formatMoney(discount)} • Total ${formatMoney(total)} • ${savingText}`;
}
joinForm.addEventListener("input", updateJoinPreview);
joinForm.addEventListener("change", updateJoinPreview);
updateJoinPreview();

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  joinError.textContent = "";
  const data = Object.fromEntries(new FormData(joinForm));
  if (!data.fullName?.trim()) return joinError.textContent = "Full name required";
  if (!data.phone?.startsWith("07") || data.phone.length !== 10) return joinError.textContent = "Phone must start with 07 and be 10 digits";
  if (!data.email?.includes("@")) return joinError.textContent = "Enter valid email";
  if (!data.startDate || data.startDate < getToday()) return joinError.textContent = "Start date must be today or future";
  if (!data.emergencyContact?.trim()) return joinError.textContent = "Emergency contact required";
  if (data.hasMedicalCondition) { if (!confirm("You checked medical condition. Our trainer will contact you before first session. Continue?")) return; }

  const plan = plans.find(p => p.id === Number(data.planId));
  let total = plan.price;
  let months = 1;
  if (plan.period !== "day") {
    months = Number(data.months);
    total = calculateMembershipTotal(plan.price, months).total;
  }
  const booking = { id: generateBookingId(), type: "Membership", planName: plan.name, months: plan.period === "day" ? 0 : months, startDate: data.startDate, fullName: data.fullName.trim(), phone: data.phone, email: data.email, total, createdAt: new Date().toLocaleString(), status: "Active" };
  saveBooking(booking);
  renderBookings();
  updateBookingCount();
  alert(`Welcome to Iron House! ID: ${booking.id}\nPlan: ${plan.name}\nTotal: ${formatMoney(total)}\nWe will WhatsApp you on ${booking.phone}.`);
  joinForm.reset();
  updateJoinPreview();
});

// ===== CLASS MODAL =====
const modal = document.querySelector("#classModal");
let selectedClassId = null;
function openModal(classId) {
  const cls = classes.find(c => c.id === Number(classId));
  if (!cls) return;
  selectedClassId = cls.id;
  document.querySelector("#modalClassName").textContent = cls.name;
  const spotsLeft = getClassSpotsLeft(cls);
  document.querySelector("#modalClassInfo").textContent = `${cls.trainer} • ${cls.days.join(", ")} • ${cls.time} • ${cls.duration} min • ${spotsLeft} spots left`;
  document.querySelector('[name="classDate"]').min = getToday();
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal() { modal.classList.add("hidden"); document.body.style.overflow = ""; }
document.querySelector("#closeModalBtn").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });

document.querySelector("#classBookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if (!data.memberName?.trim()) return alert("Name required");
  if (!data.memberPhone?.startsWith("07") || data.memberPhone.length !== 10) return alert("Phone must start with 07 and be 10 digits");
  if (!data.classDate || data.classDate < getToday()) return alert("Class date must be future");
  const cls = classes.find(c => c.id === Number(selectedClassId));
  if (isClassFull(cls)) return alert("This class is full. Try another class.");
  const booking = { id: generateBookingId(), type: "Class", classId: cls.id, className: cls.name, classDate: data.classDate, fullName: data.memberName.trim(), phone: data.memberPhone, total: 0, createdAt: new Date().toLocaleString(), status: "Booked" };
  saveBooking(booking);
  renderBookings();
  updateBookingCount();
  applyClassFilters(); // Refresh spots
  alert(`Booked! ${cls.name} on ${data.classDate}\nID: ${booking.id}\nShow this at reception.`);
  e.target.reset();
  closeModal();
});

// ===== PT + PLAN BUTTONS - DELEGATION =====
document.querySelector("#plansGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".choosePlanBtn");
  if (!btn) return;
  planSelect.value = btn.dataset.id;
  monthsSelect.value = String(currentMonths);
  updateJoinPreview();
  document.querySelector("#join").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#ptGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".choosePTBtn");
  if (!btn) return;
  const name = btn.dataset.name;
  const price = Number(btn.dataset.price);
  const booking = { id: generateBookingId(), type: "PT", planName: name, fullName: "Walk-in - Ask at reception", phone: "", total: price, createdAt: new Date().toLocaleString(), status: "Pending - Pay at Reception" };
  saveBooking(booking);
  renderBookings();
  updateBookingCount();
  alert(`PT Pack added: ${name} - ${formatMoney(price)}\nPay at reception. ID: ${booking.id}`);
});

document.querySelector("#trainersGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".bookPTBtn");
  if (!btn) return;
  const trainerName = btn.dataset.name;
  alert(`To book PT with ${trainerName}, choose a PT pack below or WhatsApp 0772 123 456.\nWe will match you with ${trainerName}.`);
  document.querySelector("#pt").scrollIntoView({ behavior: "smooth" });
});

// ===== MY BOOKINGS =====
function renderBookings() {
  const list = document.querySelector("#bookingsList");
  const filter = document.querySelector("#bookingFilter").value;
  let bookings = getBookings();
  if (filter !== "All") bookings = bookings.filter(b => b.type === filter);
  if (bookings.length === 0) { list.innerHTML = `<p class="text-gray-500 col-span-full">No bookings yet. Join or book a class above.</p>`; return; }
  list.innerHTML = bookings.map(b => `
    <div class="card p-5 gap-2">
      <div class="flex justify-between"><span class="badge ${b.type === "Membership" ? "bg-green-100 text-green-800" : b.type === "Class" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}">${b.type}</span><span class="text-xs">${b.id}</span></div>
      <h4 class="font-bold">${b.planName || b.className} - ${b.status}</h4>
      <p class="text-sm">${b.fullName} • ${b.phone || "No phone"}</p>
      ${b.classDate ? `<p class="text-sm">Class Date: ${b.classDate}</p>` : ""}
      ${b.startDate ? `<p class="text-sm">Starts: ${b.startDate} • ${b.months} month(s)</p>` : ""}
      <p><strong>Total: ${formatMoney(b.total)}</strong></p>
      <p class="text-xs text-gray-500">${b.createdAt}</p>
      <button class="deleteBookingBtn bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm mt-2" data-id="${b.id}">Cancel</button>
    </div>`).join("");
}
function updateBookingCount() {
  document.querySelector("#bookingCount").textContent = getBookings().length;
}
renderBookings();
updateBookingCount();
document.querySelector("#bookingFilter").addEventListener("change", renderBookings);
document.querySelector("#bookingsList").addEventListener("click", (e) => {
  const btn = e.target.closest(".deleteBookingBtn");
  if (!btn) return;
  if (!confirm("Cancel this booking?")) return;
  deleteBooking(btn.dataset.id);
  renderBookings();
  updateBookingCount();
  applyClassFilters(); // Spots freed
});
document.querySelector("#clearBookingsBtn").addEventListener("click", () => {
  if (!confirm("Clear all bookings?")) return;
  clearBookings();
  renderBookings();
  updateBookingCount();
  applyClassFilters();
});
document.querySelector("#myBookingsBtn").addEventListener("click", () => {
  document.querySelector("#myBookings").scrollIntoView({ behavior: "smooth" });
});

// ===== CLASS GRID DELEGATION FOR MODAL =====
document.querySelector("#classesGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".bookClassBtn");
  if (!btn || btn.disabled) return;
  openModal(btn.dataset.id);
});
document.querySelector("#classesTableBody").addEventListener("click", (e) => {
  const btn = e.target.closest(".bookClassBtn");
  if (!btn || btn.disabled) return;
  openModal(btn.dataset.id);
});

// ===== BMI =====
document.querySelector("#bmiForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const weight = Number(data.weight);
  const height = Number(data.height);
  if (!weight || !height || weight <= 0 || height <= 0) { document.querySelector("#bmiResult").textContent = "Enter valid weight and height"; return; }
  const { bmi, category, color } = calculateBMI(weight, height);
  const colorMap = { blue: "text-blue-600", green: "text-green-600", amber: "text-amber-600", red: "text-red-600" };
  document.querySelector("#bmiResult").innerHTML = `Your BMI: <span class="font-extrabold text-2xl ${colorMap[color]}">${bmi}</span> - <span class="font-bold ${colorMap[color]}">${category}</span>`;
  let rec = "";
  if (bmi >= 30 && data.goal === "Lose Weight") rec = "Recommend: Pro Plan + HIIT Blast + Boxing. Talk to Coach Moyo. Start with 3x/week, not daily.";
  else if (bmi < 18.5 && data.goal === "Gain Muscle") rec = "Recommend: Elite Plan + Strength 101 + 4 PT Sessions. Talk to Tino. Eat + protein, lift 3x/week.";
  else if (data.goal === "General Health") rec = "Recommend: Starter Plan + Strength 101 + Morning Yoga. Easy start, 2x/week.";
  else if (bmi >= 25) rec = "Recommend: Pro Plan + HIIT + Spin. Unlimited classes will help you lose weight fast.";
  else rec = "Recommend: Pro Plan - Unlimited classes + Sauna. You are in good shape, maintain it!";
  document.querySelector("#bmiRecommendation").textContent = rec;
});

// ===== SCROLL TOP =====
const scrollBtn = document.querySelector("#scrollTopBtn");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("hidden", window.scrollY < 500);
});
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
