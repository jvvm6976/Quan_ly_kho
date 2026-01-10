import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AdminLayout from './Layout';
import { categoryAPI } from '../../services/api';

const Categories = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const response = await categoryAPI.getAllCategories();
        setCategories(response.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  // Validation schema
  const categoryValidationSchema = Yup.object({
    name: Yup.string().required('Tên danh mục là bắt buộc')
  });
  
  // Handle modal open for add
  const handleAddCategory = () => {
    setModalMode('add');
    setCurrentCategory(null);
    setShowModal(true);
  };
  
  // Handle modal open for edit
  const handleEditCategory = (category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setShowModal(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
  };
  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      let response;
      
      if (modalMode === 'add') {
        // Create category
        response = await categoryAPI.createCategory(values);
        setSuccess('Thêm danh mục thành công!');
      } else {
        // Update category
        response = await categoryAPI.updateCategory(currentCategory.id, values);
        setSuccess('Cập nhật danh mục thành công!');
      }
      
      // Refresh category list
      const categoriesRes = await categoryAPI.getAllCategories();
      setCategories(categoriesRes.data);
      
      // Close modal and reset form
      handleCloseModal();
      resetForm();
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting category:', error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      setSubmitting(false);
    }
  };
  
  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      setError('');
      setSuccess('');
      
      // Delete category
      await categoryAPI.deleteCategory(categoryId);
      
      // Refresh category list
      const categoriesRes = await categoryAPI.getAllCategories();
      setCategories(categoriesRes.data);
      
      setSuccess('Xóa danh mục thành công!');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      
      if (error.response && error.response.status === 400) {
        setError('Không thể xóa danh mục này vì có sản phẩm liên quan.');
      } else {
        setError('Đã xảy ra lỗi khi xóa danh mục. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Quản Lý Danh Mục</h1>
        
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="primary" onClick={handleAddCategory}>
                <FaPlus className="me-2" />
                Thêm Danh Mục
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : categories.length > 0 ? (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          {category.isActive ? (
                            <span className="badge bg-success">Hoạt động</span>
                          ) : (
                            <span className="badge bg-danger">Không hoạt động</span>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditCategory(category)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => setConfirmDelete(category)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center my-5">
                <p className="mb-0">Không có danh mục nào</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
      
      {/* Add/Edit Category Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Thêm Danh Mục Mới' : 'Chỉnh Sửa Danh Mục'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={
            currentCategory ? {
              name: currentCategory.name,
              description: currentCategory.description || '',
              isActive: currentCategory.isActive
            } : {
              name: '',
              description: '',
              isActive: true
            }
          }
          validationSchema={categoryValidationSchema}
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
                  <Form.Label>Tên danh mục</Form.Label>
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Kích hoạt danh mục"
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
                  {isSubmitting ? 'Đang xử lý...' : modalMode === 'add' ? 'Thêm danh mục' : 'Cập nhật danh mục'}
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
          Bạn có chắc chắn muốn xóa danh mục <strong>{confirmDelete?.name}</strong>?
          <p className="text-danger mt-2 mb-0">Lưu ý: Không thể xóa danh mục đã có sản phẩm liên quan.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDeleteCategory(confirmDelete.id)}
          >
            Xóa danh mục
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Categories;
