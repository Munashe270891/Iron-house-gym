import { formatMoney, calculateMembershipTotal } from "./utils.js";
import { getClassSpotsLeft } from "./bookings.js";

function intensityBadge(intensity) {
  const map = { Low: "bg-green-100 text-green-800", Medium: "bg-amber-100 text-amber-800", High: "bg-red-100 text-red-800" };
  return `<span class="badge ${map[intensity] || "bg-gray-100"}">${intensity} Intensity</span>`;
}

export function renderPlans(plansToShow, months) {
  const grid = document.querySelector("#plansGrid");
  if (!grid) return;
  grid.innerHTML = plansToShow.map(plan => {
    let priceLine = "";
    if (plan.period === "day") {
      priceLine = `<p><span class="text-3xl font-extrabold">${formatMoney(plan.price)}</span> / day</p><p class="text-sm text-gray-500">First visit FREE</p>`;
    } else {
      const { total, savingText } = calculateMembershipTotal(plan.price, months);
      priceLine = months === 1
        ? `<p><span class="text-3xl font-extrabold">${formatMoney(plan.price)}</span> / month</p>`
        : `<p><span class="text-3xl font-extrabold">${formatMoney(total)}</span> <span class="text-sm">for ${months} months</span></p><p class="text-sm text-green-700 font-bold">${savingText}</p><p class="text-xs text-gray-500">Normal: ${formatMoney(plan.price * months)}</p>`;
    }
    return `
    <div class="card p-6 gap-3 ${plan.popular ? "ring-2 ring-amber-400 relative" : ""}">
      ${plan.popular ? `<span class="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">MOST POPULAR</span>` : ""}
      <h3 class="text-xl font-bold">${plan.name}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">${plan.description}</p>
      ${priceLine}
      <ul class="text-sm space-y-1">${plan.features.map(f => `<li>✓ ${f}</li>`).join("")}</ul>
      <button class="choosePlanBtn btn-primary mt-auto" data-id="${plan.id}">Choose ${plan.name}</button>
    </div>`;
  }).join("");
}

export function renderClasses(classesToShow) {
  const grid = document.querySelector("#classesGrid");
  if (!grid) return;
  if (classesToShow.length === 0) { grid.innerHTML = `<p class="text-gray-500 col-span-full">No classes match your filters.</p>`; return; }
  grid.innerHTML = classesToShow.map(cls => {
    const spotsLeft = getClassSpotsLeft(cls);
    const filled = Math.round(((cls.maxSpots - spotsLeft) / cls.maxSpots) * 100);
    const isFull = spotsLeft <= 0;
    return `
    <div class="card group">
      <img src="${cls.image}" alt="${cls.name}" loading="lazy" class="w-full h-44 object-cover group-hover:scale-105 transition duration-300">
      <div class="p-5 flex flex-col gap-2 flex-1">
        <div class="flex flex-wrap gap-2">${intensityBadge(cls.intensity)} ${cls.beginnerFriendly ? `<span class="badge bg-blue-100 text-blue-800">Beginner Friendly</span>` : ""}</div>
        <h3 class="text-xl font-bold">${cls.name}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">${cls.description}</p>
        <p class="text-sm"><strong>${cls.trainer}</strong> • ${cls.days.join(", ")} • ${cls.time} • ${cls.duration} min • ${cls.category}</p>
        <div><div class="flex justify-between text-xs"><span>Spots: ${spotsLeft} / ${cls.maxSpots} left</span><span>${filled}% full</span></div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1"><div class="h-2 rounded-full ${filled > 80 ? "bg-red-500" : filled > 50 ? "bg-amber-400" : "bg-green-500"}" style="width:${filled}%"></div></div></div>
        <button class="bookClassBtn ${isFull ? "bg-gray-400 cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold" : "btn-primary"} mt-auto" data-id="${cls.id}" ${isFull ? "disabled" : ""}>${isFull ? "Full - Join Waitlist" : "Book Spot"}</button>
      </div>
    </div>`;
  }).join("");

  // Table view
  const tbody = document.querySelector("#classesTableBody");
  if (tbody) {
    tbody.innerHTML = classesToShow.map(cls => {
      const spotsLeft = getClassSpotsLeft(cls);
      return `<tr class="border-b dark:border-gray-700"><td class="p-3 font-bold">${cls.name}</td><td class="p-3">${cls.trainer}</td><td class="p-3">${cls.days.join(", ")}</td><td class="p-3">${cls.time}</td><td class="p-3">${spotsLeft} / ${cls.maxSpots}</td><td class="p-3"><button class="bookClassBtn btn-primary text-sm px-3 py-1.5" data-id="${cls.id}" ${spotsLeft <= 0 ? "disabled" : ""}>Book</button></td></tr>`;
    }).join("");
  }
}

export function renderTrainers(trainersToShow) {
  const grid = document.querySelector("#trainersGrid");
  if (!grid) return;
  grid.innerHTML = trainersToShow.map(t => `
    <div class="card group">
      <img src="${t.image}" alt="${t.name}" loading="lazy" class="w-full h-56 object-cover group-hover:scale-105 transition duration-300">
      <div class="p-5 flex flex-col gap-2 flex-1">
        <h3 class="text-xl font-bold">${t.name}</h3>
        <p class="text-sm font-medium text-red-600">${t.specialty} • ${t.experience} yrs</p>
        <p class="text-sm text-gray-600 dark:text-gray-300">${t.bio}</p>
        <p class="text-amber-400">${"⭐".repeat(Math.round(t.rating))} ${t.rating} / 5</p>
        <button class="bookPTBtn btn-gold mt-auto" data-id="${t.id}" data-name="${t.name}">Book PT with ${t.name}</button>
      </div>
    </div>`).join("");
}

export function renderPTPacks(packs) {
  const grid = document.querySelector("#ptGrid");
  if (!grid) return;
  grid.innerHTML = packs.map(p => `
    <div class="bg-white text-gray-900 p-6 rounded-xl flex flex-col gap-2">
      <h3 class="text-xl font-bold">${p.name}</h3>
      <p class="text-sm text-gray-600">${p.description}</p>
      <p><span class="text-3xl font-extrabold">${formatMoney(p.price)}</span> <span class="text-sm">/ ${p.sessions} session${p.sessions > 1 ? "s" : ""}</span></p>
      ${p.saving > 0 ? `<p class="text-green-700 font-bold text-sm">Save ${formatMoney(p.saving)} vs single</p>` : `<p class="text-sm text-gray-500">Pay as you go</p>`}
      <button class="choosePTBtn btn-primary mt-auto" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Choose ${p.name}</button>
    </div>`).join("");
}

export function renderTestimonials(testimonials) {
  const grid = document.querySelector("#testimonialGrid");
  if (!grid) return;
  grid.innerHTML = testimonials.map(t => `
    <div class="card p-5 gap-2">
      <p class="text-amber-400">${"⭐".repeat(t.rating)}</p>
      <p class="italic text-sm">"${t.text}"</p>
      <p><strong>${t.name}</strong> - <span class="text-red-600 text-sm">${t.goal}</span></p>
      <p class="text-xs text-gray-500">Plan: ${t.plan}</p>
    </div>`).join("");
}
