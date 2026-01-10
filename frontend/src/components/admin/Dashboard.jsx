import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import AdminLayout from "./Layout";
import { inventoryAPI, reportAPI, orderAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    inventorySummary: {},
    recentOrders: [],
    lowStockProducts: [],
    salesData: [],
    topProducts: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get inventory summary
        const inventorySummary = await inventoryAPI.getInventorySummary();

        // Get low stock products
        const lowStockProducts = await inventoryAPI.getLowStockProducts();

        // Get recent orders
        const recentOrders = await orderAPI.getAllOrders({ limit: 5 });

        // Get sales data for the last 7 days including today
        // Lấy ngày hiện tại (kết thúc ngày hôm nay)
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Đặt thời gian là cuối ngày
        const endDate = today.toISOString().split("T")[0];

        // Lấy ngày 6 ngày trước (để tổng cộng là 7 ngày tính cả hôm nay)
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0); // Đặt thời gian là đầu ngày
        const startDateStr = startDate.toISOString().split("T")[0];

        console.log("Fetching sales data from", startDateStr, "to", endDate);

        const salesData = await reportAPI.getSalesReport({
          startDate: startDateStr,
          endDate: endDate,
          groupBy: "day",
        });

        console.log("Frontend received sales data:", salesData.data);

        // Get top 5 selling products
        const topProducts = await reportAPI.getTopSellingProducts({ limit: 5 });
        console.log("Top products:", topProducts.data);

        setDashboardData({
          inventorySummary: inventorySummary.data,
          recentOrders: recentOrders.data.orders,
          lowStockProducts: lowStockProducts.data,
          salesData: salesData.data,
          topProducts: topProducts.data,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const salesChartData = {
    labels: dashboardData.salesData.map((item) => {
      // Format date to display in a more readable format (DD/MM)
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: "Doanh số",
        data: dashboardData.salesData.map((item) => item.totalSales),
        fill: false,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        tension: 0.1, // Làm cho đường cong mượt hơn
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(54, 162, 235, 1)",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const topProductsChartData = {
    labels: dashboardData.topProducts.map((item) => {
      // Truncate long product names
      const name = item?.name || "";
      return name.length > 15 ? name.substring(0, 15) + "..." : name;
    }),
    datasets: [
      {
        label: "Số lượng bán",
        data: dashboardData.topProducts.map((item) => item.totalQuantity),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Tổng quan</h1>

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
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaBox className="text-primary mb-2" size={30} />
                    <h5>Tổng sản phẩm</h5>
                    <h2 className="mb-0">
                      {dashboardData.inventorySummary.totalProducts || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaClipboardList className="text-success mb-2" size={30} />
                    <h5>Tổng đơn hàng</h5>
                    <h2 className="mb-0">
                      {dashboardData.recentOrders?.length || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaChartBar className="text-info mb-2" size={30} />
                    <h5>Giá trị kho</h5>
                    <h2 className="mb-0">
                      {formatCurrency(
                        dashboardData.inventorySummary.inventoryValue || 0
                      )}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column align-items-center">
                    <FaExclamationTriangle
                      className="text-warning mb-2"
                      size={30}
                    />
                    <h5>Sản phẩm sắp hết</h5>
                    <h2 className="mb-0">
                      {dashboardData.lowStockProducts?.length || 0}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Doanh số 7 ngày qua</h5>
                  </Card.Header>
                  <Card.Body>
                    {dashboardData.salesData.length > 0 ? (
                      <Line
                        data={salesChartData}
                        options={{
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(value * 24000);
                                },
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <p className="text-center text-muted">
                        Không có dữ liệu doanh số
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="shadow-sm h-100">
                  <Card.Header>
                    <h5 className="mb-0">Sản phẩm bán chạy</h5>
                  </Card.Header>
                  <Card.Body>
                    {dashboardData.topProducts.length > 0 ? (
                      <Pie
                        data={topProductsChartData}
                        options={{ responsive: true }}
                      />
                    ) : (
                      <p className="text-center text-muted">
                        Không có dữ liệu sản phẩm
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Low Stock Products */}
            <Row className="mb-4">
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Sản phẩm sắp hết hàng</h5>
                    <Link to="/admin/inventory">
                      <Button variant="outline-primary" size="sm">
                        Xem tất cả
                      </Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {dashboardData.lowStockProducts.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Sản phẩm</th>
                              <th>Mã SKU</th>
                              <th>Tồn kho</th>
                              <th>Tồn kho tối thiểu</th>
                              <th>Trạng thái</th>
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
                                      Sắp hết hàng
                                    </span>
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

            {/* Recent Orders */}
            <Row>
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Đơn hàng gần đây</h5>
                    <Link to="/admin/orders">
                      <Button variant="outline-primary" size="sm">
                        Xem tất cả
                      </Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {dashboardData.recentOrders.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Mã đơn</th>
                              <th>Khách hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng tiền</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td>
                                  <Link to={`/admin/orders/${order.id}`}>
                                    {order.orderNumber}
                                  </Link>
                                </td>
                                <td>{order.customer?.fullName}</td>
                                <td>
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </td>
                                <td>{formatCurrency(order.totalAmount)}</td>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      order.status === "delivered"
                                        ? "success"
                                        : order.status === "shipped"
                                        ? "info"
                                        : order.status === "processing"
                                        ? "primary"
                                        : order.status === "cancelled"
                                        ? "danger"
                                        : "warning"
                                    }`}
                                  >
                                    {order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-muted">
                        Không có đơn hàng gần đây
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard;
