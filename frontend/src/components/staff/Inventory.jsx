import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Dropdown,
  DropdownButton,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaWarehouse,
  FaSearch,
  FaFilter,
  FaSort,
  FaInfoCircle,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { productAPI, inventoryAPI, categoryAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

// Debounce helper function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const StaffInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Apply debounce to search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Lấy dữ liệu sản phẩm từ API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách danh mục
        const categoriesRes = await categoryAPI.getAllCategories();
        setCategories(categoriesRes.data);

        // Lấy danh sách sản phẩm
        const productsRes = await productAPI.getAllProducts({
          limit: 1000, // Lấy tất cả sản phẩm
        });
        setProducts(productsRes.data.products);
        setFilteredProducts(productsRes.data.products);

        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Lấy lịch sử giao dịch từ API
  const fetchTransactionHistory = async (productId) => {
    try {
      // Lấy lịch sử giao dịch của sản phẩm
      const response = await inventoryAPI.getAllTransactions({
        productId: productId,
        limit: 100,
      });

      // Kiểm tra dữ liệu trả về
      if (response.data && response.data.transactions) {
        setTransactionHistory(response.data.transactions);
      } else if (Array.isArray(response.data)) {
        // Trường hợp API trả về mảng trực tiếp
        setTransactionHistory(response.data);
      } else {
        // Trường hợp không có dữ liệu hoặc dữ liệu không đúng định dạng
        setTransactionHistory([]);
        console.warn("Transaction data format is unexpected:", response.data);
      }

      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      // Nếu có lỗi, hiển thị danh sách trống
      setTransactionHistory([]);
      setShowHistoryModal(true);
    }
  };

  // Lọc và sắp xếp sản phẩm
  useEffect(() => {
    let result = [...products];

    // Lọc theo từ khóa tìm kiếm
    if (debouncedSearchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    // Lọc theo danh mục
    if (filterCategory !== "all") {
      result = result.filter(
        (product) => product.category && product.category.id === parseInt(filterCategory)
      );
    }

    // Lọc theo tình trạng tồn kho
    if (filterStock === "low") {
      result = result.filter(
        (product) => product.quantity > 0 && product.quantity <= product.minQuantity
      );
    } else if (filterStock === "out") {
      result = result.filter((product) => product.quantity === 0);
    } else if (filterStock === "in") {
      result = result.filter((product) => product.quantity > 0);
    }

    // Sắp xếp
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "price") {
        comparison = a.price - b.price;
      } else if (sortField === "quantity") {
        comparison = a.quantity - b.quantity;
      } else if (sortField === "category") {
        comparison = a.category.name.localeCompare(b.category.name);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredProducts(result);
  }, [
    products,
    debouncedSearchTerm,
    filterCategory,
    filterStock,
    sortField,
    sortDirection,
  ]);

  // Xử lý khi xem chi tiết sản phẩm
  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  // Xử lý khi xem lịch sử giao dịch
  const handleViewHistory = (productId) => {
    fetchTransactionHistory(productId);
  };

  // Hiển thị badge cho tình trạng tồn kho
  const renderStockStatus = (product) => {
    if (product.quantity === 0) {
      return <Badge bg="danger">Hết hàng</Badge>;
    } else if (product.quantity <= product.minQuantity) {
      return <Badge bg="warning">Sắp hết hàng</Badge>;
    } else {
      return <Badge bg="success">Còn hàng</Badge>;
    }
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaWarehouse className="me-2" />
            Quản Lý Tồn Kho
          </h1>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {/* Bộ lọc và tìm kiếm */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaSearch className="me-1" /> Tìm kiếm
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {debouncedSearchTerm && filteredProducts.length === 0 && (
                    <Form.Text className="text-muted">
                      Không tìm thấy sản phẩm phù hợp
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaFilter className="me-1" /> Danh mục
                  </Form.Label>
                  <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaFilter className="me-1" /> Tình trạng
                  </Form.Label>
                  <Form.Select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="in">Còn hàng</option>
                    <option value="low">Sắp hết hàng</option>
                    <option value="out">Hết hàng</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaSort className="me-1" /> Sắp xếp theo
                  </Form.Label>
                  <InputGroup>
                    <Form.Select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                    >
                      <option value="name">Tên sản phẩm</option>
                      <option value="price">Giá</option>
                      <option value="quantity">Số lượng</option>
                      <option value="category">Danh mục</option>
                    </Form.Select>
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Danh sách sản phẩm */}
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Mã SKU</th>
                      <th>Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Thuế (%)</th>
                      <th>Vị trí</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>{product.category.name}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          {product.quantity} / {product.minQuantity}
                          {product.quantity <= product.minQuantity && (
                            <FaExclamationTriangle className="text-warning ms-2" />
                          )}
                        </td>
                        <td>{product.tax ?? 0}</td>
                        <td>{product.location}</td>
                        <td>{renderStockStatus(product)}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-1"
                            onClick={() => handleViewDetail(product)}
                          >
                            <FaInfoCircle /> Chi tiết
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleViewHistory(product.id)}
                          >
                            <FaHistory /> Lịch sử
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      Không tìm thấy sản phẩm nào phù hợp với điều kiện lọc.
                    </p>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Modal Chi tiết sản phẩm */}
        <Modal
          show={showProductDetail}
          onHide={() => setShowProductDetail(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết sản phẩm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <Row>
                <Col md={4}>
                  <img
                    src={selectedProduct.image ? `http://localhost:5000/${selectedProduct.image}` : 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={selectedProduct.name}
                    className="img-fluid rounded mb-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    }}
                  />
                </Col>
                <Col md={8}>
                  <h4>{selectedProduct.name}</h4>
                  <p className="text-muted">SKU: {selectedProduct.sku}</p>
                  <p>{selectedProduct.description}</p>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td width="30%">
                          <strong>Danh mục</strong>
                        </td>
                        <td>{selectedProduct.category.name}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Giá</strong>
                        </td>
                        <td>{formatCurrency(selectedProduct.price)}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Số lượng tồn kho</strong>
                        </td>
                        <td>
                          {selectedProduct.quantity} /{" "}
                          {selectedProduct.minQuantity} (Tối thiểu)
                          {selectedProduct.quantity <=
                            selectedProduct.minQuantity && (
                            <Badge bg="warning" className="ms-2">
                              Sắp hết hàng
                            </Badge>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Thuế</strong>
                        </td>
                        <td>{selectedProduct.tax ?? 0}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Vị trí trong kho</strong>
                        </td>
                        <td>{selectedProduct.location}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowProductDetail(false)}
            >
              Đóng
            </Button>
            {selectedProduct && (
              <Button
                variant="primary"
                onClick={() => {
                  setShowProductDetail(false);
                  handleViewHistory(selectedProduct.id);
                }}
              >
                <FaHistory className="me-1" /> Xem lịch sử giao dịch
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Modal Lịch sử giao dịch */}
        <Modal
          show={showHistoryModal}
          onHide={() => setShowHistoryModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Lịch sử giao dịch</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại giao dịch</th>
                  <th>Số lượng</th>
                  <th>Ghi chú</th>
                  <th>Người thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(transaction.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      {transaction.type === "in" ? (
                        <Badge bg="success">Nhập kho</Badge>
                      ) : transaction.type === "out" ? (
                        <Badge bg="danger">Xuất kho</Badge>
                      ) : (
                        <Badge bg="info">Điều chỉnh</Badge>
                      )}
                    </td>
                    <td>
                      {transaction.type === "in" ? "+" : ""}
                      {transaction.quantity}
                    </td>
                    <td>{transaction.note}</td>
                    <td>{transaction.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {transactionHistory.length === 0 && (
              <Alert variant="info">
                Không có lịch sử giao dịch cho sản phẩm này.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowHistoryModal(false)}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffInventory;
