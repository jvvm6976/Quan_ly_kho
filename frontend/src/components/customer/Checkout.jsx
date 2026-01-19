import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  FaArrowLeft,
  FaCheck,
  FaMoneyBill,
} from "react-icons/fa";
import CustomerLayout from "./Layout";
import AuthContext from "../../context/AuthContext";
import CartContext from "../../context/CartContext";
import { orderAPI } from "../../services/api";
import {formatCurrency} from "../../utils/formatCurrency";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart, getCartTotals } = useContext(CartContext);
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

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
    };
  };

  // Validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string().required("Họ tên là bắt buộc"),
    phone: Yup.string()
      .required("Số điện thoại là bắt buộc")
      .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa số")
      .min(10, "Số điện thoại phải có ít nhất 10 số"),
    address: Yup.string().required("Địa chỉ là bắt buộc"),
    city: Yup.string().required("Thành phố là bắt buộc"),
    paymentMethod: Yup.string().required("Phương thức thanh toán là bắt buộc"),
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: `${values.address}, ${values.city}`,
        shippingMethod: "Standard",
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };

      // Create order
      const response = await orderAPI.createOrder(orderData);

      // Clear cart using CartContext
      clearCart();

      // Show success message
      setOrderSuccess(true);
      setOrderNumber(response.data.order.orderNumber);

      setLoading(false);
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate("/cart");
    }
  }, [cartItems, orderSuccess, navigate]);

  return (
    <CustomerLayout>
      <Container className="py-4">
        <h1 className="mb-4">Thanh Toán</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        {orderSuccess ? (
          <Card className="text-center p-5 shadow-sm">
            <Card.Body>
              <div className="mb-4">
                <span
                  className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaCheck size={40} />
                </span>
              </div>
              <h2 className="mb-3">Đặt hàng thành công!</h2>
              <p className="mb-1">
                Cảm ơn bạn đã đặt hàng tại Computer Parts Warehouse.
              </p>
              <p className="mb-4">
                Mã đơn hàng của bạn là: <strong>{orderNumber}</strong>
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" as={Link} to="/my-orders">
                  Xem đơn hàng của tôi
                </Button>
                <Button variant="outline-primary" as={Link} to="/">
                  Tiếp tục mua sắm
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {/* Checkout Form */}
            <Col lg={8} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Thông tin thanh toán</h5>
                </Card.Header>
                <Card.Body>
                  <Formik
                    initialValues={{
                      fullName: user?.fullName || "",
                      phone: user?.phone || "",
                      address: user?.address || "",
                      city: "",
                      notes: "",
                      paymentMethod: "cod",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <h5 className="mb-3">Thông tin giao hàng</h5>

                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Họ tên</Form.Label>
                              <Form.Control
                                type="text"
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.fullName && errors.fullName}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.fullName}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Số điện thoại</Form.Label>
                              <Form.Control
                                type="text"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.phone && errors.phone}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.phone}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Địa chỉ</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.address && errors.address}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.address}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Thành phố</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={values.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.city && errors.city}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.city}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="notes"
                            value={values.notes}
                            onChange={handleChange}
                            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hoặc địa điểm giao hàng chi tiết"
                          />
                        </Form.Group>

                        <h5 className="mb-3">Phương thức thanh toán</h5>

                        <div className="mb-4">
                          <Form.Check
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={values.paymentMethod === "cod"}
                            onChange={handleChange}
                            label={
                              <div className="d-flex align-items-center">
                                <FaMoneyBill className="me-2 text-success" />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                              </div>
                            }
                            className="mb-2"
                          />
                          {touched.paymentMethod && errors.paymentMethod && (
                            <div className="text-danger mt-1">
                              {errors.paymentMethod}
                            </div>
                          )}
                        </div>

                        <div className="d-flex justify-content-between">
                          <Button
                            variant="outline-secondary"
                            as={Link}
                            to="/cart"
                          >
                            <FaArrowLeft className="me-2" />
                            Quay lại giỏ hàng
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? "Đang xử lý..." : "Đặt hàng"}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </Col>

            {/* Order Summary */}
            <Col lg={4}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Đơn hàng của bạn</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.name}{" "}
                            <span className="text-muted">
                              × {item.quantity}
                            </span>
                          </td>
                          <td className="text-end">
                            {formatCurrency(getLineTotals(item).lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-light">
                      <tr>
                        <th>Tạm tính</th>
                        <td className="text-end">{formatCurrency(subtotal)}</td>
                      </tr>
                      <tr>
                        <th>Phí vận chuyển</th>
                        <td className="text-end">
                          {shipping === 0
                            ? "Miễn phí"
                            : `${formatCurrency(shipping)}`}
                        </td>
                      </tr>
                      <tr>
                        <th>Tổng cộng</th>
                        <td className="text-end fw-bold text-primary">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>

              <Alert variant="info">
                <p className="mb-0">
                  <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý trong vòng 24
                  giờ làm việc.
                </p>
              </Alert>
            </Col>
          </Row>
        )}
      </Container>
    </CustomerLayout>
  );
};

export default Checkout;
