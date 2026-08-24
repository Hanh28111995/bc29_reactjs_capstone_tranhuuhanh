import { Space, Table, Button, App, Popconfirm, Card, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons";
import { fetchTheaterListAPI, deleteTheaterAPI } from 'services/theater';
import { safeArray, useAsync, useAsyncMutation } from 'hooks/useAsync';
import "./index.scss";

export default function TheaterTable() {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  // Quản lý limit hiển thị ban đầu (8 hoặc 10 item tùy ý)
  const [limit, setLimit] = useState(10);
  const [theaterList, setTheaterList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // 1. Gọi API lấy danh sách rạp/phòng chiếu dựa theo limit hiện tại (từ trang 1)
  const { data: responseContent, loading: isLoading } = useAsync({
    dependencies: [limit],
    queryKey: ['theaters_list', limit],
    service: () => fetchTheaterListAPI({ page: 1, limit }),
  });

  // Đồng bộ dữ liệu trả về từ API vào state local
  useEffect(() => {
    if (responseContent) {
      const content = responseContent?.data ?? responseContent;
      const list = safeArray(content?.theaters ?? content);
      const totalRecord = content?.pagination?.total || list.length;
      
      setTheaterList(list);
      setTotalItems(totalRecord);
    }
  }, [responseContent]);

  // 2. Sử dụng useAsyncMutation chuẩn của dự án để xóa phòng chiếu
  const { mutateAsync: deleteTheater, isPending: isDeleting } = useAsyncMutation({
    service: (id) => deleteTheaterAPI(id),
    invalidateQueries: [['theaters_list']],
    onSuccess: () => {
      notification.success({
        message: "Thành công",
        description: "Phòng chiếu đã được xóa khỏi hệ thống."
      });
    },
    onError: (error) => {
      notification.error({
        message: "Xóa thất bại",
        description: error.response?.data?.message || "Vui lòng thử lại sau."
      });
    },
  });

  const handleDelete = async (id) => {
    await deleteTheater(id);
  };

  // Hàm xử lý khi bấm nút Load More (tăng limit lên mỗi lần bấm)
  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 10);
  };

  const columns = [
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      width: '35%',
      render: (text) => <Tag color="blue" className="branch-tag">{text || '---'}</Tag>,
    },
    {
      title: 'Tên Phòng Chiếu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Số lượng ghế',
      key: 'totalSeats',
      render: (_, record) => {
        const rows = record.totalSeat?.rows || 0;
        const cols = record.totalSeat?.cols || 0;
        return (
          <span>
            <b>{rows * cols}</b> Ghế ({rows} x {cols})
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: "15%",
      render: (_, record) => (
        <Space size="small" className="action-btns">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => navigate(`/admin/theater-management/${record._id}/update`)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={isDeleting} // Khóa nút khi đang xóa tránh click đúp
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Kiểm tra xem còn dữ liệu ở server để load tiếp hay không
  const hasMore = theaterList.length < totalItems;

  return (
    <div className="movie-management-container">
      <Card title="Quản lý rạp và phòng chiếu">
        <div className="table-header" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-btn"
            onClick={() => navigate('/admin/theater-management/create')}
          >
            THÊM PHÒNG CHIẾU
          </Button>
        </div>

        <Table
          tableLayout='fixed'
          className="custom-table"
          rowKey="_id"
          columns={columns}
          dataSource={theaterList}
          loading={isLoading || isDeleting}
          bordered
          pagination={false} // Tắt hoàn toàn phân trang truyền thống
        />

        {/* Khu vực nút Load More */}
        {totalItems > 10 && (
          <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
            {hasMore ? (
              <Button 
                onClick={handleLoadMore} 
                loading={isLoading}
                icon={<DownOutlined />}
                size="large"
                style={{ minWidth: 200 }}
              >
                Xem thêm ({theaterList.length}/{totalItems})
              </Button>
            ) : (
              <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
                Đã hiển thị tất cả {totalItems} phòng chiếu.
              </span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}