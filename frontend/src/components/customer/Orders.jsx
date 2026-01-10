import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaFileInvoice,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import CustomerLayout from "./Layout";
import { orderAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const CustomerOrders = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [cancelling, setCancelling] = useState(false);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Get all orders for the current user
        const response = await orderAPI.getAllOrders();
        setOrders(response.data.orders);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      setCancelling(true);
      setError("");
      setSuccess("");

      console.log("Attempting to cancel order:", orderId);
      
      // Check if the order is in a cancellable state
      const orderToCancel = orders.find(order => order.id === orderId);
      if (!orderToCancel) {
        console.error("Order not found in local state");
        setError("Không thể tìm thấy đơn hàng. Vui lòng tải lại trang.");
        setCancelling(false);
        return;
      }
      
      if (orderToCancel.status !== "pending") {
        console.error("Cannot cancel order in status:", orderToCancel.status);
        setError("Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý.");
        setCancelling(false);
        return;
      }

      // Update order status to cancelled
      const response = await orderAPI.updateOrderStatus(orderId, { 
        status: "cancelled"
      });
      
      console.log("Cancel order response:", response);

      // Update the order in the UI
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order
      );
      setOrders(updatedOrders);

      // Update selected order if it's the one being cancelled
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }

      setSuccess("Đơn hàng đã được hủy thành công!");
      setCancelling(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      // More detailed error message
      if (error.response) {
        console.error("Error response:", error.response.data);
        // Use the error message from the server if available
        setError(error.response.data.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      } else if (error.request) {
        console.error("Error request:", error.request);
        setError("Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
      setCancelling(false);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return order.status === "pending";
    if (activeTab === "processing") return order.status === "processing";
    if (activeTab === "shipped") return order.status === "shipped";
    if (activeTab === "delivered") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  // Get order details
  const handleViewOrder = async (orderId) => {
    try {
      setLoading(true);

      // Get order details
      const response = await orderAPI.getOrderById(orderId);
      setSelectedOrder(response.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Chờ xử lý</Badge>;
      case "processing":
        return <Badge bg="primary">Đang xử lý</Badge>;
      case "shipped":
        return <Badge bg="info">Đang giao hàng</Badge>;
      case "delivered":
        return <Badge bg="success">Đã giao hàng</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Chờ thanh toán</Badge>;
      case "paid":
        return <Badge bg="success">Đã thanh toán</Badge>;
      case "failed":
        return <Badge bg="danger">Thanh toán thất bại</Badge>;
      default:
        return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaFileInvoice className="text-warning" />;
      case "processing":
        return <FaBoxOpen className="text-primary" />;
      case "shipped":
        return <FaShippingFast className="text-info" />;
      case "delivered":
        return <FaCheckCircle className="text-success" />;
      case "cancelled":
        return <FaTimesCircle className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <CustomerLayout>
      <Container className="py-4">
        <h1 className="mb-4">Đơn Hàng Của Tôi</h1>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Row>
          <Col lg={selectedOrder ? 6 : 12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-0"
                >
                  <Tab eventKey="all" title="Tất cả" />
                  <Tab eventKey="pending" title="Chờ xử lý" />
                  <Tab eventKey="processing" title="Đang xử lý" />
                  <Tab eventKey="shipped" title="Đang giao" />
                  <Tab eventKey="delivered" title="Đã giao" />
                  <Tab eventKey="cancelled" title="Đã hủy" />
                </Tabs>
              </Card.Header>
              <Card.Body className="p-0">
                {loading && !selectedOrder ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Mã đơn hàng</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th>Thanh toán</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.orderNumber}</td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>{formatCurrency(order.totalAmount)}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              {getPaymentStatusBadge(order.paymentStatus)}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                <FaEye className="me-1" />
                                Chi tiết
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center my-5">
                    <p className="mb-0">Không có đơn hàng nào</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Details */}
          {selectedOrder && (
            <Col lg={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Chi tiết đơn hàng #{selectedOrder.orderNumber}
                  </h5>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Đóng
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Trạng thái đơn hàng:</span>
                      <span>{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Trạng thái thanh toán:</span>
                      <span>
                        {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Ngày đặt hàng:</span>
                      <span>
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Phương thức thanh toán:</span>
                      <span>
                        {selectedOrder.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng"
                          : "Thẻ tín dụng/ghi nợ"}
                      </span>
                    </div>
                  </div>

                  <h6 className="mb-3">Địa chỉ giao hàng</h6>
                  <p className="mb-4">{selectedOrder.shippingAddress}</p>

                  <h6 className="mb-3">Sản phẩm đã đặt</h6>
                  <div className="table-responsive mb-3">
                    <Table className="table-sm">
                      <thead className="bg-light">
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-end">Giá</th>
                          <th className="text-end">Tổng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product?.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="text-end">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-light">
                        <tr>
                          <th colSpan="3">Tổng cộng</th>
                          <th className="text-end">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </th>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>

                  {selectedOrder.notes && (
                    <>
                      <h6 className="mb-2">Ghi chú</h6>
                      <p className="mb-0">{selectedOrder.notes}</p>
                    </>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ms-2">
                        {selectedOrder.status === "pending" &&
                          "Đơn hàng của bạn đang chờ xử lý."}
                        {selectedOrder.status === "processing" &&
                          "Đơn hàng của bạn đang được xử lý."}
                        {selectedOrder.status === "shipped" &&
                          "Đơn hàng của bạn đang được giao."}
                        {selectedOrder.status === "delivered" &&
                          "Đơn hàng của bạn đã được giao thành công."}
                        {selectedOrder.status === "cancelled" &&
                          "Đơn hàng của bạn đã bị hủy."}
                      </span>
                    </div>
                    {selectedOrder.status === "pending" && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Đang hủy...
                          </>
                        ) : (
                          "Hủy đơn hàng"
                        )}
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </CustomerLayout>
  );
};

export default CustomerOrders;
