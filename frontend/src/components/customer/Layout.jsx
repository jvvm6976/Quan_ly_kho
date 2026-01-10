import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import AuthContext from "../../context/AuthContext";
import CartContext from "../../context/CartContext";

const CustomerLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems, getCartTotals } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get total items in cart
  const { itemCount } = getCartTotals();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-3 mb-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Kho Linh Kiện Máy Tính
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="customer-navbar" />
          <Navbar.Collapse id="customer-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Trang Chủ
              </Nav.Link>
              <Nav.Link as={Link} to="/products">
                Sản Phẩm
              </Nav.Link>
              <NavDropdown title="Danh Mục" id="categories-dropdown">
                <NavDropdown.Item as={Link} to="/products?category=1">
                  CPU
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products?category=2">
                  Bo Mạch Chủ
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products?category=3">
                  Bộ Nhớ RAM
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products?category=4">
                  Ổ Cứng
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/products?category=5">
                  Card Đồ Họa
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/products">
                  Tất Cả Sản Phẩm
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Form className="d-flex mx-auto" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-light" type="submit">
                <FaSearch />
              </Button>
            </Form>

            <Nav>
              <Nav.Link as={Link} to="/cart" className="me-2">
                <FaShoppingCart className="me-1" />
                Giỏ Hàng
                {itemCount > 0 && (
                  <Badge bg="danger" pill className="ms-1">
                    {itemCount}
                  </Badge>
                )}
              </Nav.Link>

              {user ? (
                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user.fullName}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Hồ Sơ Của Tôi
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-orders">
                    Đơn Hàng Của Tôi
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Đăng Xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login">
                  Đăng Nhập / Đăng Ký
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div className="flex-grow-1">{children}</div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>Kho Linh Kiện Máy Tính</h5>
              <p className="text-muted">
                Địa chỉ mua sắm linh kiện và phụ kiện máy tính uy tín.
              </p>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>Liên Kết Nhanh</h5>
              <ul className="list-unstyled">
                <li>
                  <Link to="/" className="text-decoration-none text-muted">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-decoration-none text-muted"
                  >
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-decoration-none text-muted">
                    Giỏ Hàng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-orders"
                    className="text-decoration-none text-muted"
                  >
                    Đơn Hàng Của Tôi
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Liên Hệ</h5>
              <address className="text-muted">
                <p>123 Đường Công Nghệ, Thành Phố Số</p>
                <p>Email: info@linhkienmaytinh.com</p>
                <p>Điện thoại: (028) 3456-7890</p>
              </address>
            </div>
          </div>
          <hr className="my-3 bg-secondary" />
          <div className="text-center text-muted">
            <small>
              &copy; {new Date().getFullYear()} Kho Linh Kiện Máy Tính. Tất cả
              quyền được bảo lưu.
            </small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default CustomerLayout;
