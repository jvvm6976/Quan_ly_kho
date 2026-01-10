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
  Pagination,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AdminLayout from "./Layout";
import ImageUpload from "../common/ImageUpload";
import { productAPI, categoryAPI } from "../../services/api";
import formatCurrency from "../../utils/formatCurrency";
const AdminProducts = () => {
  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get categories
        const categoriesRes = await categoryAPI.getAllCategories();
        setCategories(categoriesRes.data);

        // Get products
        const productsRes = await productAPI.getAllProducts({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: activeSearchTerm,
        });

        setProducts(productsRes.data.products);
        setPagination(prevPagination => ({
          ...prevPagination,
          totalPages: productsRes.data.pagination.totalPages,
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.itemsPerPage, activeSearchTerm]);

  // Validation schema
  const productValidationSchema = Yup.object({
    name: Yup.string().required("Tên sản phẩm là bắt buộc"),
    sku: Yup.string().required("Mã SKU là bắt buộc"),
    price: Yup.number()
      .required("Giá bán là bắt buộc")
      .positive("Giá bán phải là số dương"),
    costPrice: Yup.number()
      .required("Giá nhập là bắt buộc")
      .positive("Giá nhập phải là số dương"),
    quantity: Yup.number()
      .required("Số lượng là bắt buộc")
      .min(0, "Số lượng không được âm"),
    minQuantity: Yup.number()
      .required("Số lượng tối thiểu là bắt buộc")
      .min(0, "Số lượng tối thiểu không được âm"),
    categoryId: Yup.number().required("Danh mục là bắt buộc"),
  });

  // Handle modal open for add
  const handleAddProduct = () => {
    setModalMode("add");
    setCurrentProduct(null);
    setSelectedImage(null);
    setShowModal(true);
  };

  // Handle modal open for edit
  const handleEditProduct = (product) => {
    setModalMode("edit");
    setCurrentProduct(product);
    setSelectedImage(null);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
    setSelectedImage(null);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("");
      setSuccess("");

      // Create form data for file upload
      const formData = new FormData();

      // Add all values to form data with proper type conversion
      Object.keys(values).forEach((key) => {
        // Đảm bảo giá trị không phải là undefined
        if (values[key] !== undefined) {
          // Convert numeric fields to numbers
          if (["price", "costPrice", "quantity", "minQuantity", "categoryId"].includes(key)) {
            // Convert to number and ensure it's a valid number
            const numValue = Number(values[key]);
            formData.append(key, isNaN(numValue) ? 0 : numValue);
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Add image if selected
      if (selectedImage) {
        console.log(
          "Adding image to FormData:",
          selectedImage.name,
          selectedImage.type,
          selectedImage.size
        );
        formData.append("image", selectedImage);
      } else {
        console.log("No image selected");
      }

      // Log FormData entries for debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
        );
      }

      if (modalMode === "add") {
        // Create product
        console.log("Creating new product with FormData");
        await productAPI.createProduct(formData);
        setSuccess("Thêm sản phẩm thành công!");
      } else {
        // Update product
        console.log("Updating product ID:", currentProduct.id);
        await productAPI.updateProduct(currentProduct.id, formData);
        setSuccess("Cập nhật sản phẩm thành công!");
      }

      // Refresh product list
      const productsRes = await productAPI.getAllProducts({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: activeSearchTerm,
      });

      setProducts(productsRes.data.products);
      setPagination({
        ...pagination,
        totalPages: productsRes.data.pagination.totalPages,
      });

      // Close modal and reset form
      handleCloseModal();
      resetForm();

      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting product:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      setError("");
      setSuccess("");

      // Delete product
      await productAPI.deleteProduct(productId);

      // Refresh product list
      const productsRes = await productAPI.getAllProducts({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: activeSearchTerm,
      });

      setProducts(productsRes.data.products);
      setPagination({
        ...pagination,
        totalPages: productsRes.data.pagination.totalPages,
      });

      setSuccess("Xóa sản phẩm thành công!");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại sau.");
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchTerm(searchTerm);
    // Reset to first page when searching
    setPagination({
      ...pagination,
      currentPage: 1,
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page,
    });
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
        <h1 className="mb-4">Quản Lý Sản Phẩm</h1>

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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="primary" onClick={handleAddProduct}>
                <FaPlus className="me-2" />
                Thêm Sản Phẩm
              </Button>

              <Form onSubmit={handleSearch} className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="me-2"
                />
                <Button type="submit" variant="outline-primary">
                  <FaSearch />
                </Button>
              </Form>
            </div>

            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>SKU</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.image ? (
                              <img
                                src={`http://localhost:5000/${product.image}`}
                                alt={product.name}
                                width="50"
                                height="50"
                                className="img-thumbnail"
                              />
                            ) : (
                              <div
                                className="bg-light d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px" }}
                              >
                                <span className="text-muted small">No img</span>
                              </div>
                            )}
                          </td>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.category?.name}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{product.quantity}</td>
                          <td>
                            {product.quantity > product.minQuantity ? (
                              <span className="badge bg-success">Đủ hàng</span>
                            ) : product.quantity > 0 ? (
                              <span className="badge bg-warning">Sắp hết</span>
                            ) : (
                              <span className="badge bg-danger">Hết hàng</span>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditProduct(product)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => setConfirmDelete(product)}
                            >
                              <FaTrash />
                            </Button>
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
                <p className="mb-0">Không có sản phẩm nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={
            currentProduct
              ? {
                  name: currentProduct.name,
                  sku: currentProduct.sku,
                  description: currentProduct.description || "",
                  price: currentProduct.price,
                  costPrice: currentProduct.costPrice,
                  quantity: currentProduct.quantity,
                  minQuantity: currentProduct.minQuantity,
                  categoryId: currentProduct.categoryId,
                  location: currentProduct.location || "",
                  isActive: currentProduct.isActive,
                }
              : {
                  name: "",
                  sku: "",
                  description: "",
                  price: "",
                  costPrice: "",
                  quantity: 0,
                  minQuantity: 10,
                  categoryId: "",
                  location: "",
                  isActive: true,
                }
          }
          validationSchema={productValidationSchema}
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
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Modal.Body>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên sản phẩm</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Mã SKU</Form.Label>
                          <Form.Control
                            type="text"
                            name="sku"
                            value={values.sku}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.sku && errors.sku}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.sku}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Danh mục</Form.Label>
                          <Form.Select
                            name="categoryId"
                            value={values.categoryId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.categoryId && errors.categoryId}
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.categoryId}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Giá bán</Form.Label>
                          <Form.Control
                            type="number"
                            name="price"
                            value={values.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.price && errors.price}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.price}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Giá nhập</Form.Label>
                          <Form.Control
                            type="number"
                            name="costPrice"
                            value={values.costPrice}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.costPrice && errors.costPrice}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.costPrice}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
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
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số lượng tối thiểu</Form.Label>
                          <Form.Control
                            type="number"
                            name="minQuantity"
                            value={values.minQuantity}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={
                              touched.minQuantity && errors.minQuantity
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.minQuantity}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Vị trí trong kho</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={values.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Kích hoạt sản phẩm"
                        name="isActive"
                        checked={values.isActive}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <ImageUpload
                      onImageChange={(file) => setSelectedImage(file)}
                      currentImage={currentProduct?.image}
                    />

                    <Form.Group className="mb-3">
                      <Form.Label>Mô tả sản phẩm</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Đang xử lý..."
                    : modalMode === "add"
                    ? "Thêm sản phẩm"
                    : "Cập nhật sản phẩm"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa sản phẩm{" "}
          <strong>{confirmDelete?.name}</strong>?
          <p className="text-danger mt-2 mb-0">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteProduct(confirmDelete.id)}
          >
            Xóa sản phẩm
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default AdminProducts;
