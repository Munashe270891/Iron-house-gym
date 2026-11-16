export const plans = [
  { id: 1, name: "Day Pass", price: 5, period: "day", description: "Try us for a day. Full gym access.", features: ["1 Day Access", "All Equipment", "Locker Room"], popular: false },
  { id: 2, name: "Starter", price: 30, period: "month", description: "Perfect for beginners. Daytime access.", features: ["Gym Floor 6am-6pm", "1 Group Class / Week", "Locker Room"], popular: false },
  { id: 3, name: "Pro", price: 50, period: "month", description: "Most popular. Full access + classes + sauna.", features: ["24/7 Access", "Unlimited Classes", "Sauna", "1 PT Session / Month"], popular: true },
  { id: 4, name: "Elite", price: 80, period: "month", description: "VIP. Everything + nutrition + guest.", features: ["24/7 + VIP Area", "Unlimited Classes", "Sauna", "4 PT Sessions", "Nutrition Plan", "Guest Pass"], popular: false }
];

export const trainers = [
  { id: 1, name: "Coach Moyo", specialty: "Boxing + CrossFit", experience: 10, rating: 4.9, image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600", bio: "10 years turning beginners into fighters." },
  { id: 2, name: "Rudo", specialty: "Yoga + Mobility", experience: 6, rating: 4.8, image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600", bio: "Flexibility, balance, and calm strength." },
  { id: 3, name: "Tino", specialty: "Strength + HIIT", experience: 5, rating: 4.7, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600", bio: "Strength for real life. No fluff." },
  { id: 4, name: "Chipo", specialty: "Spin + Cardio", experience: 4, rating: 4.8, image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600", bio: "High-energy spin that burns 600+ cal." },
  { id: 5, name: "Nyasha", specialty: "Zumba + Dance", experience: 7, rating: 5.0, image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600", bio: "Dance your way to fitness. Fun first." }
];

export const classes = [
  { id: 1, name: "Morning Yoga", trainer: "Rudo", days: ["Mon","Wed","Fri"], time: "06:00", duration: 45, maxSpots: 20, intensity: "Low", category: "Mind & Body", beginnerFriendly: true, description: "Gentle yoga to start your day.", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600" },
  { id: 2, name: "HIIT Blast", trainer: "Tino", days: ["Mon","Wed","Fri"], time: "07:00", duration: 30, maxSpots: 15, intensity: "High", category: "Cardio", beginnerFriendly: false, description: "30 min fat-burning interval training.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600" },
  { id: 3, name: "Spin / Cycling", trainer: "Chipo", days: ["Tue","Thu"], time: "06:30", duration: 45, maxSpots: 12, intensity: "High", category: "Cardio", beginnerFriendly: false, description: "Indoor cycling, high energy music.", image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600" },
  { id: 4, name: "Zumba", trainer: "Nyasha", days: ["Tue","Thu","Sat"], time: "17:30", duration: 60, maxSpots: 25, intensity: "Medium", category: "Dance", beginnerFriendly: true, description: "Dance fitness party. No experience needed.", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600" },
  { id: 5, name: "Boxing Fundamentals", trainer: "Coach Moyo", days: ["Mon","Thu"], time: "18:00", duration: 60, maxSpots: 16, intensity: "High", category: "Strength", beginnerFriendly: false, description: "Learn punches, footwork, defence.", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600" },
  { id: 6, name: "Strength 101 (Beginners)", trainer: "Tino", days: ["Sat"], time: "09:00", duration: 60, maxSpots: 20, intensity: "Low", category: "Strength", beginnerFriendly: true, description: "Perfect first class. Learn squat, deadlift, bench safely.", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600" },
  { id: 7, name: "Ladies Only - Toning", trainer: "Rudo", days: ["Sat"], time: "10:30", duration: 45, maxSpots: 18, intensity: "Medium", category: "Strength", beginnerFriendly: true, description: "Safe space, toning + core, ladies only.", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600" },
  { id: 8, name: "CrossFit WOD", trainer: "Coach Moyo", days: ["Sun"], time: "08:00", duration: 60, maxSpots: 14, intensity: "High", category: "Strength", beginnerFriendly: false, description: "Workout of the Day. Hard, fun, team.", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600" }
];

export const ptPacks = [
  { id: 1, name: "Single Session", sessions: 1, price: 15, saving: 0, description: "Try PT once." },
  { id: 2, name: "4 Sessions Pack", sessions: 4, price: 50, saving: 10, description: "Most popular for beginners." },
  { id: 3, name: "8 Sessions Pack", sessions: 8, price: 90, saving: 30, description: "Best value. Full program." }
];

export const testimonials = [
  { name: "Tawanda M.", goal: "Lost 10kg in 3 months", text: "I was shy at first. Strength 101 changed everything. Trainers are patient.", rating: 5, plan: "Pro" },
  { name: "Chipo K.", goal: "Gained muscle", text: "Elite plan + Tino's PT = I finally see muscle. Worth every dollar.", rating: 5, plan: "Elite" },
  { name: "Nyasha D.", goal: "Zumba lover", text: "Zumba with Nyasha is the best part of my week. I lost 5kg dancing!", rating: 5, plan: "Starter" },
  { name: "Mr. Moyo", goal: "Stay fit at 55", text: "24/7 access means I train at 5am before work. Clean gym, good people.", rating: 4, plan: "Pro" }
];

export const fallbackQuotes = [
  "No pain, no gain.",
  "Stronger every day.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Don't wish for it, work for it."
];
