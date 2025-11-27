const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export async function signup(payload) {
  await delay(700);
  return {
    id: Date.now(),
    name: `${payload.first || ""} ${payload.last || ""}`.trim(),
    email: payload.email,
  };
}

export async function login({ email, password }) {
  await delay(600);
  if (!email || !password) {
    const err = new Error("Invalid credentials");
    err.code = 401;
    throw err;
  }

  return {
    token: `fake-token-${Date.now()}`,
    user: { email, name: "Customer" },
  };
}

export async function createAppointment({ service, date }) {
  await delay(700);
  const appt = {
    id: Date.now(),
    service,
    date: date || new Date().toISOString(),
    time: null,
    confirmation: `CONF-${Math.floor(Math.random() * 90000) + 10000}`,
  };
  return appt;
}

export async function getAvailableTimes({ service, date }) {
  // simple deterministic mock: return a set of times depending on the day
  await delay(350);
  // parse date (ISO or YYYY-MM-DD)
  const d = new Date(date || Date.now());
  const day = d.getDate();

  const baseSlots = [
    "08:00 am",
    "09:00 am",
    "09:30 am",
    "10:00 am",
    "10:30 am",
    "12:00 pm",
    "01:00 pm",
    "01:30 pm",
    "03:00 pm",
    "03:30 pm",
    "04:00 pm",
    "05:00 pm",
  ];

  // simulate some slots taken depending on the day number
  const available = baseSlots.filter((s, i) => (day + i) % 3 !== 0);
  return available;
}

export default { signup, login, createAppointment, getAvailableTimes };
