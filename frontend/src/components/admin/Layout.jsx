import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import {
  FaBox,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaWarehouse,
  FaClipboardCheck,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import AuthContext from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin">
            Kho Linh Kiện Máy Tính
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar" />
          <Navbar.Collapse id="admin-navbar">
            <Nav className="ms-auto">
              <NavDropdown
                title={
                  <span>
                    <FaUser className="me-1" />
                    {user?.fullName || "Admin"}
                  </span>
                }
                id="admin-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Hồ sơ
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div
          className="bg-light sidebar"
          style={{ width: "250px", minHeight: "calc(100vh - 56px)" }}
        >
          <Nav className="flex-column p-3">
            <Nav.Link
              as={Link}
              to="/admin"
              className={location.pathname === "/admin" ? "active" : ""}
            >
              <FaChartBar className="me-2" />
              Tổng quan
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/products"
              className={
                location.pathname === "/admin/products" ? "active" : ""
              }
            >
              <FaBox className="me-2" />
              Sản phẩm
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/categories"
              className={
                location.pathname === "/admin/categories" ? "active" : ""
              }
            >
              <FaBox className="me-2" />
              Danh mục
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/inventory"
              className={
                location.pathname === "/admin/inventory" ? "active" : ""
              }
            >
              <FaWarehouse className="me-2" />
              Kho hàng
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/inventory-check"
              className={
                location.pathname === "/admin/inventory-check" ? "active" : ""
              }
            >
              <FaClipboardCheck className="me-2" />
              Kiểm kê kho
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/orders"
              className={location.pathname === "/admin/orders" ? "active" : ""}
            >
              <FaClipboardList className="me-2" />
              Đơn hàng
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/users"
              className={location.pathname === "/admin/users" ? "active" : ""}
            >
              <FaUsers className="me-2" />
              Người dùng
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/admin/reports"
              className={location.pathname === "/admin/reports" ? "active" : ""}
            >
              <FaChartBar className="me-2" />
              Báo cáo
            </Nav.Link>
          </Nav>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 bg-light">{children}</div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-2 text-center">
        <Container>
          <small>
            &copy; {new Date().getFullYear()} Kho Linh Kiện Máy Tính. Tất cả
            quyền được bảo lưu.
          </small>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout;
