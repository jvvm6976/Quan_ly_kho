import { useState, useRef } from "react";
import { Form, Button, Image, Alert } from "react-bootstrap";
import { FaUpload, FaTrash, FaImage } from "react-icons/fa";

const ImageUpload = ({
  onImageChange,
  currentImage = null,
  label = "Hình ảnh sản phẩm",
  accept = "image/*",
  maxSize = 5, // in MB
}) => {
  const [preview, setPreview] = useState(
    currentImage ? `http://localhost:5000/${currentImage}` : null
  );
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Kích thước file không được vượt quá ${maxSize}MB`);
      return;
    }

    // Clear error
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Log file details for debugging
    console.log("Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    // Pass file to parent component
    onImageChange(file);
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle click on upload button
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex flex-column">
        {/* Preview */}
        {preview ? (
          <div className="mb-3 position-relative">
            <Image
              src={preview}
              alt="Preview"
              thumbnail
              style={{ maxHeight: "200px", maxWidth: "200px" }}
            />
            <Button
              variant="danger"
              size="sm"
              className="position-absolute top-0 end-0"
              onClick={handleRemoveImage}
            >
              <FaTrash />
            </Button>
          </div>
        ) : (
          <div
            className="bg-light d-flex flex-column align-items-center justify-content-center p-4 mb-3 border rounded"
            style={{ height: "200px", cursor: "pointer" }}
            onClick={handleUploadClick}
          >
            <FaImage size={40} className="text-muted mb-2" />
            <p className="text-muted mb-0">Nhấp để tải lên hình ảnh</p>
          </div>
        )}

        {/* Hidden file input */}
        <Form.Control
          type="file"
          accept={accept}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="d-none"
        />

        {/* Upload button */}
        <Button
          variant="outline-primary"
          onClick={handleUploadClick}
          className="d-flex align-items-center justify-content-center"
        >
          <FaUpload className="me-2" />
          {preview ? "Thay đổi hình ảnh" : "Tải lên hình ảnh"}
        </Button>

        <Form.Text className="text-muted mt-2">
          Định dạng hỗ trợ: JPG, PNG, GIF. Kích thước tối đa: {maxSize}MB
        </Form.Text>
      </div>
    </Form.Group>
  );
};

export default ImageUpload;
