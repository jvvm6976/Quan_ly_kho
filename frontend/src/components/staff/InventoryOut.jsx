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
  FaArrowUp,
  FaExclamationTriangle,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { inventoryAPI, productAPI } from "../../services/api";

const StaffInventoryOut = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState([]);
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

        // Get all products
        const productsRes = await productAPI.getAllProducts({
          limit: 1000, // Get all products for dropdown
          inStock: true, // Only get products that are in stock
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
        type: "out",
      });

      // Show success message
      setSuccess("Phiếu xuất kho đã được tạo và đang chờ duyệt!");

      // Close modal and reset form
      setShowModal(false);
      resetForm();

      // Refresh data
      const productsRes = await productAPI.getAllProducts({
        limit: 1000,
        inStock: true,
      });
      setProducts(productsRes.data.products);
      setFilteredProducts(productsRes.data.products);

      setSubmitting(false);
    } catch (err) {
      console.error("Error creating transaction:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tạo phiếu xuất kho. Vui lòng thử lại sau."
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
            <FaArrowUp className="me-2 text-danger" />
            Xuất Kho
          </h1>
          <Button
            variant="danger"
            onClick={() => handleCreateTransaction(null)}
          >
            <FaPlus className="me-2" />
            Tạo Phiếu Xuất Kho
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
                {/* All Products */}
                <h5 className="mb-3">Sản phẩm có thể xuất kho</h5>

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
                              {product.quantity <= product.minQuantity ? (
                                <Badge bg="warning">Sắp hết hàng</Badge>
                              ) : (
                                <Badge bg="success">Còn hàng</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCreateTransaction(product)}
                                disabled={product.quantity <= 0}
                              >
                                Xuất kho
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert variant="warning">
                    <FaExclamationTriangle className="me-2" />
                    Không tìm thấy sản phẩm nào có thể xuất kho. Vui lòng kiểm
                    tra lại kho hàng.
                  </Alert>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Transaction Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo Phiếu Xuất Kho</Modal.Title>
          </Modal.Header>
          <Formik
            initialValues={{
              productId: selectedProduct ? selectedProduct.id : "",
              quantity: "",
              reason: "order",
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
              setFieldValue,
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
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={product.quantity <= 0}
                          >
                            {product.name} ({product.sku}) - SL:{" "}
                            {product.quantity}
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
                      max={
                        selectedProduct
                          ? selectedProduct.quantity
                          : values.productId
                          ? products.find(
                              (p) => p.id === parseInt(values.productId)
                            )?.quantity
                          : 0
                      }
                    />
                    {selectedProduct && (
                      <Form.Text className="text-muted">
                        Số lượng tối đa có thể xuất: {selectedProduct.quantity}
                      </Form.Text>
                    )}
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
                      <option value="order">Đơn hàng</option>
                      <option value="return">Trả hàng nhà cung cấp</option>
                      <option value="damage">Hàng hỏng</option>
                      <option value="adjustment">Điều chỉnh số lượng</option>
                      <option value="other">Khác</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.reason}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {values.reason === "order" && (
                    <Form.Group className="mb-3">
                      <Form.Label>Mã đơn hàng</Form.Label>
                      <Form.Control
                        type="text"
                        name="reference"
                        value={values.reference || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập mã đơn hàng (nếu có)"
                      />
                    </Form.Group>
                  )}

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
                      Lưu ý: Phiếu xuất kho sẽ được gửi đến quản trị viên để phê
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
                    variant="danger"
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
                      "Tạo phiếu xuất kho"
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

export default StaffInventoryOut;
