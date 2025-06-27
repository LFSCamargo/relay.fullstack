import { BrowserRouter, Route, Routes } from "react-router";
import {
  DashboardScreen,
  LoginScreen,
  SignupScreen,
  NotFoundScreen,
  RecoverPasswordScreen,
  ValidateAndResetScreen,
} from "../modules";
import { useAuthStore } from "@/modules/auth/stores";

export function AppRouter() {
  const { token } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <DashboardScreen /> : <LoginScreen />}
        />
        <Route path="/auth/login" element={<LoginScreen />} />
        <Route
          path="/auth/recover-password"
          element={<RecoverPasswordScreen />}
        />
        <Route
          path="/auth/validate-and-reset"
          element={<ValidateAndResetScreen />}
        />
        <Route path="/auth/signup" element={<SignupScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
