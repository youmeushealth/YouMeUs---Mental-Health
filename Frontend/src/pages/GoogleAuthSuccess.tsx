import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);
    setToken(token);

    axios
      .get(`${BACKEND_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        navigate(res.data.role === "admin" ? "/admin" : "/blogs");
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate, setUser, setToken]);

  return (
    <div className="flex items-center justify-center h-screen text-lg font-semibold">
      Signing you in with Google...
    </div>
  );
}
