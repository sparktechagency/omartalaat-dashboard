import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Space,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  useCreateNewProductsMutation,
  useUpdateProductMutation,
} from "../../redux/apiSlices/productsApi";
import { useGetCategoryQuery } from "../../redux/apiSlices/categoryApi";
import { getImageUrl } from "../common/imageUrl";

const ProductModal = ({ visible, editingProduct, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: categoryData } = useGetCategoryQuery();
  const categories = categoryData?.data || [];

  const [createNewProduct, { isLoading: createLoading }] =
    useCreateNewProductsMutation();
  const [updateProduct, { isLoading: updateLoading }] =
    useUpdateProductMutation();

  const membershipOptions = [
    { label: "Premium Membership", value: "premium" },
    { label: "Advanced Membership", value: "advanced" },
    { label: "Normal Membership", value: "normal" },
  ];

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  useEffect(() => {
    if (editingProduct && visible) {
      let membershipType = "normal";
      if (editingProduct.premiumMembership) membershipType = "premium";
      else if (editingProduct.advanceMembership) membershipType = "advanced";

      form.setFieldsValue({
        name: editingProduct.name,
        sku: editingProduct.sku,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        stock: editingProduct.stock,
        highestPriceForFreeShipping:
          editingProduct.highestPriceForFreeShipping,
        description: editingProduct.description,
        creditNeeds: editingProduct.creditNeeds,
        csAuraEarn: editingProduct.csAuraEarn,
        creditEarn: editingProduct.creditEarn || 0,
        membershipType: membershipType,
      });

      if (editingProduct.images?.length > 0) {
        const newFileList = editingProduct.images.map((img, index) => ({
          uid: `-${index}`,
          name: `image-${index}.png`,
          status: "done",
          url: getImageUrl(img),
        }));
        setFileList(newFileList);
      }
    }
  }, [editingProduct, visible, form]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url?.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      // Append all files to FormData
      fileList.forEach((file) => {
        if (file.originFileObj) formData.append("images", file.originFileObj);
      });

      const membershipFlags = {
        premiumMembership: values.membershipType === "premium",
        advanceMembership: values.membershipType === "advanced",
        normalMembership: values.membershipType === "normal",
      };

      const productData = {
        name: values.name,
        sku: values.sku,
        categoryId: values.categoryId,
        categories:
          categories.find((cat) => cat._id === values.categoryId)?.name || "",
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        highestPriceForFreeShipping: parseFloat(
          values.highestPriceForFreeShipping
        ),
        description: values.description,
        creditNeeds: parseInt(values.creditNeeds),
        csAuraEarn: parseInt(values.csAuraEarn),
        creditEarn:
          values.creditEarn !== undefined && values.creditEarn !== null
            ? parseInt(values.creditEarn)
            : 0,
        ...membershipFlags,
      };

      formData.append("data", JSON.stringify(productData));

      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          ...Object.fromEntries(formData),
        }).unwrap();
        message.success("Product updated successfully");
      } else {
        await createNewProduct(formData).unwrap();
        message.success("Product created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        error?.data?.message || "Failed to save product. Please try again."
      );
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList(fileList.filter((f) => f.uid !== file.uid));
    },
    beforeUpload: async (file) => {
      const preview = await getBase64(file);
      setFileList((prev) => [
        ...prev,
        {
          ...file,
          preview,
          url: preview,
        },
      ]);
      return false;
    },
    fileList,
    onPreview: handlePreview,
    listType: "picture-card",
    multiple: true, // Multiple files enabled
  };

  return (
    <Modal
      title={editingProduct ? "Edit Product" : "Add New Product"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          membershipType: "normal",
          stock: 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter Your Product Name" />
          </Form.Item>

          <Form.Item
            name="sku"
            label="Product SKU"
            rules={[{ required: true, message: "Please enter product SKU" }]}
          >
            <Input placeholder="Enter Your Product SKU" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Product Categories"
            rules={[{ required: true, message: "Please select product category" }]}
          >
            <Select placeholder="Select Product Categories">
              {categories.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Product Price"
            rules={[{ required: true, message: "Please enter product price" }]}
          >
            <InputNumber
              placeholder="Enter Product Price"
              min={0}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Product Stock"
            rules={[{ required: true, message: "Please enter product stock" }]}
          >
            <InputNumber placeholder="Enter Product Stock Here" min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="highestPriceForFreeShipping"
            label="Highest Price For Free Shipping"
            rules={[{ required: true, message: "Please enter highest price" }]}
          >
            <InputNumber
              placeholder="Enter Highest Price For Free Shipping"
              min={0}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="creditNeeds"
            label="Credits"
            rules={[{ required: true, message: "Please enter credit needs" }]}
          >
            <InputNumber placeholder="Enter Credit" min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="csAuraEarn"
            label="Cs Aura"
            rules={[{ required: true, message: "Please enter CS Aura earn" }]}
          >
            <InputNumber placeholder="Enter Credit" min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="creditEarn"
            label="Credit Earn"
            rules={[{ required: true, message: "Please enter credit earn" }]}
          >
            <InputNumber placeholder="Enter Credit Earn" min={0} style={{ width: "100%" }} />
          </Form.Item>

            <Form.Item
          name="membershipType"
          label="Membership Type"
          rules={[{ required: true, message: "Please select membership type" }]}
        >
          <Select placeholder="Select Membership Type">
            {membershipOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Product Description"
          rules={[{ required: true, message: "Please enter product description" }]}
        >
          <Input.TextArea placeholder="Enter product description" rows={4} />
        </Form.Item>

      

        <Form.Item label="Upload Pictures">
          <Upload {...uploadProps}>
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item className="flex justify-end">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading || updateLoading}
            >
              {editingProduct ? "Update Product" : "Add New Product"}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </Modal>
  );
};

export default ProductModal;
