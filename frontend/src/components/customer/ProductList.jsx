import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Pagination,
  Alert,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaFilter, FaSort, FaSearch, FaShoppingCart } from "react-icons/fa";
import CustomerLayout from "./Layout";
import { productAPI, categoryAPI } from "../../services/api";
import CartContext from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Get cart context
  const { addToCart } = useContext(CartContext);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 12,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: queryParams.get("search") || "",
    category: queryParams.get("category") || "",
    minPrice: queryParams.get("minPrice") || "",
    maxPrice: queryParams.get("maxPrice") || "",
    inStock: queryParams.get("inStock") === "true",
    sortBy: queryParams.get("sortBy") || "name",
    sortOrder: queryParams.get("sortOrder") || "asc",
  });

  // Fetch products and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get categories
      const categoriesRes = await categoryAPI.getAllCategories();
      setCategories(categoriesRes.data);

      // Get products with filters
      const page = queryParams.get("page") || 1;
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search: queryParams.get("search") || "",
        category: queryParams.get("category") || "",
        minPrice: queryParams.get("minPrice") || "",
        maxPrice: queryParams.get("maxPrice") || "",
        inStock: queryParams.get("inStock") === "true" ? "true" : undefined,
        sortBy: queryParams.get("sortBy") || "name",
        sortOrder: queryParams.get("sortOrder") || "asc",
      };

      console.log("Fetching products with params:", params);
      const productsRes = await productAPI.getAllProducts(params);
      setProducts(productsRes.data.products);
      setPagination({
        currentPage: parseInt(page),
        totalPages: productsRes.data.pagination.totalPages,
        itemsPerPage: productsRes.data.pagination.itemsPerPage,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [queryParams, pagination.itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();

    // Only add parameters if they have values
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.inStock) params.append("inStock", "true");

    // Always include sort parameters
    params.append("sortBy", filters.sortBy);
    params.append("sortOrder", filters.sortOrder);

    // Reset to page 1 when applying new filters
    params.append("page", "1");

    navigate(`/products?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    setFilters({
      ...filters,
      sortBy,
      sortOrder,
    });

    // Apply sort immediately
    const params = new URLSearchParams(location.search);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to page 1

    navigate(`/products?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sortBy: "name",
      sortOrder: "asc",
    });
    navigate("/products");
  };

  // Handle pagination
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate(`/products?${params.toString()}`);
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

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Add product to cart with quantity 1
    addToCart(product, 1);

    // Set product for toast notification
    setAddedProduct(product);

    // Show toast notification
    setShowToast(true);
  };

  return (
    <CustomerLayout>
      <Container className="py-4">
        {/* Toast notification */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ zIndex: 1 }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Giỏ hàng</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {addedProduct && `Đã thêm ${addedProduct.name} vào giỏ hàng!`}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <h1 className="mb-4">Danh Sách Sản Phẩm</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaFilter className="me-2" />
                  Bộ Lọc
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSearchSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tìm Kiếm</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="AMD, Intel..."
                      />
                      <Button variant="outline-primary" type="submit">
                        <FaSearch />
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Danh Mục</Form.Label>
                    <Form.Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Giá (VND)</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Từ"
                          min="0"
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Đến"
                          min="0"
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="inStock"
                      checked={filters.inStock}
                      onChange={handleFilterChange}
                      label="Chỉ hiển thị sản phẩm còn hàng"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Sắp Xếp Theo</Form.Label>
                    <Form.Select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                    >
                      <option value="name">Tên sản phẩm</option>
                      <option value="price">Giá</option>
                      <option value="createdAt">Mới nhất</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Thứ Tự</Form.Label>
                    <Form.Select
                      name="sortOrder"
                      value={filters.sortOrder}
                      onChange={handleFilterChange}
                    >
                      <option value="asc">Tăng dần</option>
                      <option value="desc">Giảm dần</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={applyFilters}>
                      Áp Dụng Bộ Lọc
                    </Button>
                    <Button variant="outline-secondary" onClick={resetFilters}>
                      Đặt Lại
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Grid */}
          <Col lg={9}>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <Row className="mb-3 align-items-center">
                  <Col md={6}>
                    <p className="mb-0">Hiển thị {products.length} sản phẩm</p>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-md-end align-items-center">
                      <span className="me-2">Sắp xếp theo:</span>
                      <div className="d-flex">
                        <Button
                          variant={
                            filters.sortBy === "name"
                              ? "primary"
                              : "outline-secondary"
                          }
                          size="sm"
                          className="me-1"
                          onClick={() =>
                            handleSortChange(
                              "name",
                              filters.sortBy === "name" &&
                                filters.sortOrder === "asc"
                                ? "desc"
                                : "asc"
                            )
                          }
                        >
                          Tên{" "}
                          {filters.sortBy === "name" &&
                            (filters.sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "price"
                              ? "primary"
                              : "outline-secondary"
                          }
                          size="sm"
                          className="me-1"
                          onClick={() =>
                            handleSortChange(
                              "price",
                              filters.sortBy === "price" &&
                                filters.sortOrder === "asc"
                                ? "desc"
                                : "asc"
                            )
                          }
                        >
                          Giá{" "}
                          {filters.sortBy === "price" &&
                            (filters.sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                        <Button
                          variant={
                            filters.sortBy === "createdAt"
                              ? "primary"
                              : "outline-secondary"
                          }
                          size="sm"
                          onClick={() =>
                            handleSortChange(
                              "createdAt",
                              filters.sortBy === "createdAt" &&
                                filters.sortOrder === "asc"
                                ? "desc"
                                : "asc"
                            )
                          }
                        >
                          Mới nhất{" "}
                          {filters.sortBy === "createdAt" &&
                            (filters.sortOrder === "asc" ? "↑" : "↓")}
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row>
                  {products.map((product) => (
                    <Col lg={4} md={6} className="mb-4" key={product.id}>
                      <Card className="h-100 shadow-sm product-card">
                        <div className="product-img-container bg-light p-3 text-center">
                          {product.image ? (
                            <Card.Img
                              variant="top"
                              src={`http://localhost:5000/${product.image}`}
                              alt={product.name}
                              className="product-img"
                            />
                          ) : (
                            <div className="placeholder-img d-flex align-items-center justify-content-center">
                              <span className="text-muted">
                                Không có hình ảnh
                              </span>
                            </div>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="product-title">
                            {product.name}
                          </Card.Title>
                          <Card.Text className="text-muted small mb-2">
                            {product.category?.name}
                          </Card.Text>
                          <Card.Text className="product-price fw-bold mb-3">
                            {formatCurrency(product.price)}
                          </Card.Text>
                          <div className="d-flex justify-content-between mt-auto">
                            <Link
                              to={`/products/${product.id}`}
                              className="w-100 me-2"
                            >
                              <Button
                                variant="primary"
                                className="w-100"
                                style={{ height: "100%" }}
                              >
                                Chi Tiết
                              </Button>
                            </Link>
                            <Button
                              variant="success"
                              className="w-100"
                              disabled={product.quantity <= 0}
                              onClick={() => handleAddToCart(product)}
                            >
                              <FaShoppingCart className="me-1" />
                              {product.quantity > 0
                                ? "Thêm Vào Giỏ"
                                : "Hết Hàng"}
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

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
                <h4>Không tìm thấy sản phẩm nào</h4>
                <p>Vui lòng thử lại với bộ lọc khác</p>
                <Button variant="primary" onClick={resetFilters}>
                  Xem Tất Cả Sản Phẩm
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </CustomerLayout>
  );
};

export default ProductList;
