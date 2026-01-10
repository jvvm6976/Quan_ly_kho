import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import AuthContext from "../../context/AuthContext";
import CustomerLayout from "../customer/Layout";

const Register = () => {
  const { register } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Tên đăng nhập là bắt buộc")
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    email: Yup.string()
      .email("Địa chỉ email không hợp lệ")
      .required("Email là bắt buộc"),
    password: Yup.string()
      .required("Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
      .required("Xác nhận mật khẩu là bắt buộc"),
    fullName: Yup.string().required("Họ tên là bắt buộc"),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa các chữ số")
      .min(10, "Số điện thoại phải có ít nhất 10 chữ số")
      .nullable(),
    address: Yup.string().nullable(),
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = values;

      const result = await register(userData);

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Kho Linh Kiện Máy Tính</h2>
                  <h4>Tạo Tài Khoản Mới</h4>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Formik
                  initialValues={{
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    fullName: "",
                    phone: "",
                    address: "",
                  }}
                  validationSchema={validationSchema}
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
                    <Form onSubmit={handleSubmit}>
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
                              placeholder="Chọn tên đăng nhập"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.username}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.email && errors.email}
                              placeholder="Nhập email của bạn"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={values.password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.password && errors.password}
                              placeholder="Tạo mật khẩu"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={values.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={
                                touched.confirmPassword &&
                                errors.confirmPassword
                              }
                              placeholder="Xác nhận mật khẩu của bạn"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Họ và tên</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={values.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.fullName && errors.fullName}
                          placeholder="Nhập họ và tên của bạn"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại (không bắt buộc)</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.phone && errors.phone}
                          placeholder="Nhập số điện thoại của bạn"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Địa chỉ (không bắt buộc)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.address && errors.address}
                          placeholder="Nhập địa chỉ của bạn"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? "Đang đăng ký..." : "Đăng Ký"}
                      </Button>

                      <div className="text-center">
                        <p className="mb-0">
                          Đã có tài khoản? <Link to="/login">Đăng Nhập</Link>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </CustomerLayout>
  );
};

export default Register;
