import { Space, Table, Input, Button, App, Popconfirm, Card, Tag } from 'antd';
import React, { useMemo, useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { fetchTheaterListAPI, deleteTheaterAPI } from 'services/theater';
import './index.scss';

const { Search } = Input;

export default function TheaterManagement() {
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { notification } = App.useApp();

  const { state: data = [], loading } = useAsync({
    dependencies: [toggle],
    service: fetchTheaterListAPI,
  });

  const theaterList = useMemo(() => {
    if (!keyword) return data;
    const key = keyword.toLowerCase().trim();
    return data.filter(ele =>
      (ele.branch?.toLowerCase().includes(key)) ||
      (ele.name?.toLowerCase().includes(key))
    );
  }, [data, keyword]);

  const handleDelete = async (id) => {
    try {
      await deleteTheaterAPI(id);
      notification.success({
        message: "Thành công",
        description: "Phòng chiếu đã được xóa khỏi hệ thống."
      });
      setToggle(prev => !prev);
    } catch (error) {
      notification.error({
        message: "Xóa thất bại",
        description: error.response?.data?.message || "Vui lòng thử lại sau."
      });
    }
  };

  const columns = [
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      width: '35%',
      render: (text) => <Tag color="blue" className="branch-tag">{text}</Tag>,
      filters: [...new Set(data.map(item => item.branch))].filter(Boolean).map(b => ({ text: b, value: b })),
      onFilter: (value, record) => record.branch === value,
    },
    {
      title: 'Tên Phòng Chiếu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số lượng ghế',
      key: 'totalSeats',
      // width: "40%",
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
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="theater-management-container">
      <Card title="Quản lý rạp và phòng chiếu">
        <div className="table-header">
          <Search
            className='search-box'
            placeholder="Tìm theo chi nhánh hoặc tên phòng..."
            allowClear
            enterButton={<Button icon={<SearchOutlined />}></Button>}
            size='large'
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

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
          loading={loading}
          bordered
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>
    </div>
  );
}