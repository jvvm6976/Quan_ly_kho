import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaBell, FaCheck, FaTrash, FaFilter, FaEye } from "react-icons/fa";
import StaffLayout from "./Layout";
import AuthContext from "../../context/AuthContext";
import "./Notifications.css";

const StaffNotifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read

  // Mô phỏng dữ liệu thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
        // Ví dụ: const response = await notificationAPI.getNotifications();

        // Mô phỏng dữ liệu
        const mockNotifications = [
          {
            id: 1,
            title: "Đơn hàng mới",
            message: "Đơn hàng #ORD250522-001 vừa được tạo và đang chờ xử lý.",
            type: "order",
            reference: "ORD250522-001",
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
            read: false,
          },
          {
            id: 2,
            title: "Sản phẩm sắp hết hàng",
            message:
              'Sản phẩm "CPU Intel i9-13900K" sắp hết hàng. Hiện chỉ còn 3 sản phẩm.',
            type: "inventory",
            reference: "CPU-I9-13900K",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
            read: false,
          },
          {
            id: 3,
            title: "Phiếu nhập kho được phê duyệt",
            message: "Phiếu nhập kho #INV2023-05 đã được phê duyệt.",
            type: "inventory",
            reference: "INV2023-05",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 giờ trước
            read: true,
          },
          {
            id: 4,
            title: "Đơn hàng đã giao thành công",
            message: "Đơn hàng #ORD250522-002 đã được giao thành công.",
            type: "order",
            reference: "ORD250522-002",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
            read: true,
          },
          {
            id: 5,
            title: "Đợt kiểm kê mới",
            message: "Đợt kiểm kê mới đã được tạo và đang chờ bạn tham gia.",
            type: "inventory_check",
            reference: "IC2023-02",
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 2
            ).toISOString(), // 2 ngày trước
            read: false,
          },
          {
            id: 6,
            title: "Lịch làm việc đã được cập nhật",
            message: "Lịch làm việc của bạn đã được cập nhật cho tuần tới.",
            type: "schedule",
            reference: null,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 3
            ).toISOString(), // 3 ngày trước
            read: true,
          },
          {
            id: 7,
            title: "Công việc mới được giao",
            message: 'Bạn được giao công việc "Kiểm kê kho quý 2".',
            type: "task",
            reference: "TASK-2023-15",
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 4
            ).toISOString(), // 4 ngày trước
            read: false,
          },
        ];

        setNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Không thể tải thông báo. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Lọc thông báo theo trạng thái đã đọc/chưa đọc
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  // Đánh dấu thông báo đã đọc
  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Xóa thông báo
  const handleDeleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  // Xóa tất cả thông báo đã đọc
  const handleDeleteAllRead = () => {
    setNotifications(
      notifications.filter((notification) => !notification.read)
    );
  };

  // Định dạng thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  // Lấy biểu tượng cho loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return (
          <Badge bg="primary" className="notification-icon">
            Đơn hàng
          </Badge>
        );
      case "inventory":
        return (
          <Badge bg="success" className="notification-icon">
            Kho hàng
          </Badge>
        );
      case "inventory_check":
        return (
          <Badge bg="info" className="notification-icon">
            Kiểm kê
          </Badge>
        );
      case "task":
        return (
          <Badge bg="warning" className="notification-icon">
            Công việc
          </Badge>
        );
      case "schedule":
        return (
          <Badge bg="secondary" className="notification-icon">
            Lịch
          </Badge>
        );
      default:
        return (
          <Badge bg="dark" className="notification-icon">
            Khác
          </Badge>
        );
    }
  };

  // Lấy URL cho thông báo
  const getNotificationUrl = (notification) => {
    switch (notification.type) {
      case "order":
        return `/staff/orders?search=${notification.reference}`;
      case "inventory":
        return `/staff/inventory?search=${notification.reference}`;
      case "inventory_check":
        return `/staff/inventory-check`;
      case "task":
        return `/staff/tasks`;
      case "schedule":
        return `/staff/schedule`;
      default:
        return "#";
    }
  };

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaBell className="me-2" />
            Thông Báo
            {unreadCount > 0 && (
              <Badge bg="danger" pill className="ms-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <div>
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <FaCheck className="me-1" />
              Đánh dấu tất cả đã đọc
            </Button>
            <Button
              variant="outline-danger"
              onClick={handleDeleteAllRead}
              disabled={notifications.filter((n) => n.read).length === 0}
            >
              <FaTrash className="me-1" />
              Xóa tất cả đã đọc
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <Card className="shadow-sm">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button
                  variant={filter === "all" ? "primary" : "outline-primary"}
                  className="me-2"
                  onClick={() => setFilter("all")}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filter === "unread" ? "primary" : "outline-primary"}
                  className="me-2"
                  onClick={() => setFilter("unread")}
                >
                  Chưa đọc
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={filter === "read" ? "primary" : "outline-primary"}
                  onClick={() => setFilter("read")}
                >
                  Đã đọc
                </Button>
              </div>
              <div>
                <FaFilter className="me-2" />
                <span>Lọc</span>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải thông báo...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ListGroup variant="flush">
                {filteredNotifications.map((notification) => (
                  <ListGroup.Item
                    key={notification.id}
                    className={`notification-item ${
                      !notification.read ? "unread" : ""
                    }`}
                  >
                    <Row>
                      <Col
                        xs={12}
                        className="d-flex justify-content-between align-items-start mb-2"
                      >
                        <div className="d-flex align-items-center">
                          {getNotificationIcon(notification.type)}
                          <h6 className="mb-0 ms-2">{notification.title}</h6>
                          {!notification.read && (
                            <Badge bg="danger" pill className="ms-2">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          {formatTime(notification.createdAt)}
                        </small>
                      </Col>
                      <Col xs={12}>
                        <p className="mb-2">{notification.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <Button
                              as="a"
                              href={getNotificationUrl(notification)}
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <FaEye className="me-1" />
                              Xem chi tiết
                            </Button>
                            {!notification.read && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <FaCheck className="me-1" />
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                          >
                            <FaTrash className="me-1" />
                            Xóa
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info">
                {filter === "all"
                  ? "Không có thông báo nào."
                  : filter === "unread"
                  ? "Không có thông báo chưa đọc."
                  : "Không có thông báo đã đọc."}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
    </StaffLayout>
  );
};

export default StaffNotifications;
