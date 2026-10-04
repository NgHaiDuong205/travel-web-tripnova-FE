import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { useI18n } from "./i18n/I18nContext";

function App() {
  // Đọc ngôn ngữ ở đây để khi đổi ngôn ngữ cả cây render lại (kể cả component chỉ dùng formatMoney/formatDate).
  useI18n();
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
