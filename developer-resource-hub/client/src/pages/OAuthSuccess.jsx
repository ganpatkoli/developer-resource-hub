import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setUserInfo, setUserToken, setAdminToken } from "../api/client";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const token = qp.get("token");
    const email = qp.get("email");
    const id = qp.get("id");
    const role = qp.get("role") || "user";
    if (token) {
      if (role === "admin") {
        setAdminToken(token);
        setUserInfo({ email, id, role });
        navigate("/admin/settings", { replace: true });
      } else {
        setUserToken(token);
        setUserInfo({ email, id, role });
        navigate("/", { replace: true });
      }
      return;
    }
    navigate("/user/login", { replace: true });
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center text-sm text-ink-muted">
      Completing OAuth login...
    </div>
  );
}
