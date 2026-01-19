import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaClipboardCheck,
  FaSearch,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import StaffLayout from "./Layout";
import { inventoryAPI, productAPI } from "../../services/api";

const StaffInventoryCheck = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventoryChecks, setInventoryChecks] = useState([]);
  const [activeCheck, setActiveCheck] = useState(null);
  const [checkItems, setCheckItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);

  // Fetch inventory checks
  useEffect(() => {
    const fetchInventoryChecks = async () => {
      try {
        setLoading(true);
        setError("");

        // Get inventory checks (ưu tiên in_progress, sau đó pending)
        const checksRes = await inventoryAPI.getAllInventoryChecks({
          limit: 10,
          page: 1,
        });

        setInventoryChecks(checksRes.data.inventoryChecks);

        setActiveCheck(null);
        setCheckItems([]);
        setFilteredItems([]);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory checks:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchInventoryChecks();
  }, []);

  // Filter check items based on search term
  useEffect(() => {
    if (!activeCheck) return;

    if (searchTerm.trim() === "") {
      setFilteredItems(checkItems);
    } else {
      const filtered = checkItems.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, checkItems, activeCheck]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect
  };

  // Handle view check details / chọn đợt
  const handleViewCheckDetails = async (check) => {
    try {
      const detailRes = await inventoryAPI.getInventoryCheckById(check.id);
      setSelectedCheck(detailRes.data);
      setShowDetailModal(true);

      // Khi chọn đợt để kiểm kê
      if (check.status === "in_progress" || check.status === "pending") {
        setActiveCheck(detailRes.data);
        const items = detailRes.data.items || [];
        setCheckItems(items);
        setFilteredItems(items);
      }
    } catch (err) {
      console.error("Error loading check detail:", err);
      setError("Không tải được chi tiết đợt kiểm kê.");
    }
  };

  // Handle check item form submission
  const handleCheckItem = async (itemId, actualQuantity, notes) => {
    try {
      if (!activeCheck) {
        setError("Không có đợt kiểm kê đang diễn ra.");
        return;
      }
      setError("");

      // Update check item
      await inventoryAPI.updateInventoryCheckItem(activeCheck.id, itemId, {
        actualQuantity,
        notes,
      });

      // Refresh check items
      const detailRes = await inventoryAPI.getInventoryCheckById(
        activeCheck.id
      );
      const refreshedItems = detailRes.data.items || [];
      setActiveCheck(detailRes.data);
      setCheckItems(refreshedItems);
      setFilteredItems(
        searchTerm.trim() === ""
          ? refreshedItems
          : refreshedItems.filter(
              (item) =>
                item.product.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.product.sku
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
      );

      setSuccess("Cập nhật thành công!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error updating check item:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại sau."
      );
    }
  };

  // Check Item component
  const CheckItemForm = ({ item }) => {
    const [showForm, setShowForm] = useState(false);
    const [actualQuantity, setActualQuantity] = useState(
      item.actualQuantity ?? item.systemQuantity
    );
    const [notes, setNotes] = useState(item.notes || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      await handleCheckItem(item.id, actualQuantity, notes);
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
                  <Spinner animation="border" size="sm" />
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
            disabled={item.status !== "pending"}
          >
            {item.status === "pending" ? "Kiểm kê" : "Đã kiểm kê"}
          </Button>
        )}
      </>
    );
  };

  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>
            <FaClipboardCheck className="me-2" />
            Kiểm Kê Kho
          </h1>
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

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
        {activeCheck ? (
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Đợt Kiểm Kê Đang Diễn Ra</h5>
                <Badge bg="light" text="dark">
                  Mã: {activeCheck.id}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-end mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setActiveCheck(null);
                    setCheckItems([]);
                    setFilteredItems([]);
                  }}
                >
                  Quay lại danh sách
                </Button>
              </div>
              <Row className="mb-4">
                <Col md={6}>
                  <p>
                        <strong>Ngày tạo:</strong>{" "}
                        {new Date(activeCheck.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                      <p>
                        <strong>Người tạo:</strong>{" "}
                        {activeCheck.creator?.fullName ||
                          activeCheck.creator?.username ||
                          activeCheck.createdBy?.name ||
                          "Admin"}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <Badge bg="success">Đang diễn ra</Badge>
                      </p>
                      <p>
                        <strong>Ghi chú:</strong>{" "}
                        {activeCheck.notes || "Không có ghi chú"}
                      </p>
                    </Col>
                  </Row>

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
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product?.name || "-"}</td>
                            <td>{item.product?.sku || "-"}</td>
                            <td>{item.systemQuantity}</td>
                            <td>
                              {item.actualQuantity !== null &&
                              item.actualQuantity !== undefined
                                ? item.actualQuantity
                                : "-"}
                            </td>
                            <td>
                              {item.actualQuantity !== null &&
                              item.actualQuantity !== undefined ? (
                                <span
                                  className={
                                    item.actualQuantity > item.systemQuantity
                                      ? "text-success"
                                      : item.actualQuantity <
                                        item.systemQuantity
                                      ? "text-danger"
                                      : ""
                                  }
                                >
                                  {item.actualQuantity - item.systemQuantity}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>
                              {item.status === "pending" ? (
                                <Badge bg="warning">Chưa kiểm kê</Badge>
                              ) : (
                                <Badge bg="success">Đã kiểm kê</Badge>
                              )}
                            </td>
                            <td>
                              <CheckItemForm item={item} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {filteredItems.length === 0 && (
                    <Alert variant="info">
                      Không tìm thấy sản phẩm nào phù hợp với điều kiện tìm
                      kiếm.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <>
                {inventoryChecks.length > 0 ? (
                  <Card className="shadow-sm mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Các Đợt Kiểm Kê Gần Đây</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table hover>
                          <thead>
                            <tr>
                              <th>Mã</th>
                              <th>Ngày tạo</th>
                              <th>Người tạo</th>
                              <th>Trạng thái</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryChecks.map((check) => (
                              <tr key={check.id}>
                                <td>{check.id}</td>
                                <td>
                                  {new Date(check.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </td>
                                <td>
                                  {check.creator?.fullName ||
                                    check.creator?.username ||
                                    check.createdBy?.name ||
                                    "Admin"}
                                </td>
                                <td>
                              {check.status === "in_progress" ? (
                                <Badge bg="success">Đang diễn ra</Badge>
                              ) : check.status === "pending" ? (
                                <Badge bg="warning">Chờ xử lý</Badge>
                              ) : check.status === "completed" ? (
                                <Badge bg="primary">Hoàn thành</Badge>
                              ) : (
                                <Badge bg="secondary">Đã hủy</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() =>
                                  handleViewCheckDetails(check)
                                }
                              >
                                <FaInfoCircle className="me-1" />
                                Xem/Chọn đợt
                              </Button>
                            </td>
                          </tr>
                        ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Alert variant="info">
                    Hiện tại không có đợt kiểm kê nào đang diễn ra. Vui lòng
                    liên hệ quản trị viên để tạo đợt kiểm kê mới.
                  </Alert>
                )}
              </>
            )}
          </>
        )}

        {/* Check Detail Modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Chi Tiết Đợt Kiểm Kê</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCheck && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <p>
                      <strong>Mã đợt kiểm kê:</strong> {selectedCheck.id}
                    </p>
                    <p>
                      <strong>Ngày tạo:</strong>{" "}
                      {new Date(selectedCheck.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p>
                      <strong>Người tạo:</strong>{" "}
                      {selectedCheck.creator?.fullName ||
                        selectedCheck.creator?.username ||
                        selectedCheck.createdBy?.name ||
                        "Admin"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {selectedCheck.status === "in_progress" ? (
                        <Badge bg="success">Đang diễn ra</Badge>
                      ) : selectedCheck.status === "pending" ? (
                        <Badge bg="warning">Chờ xử lý</Badge>
                      ) : selectedCheck.status === "completed" ? (
                        <Badge bg="primary">Hoàn thành</Badge>
                      ) : (
                        <Badge bg="secondary">Đã hủy</Badge>
                      )}
                    </p>
                    <p>
                      <strong>Ghi chú:</strong>{" "}
                      {selectedCheck.notes || "Không có ghi chú"}
                    </p>
                  </Col>
                </Row>
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>SKU</th>
                        <th>Số lượng hệ thống</th>
                        <th>Số lượng thực tế</th>
                        <th>Chênh lệch</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCheck.items?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{item.product?.sku}</td>
                          <td>{item.systemQuantity}</td>
                          <td>{item.actualQuantity ?? "-"}</td>
                          <td>
                            {item.actualQuantity !== null &&
                            item.actualQuantity !== undefined
                              ? item.actualQuantity - item.systemQuantity
                              : "-"}
                          </td>
                          <td>
                            {item.status === "pending" ? (
                              <Badge bg="warning">Chưa kiểm kê</Badge>
                            ) : item.status === "checked" ? (
                              <Badge bg="success">Đã kiểm kê</Badge>
                            ) : item.status === "adjusted" ? (
                              <Badge bg="info">Đã điều chỉnh</Badge>
                            ) : (
                              <Badge bg="secondary">{item.status}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </StaffLayout>
  );
};

export default StaffInventoryCheck;
