import { NavLink } from "react-router-dom";

function Header() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "#fff",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h3 style={{ color: "black", margin: 0 }}>Magayon Diagnostic Center</h3>

      <div>
        <NavLink to="/dashboard" style={{ marginRight: "15px" }}>
          Home
        </NavLink>
        <NavLink to="/register" style={{ marginRight: "15px" }}>
          Register
        </NavLink>
        <NavLink to="/login" onClick={() => localStorage.removeItem("token")}>
          Logout
        </NavLink>
      </div>
    </div>
  );
}

export default Header;
