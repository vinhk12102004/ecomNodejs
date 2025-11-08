import { logout } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function useLogout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().catch(() => {}); // gọi API, bỏ qua lỗi nếu server không phản hồi
    } finally {
      // Xóa token + user khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Điều hướng về trang chủ
      navigate("/login");
    }
  };

  return handleLogout;
}
