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
  FaShippingFast,
  FaCheck,
  FaTimesCircle,
  FaBoxOpen,
  FaClipboardList,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { orderAPI, inventoryAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";

const StaffOrders = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
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

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Prepare filter params
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
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
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      currentPage: 1,
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      startDate: "",
      endDate: "",
      search: "",
    });
    setPagination({
      ...pagination,
      currentPage: 1,
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page,
    });
  };

  // Handle view order
  const handleViewOrder = async (order) => {
    try {
      setLoading(true);
      const orderRes = await orderAPI.getOrderById(order.id);
      setSelectedOrder(orderRes.data);
      setShowModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId, status, paymentStatus) => {
    try {
      setError("");
      setSuccess("");
      setProcessingOrder(true);

      // Update order status
      await orderAPI.updateOrderStatus(orderId, {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        processorId: undefined, // Sẽ được tự động gán là người dùng hiện tại
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

      setProcessingOrder(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
      setProcessingOrder(false);
    }
  };

  // Handle create inventory transaction for order
  const handleCreateInventoryTransaction = async (order) => {
    try {
      setError("");
      setSuccess("");
      setProcessingOrder(true);

      // Create inventory transaction for each item
      for (const item of order.items) {
        await inventoryAPI.createTransaction({
          productId: item.productId,
          quantity: item.quantity,
          type: "out",
          reason: "order",
          reference: order.orderNumber,
          notes: `Xuất kho cho đơn hàng #${order.orderNumber}`,
        });
      }

      // Update order status to processing
      await handleUpdateStatus(order.id, "processing");

      // Show success message
      setSuccess(
        "Đã tạo phiếu xuất kho cho đơn hàng và cập nhật trạng thái thành 'Đang xử lý'!"
      );

      setShowInventoryModal(false);
      setProcessingOrder(false);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      setError(
        "Không thể tạo phiếu xuất kho cho đơn hàng. Vui lòng thử lại sau."
      );
      setProcessingOrder(false);
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
        return <Badge bg="info">Đã giao cho vận chuyển</Badge>;
      case "delivered":
        return <Badge bg="success">Đã giao hàng</Badge>;
      case "cancelled":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Chờ thanh toán</Badge>;
      case "paid":
        return <Badge bg="success">Đã thanh toán</Badge>;
      case "refunded":
        return <Badge bg="info">Đã hoàn tiền</Badge>;
      case "failed":
        return <Badge bg="danger">Thanh toán thất bại</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Render pagination
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
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
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        />
        {pages}
        <Pagination.Next
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        />
      </Pagination>
    );
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaClipboardList className="me-2" />
            Quản Lý Đơn Hàng
          </h1>
        </div>

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
            <Form onSubmit={handleSearch}>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Trạng thái đơn hàng</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipped">Đã giao cho vận chuyển</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="cancelled">Đã hủy</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Trạng thái thanh toán</Form.Label>
                    <Form.Select
                      name="paymentStatus"
                      value={filters.paymentStatus}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="refunded">Đã hoàn tiền</option>
                      <option value="failed">Thanh toán thất bại</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Từ ngày</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Đến ngày</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <FaSearch className="me-1" /> Tìm kiếm
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Button type="submit" variant="primary" className="me-2">
                    Tìm kiếm
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleResetFilters}
                  >
                    Đặt lại
                  </Button>
                </Col>
              </Row> */}
            </Form>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            {loading && !showModal ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
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

                {pagination.totalPages > 1 && renderPagination()}
              </>
            ) : (
              <Alert variant="info">
                Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Order Detail Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết đơn hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="d-flex justify-content-between mb-4">
                  <h5>
                    Mã đơn hàng: <strong>{selectedOrder.orderNumber}</strong>
                  </h5>
                  <div>
                    {getStatusBadge(selectedOrder.status)}{" "}
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>

                <Row className="mb-4">
                  <Col md={6}>
                    <p>
                      <strong>Ngày đặt:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p>
                      <strong>Khách hàng:</strong>{" "}
                      {selectedOrder.customer?.fullName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer?.email}
                    </p>
                    <p>
                      <strong>Điện thoại:</strong>{" "}
                      {selectedOrder.customer?.phone || "Không có"}
                    </p>
                    <p>
                      <strong>Địa chỉ giao hàng:</strong>{" "}
                      {selectedOrder.shippingAddress}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Phương thức vận chuyển:</strong>{" "}
                      {selectedOrder.shippingMethod}
                    </p>
                    <p>
                      <strong>Phương thức thanh toán:</strong>{" "}
                      {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Ghi chú:</strong>{" "}
                      {selectedOrder.notes || "Không có ghi chú"}
                    </p>
                    <p>
                      <strong>Người xử lý:</strong>{" "}
                      {selectedOrder.processor?.fullName || "Chưa có"}
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

                <h6 className="mb-3">Cập nhật trạng thái</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setShowModal(false);
                          setShowInventoryModal(true);
                        }}
                        disabled={processingOrder}
                      >
                        <FaBoxOpen className="me-1" />
                        Xử lý đơn hàng
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleUpdateStatus(selectedOrder.id, "cancelled")
                        }
                        disabled={processingOrder}
                      >
                        <FaTimesCircle className="me-1" />
                        Hủy đơn hàng
                      </Button>
                    </>
                  )}

                  {selectedOrder.status === "processing" && (
                    <Button
                      variant="info"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "shipped")
                      }
                      disabled={processingOrder}
                    >
                      <FaShippingFast className="me-1" />
                      Đã giao cho vận chuyển
                    </Button>
                  )}

                  {selectedOrder.status === "shipped" && (
                    <Button
                      variant="success"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "delivered")
                      }
                      disabled={processingOrder}
                    >
                      <FaCheck className="me-1" />
                      Đã giao hàng
                    </Button>
                  )}

                  {selectedOrder.paymentStatus === "pending" && (
                    <Button
                      variant="outline-success"
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, undefined, "paid")
                      }
                      disabled={processingOrder}
                    >
                      <FaCheck className="me-1" />
                      Đánh dấu đã thanh toán
                    </Button>
                  )}

                  {processingOrder && (
                    <div className="ms-2 d-flex align-items-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </div>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Inventory Transaction Confirmation Modal */}
        <Modal
          show={showInventoryModal}
          onHide={() => setShowInventoryModal(false)}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xử lý đơn hàng</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <Alert variant="info">
                  <p>
                    Bạn đang xử lý đơn hàng{" "}
                    <strong>{selectedOrder.orderNumber}</strong>. Hệ thống sẽ:
                  </p>
                  <ol>
                    <li>Tạo phiếu xuất kho cho các sản phẩm trong đơn hàng</li>
                    <li>Cập nhật trạng thái đơn hàng thành "Đang xử lý"</li>
                    <li>Ghi nhận bạn là người xử lý đơn hàng này</li>
                  </ol>
                  <p className="mb-0">
                    <strong>Lưu ý:</strong> Phiếu xuất kho sẽ được gửi đến quản
                    trị viên để phê duyệt.
                  </p>
                </Alert>

                <h6 className="mb-3">Sản phẩm cần xuất kho:</h6>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowInventoryModal(false)}
              disabled={processingOrder}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => handleCreateInventoryTransaction(selectedOrder)}
              disabled={processingOrder}
            >
              {processingOrder ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận xử lý"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffOrders;
