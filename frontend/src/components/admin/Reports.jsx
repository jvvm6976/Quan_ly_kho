import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaDownload, FaCalendarAlt } from "react-icons/fa";
import AdminLayout from "./Layout";
import { reportAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sales");

  // Date filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0], // 1 month ago
    endDate: new Date().toISOString().split("T")[0], // today
    groupBy: "day",
  });

  // Report data
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryValue, setInventoryValue] = useState({});
  const [customerData, setCustomerData] = useState({});

  // Fetch sales report
  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);

        const response = await reportAPI.getSalesReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: dateRange.groupBy,
        });

        setSalesData(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales report:", error);
        setError("Không thể tải báo cáo doanh thu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (activeTab === "sales") {
      fetchSalesReport();
    }
  }, [activeTab, dateRange]);

  // Fetch top products
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);

        const response = await reportAPI.getTopSellingProducts({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 10,
        });

        setTopProducts(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setError(
          "Không thể tải danh sách sản phẩm bán chạy. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    if (activeTab === "products") {
      fetchTopProducts();
    }
  }, [activeTab, dateRange]);

  // Fetch inventory value
  useEffect(() => {
    const fetchInventoryValue = async () => {
      try {
        setLoading(true);

        const response = await reportAPI.getInventoryValueReport();

        setInventoryValue(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching inventory value:", error);
        setError(
          "Không thể tải báo cáo giá trị tồn kho. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    if (activeTab === "inventory") {
      fetchInventoryValue();
    }
  }, [activeTab]);

  // Fetch customer report
  useEffect(() => {
    const fetchCustomerReport = async () => {
      try {
        setLoading(true);

        const response = await reportAPI.getCustomerReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        console.log("Customer data received:", response.data);
        setCustomerData(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching customer report:", error);
        setError("Không thể tải báo cáo khách hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (activeTab === "customers") {
      fetchCustomerReport();
    }
  }, [activeTab, dateRange]);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    // Refetch data based on active tab
    setLoading(true);
  };

  // Prepare chart data for sales
  const salesChartData = {
    labels: salesData.map((item) => item.date),
    datasets: [
      {
        label: "Doanh thu",
        data: salesData.map((item) => item.totalSales),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Số đơn hàng",
        data: salesData.map((item) => item.orderCount),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };

  // Prepare chart data for top products
  const topProductsChartData = {
    labels: topProducts.map((item) => item.name),
    datasets: [
      {
        label: "Số lượng bán",
        data: topProducts.map((item) => item.totalQuantity),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(199, 199, 199, 0.5)",
          "rgba(83, 102, 255, 0.5)",
          "rgba(40, 159, 64, 0.5)",
          "rgba(210, 199, 199, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(83, 102, 255, 1)",
          "rgba(40, 159, 64, 1)",
          "rgba(210, 199, 199, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for inventory value
  const inventoryValueChartData = {
    labels:
      inventoryValue.inventoryByCategory?.map(
        (item) => item["category.name"]
      ) || [],
    datasets: [
      {
        label: "Giá trị tồn kho",
        data:
          inventoryValue.inventoryByCategory?.map((item) => item.totalValue) ||
          [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for customers
  const customerChartData = {
    labels:
      customerData.topCustomers?.map((item) => {
        // Kiểm tra các cách truy cập tên khách hàng khác nhau
        console.log("Customer item:", item);
        return (
          item.fullName ||
          item["customer.fullName"] ||
          item.username ||
          item["customer.username"] ||
          "Unknown"
        );
      }) || [],
    datasets: [
      {
        label: "Tổng chi tiêu",
        data:
          customerData.topCustomers?.map((item) => {
            console.log(
              "Customer totalSpent:",
              item.totalSpent,
              typeof item.totalSpent
            );
            const spent = Number(item.totalSpent) || 0;
            console.log("Converted spent:", spent);
            return spent;
          }) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Báo Cáo & Thống Kê</h1>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="sales" title="Doanh Thu" />
              <Tab eventKey="products" title="Sản Phẩm" />
              <Tab eventKey="inventory" title="Tồn Kho" />
              <Tab eventKey="customers" title="Khách Hàng" />
            </Tabs>

            {/* Date Range Filter */}
            <Row className="mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                  />
                </Form.Group>
              </Col>
              {activeTab === "sales" && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Nhóm theo</Form.Label>
                    <Form.Select
                      name="groupBy"
                      value={dateRange.groupBy}
                      onChange={handleDateRangeChange}
                    >
                      <option value="day">Ngày</option>
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={3} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="w-100"
                >
                  <FaCalendarAlt className="me-2" />
                  Áp dụng
                </Button>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Sales Report */}
                {activeTab === "sales" && (
                  <>
                    <Row className="mb-4">
                      <Col>
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Biểu đồ doanh thu</h5>
                            {/* <Button variant="outline-primary" size="sm">
                              <FaDownload className="me-2" />
                              Xuất báo cáo
                            </Button> */}
                          </Card.Header>
                          <Card.Body>
                            {salesData.length > 0 ? (
                              <Line
                                data={salesChartData}
                                options={{
                                  responsive: true,
                                  scales: {
                                    y: {
                                      type: "linear",
                                      display: true,
                                      position: "left",
                                      title: {
                                        display: true,
                                        text: "Doanh thu ($)",
                                      },
                                    },
                                    y1: {
                                      type: "linear",
                                      display: true,
                                      position: "right",
                                      grid: {
                                        drawOnChartArea: false,
                                      },
                                      title: {
                                        display: true,
                                        text: "Số đơn hàng",
                                      },
                                    },
                                  },
                                }}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">
                                  Không có dữ liệu doanh thu trong khoảng thời
                                  gian này
                                </p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Tổng quan doanh thu</h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={4} className="text-center mb-3 mb-md-0">
                                <h6 className="text-muted">Tổng doanh thu</h6>
                                <h3 className="text-primary">
                                  {formatCurrency(
                                    salesData.reduce(
                                      (total, item) =>
                                        total +
                                        parseFloat(item.totalSales || 0),
                                      0
                                    )
                                  )}
                                </h3>
                              </Col>
                              <Col md={4} className="text-center mb-3 mb-md-0">
                                <h6 className="text-muted">Tổng đơn hàng</h6>
                                <h3 className="text-success">
                                  {salesData.reduce(
                                    (total, item) =>
                                      total + parseInt(item.orderCount || 0),
                                    0
                                  )}
                                </h3>
                              </Col>
                              <Col md={4} className="text-center">
                                <h6 className="text-muted">
                                  Giá trị đơn hàng trung bình
                                </h6>
                                <h3 className="text-info">
                                  {salesData.length > 0
                                    ? formatCurrency(
                                        salesData.reduce(
                                          (total, item) =>
                                            total +
                                            parseFloat(item.totalSales || 0),
                                          0
                                        ) /
                                          salesData.reduce(
                                            (total, item) =>
                                              total +
                                              parseInt(item.orderCount || 0),
                                            0
                                          )
                                      )
                                    : formatCurrency(0)}
                                </h3>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Products Report */}
                {activeTab === "products" && (
                  <>
                    <Row className="mb-4">
                      <Col md={8}>
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Top 10 sản phẩm bán chạy</h5>
                            {/* <Button variant="outline-primary" size="sm">
                              <FaDownload className="me-2" />
                              Xuất báo cáo
                            </Button> */}
                          </Card.Header>
                          <Card.Body>
                            {topProducts.length > 0 ? (
                              <Bar
                                data={topProductsChartData}
                                options={{
                                  responsive: true,
                                  indexAxis: "y",
                                  plugins: {
                                    legend: {
                                      display: false,
                                    },
                                  },
                                }}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">
                                  Không có dữ liệu sản phẩm trong khoảng thời
                                  gian này
                                </p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Doanh thu theo sản phẩm</h5>
                          </Card.Header>
                          <Card.Body>
                            {topProducts.length > 0 ? (
                              <Pie
                                data={{
                                  labels: topProducts
                                    .slice(0, 5)
                                    .map((item) => item.name),
                                  datasets: [
                                    {
                                      label: "Doanh thu",
                                      data: topProducts
                                        .slice(0, 5)
                                        .map((item) => item.totalSales),
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
                                }}
                                options={{
                                  responsive: true,
                                }}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">Không có dữ liệu</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Inventory Report */}
                {activeTab === "inventory" && (
                  <>
                    <Row className="mb-4">
                      <Col md={8}>
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                              Giá trị tồn kho theo danh mục
                            </h5>
                            {/* <Button variant="outline-primary" size="sm">
                              <FaDownload className="me-2" />
                              Xuất báo cáo
                            </Button> */}
                          </Card.Header>
                          <Card.Body>
                            {inventoryValue.inventoryByCategory?.length > 0 ? (
                              <Bar
                                data={inventoryValueChartData}
                                options={{
                                  responsive: true,
                                }}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">Không có dữ liệu tồn kho</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Phân bổ tồn kho</h5>
                          </Card.Header>
                          <Card.Body>
                            {inventoryValue.inventoryByCategory?.length > 0 ? (
                              <Doughnut
                                data={inventoryValueChartData}
                                options={{
                                  responsive: true,
                                }}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">Không có dữ liệu</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Tổng quan tồn kho</h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={4} className="text-center mb-3 mb-md-0">
                                <h6 className="text-muted">
                                  Tổng giá trị tồn kho
                                </h6>
                                <h3 className="text-primary">
                                  {formatCurrency(
                                    inventoryValue.totalValue || 0
                                  )}
                                </h3>
                              </Col>
                              <Col md={4} className="text-center mb-3 mb-md-0">
                                <h6 className="text-muted">Tổng số sản phẩm</h6>
                                <h3 className="text-success">
                                  {inventoryValue.inventoryByCategory?.reduce(
                                    (total, item) =>
                                      total + parseInt(item.productCount || 0),
                                    0
                                  ) || 0}
                                </h3>
                              </Col>
                              <Col md={4} className="text-center">
                                <h6 className="text-muted">Tổng số lượng</h6>
                                <h3 className="text-info">
                                  {inventoryValue.inventoryByCategory?.reduce(
                                    (total, item) =>
                                      total + parseInt(item.totalQuantity || 0),
                                    0
                                  ) || 0}
                                </h3>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Customers Report */}
                {activeTab === "customers" && (
                  <>
                    <Row className="mb-4">
                      <Col>
                        <Card>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                              Top khách hàng theo doanh thu
                            </h5>
                            {/* <Button variant="outline-primary" size="sm">
                              <FaDownload className="me-2" />
                              Xuất báo cáo
                            </Button> */}
                          </Card.Header>
                          <Card.Body>
                            {customerData.topCustomers?.length > 0 ? (
                              <Bar
                                data={customerChartData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        callback: function (value) {
                                          return "$" + value;
                                        },
                                      },
                                      title: {
                                        display: true,
                                        text: "Tổng chi tiêu ($)",
                                      },
                                    },
                                    x: {
                                      title: {
                                        display: true,
                                        text: "Khách hàng",
                                      },
                                    },
                                  },
                                  plugins: {
                                    legend: {
                                      display: true,
                                      position: "top",
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          return (
                                            context.dataset.label +
                                            ": $" +
                                            context.parsed.y
                                          );
                                        },
                                      },
                                    },
                                  },
                                }}
                                height={400}
                              />
                            ) : (
                              <div className="text-center my-5">
                                <p className="mb-0">
                                  Không có dữ liệu khách hàng trong khoảng thời
                                  gian này
                                </p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <Card>
                          <Card.Header>
                            <h5 className="mb-0">Tổng quan khách hàng</h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={6} className="text-center mb-3 mb-md-0">
                                <h6 className="text-muted">Khách hàng mới</h6>
                                <h3 className="text-primary">
                                  {customerData.newCustomersCount || 0}
                                </h3>
                              </Col>
                              <Col md={6} className="text-center">
                                <h6 className="text-muted">Tổng số đơn hàng</h6>
                                <h3 className="text-success">
                                  {customerData.topCustomers?.reduce(
                                    (total, item) =>
                                      total + parseInt(item.orderCount || 0),
                                    0
                                  ) || 0}
                                </h3>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default Reports;
