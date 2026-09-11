import type { Customer, AdminUser, AuthState } from "@/types";

const CUSTOMER_KEY = "ha_customer";
const ADMIN_KEY = "ha_admin";
const CUSTOMERS_DB_KEY = "ha_customers_db";

export function getAuthState(): AuthState {
  try {
    const adminRaw = localStorage.getItem(ADMIN_KEY);
    if (adminRaw) {
      const admin = JSON.parse(adminRaw) as AdminUser;
      return { type: "admin", user: admin };
    }
    const customerRaw = localStorage.getItem(CUSTOMER_KEY);
    if (customerRaw) {
      const customer = JSON.parse(customerRaw) as Customer;
      return { type: "customer", user: customer };
    }
  } catch {
    // ignore
  }
  return { type: "none" };
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_KEY);
}

export function getCustomersDB(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_DB_KEY);
    if (raw) return JSON.parse(raw) as Customer[];
  } catch {
    // ignore
  }
  return [];
}

function saveCustomersDB(customers: Customer[]): void {
  localStorage.setItem(CUSTOMERS_DB_KEY, JSON.stringify(customers));
}

export function registerCustomer(
  name: string,
  email: string,
  password: string,
  phone?: string
): { success: boolean; error?: string } {
  const customers = getCustomersDB();
  const exists = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }
  if (password.length < 6) {
    return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
  }
  // Simple hash simulation (in production use bcrypt via backend)
  const hashedPassword = btoa(password + "_ha_salt");
  const newCustomer: Customer & { password: string } = {
    id: `cust-${Date.now()}`,
    name,
    email,
    phone,
    createdAt: new Date().toISOString(),
    password: hashedPassword,
  };
  customers.push(newCustomer as Customer);
  saveCustomersDB(customers);
  // Auto login
  const { password: _pw, ...customerWithoutPw } = newCustomer;
  void _pw;
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customerWithoutPw));
  return { success: true };
}

export function loginCustomer(
  email: string,
  password: string
): { success: boolean; error?: string } {
  const customers = getCustomersDB() as (Customer & { password?: string })[];
  const customer = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    return { success: false, error: "E-mail não encontrado." };
  }
  const hashedPassword = btoa(password + "_ha_salt");
  if (customer.password !== hashedPassword) {
    return { success: false, error: "Senha incorreta." };
  }
  const { password: _pw, ...customerWithoutPw } = customer;
  void _pw;
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customerWithoutPw));
  return { success: true };
}

export function logoutCustomer(): void {
  localStorage.removeItem(CUSTOMER_KEY);
}

export function logout(): void {
  logoutAdmin();
  logoutCustomer();
}
