import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Tabs, Tab, Badge, Pagination, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaCheck, FaTimes, FaSearch, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';
import AdminLayout from './Layout';
import { inventoryAPI, productAPI } from '../../services/api';

const AdminInventory = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transactionType, setTransactionType] = useState('in');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  
  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        // Get inventory summary
        await inventoryAPI.getInventorySummary();
        
        // Get low stock products
        const lowStockRes = await inventoryAPI.getLowStockProducts();
        setLowStockProducts(lowStockRes.data);
        
        // Get out of stock products
        const outOfStockRes = await inventoryAPI.getOutOfStockProducts();
        setOutOfStockProducts(outOfStockRes.data);
        
        // Get all products
        const productsRes = await productAPI.getAllProducts({
          limit: 1000 // Get all products for dropdown
        });
        setProducts(productsRes.data.products);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError('Không thể tải dữ liệu kho. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (activeTab === 'inventory') {
      fetchInventoryData();
    }
  }, [activeTab]);
  
  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // Prepare filter params
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...activeFilters
        };
        
        // Get transactions
        const transactionsRes = await inventoryAPI.getAllTransactions(params);
        setTransactions(transactionsRes.data.transactions);
        setPagination(prevPagination => ({
          ...prevPagination,
          totalPages: transactionsRes.data.pagination.totalPages
        }));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Không thể tải dữ liệu giao dịch kho. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, pagination.currentPage, pagination.itemsPerPage, activeFilters]);
  
  // Validation schema for transaction
  const transactionValidationSchema = Yup.object({
    productId: Yup.number().required('Sản phẩm là bắt buộc'),
    quantity: Yup.number()
      .required('Số lượng là bắt buộc')
      .positive('Số lượng phải là số dương'),
    reason: Yup.string().required('Lý do là bắt buộc'),
    reference: Yup.string()
  });
  
  // Handle create transaction modal
  const handleCreateTransaction = (product = null, type = 'in') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setShowModal(true);
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // Create transaction
      await inventoryAPI.createTransaction({
        ...values,
        type: transactionType
      });
      
      // Show success message
      setSuccess(`Giao dịch ${transactionType === 'in' ? 'nhập kho' : transactionType === 'out' ? 'xuất kho' : 'điều chỉnh'} đã được tạo thành công!`);
      
      // Close modal and reset form
      handleCloseModal();
      resetForm();
      
      // Refresh transactions if on transactions tab
      if (activeTab === 'transactions') {
        const transactionsRes = await inventoryAPI.getAllTransactions({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters
        });
        setTransactions(transactionsRes.data.transactions);
        setPagination({
          ...pagination,
          totalPages: transactionsRes.data.pagination.totalPages
        });
      }
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError('Đã xảy ra lỗi khi tạo giao dịch. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };
  
  // Handle approve transaction
  const handleApproveTransaction = async (transactionId) => {
    try {
      setError('');
      setSuccess('');
      
      // Approve transaction
      await inventoryAPI.updateTransactionStatus(transactionId, { status: 'approved' });
      
      // Show success message
      setSuccess('Giao dịch đã được phê duyệt thành công!');
      
      // Refresh transactions
      const transactionsRes = await inventoryAPI.getAllTransactions({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });
      setTransactions(transactionsRes.data.transactions);
      setPagination({
        ...pagination,
        totalPages: transactionsRes.data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error approving transaction:', error);
      setError('Đã xảy ra lỗi khi phê duyệt giao dịch. Vui lòng thử lại sau.');
    }
  };
  
  // Handle reject transaction
  const handleRejectTransaction = async (transactionId) => {
    try {
      setError('');
      setSuccess('');
      
      // Reject transaction
      await inventoryAPI.updateTransactionStatus(transactionId, { status: 'rejected' });
      
      // Show success message
      setSuccess('Giao dịch đã bị từ chối!');
      
      // Refresh transactions
      const transactionsRes = await inventoryAPI.getAllTransactions({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      });
      setTransactions(transactionsRes.data.transactions);
      setPagination({
        ...pagination,
        totalPages: transactionsRes.data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      setError('Đã xảy ra lỗi khi từ chối giao dịch. Vui lòng thử lại sau.');
    }
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    // Apply the current filters
    setActiveFilters(filters);
    
    // Reset to first page when applying filters
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    
    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
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
        <h1 className="mb-4">Quản Lý Kho</h1>
        
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="inventory" title="Tồn Kho" />
              <Tab eventKey="transactions" title="Giao Dịch Kho" />
            </Tabs>
            
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Sản phẩm tồn kho</h5>
                      <div>
                        <Button 
                          variant="primary" 
                          className="me-2"
                          onClick={() => handleCreateTransaction(null, 'in')}
                        >
                          <FaArrowDown className="me-2" />
                          Nhập kho
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleCreateTransaction(null, 'out')}
                        >
                          <FaArrowUp className="me-2" />
                          Xuất kho
                        </Button>
                      </div>
                    </div>
                    
                    {/* Low Stock Products */}
                    <h6 className="mb-3">
                      <FaExclamationTriangle className="text-warning me-2" />
                      Sản phẩm sắp hết hàng
                    </h6>
                    
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
                            {lowStockProducts.map(product => (
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
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleCreateTransaction(product, 'in')}
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
                      <p className="text-muted mb-4">Không có sản phẩm nào sắp hết hàng</p>
                    )}
                    
                    {/* Out of Stock Products */}
                    <h6 className="mb-3">
                      <FaTimes className="text-danger me-2" />
                      Sản phẩm hết hàng
                    </h6>
                    
                    {outOfStockProducts.length > 0 ? (
                      <div className="table-responsive">
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
                            {outOfStockProducts.map(product => (
                              <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.sku}</td>
                                <td>{product.minQuantity}</td>
                                <td>
                                  <Badge bg="danger">Hết hàng</Badge>
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleCreateTransaction(product, 'in')}
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
                      <p className="text-muted">Không có sản phẩm nào hết hàng</p>
                    )}
                  </>
                )}
                
                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Giao dịch kho</h5>
                      <div>
                        <Button 
                          variant="primary" 
                          className="me-2"
                          onClick={() => handleCreateTransaction(null, 'in')}
                        >
                          <FaPlus className="me-2" />
                          Tạo giao dịch
                        </Button>
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <Card className="mb-4">
                      <Card.Body>
                        <Row>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>Tìm kiếm</Form.Label>
                              <div className="position-relative">
                                <Form.Control
                                  type="text"
                                  name="search"
                                  value={filters.search}
                                  onChange={handleFilterChange}
                                  placeholder="Tìm theo sản phẩm, lý do..."
                                />
                              </div>
                              {activeFilters.search && transactions.length === 0 && !loading && (
                                <Form.Text className="text-muted">
                                  Không tìm thấy kết quả phù hợp
                                </Form.Text>
                              )}
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group className="mb-3">
                              <Form.Label>Loại giao dịch</Form.Label>
                              <Form.Select
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                              >
                                <option value="">Tất cả</option>
                                <option value="in">Nhập kho</option>
                                <option value="out">Xuất kho</option>
                                <option value="adjustment">Điều chỉnh</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group className="mb-3">
                              <Form.Label>Trạng thái</Form.Label>
                              <Form.Select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                              >
                                <option value="">Tất cả</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Đã từ chối</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
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
                          <Col md={2}>
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
                          <Col md={1} className="d-flex align-items-end">
                            <div className="d-flex flex-column w-100">
                              <Button 
                                variant="primary" 
                                className="mb-2"
                                onClick={handleApplyFilters}
                                title="Tìm kiếm"
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
                    
                    {/* Transactions Table */}
                    {transactions.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          <Table hover>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Sản phẩm</th>
                                <th>Loại</th>
                                <th>Số lượng</th>
                                <th>Trước</th>
                                <th>Sau</th>
                                <th>Lý do</th>
                                <th>Người tạo</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map(transaction => (
                                <tr key={transaction.id}>
                                  <td>{transaction.id}</td>
                                  <td>{transaction.product?.name}</td>
                                  <td>
                                    {transaction.type === 'in' ? (
                                      <Badge bg="success">Nhập kho</Badge>
                                    ) : transaction.type === 'out' ? (
                                      <Badge bg="danger">Xuất kho</Badge>
                                    ) : (
                                      <Badge bg="info">Điều chỉnh</Badge>
                                    )}
                                  </td>
                                  <td>{transaction.quantity}</td>
                                  <td>{transaction.previousQuantity}</td>
                                  <td>{transaction.newQuantity}</td>
                                  <td>
                                    {transaction.reason === 'restock' ? 'Bổ sung hàng tồn kho' :
                                     transaction.reason === 'purchase' ? 'Mua hàng mới' :
                                     transaction.reason === 'return' ? 'Hàng trả lại' :
                                     transaction.reason === 'adjustment' ? 'Điều chỉnh số lượng' :
                                     transaction.reason === 'other' ? 'Khác' :
                                     transaction.reason === 'order' ? 'Đơn hàng' :
                                     transaction.reason === 'damage' ? 'Hàng hỏng' :
                                     transaction.reason}
                                  </td>
                                  <td>{transaction.creator?.fullName}</td>
                                  <td>{new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</td>
                                  <td>
                                    {transaction.status === 'pending' ? (
                                      <Badge bg="warning">Chờ duyệt</Badge>
                                    ) : transaction.status === 'approved' ? (
                                      <Badge bg="success">Đã duyệt</Badge>
                                    ) : (
                                      <Badge bg="danger">Đã từ chối</Badge>
                                    )}
                                  </td>
                                  <td>
                                    {transaction.status === 'pending' && (
                                      <>
                                        <Button 
                                          variant="outline-success" 
                                          size="sm" 
                                          className="me-1"
                                          onClick={() => handleApproveTransaction(transaction.id)}
                                        >
                                          <FaCheck />
                                        </Button>
                                        <Button 
                                          variant="outline-danger" 
                                          size="sm"
                                          onClick={() => handleRejectTransaction(transaction.id)}
                                        >
                                          <FaTimes />
                                        </Button>
                                      </>
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
                              <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} />
                              <Pagination.Prev onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />
                              {paginationItems}
                              <Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} />
                              <Pagination.Last onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} />
                            </Pagination>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center my-5">
                        <p className="mb-0">Không có giao dịch nào</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Create Transaction Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {transactionType === 'in' ? 'Nhập kho' : 
             transactionType === 'out' ? 'Xuất kho' : 'Điều chỉnh kho'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            productId: selectedProduct?.id || '',
            quantity: '',
            reason: '',
            reference: '',
            notes: ''
          }}
          validationSchema={transactionValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Sản phẩm</Form.Label>
                  <Form.Select
                    name="productId"
                    value={values.productId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.productId && errors.productId}
                    disabled={!!selectedProduct}
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.sku} (Tồn kho: {product.quantity})
                      </option>
                    ))}
                  </Form.Select>
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
                  <Form.Control
                    type="text"
                    name="reason"
                    value={values.reason}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.reason && errors.reason}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.reason}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tham chiếu (tùy chọn)</Form.Label>
                  <Form.Control
                    type="text"
                    name="reference"
                    value={values.reference}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.reference && errors.reference}
                    placeholder="Số hóa đơn, phiếu nhập, v.v."
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.reference}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo giao dịch'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </AdminLayout>
  );
};

export default AdminInventory;
