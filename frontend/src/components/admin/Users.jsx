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
  FaTrash,
  FaSearch,
  FaTimes,
  FaLock,
  FaUnlock,
  FaCheck,
} from "react-icons/fa";
import AdminLayout from "./Layout";
import { userAPI } from "../../services/api";

const AdminUsers = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', or 'password'
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
  });
  
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    role: "",
    isActive: "",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Prepare filter params
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...activeFilters,
        };

        // Get users
        const usersRes = await userAPI.getAllUsers(params);
        setUsers(usersRes.data.users);
        setPagination({
          ...pagination,
          totalPages: usersRes.data.pagination?.totalPages || 1,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [pagination.currentPage, pagination.itemsPerPage, activeFilters]);

  // Validation schema for user
  const userValidationSchema = Yup.object({
    username: Yup.string()
      .required("Tên đăng nhập là bắt buộc")
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email là bắt buộc"),
    password: Yup.string().when("$isEdit", {
      is: false,
      then: Yup.string()
        .required("Mật khẩu là bắt buộc")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    }),
    fullName: Yup.string().required("Họ tên là bắt buộc"),
    role: Yup.string().required("Vai trò là bắt buộc"),
    phone: Yup.string()
      .matches(/^[0-9]*$/, "Số điện thoại chỉ được chứa số")
      .min(10, "Số điện thoại phải có ít nhất 10 số")
      .nullable(),
  });

  // Handle create user modal
  const handleCreateUser = () => {
    setModalMode("add");
    setCurrentUser(null);
    setShowModal(true);
  };

  // Handle edit user modal
  const handleEditUser = (user) => {
    setModalMode("edit");
    setCurrentUser(user);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError("");
      setSuccess("");

      if (modalMode === "add") {
        // Create user
        await userAPI.createUser(values);
        setSuccess("Người dùng đã được tạo thành công!");
      } else if (modalMode === "edit") {
        // Update user
        await userAPI.updateUser(currentUser.id, values);
        setSuccess("Người dùng đã được cập nhật thành công!");
      }

      // Close modal and reset form
      handleCloseModal();
      resetForm();

      // Refresh users
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const usersRes = await userAPI.getAllUsers(params);
      setUsers(usersRes.data.users);

      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting user:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      setSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      setError("");
      setSuccess("");

      // Delete user
      await userAPI.deleteUser(userId);

      // Show success message
      setSuccess("Người dùng đã được xóa thành công!");

      // Close confirm modal
      setConfirmDelete(null);

      // Refresh users
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const usersRes = await userAPI.getAllUsers(params);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Đã xảy ra lỗi khi xóa người dùng. Vui lòng thử lại sau.");
    }
  };

  // Handle toggle user active status
  const handleToggleActive = async (user) => {
    try {
      setError("");
      setSuccess("");

      // Update user
      await userAPI.updateUser(user.id, {
        isActive: !user.isActive,
      });

      // Show success message
      setSuccess(
        `Người dùng đã được ${
          user.isActive ? "vô hiệu hóa" : "kích hoạt"
        } thành công!`
      );

      // Refresh users
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const usersRes = await userAPI.getAllUsers(params);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error("Error toggling user active status:", error);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
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
    // Apply current filters as active filters
    setActiveFilters(filters);
    
    // Reset to first page when applying filters
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    const emptyFilters = {
      search: "",
      role: "",
      isActive: "",
    };
    
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);

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
        <h1 className="mb-4">Quản Lý Người Dùng</h1>

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
              <h5 className="mb-0">Danh sách người dùng</h5>
              <Button variant="primary" onClick={handleCreateUser}>
                <FaPlus className="me-2" />
                Thêm người dùng
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tìm kiếm</Form.Label>
                      <Form.Control
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Tên, email, số điện thoại..."
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò</Form.Label>
                      <Form.Select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="staff">Nhân viên</option>
                        <option value="customer">Khách hàng</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select
                        name="isActive"
                        value={filters.isActive}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả</option>
                        <option value="true">Đang hoạt động</option>
                        <option value="false">Đã vô hiệu hóa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <div className="d-flex flex-column w-100">
                      <Button
                        variant="primary"
                        className="mb-2"
                        onClick={handleApplyFilters}
                        title="Áp dụng bộ lọc"
                      >
                        <FaSearch />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleResetFilters}
                        title="Xóa bộ lọc"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : users?.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || "-"}</td>
                          <td>
                            {user.role === "admin" ? (
                              <Badge bg="danger">Quản trị viên</Badge>
                            ) : user.role === "staff" ? (
                              <Badge bg="primary">Nhân viên</Badge>
                            ) : (
                              <Badge bg="success">Khách hàng</Badge>
                            )}
                          </td>
                          <td>
                            {user.isActive ? (
                              <Badge bg="success">Đang hoạt động</Badge>
                            ) : (
                              <Badge bg="danger">Đã vô hiệu hóa</Badge>
                            )}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditUser(user)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant={
                                user.isActive
                                  ? "outline-danger"
                                  : "outline-success"
                              }
                              size="sm"
                              className="me-1"
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.isActive ? <FaTimes /> : <FaCheck />}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => setConfirmDelete(user)}
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
                <p className="mb-0">Không có người dùng nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add"
              ? "Thêm người dùng mới"
              : "Chỉnh sửa người dùng"}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={
            currentUser
              ? {
                  username: currentUser.username,
                  email: currentUser.email,
                  fullName: currentUser.fullName,
                  phone: currentUser.phone || "",
                  address: currentUser.address || "",
                  role: currentUser.role,
                  isActive: currentUser.isActive,
                }
              : {
                  username: "",
                  email: "",
                  password: "",
                  fullName: "",
                  phone: "",
                  address: "",
                  role: "customer",
                  isActive: true,
                }
          }
          validationSchema={userValidationSchema}
          onSubmit={handleSubmit}
          context={{ isEdit: modalMode === "edit" }}
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
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên đăng nhập</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && errors.username}
                        disabled={modalMode === "edit"}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {modalMode === "add" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.fullName && errors.fullName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.phone && errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Vai trò</Form.Label>
                      <Form.Select
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.role && errors.role}
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="staff">Nhân viên</option>
                        <option value="admin">Quản trị viên</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.role}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Kích hoạt tài khoản"
                    name="isActive"
                    checked={values.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Đang xử lý..."
                    : modalMode === "add"
                    ? "Thêm người dùng"
                    : "Lưu thay đổi"}
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
          <p>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{confirmDelete?.fullName}</strong>?
          </p>
          <p className="text-danger mb-0">
            Lưu ý: Hành động này không thể hoàn tác.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteUser(confirmDelete.id)}
          >
            Xóa người dùng
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsers;
