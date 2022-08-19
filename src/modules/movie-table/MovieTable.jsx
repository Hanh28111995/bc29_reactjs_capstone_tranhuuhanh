import { Space, Table, Tag,Button, Image, } from 'antd';
import React, { useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import { fetchMovieListAPI } from "services/movie";
import {formatDate} from "../../utils/common";
import { useNavigate } from 'react-router-dom';
import { deleteMovieAPI } from 'services/movie';
import { notification,} from 'antd';

function MovieTable() {
  
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);
  const {state: data = []} = useAsync({
    dependencies: [toggle]  ,
    service:() => fetchMovieListAPI(),
  })

  const handleDelete = async (x) =>{
    await deleteMovieAPI(x);
    notification.success({
     description: " Delete Successfully !",
   });
   setToggle(!toggle);
   navigate("/admin/movie-management");
   }

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
        return <Image src={`${text}`} className='img-fluid' width={50}/>
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
          <a onClick={()=> navigate(`/admin/movie-management/${record.maPhim}/update`)}>Edit</a>
          <a onClick={()=> handleDelete(record.maPhim)}>Delete</a>
        </Space>
      ),
    },
  ];
  
  

  return (
    <>
    <div className='text-right mb-3'>
    <Button type='primary' onClick={()=> navigate('/admin/movie-management/create') }>
      CREATE
    </Button>
    </div>
    <Table rowKey='maPhim' columns={columns} dataSource={data} />
    </>
  )
}

export default MovieTable;