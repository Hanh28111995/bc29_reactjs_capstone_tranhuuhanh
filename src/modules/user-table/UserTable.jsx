import { Space, Table, Tag,Button, Image, } from 'antd';
import React, { useState } from 'react';
import { useAsync } from "../../hooks/useAsync";
import {formatDate} from "../../utils/common";
import { useNavigate } from 'react-router-dom';
import { notification,} from 'antd';
import { userListApi } from 'services/user';

function UserTable() {
  
  const navigate = useNavigate();
//   const [toggle, setToggle] = useState(false);
  const {state: data = []} = useAsync({
    dependencies: []  ,
    service:() => userListApi(),
  })

//   const handleDelete = async (x) =>{
//     await deleteMovieAPI(x);
//     notification.success({
//      description: " Delete Successfully !",
//    });
//    setToggle(!toggle);
//    navigate("/admin/movie-management");
//    }

  const columns = [
    {title: 'STT', dataIndex: 'STT', key: 'STT'},
    {
      title: 'Tài Khoản',
      dataIndex: 'taiKhoan',
      key: 'taiKhoan',
    },
    {
        title: 'Họ tên',
        dataIndex: 'hoTen',
        key: 'hoTen',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Số Điện Thoại',
        dataIndex: 'soDT',
        key: 'soDT',
      },
  
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={()=> navigate(`/admin/user-management/${record.taiKhoan}/edit`)}>Edit</a>
          <a >Delete</a>
        </Space>
      ),
    },
  ];
  console.log(data);
  

  return (
    <>
    <Table rowKey='taiKhoan' 
    columns={columns} dataSource={data.map((item, index) => ({...item, STT: index + 1}))} />
    </>
  )
}

export default UserTable;