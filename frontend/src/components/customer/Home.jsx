import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import CustomerLayout from "./Layout";
import { productAPI, categoryAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Thêm log để kiểm tra
        console.log("Đang gọi API...");

        // Get featured products (newest products)
        console.log("Gọi API products...");
        const productsRes = await productAPI.getAllProducts({ limit: 8 });
        console.log("Products response:", productsRes);

        // Get categories
        console.log("Gọi API categories...");
        const categoriesRes = await categoryAPI.getAllCategories();
        console.log("Categories response:", categoriesRes);

        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          "Không thể tải dữ liệu. Vui lòng thử lại. Chi tiết lỗi: " +
            error.message
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CustomerLayout>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Hero Carousel */}
      <Carousel className="mb-4">
        <Carousel.Item>
          <div
            className="d-block w-100 bg-dark text-white"
            style={{ height: "400px" }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <h1>Chào mừng đến với Kho Linh Kiện Máy Tính</h1>
              <p className="lead">Địa chỉ mua sắm linh kiện máy tính uy tín</p>
              <Link to="/products">
                <Button variant="primary" size="lg">
                  Mua Ngay
                </Button>
              </Link>
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div
            className="d-block w-100 bg-primary text-white"
            style={{ height: "400px" }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <h1>Card Đồ Họa Mới Nhất</h1>
              <p className="lead">
                Nâng cấp trải nghiệm gaming của bạn ngay hôm nay
              </p>
              <Link to="/products?category=5">
                <Button variant="light" size="lg">
                  Xem Card Đồ Họa
                </Button>
              </Link>
            </div>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div
            className="d-block w-100 bg-success text-white"
            style={{ height: "400px" }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <h1>Giải Pháp Lưu Trữ SSD</h1>
              <p className="lead">
                Tăng hiệu suất hệ thống với ổ cứng SSD của chúng tôi
              </p>
              <Link to="/products?category=4">
                <Button variant="light" size="lg">
                  Mua Ổ Cứng
                </Button>
              </Link>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>

      <Container>
        {/* Categories Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Mua sắm theo Danh mục</h2>
            <Link to="/products" className="text-decoration-none">
              Xem tất cả <FaArrowRight className="ms-1" />
            </Link>
          </div>

          <Row>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              categories.slice(0, 4).map((category) => (
                <Col md={3} sm={6} className="mb-4" key={category.id}>
                  <Card className="h-100 shadow-sm">
                    <div className="bg-light p-4 text-center">
                      <h1 className="display-4 text-primary">
                        {category.id === 1
                          ? "🔧"
                          : category.id === 2
                          ? "🖥️"
                          : category.id === 3
                          ? "💾"
                          : category.id === 4
                          ? "💿"
                          : "🎮"}
                      </h1>
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title>{category.name}</Card.Title>
                      <Link to={`/products?category=${category.id}`}>
                        <Button variant="outline-primary" className="mt-2">
                          Xem Sản Phẩm
                        </Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </section>

        {/* Featured Products Section */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Sản Phẩm Nổi Bật</h2>
            <Link to="/products" className="text-decoration-none">
              Xem tất cả <FaArrowRight className="ms-1" />
            </Link>
          </div>

          <Row>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Col lg={3} md={4} sm={6} className="mb-4" key={product.id}>
                  <Card className="h-100 shadow-sm product-card">
                    <div className="product-img-container bg-light p-3 text-center">
                      {product.image ? (
                        <Card.Img
                          variant="top"
                          src={`http://localhost:5000/${product.image}`}
                          alt={product.name}
                          className="product-img"
                        />
                      ) : (
                        <div className="placeholder-img d-flex align-items-center justify-content-center">
                          <span className="text-muted">Không có ảnh</span>
                        </div>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="product-title">
                        {product.name}
                      </Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {product.category?.name}
                      </Card.Text>
                      <Card.Text className="product-price fw-bold mb-3">
                        {formatCurrency(product.price)}
                      </Card.Text>
                      <div className="mt-auto d-flex">
                        <Link to={`/products/${product.id}`} className="w-100">
                          <Button variant="primary" className="w-100">
                            Xem Chi Tiết
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </section>

        {/* Features Section */}
        <section className="mb-5">
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div
                    className="feature-icon mb-3 bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-truck fs-4"></i>
                  </div>
                  <h4>Giao Hàng Nhanh</h4>
                  <p className="text-muted">
                    Miễn phí giao hàng cho đơn hàng trên 2 triệu đồng
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div
                    className="feature-icon mb-3 bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-shield-check fs-4"></i>
                  </div>
                  <h4>Bảo Hành</h4>
                  <p className="text-muted">
                    Tất cả sản phẩm đều có bảo hành từ nhà sản xuất
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div
                    className="feature-icon mb-3 bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-headset fs-4"></i>
                  </div>
                  <h4>Hỗ Trợ 24/7</h4>
                  <p className="text-muted">
                    Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      </Container>
    </CustomerLayout>
  );
};

export default Home;
