import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaClipboardList,
  FaExclamationTriangle,
  FaBell,
  FaCalendarAlt,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { inventoryAPI, orderAPI } from "../../services/api";

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    lowStockProducts: [],
    recentOrders: [],
    pendingTransactions: [],
    notifications: [],
    schedule: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get low stock products
        const lowStockProducts = await inventoryAPI.getLowStockProducts();

        // Get recent orders
        const recentOrders = await orderAPI.getAllOrders({
          status: "pending,processing",
          limit: 5,
        });

        // Get pending inventory transactions
        const pendingTransactions = await inventoryAPI.getAllTransactions({
          status: "pending",
          limit: 5,
        });

        // Mô phỏng dữ liệu cho các tính năng mới
        // Trong thực tế, bạn sẽ gọi API tương ứng
        const mockNotifications = [
          {
            id: 1,
            message: "Đơn hàng #ORD250522-001 cần xử lý gấp",
            time: new Date().toISOString(),
            read: false,
          },
          {
            id: 2,
            message: "Admin đã phê duyệt phiếu nhập kho #INV2023-05",
            time: new Date().toISOString(),
            read: false,
          },
          {
            id: 3,
            message: "Sản phẩm CPU Intel i9 sắp hết hàng",
            time: new Date().toISOString(),
            read: true,
          },
        ];

        const mockSchedule = [
          {
            id: 1,
            title: "Họp nhân viên",
            time: "08:30",
            location: "Phòng họp",
          },
          { id: 2, title: "Kiểm kê kho", time: "10:00", location: "Kho chính" },
          {
            id: 3,
            title: "Xử lý đơn hàng",
            time: "13:30",
            location: "Phòng làm việc",
          },
        ];

        setDashboardData({
          lowStockProducts: lowStockProducts.data,
          recentOrders: recentOrders.data.orders,
          pendingTransactions: pendingTransactions.data.transactions,
          notifications: mockNotifications,
          schedule: mockSchedule,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Tổng Quan Nhân Viên</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaClipboardList className="text-primary mb-2" size={30} />
                    <h5>Đơn Hàng Chờ Xử Lý</h5>
                    <h2 className="mb-0">
                      {dashboardData.recentOrders?.length || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaBox className="text-success mb-2" size={30} />
                    <h5>Giao Dịch Kho Chờ Duyệt</h5>
                    <h2 className="mb-0">
                      {dashboardData.pendingTransactions?.length || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExclamationTriangle
                      className="text-warning mb-2"
                      size={30}
                    />
                    <h5>Sản Phẩm Sắp Hết Hàng</h5>
                    <h2 className="mb-0">
                      {dashboardData.lowStockProducts?.length || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Low Stock Products */}
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Sản Phẩm Sắp Hết Hàng</h5>
                    <Link to="/staff/inventory">
                      <Button variant="outline-primary" size="sm">
                        Xem Tất Cả
                      </Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {dashboardData.lowStockProducts.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Sản Phẩm</th>
                              <th>Mã SKU</th>
                              <th>Tồn Kho</th>
                              <th>Tồn Kho Tối Thiểu</th>
                              <th>Trạng Thái</th>
                              <th>Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.lowStockProducts
                              .slice(0, 5)
                              .map((product) => (
                                <tr key={product.id}>
                                  <td>{product.name}</td>
                                  <td>{product.sku}</td>
                                  <td>{product.quantity}</td>
                                  <td>{product.minQuantity}</td>
                                  <td>
                                    <span className="badge bg-warning">
                                      Sắp Hết Hàng
                                    </span>
                                  </td>
                                  <td>
                                    <Link
                                      to={`/staff/inventory?action=create-transaction&productId=${product.id}`}
                                    >
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                      >
                                        Tạo Giao Dịch
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted">
                        Không có sản phẩm sắp hết hàng
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </StaffLayout>
  );
};

export default StaffDashboard;
