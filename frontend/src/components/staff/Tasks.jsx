import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  InputGroup,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import {
  FaTasks,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaFilter,
  FaSort,
  FaSearch,
} from "react-icons/fa";
import StaffLayout from "./Layout";

const StaffTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortField, setSortField] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    status: "pending",
  });

  // Mô phỏng dữ liệu công việc
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    const mockTasks = [
      {
        id: 1,
        title: "Kiểm tra đơn hàng #ORD250522-001",
        description: "Xác nhận thông tin và chuẩn bị hàng cho đơn hàng",
        createdAt: "2023-05-20T08:00:00Z",
        dueDate: "2023-05-22T17:00:00Z",
        priority: "high",
        status: "completed",
        assignedTo: "Nhân viên A",
      },
      {
        id: 2,
        title: "Nhập kho sản phẩm mới",
        description: "Kiểm tra và nhập kho lô hàng mới từ nhà cung cấp",
        createdAt: "2023-05-21T09:30:00Z",
        dueDate: "2023-05-23T17:00:00Z",
        priority: "medium",
        status: "in-progress",
        assignedTo: "Nhân viên B",
      },
      {
        id: 3,
        title: "Kiểm kê kho quý 2",
        description: "Thực hiện kiểm kê toàn bộ kho hàng cho báo cáo quý 2",
        createdAt: "2023-05-15T10:00:00Z",
        dueDate: "2023-06-30T17:00:00Z",
        priority: "high",
        status: "pending",
        assignedTo: "Nhân viên C",
      },
      {
        id: 4,
        title: "Xử lý đơn hàng trả lại",
        description: "Kiểm tra và xử lý đơn hàng bị trả lại từ khách hàng",
        createdAt: "2023-05-22T11:00:00Z",
        dueDate: "2023-05-24T17:00:00Z",
        priority: "high",
        status: "pending",
        assignedTo: "Nhân viên A",
      },
      {
        id: 5,
        title: "Cập nhật thông tin sản phẩm",
        description: "Cập nhật thông tin và hình ảnh cho các sản phẩm mới",
        createdAt: "2023-05-18T13:30:00Z",
        dueDate: "2023-05-25T17:00:00Z",
        priority: "low",
        status: "in-progress",
        assignedTo: "Nhân viên D",
      },
    ];

    setTasks(mockTasks);
  }, []);

  // Lọc và sắp xếp tasks
  const getFilteredAndSortedTasks = () => {
    return tasks
      .filter((task) => {
        // Lọc theo trạng thái
        if (filterStatus !== "all" && task.status !== filterStatus) {
          return false;
        }

        // Lọc theo mức độ ưu tiên
        if (filterPriority !== "all" && task.priority !== filterPriority) {
          return false;
        }

        // Lọc theo từ khóa tìm kiếm
        if (
          searchTerm &&
          !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !task.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sắp xếp theo trường đã chọn
        let comparison = 0;

        if (sortField === "dueDate") {
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortField === "priority") {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortField === "status") {
          const statusOrder = { pending: 3, "in-progress": 2, completed: 1 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
        } else {
          comparison = a[sortField].localeCompare(b[sortField]);
        }

        // Đảo ngược thứ tự nếu sắp xếp giảm dần
        return sortDirection === "asc" ? comparison : -comparison;
      });
  };

  // Xử lý khi thêm công việc mới
  const handleAddTask = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
      status: "pending",
    });
    setShowAddModal(true);
  };

  // Xử lý khi chỉnh sửa công việc
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split("T")[0],
      priority: task.priority,
      status: task.status,
    });
    setShowEditModal(true);
  };

  // Xử lý khi lưu công việc mới
  const handleSaveTask = () => {
    const newTask = {
      id: tasks.length + 1,
      title: formData.title,
      description: formData.description,
      createdAt: new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      priority: formData.priority,
      status: formData.status,
      assignedTo: "Nhân viên A", // Trong thực tế, lấy từ người dùng đăng nhập
    };

    setTasks([...tasks, newTask]);
    setShowAddModal(false);
  };

  // Xử lý khi cập nhật công việc
  const handleUpdateTask = () => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          title: formData.title,
          description: formData.description,
          dueDate: new Date(formData.dueDate).toISOString(),
          priority: formData.priority,
          status: formData.status,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    setShowEditModal(false);
  };

  // Xử lý khi xóa công việc
  const handleDeleteTask = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
    }
  };

  // Xử lý khi thay đổi trạng thái công việc
  const handleChangeStatus = (id, newStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          status: newStatus,
        };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  // Xử lý khi thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Hiển thị badge cho trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Chờ xử lý</Badge>;
      case "in-progress":
        return <Badge bg="primary">Đang thực hiện</Badge>;
      case "completed":
        return <Badge bg="success">Hoàn thành</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Hiển thị badge cho mức độ ưu tiên
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge bg="danger">Cao</Badge>;
      case "medium":
        return <Badge bg="warning">Trung bình</Badge>;
      case "low":
        return <Badge bg="info">Thấp</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
    }
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaTasks className="me-2" />
            Quản Lý Công Việc
          </h1>
          <Button variant="primary" onClick={handleAddTask}>
            <FaPlus className="me-2" />
            Thêm Công Việc
          </Button>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaFilter className="me-1" /> Trạng thái
                  </Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="in-progress">Đang thực hiện</option>
                    <option value="completed">Hoàn thành</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaFilter className="me-1" /> Mức độ ưu tiên
                  </Form.Label>
                  <Form.Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
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
                      <option value="dueDate">Hạn hoàn thành</option>
                      <option value="priority">Mức độ ưu tiên</option>
                      <option value="status">Trạng thái</option>
                      <option value="title">Tiêu đề</option>
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaSearch className="me-1" /> Tìm kiếm
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm công việc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Danh sách công việc */}
        <Card className="shadow-sm">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Hạn hoàn thành</th>
                  <th>Mức độ ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Người thực hiện</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedTasks().map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{renderPriorityBadge(task.priority)}</td>
                    <td>
                      <DropdownButton
                        variant={
                          task.status === "completed"
                            ? "success"
                            : task.status === "in-progress"
                            ? "primary"
                            : "warning"
                        }
                        title={
                          task.status === "completed"
                            ? "Hoàn thành"
                            : task.status === "in-progress"
                            ? "Đang thực hiện"
                            : "Chờ xử lý"
                        }
                        size="sm"
                      >
                        <Dropdown.Item
                          onClick={() => handleChangeStatus(task.id, "pending")}
                          active={task.status === "pending"}
                        >
                          Chờ xử lý
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            handleChangeStatus(task.id, "in-progress")
                          }
                          active={task.status === "in-progress"}
                        >
                          Đang thực hiện
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            handleChangeStatus(task.id, "completed")
                          }
                          active={task.status === "completed"}
                        >
                          Hoàn thành
                        </Dropdown.Item>
                      </DropdownButton>
                    </td>
                    <td>{task.assignedTo}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEditTask(task)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {getFilteredAndSortedTasks().length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">
                  Không tìm thấy công việc nào phù hợp với điều kiện lọc.
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal Thêm Công Việc */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm Công Việc Mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Nhập tiêu đề công việc"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Nhập mô tả công việc"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hạn hoàn thành</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mức độ ưu tiên</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="in-progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveTask}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Chỉnh Sửa Công Việc */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh Sửa Công Việc</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Nhập tiêu đề công việc"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Nhập mô tả công việc"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hạn hoàn thành</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mức độ ưu tiên</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="in-progress">Đang thực hiện</option>
                  <option value="completed">Hoàn thành</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateTask}>
              Cập nhật
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffTasks;
