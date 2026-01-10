import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import {
  FaBox,
  FaClipboardList,
  FaWarehouse,
  FaClipboardCheck,
  FaSignOutAlt,
  FaUser,
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaBell,
  FaTasks,
} from "react-icons/fa";
import AuthContext from "../../context/AuthContext";

const StaffLayout = ({ children }) => {
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
          <Navbar.Brand as={Link} to="/staff">
            Kho Linh Kiện Máy Tính
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="staff-navbar" />
          <Navbar.Collapse id="staff-navbar">
            <Nav className="ms-auto">
              <NavDropdown
                title={
                  <span>
                    <FaUser className="me-1" />
                    {user?.fullName || "Nhân viên"}
                  </span>
                }
                id="staff-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Hồ sơ cá nhân
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
              to="/staff"
              className={location.pathname === "/staff" ? "active" : ""}
            >
              <FaUser className="me-2" />
              Tổng quan
            </Nav.Link>

            {/* <Nav.Link
              as={Link}
              to="/staff/products"
              className={
                location.pathname === "/staff/products" ? "active" : ""
              }
            >
              <FaBox className="me-2" />
              Danh sách sản phẩm
            </Nav.Link> */}

            <hr className="my-2" />
            <div className="sidebar-heading px-3 py-1 text-muted small text-uppercase">
              Quản lý kho
            </div>

            <Nav.Link
              as={Link}
              to="/staff/inventory"
              className={
                location.pathname === "/staff/inventory" ? "active" : ""
              }
            >
              <FaWarehouse className="me-2" />
              Tồn kho
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/staff/inventory-in"
              className={
                location.pathname === "/staff/inventory-in" ? "active" : ""
              }
            >
              <FaArrowDown className="me-2" />
              Nhập kho
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/staff/inventory-out"
              className={
                location.pathname === "/staff/inventory-out" ? "active" : ""
              }
            >
              <FaArrowUp className="me-2" />
              Xuất kho
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/staff/inventory-check"
              className={
                location.pathname === "/staff/inventory-check" ? "active" : ""
              }
            >
              <FaClipboardCheck className="me-2" />
              Kiểm kê kho
            </Nav.Link>

            <hr className="my-2" />
            <div className="sidebar-heading px-3 py-1 text-muted small text-uppercase">
              Đơn hàng & Công việc
            </div>

            <Nav.Link
              as={Link}
              to="/staff/orders"
              className={location.pathname === "/staff/orders" ? "active" : ""}
            >
              <FaClipboardList className="me-2" />
              Xử lý đơn hàng
            </Nav.Link>

            {/* <Nav.Link
              as={Link}
              to="/staff/tasks"
              className={location.pathname === "/staff/tasks" ? "active" : ""}
            >
              <FaTasks className="me-2" />
              Công việc
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/staff/schedule"
              className={
                location.pathname === "/staff/schedule" ? "active" : ""
              }
            >
              <FaCalendarAlt className="me-2" />
              Lịch làm việc
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/staff/notifications"
              className={
                location.pathname === "/staff/notifications" ? "active" : ""
              }
            >
              <FaBell className="me-2" />
              Thông báo
            </Nav.Link> */}
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

export default StaffLayout;
