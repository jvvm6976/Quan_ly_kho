import { useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaKey, FaAddressCard } from 'react-icons/fa';
import CustomerLayout from './Layout';
import AuthContext from '../../context/AuthContext';

const CustomerProfile = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  
  // State
  const [activeTab, setActiveTab] = useState('profile');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Profile validation schema
  const profileValidationSchema = Yup.object({
    fullName: Yup.string().required('Họ tên là bắt buộc'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .nullable(),
    address: Yup.string().nullable()
  });
  
  // Password validation schema
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Mật khẩu hiện tại là bắt buộc'),
    newPassword: Yup.string()
      .required('Mật khẩu mới là bắt buộc')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc')
  });
  
  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting, setErrors }) => {
    try {
      setProfileSuccess('');
      
      const result = await updateProfile(values);
      
      if (result.success) {
        setProfileSuccess('Cập nhật thông tin thành công!');
      } else {
        setErrors({ submit: result.message });
      }
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
      setSubmitting(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      setPasswordSuccess('');
      
      const result = await changePassword(values.currentPassword, values.newPassword);
      
      if (result.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        resetForm();
      } else {
        setErrors({ submit: result.message });
      }
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ submit: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <Container className="py-4">
        <h1 className="mb-4">Thông Tin Tài Khoản</h1>
        
        <Row>
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <div className="text-center mb-3">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                    <FaUser size={40} className="text-primary" />
                  </div>
                  <h5>{user?.fullName}</h5>
                  <p className="text-muted mb-0">{user?.email}</p>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <Button 
                    variant={activeTab === 'profile' ? 'primary' : 'outline-primary'} 
                    onClick={() => setActiveTab('profile')}
                    className="text-start"
                  >
                    <FaUser className="me-2" />
                    Thông tin cá nhân
                  </Button>
                  <Button 
                    variant={activeTab === 'address' ? 'primary' : 'outline-primary'} 
                    onClick={() => setActiveTab('address')}
                    className="text-start"
                  >
                    <FaAddressCard className="me-2" />
                    Địa chỉ
                  </Button>
                  <Button 
                    variant={activeTab === 'password' ? 'primary' : 'outline-primary'} 
                    onClick={() => setActiveTab('password')}
                    className="text-start"
                  >
                    <FaKey className="me-2" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={9}>
            <Card className="shadow-sm">
              <Card.Body>
                {activeTab === 'profile' && (
                  <>
                    <h4 className="mb-4">Thông tin cá nhân</h4>
                    
                    {profileSuccess && (
                      <Alert variant="success" onClose={() => setProfileSuccess('')} dismissible>
                        {profileSuccess}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        username: user?.username || ''
                      }}
                      validationSchema={profileValidationSchema}
                      onSubmit={handleProfileUpdate}
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
                          {errors.submit && (
                            <Alert variant="danger">{errors.submit}</Alert>
                          )}
                          
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Tên đăng nhập</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="username"
                                  value={values.username}
                                  disabled
                                  readOnly
                                />
                                <Form.Text className="text-muted">
                                  Tên đăng nhập không thể thay đổi
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={values.email}
                                  disabled
                                  readOnly
                                />
                                <Form.Text className="text-muted">
                                  Email không thể thay đổi
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                          
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group>
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
                            </Col>
                            <Col md={6}>
                              <Form.Group>
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
                          </Row>
                          
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </>
                )}
                
                {activeTab === 'address' && (
                  <>
                    <h4 className="mb-4">Địa chỉ</h4>
                    
                    {profileSuccess && (
                      <Alert variant="success" onClose={() => setProfileSuccess('')} dismissible>
                        {profileSuccess}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        address: user?.address || ''
                      }}
                      onSubmit={handleProfileUpdate}
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
                          {errors.submit && (
                            <Alert variant="danger">{errors.submit}</Alert>
                          )}
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="address"
                              value={values.address}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.address && errors.address}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.address}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật địa chỉ'}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </>
                )}
                
                {activeTab === 'password' && (
                  <>
                    <h4 className="mb-4">Đổi mật khẩu</h4>
                    
                    {passwordSuccess && (
                      <Alert variant="success" onClose={() => setPasswordSuccess('')} dismissible>
                        {passwordSuccess}
                      </Alert>
                    )}
                    
                    <Formik
                      initialValues={{
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      }}
                      validationSchema={passwordValidationSchema}
                      onSubmit={handlePasswordChange}
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
                          {errors.submit && (
                            <Alert variant="danger">{errors.submit}</Alert>
                          )}
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <Form.Control
                              type="password"
                              name="currentPassword"
                              value={values.currentPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.currentPassword && errors.currentPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.currentPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <Form.Control
                              type="password"
                              name="newPassword"
                              value={values.newPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.newPassword && errors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.newPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-4">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={values.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.confirmPassword && errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="primary" 
                              type="submit"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </CustomerLayout>
  );
};

export default CustomerProfile;
