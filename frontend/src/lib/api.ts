import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nome: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    nome: string;
  };
}

export interface User {
  id: number;
  email: string;
  nome: string;
}

// Tipos para as entidades
export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: number;
  name: string;
  vencibleAt: string;
  totalLimite: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountFixed {
  id: number;
  name: string;
  vencibleAt: string;
  price: number;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface AccountVariable {
  id: number;
  name: string;
  vencibleAt: string;
  price: number;
  quantity: number;
  qtPayed: number;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface AccountCredit {
  id: number;
  cardId: number;
  name: string;
  totalPrice: number;
  installmentsPrice: number;
  installments: number;
  installmentsPayed: number;
  categoryId: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  card?: CreditCard;
}

export interface MoneyEntry {
  id: number;
  name: string;
  entryDate: string;
  amount: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para Month Movimentation
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'ADVANCED';
export type AccountType = 'FIXED' | 'VARIABLE' | 'CREDIT';

export interface MonthMovimentationItem {
  id: number;
  monthMovimentationId: number;
  accountType: AccountType;
  accountId: number;
  accountName: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  categoryName: string;
  accountFixedId: number | null;
  accountVariableId: number | null;
  accountCreditId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthMovimentation {
  id: number;
  userId: number;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  items: MonthMovimentationItem[];
}

// Tipos para Reports
export interface FinancialSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  balance: number;
  availableMoney: number;
}

export interface CreditCardsSummary {
  id: number;
  name: string;
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  usagePercentage: number;
  activeAccounts: number;
}

export interface ExpensesByCategory {
  category: string;
  total: number;
  count: number;
}

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticação
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// API de usuários
export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};

// API de categorias
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (data: { name: string }): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: { name: string }): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// API de cartões de crédito
export const creditCardsApi = {
  getAll: async (): Promise<CreditCard[]> => {
    const response = await api.get<CreditCard[]>('/credit-cards');
    return response.data;
  },
  getById: async (id: number): Promise<CreditCard> => {
    const response = await api.get<CreditCard>(`/credit-cards/${id}`);
    return response.data;
  },
  getAvailableLimit: async (id: number): Promise<{ availableLimit: number }> => {
    const response = await api.get<{ availableLimit: number }>(`/credit-cards/${id}/available-limit`);
    return response.data;
  },
  create: async (data: { name: string; vencibleAt: string; totalLimite: number }): Promise<CreditCard> => {
    const response = await api.post<CreditCard>('/credit-cards', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; vencibleAt: string; totalLimite: number }>): Promise<CreditCard> => {
    const response = await api.patch<CreditCard>(`/credit-cards/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/credit-cards/${id}`);
  },
};

// API de contas fixas
export const accountsFixedApi = {
  getAll: async (): Promise<AccountFixed[]> => {
    const response = await api.get<AccountFixed[]>('/accounts-fixed');
    return response.data;
  },
  getById: async (id: number): Promise<AccountFixed> => {
    const response = await api.get<AccountFixed>(`/accounts-fixed/${id}`);
    return response.data;
  },
  create: async (data: { name: string; vencibleAt: string; price: number; categoryId: number }): Promise<AccountFixed> => {
    const response = await api.post<AccountFixed>('/accounts-fixed', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; vencibleAt: string; price: number; categoryId: number }>): Promise<AccountFixed> => {
    const response = await api.patch<AccountFixed>(`/accounts-fixed/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts-fixed/${id}`);
  },
};

// API de contas variáveis
export const accountsVariableApi = {
  getAll: async (): Promise<AccountVariable[]> => {
    const response = await api.get<AccountVariable[]>('/accounts-variable');
    return response.data;
  },
  getById: async (id: number): Promise<AccountVariable> => {
    const response = await api.get<AccountVariable>(`/accounts-variable/${id}`);
    return response.data;
  },
  create: async (data: { name: string; vencibleAt: string; price: number; quantity: number; categoryId: number }): Promise<AccountVariable> => {
    const response = await api.post<AccountVariable>('/accounts-variable', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; vencibleAt: string; price: number; quantity: number; categoryId: number }>): Promise<AccountVariable> => {
    const response = await api.patch<AccountVariable>(`/accounts-variable/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts-variable/${id}`);
  },
  payInstallment: async (id: number): Promise<AccountVariable> => {
    const response = await api.post<AccountVariable>(`/accounts-variable/${id}/pay`);
    return response.data;
  },
};

// API de contas de crédito
export const accountsCreditApi = {
  getAll: async (cardId?: number): Promise<AccountCredit[]> => {
    const params = cardId ? { cardId: cardId.toString() } : {};
    const response = await api.get<AccountCredit[]>('/accounts-credit', { params });
    return response.data;
  },
  getById: async (id: number): Promise<AccountCredit> => {
    const response = await api.get<AccountCredit>(`/accounts-credit/${id}`);
    return response.data;
  },
  create: async (data: { cardId: number; name: string; totalPrice: number; installmentsPrice: number; installments: number; categoryId: number; purchaseDate?: string }): Promise<AccountCredit> => {
    const response = await api.post<AccountCredit>('/accounts-credit', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; totalPrice: number; installmentsPrice: number; installments: number; categoryId: number }>): Promise<AccountCredit> => {
    const response = await api.patch<AccountCredit>(`/accounts-credit/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/accounts-credit/${id}`);
  },
  payInstallment: async (id: number): Promise<AccountCredit> => {
    const response = await api.post<AccountCredit>(`/accounts-credit/${id}/pay`);
    return response.data;
  },
};

// API de entradas de dinheiro
export const moneyEntriesApi = {
  getAll: async (): Promise<MoneyEntry[]> => {
    const response = await api.get<MoneyEntry[]>('/money-entries');
    return response.data;
  },
  getById: async (id: number): Promise<MoneyEntry> => {
    const response = await api.get<MoneyEntry>(`/money-entries/${id}`);
    return response.data;
  },
  findByMonth: async (month: number, year: number): Promise<MoneyEntry[]> => {
    const response = await api.get<MoneyEntry[]>('/money-entries/by-month', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  getTotalByMonth: async (month: number, year: number): Promise<{ total: number }> => {
    const response = await api.get<{ total: number }>('/money-entries/total-by-month', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  create: async (data: { name: string; entryDate: string; amount: number }): Promise<MoneyEntry> => {
    const response = await api.post<MoneyEntry>('/money-entries', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; entryDate: string; amount: number }>): Promise<MoneyEntry> => {
    const response = await api.patch<MoneyEntry>(`/money-entries/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/money-entries/${id}`);
  },
};

// API de movimentação mensal
export const monthMovimentationApi = {
  generate: async (month: number, year: number): Promise<MonthMovimentation> => {
    const response = await api.post<MonthMovimentation>('/month-movimentation/generate', null, {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  update: async (month: number, year: number): Promise<MonthMovimentation> => {
    const response = await api.post<MonthMovimentation>('/month-movimentation/update', null, {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  findAll: async (): Promise<MonthMovimentation[]> => {
    const response = await api.get<MonthMovimentation[]>('/month-movimentation');
    return response.data;
  },
  findByMonth: async (month: number, year: number): Promise<MonthMovimentation | null> => {
    const response = await api.get<MonthMovimentation>('/month-movimentation/by-month', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  getByCategory: async (month: number, year: number): Promise<ExpensesByCategory[]> => {
    const response = await api.get<ExpensesByCategory[]>('/month-movimentation/by-category', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  payItem: async (itemId: number): Promise<MonthMovimentation> => {
    const response = await api.post<MonthMovimentation>(`/month-movimentation/items/${itemId}/pay`);
    return response.data;
  },
  unpayItem: async (itemId: number): Promise<MonthMovimentation> => {
    const response = await api.post<MonthMovimentation>(`/month-movimentation/items/${itemId}/unpay`);
    return response.data;
  },
};

// API de relatórios
export const reportsApi = {
  getDashboard: async (): Promise<any> => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
  getFinancialSummary: async (month: number, year: number): Promise<FinancialSummary> => {
    const response = await api.get<FinancialSummary>('/reports/financial-summary', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  getCreditCardsSummary: async (): Promise<CreditCardsSummary[]> => {
    const response = await api.get<CreditCardsSummary[]>('/reports/credit-cards-summary');
    return response.data;
  },
  getExpensesByCategory: async (month: number, year: number): Promise<ExpensesByCategory[]> => {
    const response = await api.get<ExpensesByCategory[]>('/reports/expenses-by-category', {
      params: { month: month.toString(), year: year.toString() },
    });
    return response.data;
  },
  getUpcomingBills: async (days?: number): Promise<any[]> => {
    const response = await api.get('/reports/upcoming-bills', {
      params: days ? { days: days.toString() } : {},
    });
    return response.data;
  },
  getOverdueBills: async (): Promise<any[]> => {
    const response = await api.get('/reports/overdue-bills');
    return response.data;
  },
  getYearlyComparison: async (year?: number): Promise<any> => {
    const response = await api.get('/reports/yearly-comparison', {
      params: year ? { year: year.toString() } : {},
    });
    return response.data;
  },
};

export default api;

