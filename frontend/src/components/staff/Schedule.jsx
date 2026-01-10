import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import AuthContext from "../../context/AuthContext";
import "./Schedule.css";

const StaffSchedule = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    time: "09:00",
    location: "",
    description: "",
    priority: "medium",
  });

  // Mô phỏng dữ liệu lịch làm việc
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    const mockScheduleData = [
      {
        id: 1,
        date: new Date().toISOString().split("T")[0],
        title: "Họp nhân viên",
        time: "08:30",
        location: "Phòng họp",
        description: "Họp đánh giá kết quả kinh doanh tháng",
        priority: "high",
        completed: false,
      },
      {
        id: 2,
        date: new Date().toISOString().split("T")[0],
        title: "Kiểm kê kho",
        time: "10:00",
        location: "Kho chính",
        description: "Kiểm kê hàng tồn kho quý 2",
        priority: "medium",
        completed: false,
      },
      {
        id: 3,
        date: new Date().toISOString().split("T")[0],
        title: "Xử lý đơn hàng",
        time: "13:30",
        location: "Phòng làm việc",
        description: "Xử lý các đơn hàng mới",
        priority: "high",
        completed: true,
      },
      {
        id: 4,
        date: new Date(new Date().setDate(new Date().getDate() + 1))
          .toISOString()
          .split("T")[0],
        title: "Nhập kho hàng mới",
        time: "09:00",
        location: "Kho chính",
        description: "Nhận và kiểm tra hàng từ nhà cung cấp",
        priority: "medium",
        completed: false,
      },
    ];

    setScheduleData(mockScheduleData);
  }, []);

  // Lấy các sự kiện cho ngày được chọn
  const getEventsForSelectedDate = () => {
    const dateString = selectedDate.toISOString().split("T")[0];
    return scheduleData.filter((event) => event.date === dateString);
  };

  // Tạo mảng các ngày trong tháng hiện tại
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  };

  // Kiểm tra xem ngày có sự kiện không
  const hasEvents = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return scheduleData.some((event) => event.date === dateString);
  };

  // Xử lý khi chọn ngày
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Xử lý khi thay đổi tháng
  const handleMonthChange = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // Xử lý khi mở modal thêm sự kiện
  const handleAddEvent = () => {
    setFormData({
      title: "",
      time: "09:00",
      location: "",
      description: "",
      priority: "medium",
    });
    setShowAddModal(true);
  };

  // Xử lý khi mở modal chỉnh sửa sự kiện
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      time: event.time,
      location: event.location,
      description: event.description || "",
      priority: event.priority,
    });
    setShowEditModal(true);
  };

  // Xử lý khi lưu sự kiện mới
  const handleSaveEvent = () => {
    const newEvent = {
      id: scheduleData.length + 1,
      date: selectedDate.toISOString().split("T")[0],
      title: formData.title,
      time: formData.time,
      location: formData.location,
      description: formData.description,
      priority: formData.priority,
      completed: false,
    };

    setScheduleData([...scheduleData, newEvent]);
    setShowAddModal(false);
  };

  // Xử lý khi cập nhật sự kiện
  const handleUpdateEvent = () => {
    const updatedScheduleData = scheduleData.map((event) => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          title: formData.title,
          time: formData.time,
          location: formData.location,
          description: formData.description,
          priority: formData.priority,
        };
      }
      return event;
    });

    setScheduleData(updatedScheduleData);
    setShowEditModal(false);
  };

  // Xử lý khi xóa sự kiện
  const handleDeleteEvent = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
      const updatedScheduleData = scheduleData.filter(
        (event) => event.id !== id
      );
      setScheduleData(updatedScheduleData);
    }
  };

  // Xử lý khi đánh dấu hoàn thành
  const handleToggleComplete = (id) => {
    const updatedScheduleData = scheduleData.map((event) => {
      if (event.id === id) {
        return {
          ...event,
          completed: !event.completed,
        };
      }
      return event;
    });

    setScheduleData(updatedScheduleData);
  };

  // Xử lý khi thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">
          <FaCalendarAlt className="me-2" />
          Lịch Làm Việc
        </h1>

        <Row>
          {/* Lịch */}
          <Col md={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => handleMonthChange(-1)}
                  >
                    &lt;
                  </Button>
                  <h5 className="mb-0">
                    {currentDate.toLocaleString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => handleMonthChange(1)}
                  >
                    &gt;
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="calendar">
                  <div className="calendar-header d-flex">
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(
                      (day, index) => (
                        <div
                          key={index}
                          className="calendar-cell text-center fw-bold"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>
                  <div className="calendar-body">
                    <div className="d-flex flex-wrap">
                      {/* Tạo các ô trống cho các ngày trước ngày 1 */}
                      {Array.from({
                        length: new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          1
                        ).getDay(),
                      }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="calendar-cell empty"
                        ></div>
                      ))}

                      {/* Hiển thị các ngày trong tháng */}
                      {getDaysInMonth().map((date, index) => {
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const isSelected =
                          date.toDateString() === selectedDate.toDateString();
                        const hasEventClass = hasEvents(date)
                          ? "has-events"
                          : "";

                        return (
                          <div
                            key={index}
                            className={`calendar-cell text-center ${
                              isToday ? "today" : ""
                            } ${isSelected ? "selected" : ""} ${hasEventClass}`}
                            onClick={() => handleDateClick(date)}
                          >
                            {date.getDate()}
                            {hasEvents(date) && (
                              <div className="event-dot"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleAddEvent}
                >
                  <FaPlus className="me-2" />
                  Thêm Sự Kiện
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          {/* Danh sách sự kiện */}
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  Sự kiện ngày{" "}
                  {selectedDate.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </h5>
              </Card.Header>
              <Card.Body>
                {getEventsForSelectedDate().length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th width="15%">Thời gian</th>
                        <th width="25%">Sự kiện</th>
                        <th width="20%">Địa điểm</th>
                        <th width="15%">Mức độ</th>
                        <th width="10%">Trạng thái</th>
                        <th width="15%">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEventsForSelectedDate()
                        .sort((a, b) => {
                          // Sắp xếp theo thời gian
                          return a.time.localeCompare(b.time);
                        })
                        .map((event) => (
                          <tr
                            key={event.id}
                            className={event.completed ? "table-success" : ""}
                          >
                            <td>{event.time}</td>
                            <td>
                              <div className="fw-bold">{event.title}</div>
                              {event.description && (
                                <small className="text-muted">
                                  {event.description}
                                </small>
                              )}
                            </td>
                            <td>{event.location}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  event.priority === "high"
                                    ? "danger"
                                    : event.priority === "medium"
                                    ? "warning"
                                    : "info"
                                }`}
                              >
                                {event.priority === "high"
                                  ? "Cao"
                                  : event.priority === "medium"
                                  ? "Trung bình"
                                  : "Thấp"}
                              </span>
                            </td>
                            <td>
                              {event.completed ? (
                                <span className="badge bg-success">
                                  Hoàn thành
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  Chưa hoàn thành
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleToggleComplete(event.id)}
                                  title={
                                    event.completed
                                      ? "Đánh dấu chưa hoàn thành"
                                      : "Đánh dấu hoàn thành"
                                  }
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">
                    Không có sự kiện nào cho ngày này. Nhấn "Thêm Sự Kiện" để
                    tạo sự kiện mới.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal Thêm Sự Kiện */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm Sự Kiện Mới</Modal.Title>
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
                  placeholder="Nhập tiêu đề sự kiện"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thời gian</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Địa điểm</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Nhập địa điểm"
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
                  placeholder="Nhập mô tả (không bắt buộc)"
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveEvent}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Chỉnh Sửa Sự Kiện */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh Sửa Sự Kiện</Modal.Title>
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
                  placeholder="Nhập tiêu đề sự kiện"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thời gian</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Địa điểm</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Nhập địa điểm"
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
                  placeholder="Nhập mô tả (không bắt buộc)"
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateEvent}>
              Cập nhật
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffSchedule;
