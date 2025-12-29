import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreditCards from "./pages/CreditCards";
import AccountsFixed from "./pages/AccountsFixed";
import AccountsVariable from "./pages/AccountsVariable";
import Categories from "./pages/Categories";
import AccountsCredit from "./pages/AccountsCredit";
import MoneyEntries from "./pages/MoneyEntries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-cards"
              element={
                <ProtectedRoute>
                  <CreditCards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-fixed"
              element={
                <ProtectedRoute>
                  <AccountsFixed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-variable"
              element={
                <ProtectedRoute>
                  <AccountsVariable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-credit"
              element={
                <ProtectedRoute>
                  <AccountsCredit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/money-entries"
              element={
                <ProtectedRoute>
                  <MoneyEntries />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
