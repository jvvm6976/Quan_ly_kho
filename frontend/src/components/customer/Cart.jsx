import {useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaArrowRight,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";
import CustomerLayout from "./Layout";
import CartContext from "../../context/CartContext";
import {formatCurrency} from "../../utils/formatCurrency";
const Cart = () => {
  const navigate = useNavigate();

  // Get cart context
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotals,
  } = useContext(CartContext);

  // Calculate totals
  const { subtotal, shipping, total } = getCartTotals();

  const getLineTotals = (item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    const taxRate = Number(item.tax) || 0;
    const base = price * qty;
    const taxAmount = base * (taxRate / 100);

    return {
      taxAmount,
      lineTotal: base + taxAmount,
      base,
    };
  };

  const preTaxSubtotal = cartItems.reduce(
    (sum, item) => sum + getLineTotals(item).base,
    0
  );
  const taxTotal = cartItems.reduce(
    (sum, item) => sum + getLineTotals(item).taxAmount,
    0
  );

  // Handle quantity change
  const handleQuantityChange = (id, value) => {
    const item = cartItems.find((item) => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + value);
      updateQuantity(id, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")
    ) {
      clearCart();
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <CustomerLayout>
      <Container className="py-4">
        <h1 className="mb-4">Giỏ Hàng</h1>

        {cartItems.length === 0 ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <FaShoppingCart size={50} className="text-muted mb-3" />
              <h3>Giỏ hàng của bạn đang trống</h3>
              <p className="text-muted mb-4">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <Button variant="primary" as={Link} to="/products" size="lg">
                Tiếp tục mua sắm
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {/* Cart Items */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Sản phẩm trong giỏ hàng</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="table-borderless mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-center">Giá</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-center">Thuế</th>
                          <th className="text-center">Tiền thuế</th>
                          <th className="text-center">Tổng</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="me-3"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  {item.image ? (
                                    <Image
                                      src={`http://localhost:5000/${item.image}`}
                                      alt={item.name}
                                      width={60}
                                      height={60}
                                      className="img-thumbnail"
                                    />
                                  ) : (
                                    <div
                                      className="bg-light d-flex align-items-center justify-content-center"
                                      style={{ width: "60px", height: "60px" }}
                                    >
                                      <span className="text-muted small">
                                        No image
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    to={`/products/${item.id}`}
                                    className="text-decoration-none"
                                  >
                                    <h6 className="mb-0">{item.name}</h6>
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(item.id, -1)
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(item.id, 1)
                                  }
                                >
                                  +
                                </Button>
                          </div>
                        </td>
                        <td className="text-center">
                          {`${Number(item.tax || 0).toFixed(2)}%`}
                        </td>
                        <td className="text-center">
                          {formatCurrency(getLineTotals(item).taxAmount)}
                        </td>
                            <td className="text-center fw-bold">
                              {formatCurrency(getLineTotals(item).lineTotal)}
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white d-flex justify-content-between">
                  <Button variant="outline-secondary" as={Link} to="/products">
                    <FaArrowLeft className="me-2" />
                    Tiếp tục mua sắm
                  </Button>
                  <Button variant="outline-danger" onClick={handleClearCart}>
                    <FaTrash className="me-2" />
                    Xóa giỏ hàng
                  </Button>
                </Card.Footer>
              </Card>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Tóm tắt đơn hàng</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tiền hàng (chưa thuế):</span>
                    <span>{formatCurrency(preTaxSubtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Thuế :</span>
                    <span>{formatCurrency(taxTotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tổng tiền:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {shipping === 0 ? "Miễn phí" : `${formatCurrency(shipping)}`}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Tổng cộng:</strong>
                    <strong className="text-primary">
                      {formatCurrency(total)}
                    </strong>
                  </div>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Tiến hành thanh toán
                      <FaArrowRight className="ms-2" />
                    </Button>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Alert variant="info" className="mb-0 py-2">
                    <small>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</small>
                  </Alert>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </CustomerLayout>
  );
};

export default Cart;
