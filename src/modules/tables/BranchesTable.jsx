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

  // Đồng bộ dữ liệu gốc vào local state khi fetch thành công
  useEffect(() => {
    if (data && data.length > 0) {
      setDataSource(data);
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

  // 💡 Xử lý cập nhật dataSource an toàn, tránh mất dữ liệu khi đang lọc (search)
  const handleTableChange = (updatedList) => {
    if (searchText) {
      // Nếu đang search, EditableProTable trả về danh sách đã lọc.
      // Ta phải merge các item thay đổi ngược lại vào mảng gốc dataSource đầy đủ.
      setDataSource((prevDataSource) => {
        const updatedMap = new Map(updatedList.map((item) => [item._id, item]));

        // Cập nhật các item cũ và giữ lại các item không hiển thị trong khung search
        const merged = prevDataSource.map(
          (item) => updatedMap.get(item._id) || item,
        );

        // Thêm các item mới tạo (nếu có nằm trong danh sách lọc)
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
      width: "18%", // Tăng nhẹ để hiển thị trọn tên rạp
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Tên chi nhánh",
      dataIndex: "branch",
      width: "22%", // Thu hẹp một chút cho cân đối
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      // Bỏ width để cột Địa chỉ tự động chiếm phần không gian còn lại (địa chỉ thường dài)
      formItemProps: {
        rules: [{ required: true, message: "Không được để trống" }],
      },
    },
    {
      title: "Tọa độ [Lng, Lat]",
      dataIndex: "coordinates",
      width: "22%", // Đủ rộng để hiển thị cặp số tọa độ
      // Khi hiển thị bình thường (không sửa): chuyển mảng thành chuỗi dễ đọc
      render: (val) => (Array.isArray(val) ? val.join(", ") : val),
      // Khi sửa: hiển thị ô input text bình thường
      formItemProps: {
        rules: [
          { required: true, message: "Không được để trống" },
          {
            validator: (_, value) => {
              // Cho phép nhập chuỗi số cách nhau bởi dấu phẩy
              if (!value) return Promise.reject();
              const parts = Array.isArray(value)
                ? value
                : String(value).split(",");
              if (
                parts.length !== 2 ||
                parts.some((p) => isNaN(Number(p.trim())))
              ) {
                return Promise.reject(
                  new Error(
                    "Sai định dạng! Phải gồm 2 số cách nhau bởi dấu phẩy (VD: 106.69, 10.75)",
                  ),
                );
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
      width: "12%", // Vừa đủ cho 2 nút Sửa / Xóa, gọn gàng hơn
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
          const { _id, ...payload } = item;

          // Chuẩn hóa tọa độ cho bản ghi mới
          if (payload.coordinates) {
            if (typeof payload.coordinates === "string") {
              payload.coordinates = payload.coordinates
                .split(",")
                .map((num) => Number(num.trim()));
            } else if (Array.isArray(payload.coordinates)) {
              payload.coordinates = payload.coordinates.map((num) =>
                Number(num),
              );
            }
          }

          promises.push(addOneBranchApi(payload));
        });

      // 3. Xử lý các dòng được cập nhật
      updatedIds.forEach((id) => {
        const item = dataSource.find((d) => d._id === id);
        if (item && !deleteIds.includes(id)) {
          // Clone lại item để tránh làm thay đổi trực tiếp state của bảng
          let payload = { ...item };

          // Chuẩn hóa tọa độ cho bản ghi cập nhật
          if (payload.coordinates) {
            if (typeof payload.coordinates === "string") {
              payload.coordinates = payload.coordinates
                .split(",")
                .map((num) => Number(num.trim()));
            } else if (Array.isArray(payload.coordinates)) {
              payload.coordinates = payload.coordinates.map((num) =>
                Number(num),
              );
            }
          }

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

      // Invalidate query key chuẩn toàn cục
      queryClient.invalidateQueries({ queryKey: ["branches-list"] });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description:          
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
