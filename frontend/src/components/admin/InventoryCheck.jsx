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
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  FaPlus,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSearch,
  FaClipboardCheck,
  FaArrowRight,
} from "react-icons/fa";
import AdminLayout from "./Layout";
import { inventoryAPI, productAPI } from "../../services/api";

const AdminInventoryCheck = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventoryChecks, setInventoryChecks] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentCheck, setCurrentCheck] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  // Fetch inventory checks
  useEffect(() => {
    const fetchInventoryChecks = async () => {
      try {
        setLoading(true);

        // Prepare filter params
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        };

        // Get inventory checks
        const checksRes = await inventoryAPI.getAllInventoryChecks(params);
        setInventoryChecks(checksRes.data.inventoryChecks);
        setPagination({
          ...pagination,
          totalPages: checksRes.data.pagination.totalPages,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching inventory checks:", error);
        setError("Không thể tải danh sách kiểm kê. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchInventoryChecks();
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Fetch products for create check modal
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get all products
        const productsRes = await productAPI.getAllProducts({
          limit: 1000, // Get all products for selection
        });
        setProducts(productsRes.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (showModal) {
      fetchProducts();
    }
  }, [showModal]);

  // Fetch check details when a check is selected
  useEffect(() => {
    const fetchCheckDetails = async () => {
      try {
        if (!currentCheck) return;

        setLoading(true);

        // Get check details
        const checkRes = await inventoryAPI.getInventoryCheckById(
          currentCheck.id
        );
        setCurrentCheck(checkRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching check details:", error);
        setError("Không thể tải chi tiết kiểm kê. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (currentCheck && showCheckModal) {
      fetchCheckDetails();
    }
  }, [currentCheck?.id, showCheckModal]);

  // Validation schema for inventory check
  const inventoryCheckValidationSchema = Yup.object({
    notes: Yup.string(),
  });

  // Handle create check modal
  const handleCreateCheck = () => {
    setSelectedProducts([]);
    setShowModal(true);
  };

  // Handle view check modal
  const handleViewCheck = (check) => {
    setCurrentCheck(check);
    setShowCheckModal(true);
  };

  // Handle close modals
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducts([]);
  };

  const handleCloseCheckModal = () => {
    setShowCheckModal(false);
    setCurrentCheck(null);
  };

  // Handle product selection
  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    } else {
      setSelectedProducts((prev) => [...prev, productId]);
    }
  };

  // Handle select all products
  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  // Handle form submission for creating inventory check
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("");
      setSuccess("");

      // Create inventory check
      await inventoryAPI.createInventoryCheck({
        notes: values.notes,
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined,
      });

      // Show success message
      setSuccess("Đợt kiểm kê đã được tạo thành công!");

      // Close modal and reset form
      handleCloseModal();
      resetForm();

      // Refresh inventory checks
      const checksRes = await inventoryAPI.getAllInventoryChecks({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      });
      setInventoryChecks(checksRes.data.inventoryChecks);
      setPagination({
        ...pagination,
        totalPages: checksRes.data.pagination.totalPages,
      });

      setSubmitting(false);
    } catch (error) {
      console.error("Error creating inventory check:", error);
      setError("Đã xảy ra lỗi khi tạo đợt kiểm kê. Vui lòng thử lại sau.");
      setSubmitting(false);
    }
  };

  // Handle update check status
  const handleUpdateStatus = async (checkId, status) => {
    try {
      setError("");
      setSuccess("");

      // Update check status
      await inventoryAPI.updateInventoryCheckStatus(checkId, { status });

      // Show success message
      setSuccess(
        `Trạng thái kiểm kê đã được cập nhật thành ${
          status === "in_progress"
            ? "Đang tiến hành"
            : status === "completed"
            ? "Hoàn thành"
            : "Đã hủy"
        }!`
      );

      // Refresh inventory checks
      const checksRes = await inventoryAPI.getAllInventoryChecks({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      });
      setInventoryChecks(checksRes.data.inventoryChecks);
      setPagination({
        ...pagination,
        totalPages: checksRes.data.pagination.totalPages,
      });

      // If current check is open, refresh it
      if (currentCheck && currentCheck.id === checkId) {
        const checkRes = await inventoryAPI.getInventoryCheckById(checkId);
        setCurrentCheck(checkRes.data);
      }
    } catch (error) {
      console.error("Error updating check status:", error);
      setError(
        "Đã xảy ra lỗi khi cập nhật trạng thái kiểm kê. Vui lòng thử lại sau."
      );
    }
  };

  // Handle update check item
  const handleUpdateCheckItem = async (
    checkId,
    itemId,
    actualQuantity,
    notes
  ) => {
    try {
      setError("");
      setSuccess("");

      // Update check item
      await inventoryAPI.updateInventoryCheckItem(checkId, itemId, {
        actualQuantity,
        notes,
      });

      // Show success message
      setSuccess("Đã cập nhật số lượng thực tế!");

      // Refresh current check
      const checkRes = await inventoryAPI.getInventoryCheckById(checkId);
      setCurrentCheck(checkRes.data);
    } catch (error) {
      console.error("Error updating check item:", error);
      setError(
        "Đã xảy ra lỗi khi cập nhật số lượng thực tế. Vui lòng thử lại sau."
      );
    }
  };

  // Handle apply adjustments
  const handleApplyAdjustments = async (checkId) => {
    try {
      setError("");
      setSuccess("");

      // Apply adjustments
      await inventoryAPI.applyInventoryCheckAdjustments(checkId);

      // Show success message
      setSuccess("Đã áp dụng điều chỉnh kho thành công!");

      // Refresh current check
      const checkRes = await inventoryAPI.getInventoryCheckById(checkId);
      setCurrentCheck(checkRes.data);
    } catch (error) {
      console.error("Error applying adjustments:", error);
      setError(
        "Đã xảy ra lỗi khi áp dụng điều chỉnh kho. Vui lòng thử lại sau."
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
    // Reset to first page when applying filters
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
    });

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
        <h1 className="mb-4">Kiểm Kê Kho</h1>

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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Danh sách đợt kiểm kê</h5>
              <Button variant="primary" onClick={handleCreateCheck}>
                <FaPlus className="me-2" />
                Tạo đợt kiểm kê mới
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="in_progress">Đang tiến hành</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
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
                  <Col md={3}>
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
                  {/* <Col md={2} className="d-flex align-items-end">
                    <div className="d-flex flex-column w-100">
                      <Button
                        variant="primary"
                        className="mb-2"
                        onClick={handleApplyFilters}
                      >
                        <FaSearch className="me-2" />
                        Lọc
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleResetFilters}
                      >
                        <FaTimes className="me-2" />
                        Đặt lại
                      </Button>
                    </div>
                  </Col> */}
                </Row>
              </Card.Body>
            </Card>

            {loading && !showCheckModal ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : inventoryChecks.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Mã kiểm kê</th>
                        <th>Ngày tạo</th>
                        <th>Người tạo</th>
                        <th>Trạng thái</th>
                        <th>Ngày hoàn thành</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryChecks.map((check) => (
                        <tr key={check.id}>
                          <td>{check.checkNumber}</td>
                          <td>
                            {new Date(check.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td>{check.creator?.fullName}</td>
                          <td>
                            {check.status === "pending" ? (
                              <Badge bg="warning">Chờ xử lý</Badge>
                            ) : check.status === "in_progress" ? (
                              <Badge bg="primary">Đang tiến hành</Badge>
                            ) : check.status === "completed" ? (
                              <Badge bg="success">Hoàn thành</Badge>
                            ) : (
                              <Badge bg="danger">Đã hủy</Badge>
                            )}
                          </td>
                          <td>
                            {check.endDate
                              ? new Date(check.endDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleViewCheck(check)}
                            >
                              <FaEdit className="me-1" />
                              Chi tiết
                            </Button>

                            {check.status === "pending" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(check.id, "in_progress")
                                }
                              >
                                <FaArrowRight className="me-1" />
                                Bắt đầu
                              </Button>
                            )}

                            {check.status === "in_progress" && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(check.id, "completed")
                                }
                              >
                                <FaCheck className="me-1" />
                                Hoàn thành
                              </Button>
                            )}
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
                <p className="mb-0">Không có đợt kiểm kê nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Create Inventory Check Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo đợt kiểm kê mới</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            notes: "",
          }}
          validationSchema={inventoryCheckValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.notes && errors.notes}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.notes}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">
                      Chọn sản phẩm cần kiểm kê
                    </Form.Label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleSelectAllProducts}
                    >
                      {selectedProducts.length === products.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </Button>
                  </div>
                  <Alert variant="info">
                    <small>
                      Nếu không chọn sản phẩm nào, tất cả sản phẩm đang hoạt
                      động sẽ được thêm vào đợt kiểm kê.
                    </small>
                  </Alert>
                  <div
                    className="border rounded p-3"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {products.map((product) => (
                      <Form.Check
                        key={product.id}
                        type="checkbox"
                        id={`product-${product.id}`}
                        label={`${product.name} - ${product.sku} (Tồn kho: ${product.quantity})`}
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Tạo đợt kiểm kê"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* View Inventory Check Modal */}
      <Modal show={showCheckModal} onHide={handleCloseCheckModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết kiểm kê: {currentCheck?.checkNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : currentCheck ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <p>
                    <strong>Mã kiểm kê:</strong> {currentCheck.checkNumber}
                  </p>
                  <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(currentCheck.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p>
                    <strong>Người tạo:</strong> {currentCheck.creator?.fullName}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {currentCheck.status === "pending" ? (
                      <Badge bg="warning">Chờ xử lý</Badge>
                    ) : currentCheck.status === "in_progress" ? (
                      <Badge bg="primary">Đang tiến hành</Badge>
                    ) : currentCheck.status === "completed" ? (
                      <Badge bg="success">Hoàn thành</Badge>
                    ) : (
                      <Badge bg="danger">Đã hủy</Badge>
                    )}
                  </p>
                  <p>
                    <strong>Ngày bắt đầu:</strong>{" "}
                    {currentCheck.startDate
                      ? new Date(currentCheck.startDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                  <p>
                    <strong>Ngày hoàn thành:</strong>{" "}
                    {currentCheck.endDate
                      ? new Date(currentCheck.endDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>

              {currentCheck.notes && (
                <div className="mb-4">
                  <h6>Ghi chú:</h6>
                  <p className="mb-0">{currentCheck.notes}</p>
                </div>
              )}

              <h6 className="mb-3">Danh sách sản phẩm kiểm kê:</h6>

              {currentCheck.items?.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>SKU</th>
                        <th>Số lượng hệ thống</th>
                        <th>Số lượng thực tế</th>
                        <th>Chênh lệch</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCheck.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{item.product?.sku}</td>
                          <td>{item.systemQuantity}</td>
                          <td>
                            {item.actualQuantity !== null
                              ? item.actualQuantity
                              : "-"}
                          </td>
                          <td>
                            {item.difference !== null ? (
                              <span
                                className={
                                  item.difference > 0
                                    ? "text-success"
                                    : item.difference < 0
                                    ? "text-danger"
                                    : ""
                                }
                              >
                                {item.difference > 0 ? "+" : ""}
                                {item.difference}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {item.status === "pending" ? (
                              <Badge bg="warning">Chờ kiểm kê</Badge>
                            ) : item.status === "checked" ? (
                              <Badge bg="primary">Đã kiểm kê</Badge>
                            ) : (
                              <Badge bg="success">Đã điều chỉnh</Badge>
                            )}
                          </td>
                          <td>{item.notes || "-"}</td>
                          <td>
                            {currentCheck.status === "in_progress" &&
                              item.status === "pending" && (
                                <CheckItemForm
                                  item={item}
                                  checkId={currentCheck.id}
                                  onSubmit={handleUpdateCheckItem}
                                />
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted">
                  Không có sản phẩm nào trong đợt kiểm kê này
                </p>
              )}
            </>
          ) : (
            <p className="text-center">Không tìm thấy thông tin kiểm kê</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCheckModal}>
            Đóng
          </Button>

          {currentCheck?.status === "pending" && (
            <Button
              variant="primary"
              onClick={() => handleUpdateStatus(currentCheck.id, "in_progress")}
            >
              <FaArrowRight className="me-2" />
              Bắt đầu kiểm kê
            </Button>
          )}

          {currentCheck?.status === "in_progress" && (
            <Button
              variant="success"
              onClick={() => handleUpdateStatus(currentCheck.id, "completed")}
            >
              <FaCheck className="me-2" />
              Hoàn thành kiểm kê
            </Button>
          )}

          {currentCheck?.status === "completed" && (
            <Button
              variant="warning"
              onClick={() => handleApplyAdjustments(currentCheck.id)}
              disabled={
                !currentCheck.items?.some(
                  (item) => item.status === "checked" && item.difference !== 0
                )
              }
            >
              <FaClipboardCheck className="me-2" />
              Áp dụng điều chỉnh
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

// Check Item Form Component
const CheckItemForm = ({ item, checkId, onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const [actualQuantity, setActualQuantity] = useState(item.systemQuantity);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(checkId, item.id, actualQuantity, notes);
    setLoading(false);
    setShowForm(false);
  };

  return (
    <>
      {showForm ? (
        <Form onSubmit={handleSubmit}>
          <div className="d-flex mb-2">
            <Form.Control
              type="number"
              min="0"
              value={actualQuantity}
              onChange={(e) => setActualQuantity(parseInt(e.target.value))}
              className="me-2"
              style={{ width: "80px" }}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <FaCheck />
              )}
            </Button>
          </div>
          <Form.Control
            type="text"
            placeholder="Ghi chú"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="sm"
          />
        </Form>
      ) : (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowForm(true)}
        >
          Kiểm kê
        </Button>
      )}
    </>
  );
};

export default AdminInventoryCheck;
