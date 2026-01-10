import React, { useState, useEffect } from "react";
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
  Spinner,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  FaPlus,
  FaSearch,
  FaArrowDown,
  FaExclamationTriangle,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { inventoryAPI, productAPI } from "../../services/api";

const StaffInventoryIn = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Validation schema
  const transactionSchema = Yup.object().shape({
    productId: Yup.number().required("Vui lòng chọn sản phẩm"),
    quantity: Yup.number()
      .required("Vui lòng nhập số lượng")
      .positive("Số lượng phải lớn hơn 0")
      .integer("Số lượng phải là số nguyên"),
    reason: Yup.string().required("Vui lòng nhập lý do"),
    notes: Yup.string(),
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get low stock products
        const lowStockRes = await inventoryAPI.getLowStockProducts();
        setLowStockProducts(lowStockRes.data);

        // Get out of stock products
        const outOfStockRes = await inventoryAPI.getOutOfStockProducts();
        setOutOfStockProducts(outOfStockRes.data);

        // Get all products
        const productsRes = await productAPI.getAllProducts({
          limit: 1000, // Get all products for dropdown
        });
        setProducts(productsRes.data.products);
        setFilteredProducts(productsRes.data.products);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Handle creating a new transaction
  const handleCreateTransaction = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("");
      setSuccess("");

      // Create transaction
      await inventoryAPI.createTransaction({
        ...values,
        type: "in",
      });

      // Show success message
      setSuccess("Phiếu nhập kho đã được tạo và đang chờ duyệt!");

      // Close modal and reset form
      setShowModal(false);
      resetForm();

      // Refresh data
      const lowStockRes = await inventoryAPI.getLowStockProducts();
      setLowStockProducts(lowStockRes.data);

      const outOfStockRes = await inventoryAPI.getOutOfStockProducts();
      setOutOfStockProducts(outOfStockRes.data);

      setSubmitting(false);
    } catch (err) {
      console.error("Error creating transaction:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tạo phiếu nhập kho. Vui lòng thử lại sau."
      );
      setSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaArrowDown className="me-2 text-success" />
            Nhập Kho
          </h1>
          <Button
            variant="success"
            onClick={() => handleCreateTransaction(null)}
          >
            <FaPlus className="me-2" />
            Tạo Phiếu Nhập Kho
          </Button>
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
            <Form onSubmit={handleSearch} className="mb-4">
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <FaSearch className="me-1" /> Tìm kiếm sản phẩm
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên hoặc mã SKU sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Low Stock Products */}
                <h5 className="mb-3">
                  <FaExclamationTriangle className="text-warning me-2" />
                  Sản phẩm sắp hết hàng
                </h5>

                {lowStockProducts.length > 0 ? (
                  <div className="table-responsive mb-4">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>SKU</th>
                          <th>Số lượng hiện tại</th>
                          <th>Số lượng tối thiểu</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.quantity}</td>
                            <td>{product.minQuantity}</td>
                            <td>
                              <Badge bg="warning">Sắp hết hàng</Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCreateTransaction(product)}
                              >
                                Nhập kho
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted mb-4">
                    Không có sản phẩm nào sắp hết hàng
                  </p>
                )}

                {/* Out of Stock Products */}
                <h5 className="mb-3">
                  <FaExclamationTriangle className="text-danger me-2" />
                  Sản phẩm hết hàng
                </h5>

                {outOfStockProducts.length > 0 ? (
                  <div className="table-responsive mb-4">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>SKU</th>
                          <th>Số lượng tối thiểu</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outOfStockProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.minQuantity}</td>
                            <td>
                              <Badge bg="danger">Hết hàng</Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCreateTransaction(product)}
                              >
                                Nhập kho
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted mb-4">
                    Không có sản phẩm nào hết hàng
                  </p>
                )}

                {/* All Products */}
                <h5 className="mb-3">Tất cả sản phẩm</h5>

                {filteredProducts.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>SKU</th>
                          <th>Số lượng hiện tại</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.quantity}</td>
                            <td>
                              {product.quantity === 0 ? (
                                <Badge bg="danger">Hết hàng</Badge>
                              ) : product.quantity <= product.minQuantity ? (
                                <Badge bg="warning">Sắp hết hàng</Badge>
                              ) : (
                                <Badge bg="success">Còn hàng</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleCreateTransaction(product)}
                              >
                                Nhập kho
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">Không tìm thấy sản phẩm nào</p>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Transaction Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo Phiếu Nhập Kho</Modal.Title>
          </Modal.Header>
          <Formik
            initialValues={{
              productId: selectedProduct ? selectedProduct.id : "",
              quantity: "",
              reason: "restock",
              notes: "",
            }}
            validationSchema={transactionSchema}
            onSubmit={handleSubmit}
            enableReinitialize
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
                    <Form.Label>Sản phẩm</Form.Label>
                    {selectedProduct ? (
                      <Form.Control
                        type="text"
                        value={selectedProduct.name}
                        disabled
                      />
                    ) : (
                      <Form.Select
                        name="productId"
                        value={values.productId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.productId && errors.productId}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </Form.Select>
                    )}
                    <Form.Control.Feedback type="invalid">
                      {errors.productId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số lượng</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={values.quantity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.quantity && errors.quantity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.quantity}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Lý do</Form.Label>
                    <Form.Select
                      name="reason"
                      value={values.reason}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.reason && errors.reason}
                    >
                      <option value="restock">Bổ sung hàng tồn kho</option>
                      <option value="purchase">Mua hàng mới</option>
                      <option value="return">Hàng trả lại</option>
                      <option value="adjustment">Điều chỉnh số lượng</option>
                      <option value="other">Khác</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.reason}
                    </Form.Control.Feedback>
                  </Form.Group>

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

                  <Alert variant="info">
                    <small>
                      Lưu ý: Phiếu nhập kho sẽ được gửi đến quản trị viên để phê
                      duyệt.
                    </small>
                  </Alert>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      "Tạo phiếu nhập kho"
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffInventoryIn;
