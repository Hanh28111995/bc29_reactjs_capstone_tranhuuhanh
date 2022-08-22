import { Space, Table, Input, Button, Image, } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { fetchMovieListAPI } from "services/movie";
import { formatDate } from "../../utils/common";
import { useNavigate } from 'react-router-dom';
import { deleteMovieAPI } from 'services/movie';
import { notification, } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import { removeVietnameseTones } from 'constants/common';

const { Search } = Input;


function MovieTable() {

  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const { state: data = [] } = useAsync({
    dependencies: [toggle],
    service: () => fetchMovieListAPI(),
  })
  useEffect(() => {
    if (data) setMovielist(data)
  }, [data]);

  const handleDelete = async (x) => {
    await deleteMovieAPI(x);
    notification.success({
      description: " Delete Successfully !",
    });
    setToggle(!toggle);
    navigate("/admin/movie-management");
  }

  const [movielist, setMovielist] = useState(data);

  const columns = [
    {
      title: 'Mã Phim',
      dataIndex: 'maPhim',
      key: 'maPhim',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'hinhAnh',
      key: 'hinhAnh',
      render: (text) => {
        return <Image src={`${text}`} className='img-fluid' width={50} />
      }
    },
    {
      title: 'Tên phim',
      dataIndex: 'tenPhim',
      key: 'tenPhim',
    },
    {
      title: 'Ngày Khởi Chiếu',
      dataIndex: 'ngayKhoiChieu',
      key: 'ngayKhoiChieu',
      render: (text) => {
        return <span>{formatDate(text)}</span>
      }
    },


    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => navigate(`/admin/movie-management/${record.maPhim}/update`)}><EditOutlined /></a>
          <a onClick={() => handleDelete(record.maPhim)}><DeleteOutlined /></a>
          <a onClick={() => navigate(`/admin/movie-management/${record.maPhim}/edit-showtime`)}><CarryOutOutlined /></a>
        </Space>
      ),
    },
  ];


  const onSearch = (value) => {
    const keyword = value;
    let DT = data.filter((ele) => {
      return (
        removeVietnameseTones(ele.tenPhim)
          .toLowerCase()
          .trim()
          .indexOf(removeVietnameseTones(keyword).toLowerCase().trim()) !== -1
      );
    });
    setMovielist(DT);
  }

  return (
    <>
      <Space direction="vertical" className='mb-3' style={{ width: "100%" }}>
        <Search
          placeholder="Movie search "
          onSearch={onSearch}
        />
      </Space>
      <div className='text-left mb-3'>
        <Button type='primary' onClick={() => navigate('/admin/movie-management/create')}>
          CREATE
        </Button>
      </div>
      <Table rowKey='maPhim' columns={columns}
        dataSource={movielist} />
    </>
  )
}

export default MovieTable;