import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Modal,
  Alert,
  Badge,
  Pagination,
  Spinner,
} from "react-bootstrap";
import {
  FaEye,
  FaSearch,
  FaTimes,
  FaShippingFast,
  FaCheck,
  FaTimesCircle,
} from "react-icons/fa";
import AdminLayout from "./Layout";
import { orderAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const AdminOrders = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    paymentStatus: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Prepare filter params
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...activeFilters,
        };

        // Get orders
        const ordersRes = await orderAPI.getAllOrders(params);
        setOrders(ordersRes.data.orders);
        setPagination({
          ...pagination,
          totalPages: ordersRes.data.pagination.totalPages,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pagination.currentPage, pagination.itemsPerPage, activeFilters]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!selectedOrder) return;

        setLoading(true);

        // Get order details
        const orderRes = await orderAPI.getOrderById(selectedOrder.id);
        setSelectedOrder(orderRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (selectedOrder && showModal) {
      fetchOrderDetails();
    }
  }, [selectedOrder?.id, showModal]);

  // Handle view order
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId, status, paymentStatus) => {
    try {
      setError("");
      setSuccess("");

      // Update order status
      await orderAPI.updateOrderStatus(orderId, {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      });

      // Show success message
      setSuccess("Trạng thái đơn hàng đã được cập nhật thành công!");

      // Refresh orders
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const ordersRes = await orderAPI.getAllOrders(params);
      setOrders(ordersRes.data.orders);

      // If selected order is open, refresh it
      if (selectedOrder && selectedOrder.id === orderId) {
        const orderRes = await orderAPI.getOrderById(orderId);
        setSelectedOrder(orderRes.data);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError(
        "Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
      );
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    // Apply the current filters
    setActiveFilters(filters);
    
    // Reset to first page when applying filters
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    const emptyFilters = {
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
      search: "",
    };
    
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);

    // Reset to first page
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
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

  // Generate pagination items
  const paginationItems = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === pagination.currentPage}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Quản Lý Đơn Hàng</h1>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            {/* Filters */}
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái đơn hàng</Form.Label>
                      <Form.Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="cancelled">Đã hủy</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái thanh toán</Form.Label>
                      <Form.Select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="failed">Thanh toán thất bại</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Từ ngày</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Đến ngày</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tìm kiếm</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          name="search"
                          value={filters.search}
                          onChange={handleFilterChange}
                          placeholder="Mã đơn hàng"
                        />
                      </div>
                      {activeFilters.search && orders.length === 0 && !loading && (
                        <Form.Text className="text-muted">
                          Không tìm thấy đơn hàng phù hợp
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <div className="d-flex flex-column w-100">
                      <Button
                        variant="primary"
                        className="mb-2"
                        onClick={handleApplyFilters}
                        title="Áp dụng bộ lọc"
                      >
                        <FaSearch />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleResetFilters}
                        title="Xóa bộ lọc"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {loading && !showModal ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thanh toán</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.customer?.fullName}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleViewOrder(order)}
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                      />
                      {paginationItems}
                      <Pagination.Next
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                      />
                      <Pagination.Last
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                      />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center my-5">
                <p className="mb-0">Không có đơn hàng nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết đơn hàng: {selectedOrder?.orderNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : selectedOrder ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Thông tin đơn hàng</h6>
                  <p>
                    <strong>Mã đơn hàng:</strong> {selectedOrder.orderNumber}
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p>
                    <strong>Thanh toán:</strong>{" "}
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {selectedOrder.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : selectedOrder.paymentMethod === "credit-card"
                      ? "Thẻ tín dụng/ghi nợ"
                      : selectedOrder.paymentMethod}
                  </p>
                  <p>
                    <strong>Phương thức vận chuyển:</strong>{" "}
                    {selectedOrder.shippingMethod}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Thông tin khách hàng</h6>
                  <p>
                    <strong>Tên khách hàng:</strong>{" "}
                    {selectedOrder.customer?.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.customer?.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong>{" "}
                    {selectedOrder.customer?.phone || "Không có"}
                  </p>
                  <p>
                    <strong>Địa chỉ giao hàng:</strong>{" "}
                    {selectedOrder.shippingAddress}
                  </p>
                </Col>
              </Row>

              <h6 className="mb-3">Sản phẩm đã đặt</h6>
              <div className="table-responsive mb-4">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product?.name}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">
                        Tổng cộng:
                      </th>
                      <th>{formatCurrency(selectedOrder.totalAmount)}</th>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {selectedOrder.notes && (
                <div className="mb-4">
                  <h6>Ghi chú:</h6>
                  <p className="mb-0">{selectedOrder.notes}</p>
                </div>
              )}

              <h6 className="mb-3">Cập nhật trạng thái</h6>
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>Trạng thái đơn hàng</Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant={
                            selectedOrder.status === "pending"
                              ? "warning"
                              : "outline-warning"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, "pending")
                          }
                          disabled={selectedOrder.status === "pending"}
                        >
                          Chờ xử lý
                        </Button>
                        <Button
                          variant={
                            selectedOrder.status === "processing"
                              ? "primary"
                              : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, "processing")
                          }
                          disabled={selectedOrder.status === "processing"}
                        >
                          Đang xử lý
                        </Button>
                        <Button
                          variant={
                            selectedOrder.status === "shipped"
                              ? "info"
                              : "outline-info"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, "shipped")
                          }
                          disabled={selectedOrder.status === "shipped"}
                        >
                          <FaShippingFast className="me-1" />
                          Đang giao hàng
                        </Button>
                        <Button
                          variant={
                            selectedOrder.status === "delivered"
                              ? "success"
                              : "outline-success"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, "delivered")
                          }
                          disabled={selectedOrder.status === "delivered"}
                        >
                          <FaCheck className="me-1" />
                          Đã giao hàng
                        </Button>
                        <Button
                          variant={
                            selectedOrder.status === "cancelled"
                              ? "danger"
                              : "outline-danger"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, "cancelled")
                          }
                          disabled={selectedOrder.status === "cancelled"}
                        >
                          <FaTimesCircle className="me-1" />
                          Hủy đơn hàng
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>Trạng thái thanh toán</Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant={
                            selectedOrder.paymentStatus === "pending"
                              ? "warning"
                              : "outline-warning"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              selectedOrder.id,
                              null,
                              "pending"
                            )
                          }
                          disabled={selectedOrder.paymentStatus === "pending"}
                        >
                          Chờ thanh toán
                        </Button>
                        <Button
                          variant={
                            selectedOrder.paymentStatus === "paid"
                              ? "success"
                              : "outline-success"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, null, "paid")
                          }
                          disabled={selectedOrder.paymentStatus === "paid"}
                        >
                          <FaCheck className="me-1" />
                          Đã thanh toán
                        </Button>
                        <Button
                          variant={
                            selectedOrder.paymentStatus === "failed"
                              ? "danger"
                              : "outline-danger"
                          }
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(selectedOrder.id, null, "failed")
                          }
                          disabled={selectedOrder.paymentStatus === "failed"}
                        >
                          <FaTimesCircle className="me-1" />
                          Thanh toán thất bại
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <p className="text-center">Không tìm thấy thông tin đơn hàng</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default AdminOrders;
