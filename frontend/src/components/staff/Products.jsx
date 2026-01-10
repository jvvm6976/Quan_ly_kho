import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import StaffLayout from './Layout';

const StaffProducts = () => {
  return (
    <StaffLayout>
      <Container fluid className="py-3">
        <h1 className="mb-4">Danh Sách Sản Phẩm</h1>
        <Alert variant="info">
          <Alert.Heading>Trang đang được phát triển</Alert.Heading>
          <p>
            Chức năng này đang trong quá trình phát triển. Vui lòng quay lại sau.
          </p>
        </Alert>
      </Container>
    </StaffLayout>
  );
};

export default StaffProducts;
