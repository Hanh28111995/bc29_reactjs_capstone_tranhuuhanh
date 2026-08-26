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
    queryKey: ["branches-list", "all"],
  });

  const data = safeArray(rawData?.cinemas);

  // Đồng bộ và chuẩn hóa dữ liệu gốc khi fetch thành công
  useEffect(() => {
    if (data && data.length > 0) {
      const normalizedData = data.map((item) => {
        let coords = [0, 0];
        let rawCoords = item.coordinates;

        // Nếu backend lỡ trả về dạng chuỗi JSON (ví dụ: '["10.8, "106.9"]') thì parse nó ra mảng
        if (typeof rawCoords === "string") {
          try {
            rawCoords = JSON.parse(rawCoords);
          } catch (e) {
            rawCoords = [];
          }
        }

        if (Array.isArray(rawCoords) && rawCoords.length >= 2) {
          coords = [Number(rawCoords[0]) || 0, Number(rawCoords[1]) || 0];
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
  }, [data]);

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
    setDataSource(dataSource.filter((item) => item._id !== record._id));
    message.info("Đã xóa tạm thời. Nhấn LƯU TẤT CẢ để áp dụng.");
  };

  const handleRowSave = (key) => {
    const isNew = key?.toString().startsWith("new_");
    if (!isNew) {
      setUpdatedIds((prev) => [...new Set([...prev, key])]);
    }
    message.info(
      "Đã ghi nhận thay đổi dòng. Nhấn LƯU TẤT CẢ để cập nhật server.",
    );
  };

  const handleTableChange = (updatedList) => {
    if (searchText) {
      setDataSource((prevDataSource) => {
        const updatedMap = new Map(updatedList.map((item) => [item._id, item]));
        const merged = prevDataSource.map(
          (item) => updatedMap.get(item._id) || item,
        );
        updatedList.forEach((item) => {
          if (!prevDataSource.some((p) => p._id === item._id)) {
            merged.push(item);
          }
        });
        return merged;
      });
    } else {
      setDataSource(updatedList);
    }
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
      dataIndex: ["coordinates", 0], // Map trực tiếp vào phần tử đầu của mảng coordinates
      width: "14%",
      valueType: "digit",
      formItemProps: {
        rules: [{ required: true, message: "Nhập Lng" }],
      },
    },
    {
      title: "Vĩ độ (Lat)",
      dataIndex: ["coordinates", 1], // Map trực tiếp vào phần tử thứ hai của mảng coordinates
      width: "14%",
      valueType: "digit",
      formItemProps: {
        rules: [{ required: true, message: "Nhập Lat" }],
      },
    },
    {
      title: "Thao tác",
      valueType: "option",
      width: "12%",
      render: (text, record, _, action) => {
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

          // Chuẩn hóa và ép kiểu tường minh coordinates thành mảng [Lng, Lat]
          const payload = {
            ...restItem,
            coordinates: [
              Number(item.coordinates?.[0]) || 0,
              Number(item.coordinates?.[1]) || 0,
            ],
          };

          promises.push(addOneBranchApi(payload));
        });

      // 3. Xử lý các dòng được cập nhật
      updatedIds.forEach((id) => {
        const item = dataSource.find((d) => d._id === id);
        if (item && !deleteIds.includes(id)) {
          // Chuẩn hóa và ép kiểu tường minh coordinates thành mảng [Lng, Lat]
          const payload = {
            ...item,
            coordinates: [
              Number(item.coordinates?.[0]) || 0,
              Number(item.coordinates?.[1]) || 0,
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

      queryClient.invalidateQueries({ queryKey: ["branches-list"] });
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

  return (
    <div className="movie-management-container">
      <Card title="Quản lý chi nhánh rạp">
        <div className="table-header-toolbar">
          <div className="search-box">
            <Search
              placeholder="Tìm kiếm rạp, chi nhánh hoặc địa chỉ..."
              allowClear
              enterButton={<Button icon={<SearchOutlined />}></Button>}
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
            record: () => ({
              _id: `new_${Date.now()}`,
              cinemaName: "",
              branch: "",
              address: "",
              coordinates: [0, 0], // Khởi tạo mặc định mảng 2 số tránh lỗi undefined
            }),
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
            disabled={
              loading ||
              isSaving ||
              (deleteIds.length === 0 &&
                updatedIds.length === 0 &&
                !dataSource.some((item) =>
                  item._id?.toString().startsWith("new_"),
                ))
            }
          >
            LƯU TẤT CẢ THAY ĐỔI
          </Button>
        </div>
      </Card>
    </div>
  );
}
