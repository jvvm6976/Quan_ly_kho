import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Breadcrumb,
  Badge,
  Tabs,
  Tab,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";
import CustomerLayout from "./Layout";
import { productAPI } from "../../services/api";
import CartContext from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get cart context
  const { addToCart } = useContext(CartContext);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Get product details
        const productRes = await productAPI.getProductById(id);
        setProduct(productRes.data);

        // Get related products (same category)
        if (productRes.data.categoryId) {
          const relatedRes = await productAPI.getAllProducts({
            category: productRes.data.categoryId,
            limit: 4,
          });

          // Filter out current product
          const filtered = relatedRes.data.products.filter(
            (item) => item.id !== parseInt(id)
          );

          setRelatedProducts(filtered);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      // Add product to cart with selected quantity
      addToCart(product, quantity);

      // Show toast notification
      setShowToast(true);

      // Optionally, reset quantity to 1 after adding to cart
      setQuantity(1);
    }
  };

  return (
    <CustomerLayout>
      <Container className="py-4">
        {/* Toast notification */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ zIndex: 1 }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Giỏ hàng</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              Đã thêm {quantity} sản phẩm vào giỏ hàng!
            </Toast.Body>
          </Toast>
        </ToastContainer>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : product ? (
          <>
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                Trang chủ
              </Breadcrumb.Item>
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
                Sản phẩm
              </Breadcrumb.Item>
              <Breadcrumb.Item
                linkAs={Link}
                linkProps={{ to: `/products?category=${product.categoryId}` }}
              >
                {product.category?.name}
              </Breadcrumb.Item>
              <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Product Details */}
            <Row className="mb-5">
              {/* Product Image */}
              <Col md={5} className="mb-4 mb-md-0">
                <Card className="border-0 shadow-sm">
                  <div className="product-img-container bg-light p-4 text-center">
                    {product.image ? (
                      <img
                        src={`http://localhost:5000/${product.image}`}
                        alt={product.name}
                        className="img-fluid product-detail-img"
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        className="placeholder-img d-flex align-items-center justify-content-center"
                        style={{ height: "400px" }}
                      >
                        <span className="text-muted">Không có hình ảnh</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Product Info */}
              <Col md={7}>
                <h2 className="mb-3">{product.name}</h2>
                <p className="text-muted mb-2">Mã sản phẩm: {product.sku}</p>
                <p className="text-muted mb-3">
                  Danh mục: {product.category?.name}
                </p>

                <h3 className="text-primary mb-3">
                  {formatCurrency(product.price)}
                </h3>

                <div className="mb-4">
                  <span className="me-3">Tình trạng:</span>
                  {product.quantity > 0 ? (
                    <Badge bg="success">
                      <FaCheck className="me-1" />
                      Còn hàng ({product.quantity} sản phẩm)
                    </Badge>
                  ) : (
                    <Badge bg="danger">
                      <FaTimes className="me-1" />
                      Hết hàng
                    </Badge>
                  )}
                </div>

                {product.quantity > 0 && (
                  <div className="d-flex align-items-center mb-4">
                    <span className="me-3">Số lượng:</span>
                    <div className="input-group" style={{ width: "150px" }}>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex mb-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.quantity <= 0}
                    className="px-4"
                  >
                    <FaShoppingCart className="me-2" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="px-4"
                  >
                    <FaArrowLeft className="me-2" />
                    Quay lại
                  </Button>
                </div>

                {/* Product Tabs */}
                <Tabs defaultActiveKey="description" className="mb-3">
                  <Tab eventKey="description" title="Mô tả">
                    <Card.Body>
                      <p>{product.description}</p>
                    </Card.Body>
                  </Tab>
                  <Tab eventKey="specifications" title="Thông số kỹ thuật">
                    <Card.Body>
                      <table className="table table-striped">
                        <tbody>
                          <tr>
                            <td>Mã sản phẩm</td>
                            <td>{product.sku}</td>
                          </tr>
                          <tr>
                            <td>Danh mục</td>
                            <td>{product.category?.name}</td>
                          </tr>
                          <tr>
                            <td>Vị trí trong kho</td>
                            <td>{product.location || "Không có thông tin"}</td>
                          </tr>
                          {/* Thêm các thông số kỹ thuật khác tùy theo loại sản phẩm */}
                        </tbody>
                      </table>
                    </Card.Body>
                  </Tab>
                </Tabs>
              </Col>
            </Row>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mb-5">
                <h3 className="mb-4">Sản phẩm liên quan</h3>
                <Row>
                  {relatedProducts.map((product) => (
                    <Col lg={3} md={6} className="mb-4" key={product.id}>
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
                              <span className="text-muted">
                                Không có hình ảnh
                              </span>
                            </div>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="product-title">
                            {product.name}
                          </Card.Title>
                          <Card.Text className="product-price fw-bold mb-3">
                            {formatCurrency(product.price)}
                          </Card.Text>
                          <Link
                            to={`/products/${product.id}`}
                            className="mt-auto"
                          >
                            <Button variant="primary" className="w-100">
                              Chi tiết
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            )}
          </>
        ) : (
          <div className="text-center my-5">
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button variant="primary" as={Link} to="/products" className="mt-3">
              Quay lại danh sách sản phẩm
            </Button>
          </div>
        )}
      </Container>
    </CustomerLayout>
  );
};

export default ProductDetail;
