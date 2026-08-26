import { EditableProTable } from "@ant-design/pro-components";
import { Button, App, Card, Input, Popconfirm } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { useAsync, safeArray } from "../../hooks/useAsync";
import {
  getAllBranches,
  deleteOneBranchApi,
  addOneBranchApi,
  updateBranhesApi,
} from "services/branches";
import {
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import "./index.scss";

const { Search } = Input;

export default function BranchesTable() {
  const { notification, message } = App.useApp();
  const queryClient = useQueryClient();

  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [deleteIds, setDeleteIds] = useState([]);
  const [updatedIds, setUpdatedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const { state: rawData, loading } = useAsync({
    service: getAllBranches,
    queryKey: ["branches-list"],
  });

  const data = safeArray(rawData?.cinemas);

  // Đồng bộ và chuẩn hóa dữ liệu gốc khi fetch thành công
  useEffect(() => {
    if (data && data.length > 0) {
      const normalizedData = data?.map((item) => {
        let coords = ["0", "0"];
        let rawCoords = item.coordinates;

        if (typeof rawCoords === "string") {
          try {
            rawCoords = JSON.parse(rawCoords);
          } catch (e) {
            rawCoords = [];
          }
        }

        if (Array.isArray(rawCoords) && rawCoords.length >= 2) {
          coords = [
            String(rawCoords[0] ?? 0).replace(",", "."),
            String(rawCoords[1] ?? 0).replace(",", "."),
          ];
        }

        return {
          ...item,
          coordinates: coords,
        };
      });

      setDataSource(normalizedData);
      setDeleteIds([]);
      setUpdatedIds([]);
    }
  }, [rawData]); // Lắng nghe rawData thay vì biến data để tránh re-run không cần thiết

  const displayData = useMemo(() => {
    if (!searchText) return dataSource;
    const lowerSearch = searchText.toLowerCase().trim();
    return dataSource.filter(
      (item) =>
        item.cinemaName?.toLowerCase().includes(lowerSearch) ||
        item.branch?.toLowerCase().includes(lowerSearch) ||
        item.address?.toLowerCase().includes(lowerSearch),
    );
  }, [dataSource, searchText]);

  const handleDelete = (record) => {
    const isNew = record._id?.toString().startsWith("new_");
    if (!isNew) {
      setDeleteIds((prev) => [...new Set([...prev, record._id])]);
      setUpdatedIds((prev) => prev.filter((id) => id !== record._id));
    }
    setDataSource((prev) => prev.filter((item) => item._id !== record._id));
    message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
  };

  const handleRowSave = (key) => {
    const isNew = key?.toString().startsWith("new_");
    if (!isNew) {
      setUpdatedIds((prev) => [...new Set([...prev, key])]);
    }
    message.info("Đã ghi nhận thay đổi dòng. Nhấn LƯU TẤT CẢ để cập nhật server.");
  };

  const handleTableChange = (updatedList) => {
    setDataSource((prevDataSource) => {
      const updatedMap = new Map(updatedList.map((item) => [item._id, item]));
      
      const merged = prevDataSource.map((item) => {
        return updatedMap.has(item._id) ? updatedMap.get(item._id) : item;
      });

      updatedList.forEach((item) => {
        if (!prevDataSource.some((p) => p._id === item._id)) {
          merged.push(item);
        }
      });

      return merged;
    });
  };

  const columns = [
    {
      title: "Tên rạp",
      dataIndex: "cinemaName",
      width: "18%",
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Tên chi nhánh",
      dataIndex: "branch",
      width: "20%",
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Kinh độ (Lng)",
      dataIndex: ["coordinates", 0],
      width: "14%",
      align: "center",
      valueType: "text", 
      formItemProps: {
        rules: [
          { required: true, message: "Nhập Lng" },
          {
            validator: (_, value) => {
              if (value === undefined || value === null || value === "") {
                return Promise.reject(new Error("Nhập Lng"));
              }
              const regex = /^-?\d+([.,]\d+)?$/;
              if (!regex.test(String(value).trim())) {
                return Promise.reject(new Error("Kinh độ phải là định dạng số hợp lệ"));
              }
              return Promise.resolve();
            },
          },
        ],
      },
    },
    {
      title: "Vĩ độ (Lat)",
      dataIndex: ["coordinates", 1],
      width: "14%",
      align: "center",
      valueType: "text",
      formItemProps: {
        rules: [
          { required: true, message: "Nhập Lat" },
          {
            validator: (_, value) => {
              if (value === undefined || value === null || value === "") {
                return Promise.reject(new Error("Nhập Lat"));
              }
              const regex = /^-?\d+([.,]\d+)?$/;
              if (!regex.test(String(value).trim())) {
                return Promise.reject(new Error("Vĩ độ phải là định dạng số hợp lệ"));
              }
              return Promise.resolve();
            },
          },
        ],
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      width: "12%",
      align: "center",
      render: (_, record, __, action) => {
        const isEditing = editableKeys.includes(record._id);
        if (isEditing) return null;

        return [
          <div className="action-btns" key="actions">
            <Button
              key="edit"
              type="text"
              icon={<EditOutlined style={{ color: "#1677ff" }} />}
              onClick={() => action?.startEditable?.(record._id)}
            />
            <Popconfirm
              key="delete-confirm"
              title="Xóa tạm thời chi nhánh này?"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                type="text"
                icon={<DeleteOutlined style={{ color: "red" }} />}
              />
            </Popconfirm>
          </div>,
        ];
      },
    },
  ];

  const handleSaveAll = async () => {
    if (editableKeys.length > 0) {
      return message.warning(
        "Vui lòng nhấn 'Lưu' hoặc 'Hủy' trên các dòng đang sửa trước!",
      );
    }

    try {
      const promises = [];

      // 1. Xử lý các ID bị xóa
      deleteIds.forEach((id) => promises.push(deleteOneBranchApi(id)));

      // 2. Xử lý các dòng thêm mới
      dataSource
        .filter((item) => item._id?.toString().startsWith("new_"))
        .forEach((item) => {
          const { _id, ...restItem } = item;
          const payload = {
            ...restItem,
            coordinates: [
              Number(String(item.coordinates?.[0] || 0).replace(",", ".")) || 0,
              Number(String(item.coordinates?.[1] || 0).replace(",", ".")) || 0,
            ],
          };
          promises.push(addOneBranchApi(payload));
        });

      // 3. Xử lý các dòng được cập nhật
      updatedIds.forEach((id) => {
        const item = dataSource.find((d) => d._id === id);
        if (item && !deleteIds.includes(id)) {
          const payload = {
            ...item,
            coordinates: [
              Number(String(item.coordinates?.[0] || 0).replace(",", ".")) || 0,
              Number(String(item.coordinates?.[1] || 0).replace(",", ".")) || 0,
            ],
          };
          promises.push(updateBranhesApi(payload));
        }
      });

      if (promises.length === 0)
        return message.warning("Không có thay đổi nào để lưu!");

      setIsSaving(true);
      await Promise.all(promises);

      notification.success({
        message: "Thành công",
        description: "Hệ thống chi nhánh đã được cập nhật thành công.",
      });

      // Reset các state tracking thay đổi
      setDeleteIds([]);
      setUpdatedIds([]);
      setEditableRowKeys([]);

      // Invalidate cache để fetch lại data mới nhất từ server
      await queryClient.invalidateQueries({ queryKey: ["branches-list"] });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.content ||
          error.response?.data?.message ||
          "Lưu thất bại. Vui lòng kiểm tra lại hệ thống.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    deleteIds.length > 0 || 
    updatedIds.length > 0 || 
    dataSource.some((item) => item._id?.toString().startsWith("new_"));

  return (
    <div className="movie-management-container">
      <Card title="Quản lý chi nhánh rạp">
        <div className="table-header-toolbar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, maxWidth: 400 }}>
            <Search
              placeholder="Tìm kiếm rạp, chi nhánh hoặc địa chỉ..."
              allowClear
              enterButton={<Button icon={<SearchOutlined />} />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <EditableProTable
          className="custom-editable-table"
          rowKey="_id"
          loading={loading}
          columns={columns}
          value={displayData}
          onChange={handleTableChange}
          recordCreatorProps={{
            position: "bottom",
            creatorButtonText: "Thêm chi nhánh mới",
            record: () => {
              // Tự động xóa bộ lọc tìm kiếm khi thêm mới để đảm bảo dòng mới hiện lên bảng
              if (searchText) setSearchText("");
              return {
                _id: `new_${Date.now()}`,
                cinemaName: "",
                branch: "",
                address: "",
                coordinates: ["0", "0"],
              };
            },
          }}
          editable={{
            type: "multiple",
            editableKeys,
            onChange: setEditableRowKeys,
            onSave: handleRowSave,
            saveText: "Lưu",
            cancelText: "Hủy",
            actionRender: (row, config, defaultDoms) => [
              defaultDoms.save,
              defaultDoms.cancel,
            ],
          }}
          search={false}
          options={false}
        />

        <div
          className="save-all-wrapper"
          style={{ marginTop: 24, textAlign: "right" }}
        >
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={isSaving}
            disabled={loading || isSaving || !hasChanges}
          >
            LƯU TẤT CẢ THAY ĐỔI
          </Button>
        </div>
      </Card>
    </div>
  );
}