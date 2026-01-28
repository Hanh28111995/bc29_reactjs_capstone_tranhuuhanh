import {
  DesktopOutlined,
  UserOutlined,
  DatabaseOutlined
} from "@ant-design/icons";
import { useLocation, } from 'react-router-dom';
import { Breadcrumb, Layout, Menu, Image } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./index.scss";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem('Movie management', '/admin/movie-management', <DesktopOutlined />),
  getItem('User management', '/admin/user-management', <UserOutlined />),
  getItem('Theater management', 'theater', <DatabaseOutlined />, [
    getItem('Seat Types', '/admin/seat-types'),
    getItem('Branches', '/admin/branches'),
    getItem('Theaters', '/admin/theater-management'),
    getItem('Showtimes', '/admin/showtimes'),
    getItem('Tickets', '/admin/tickets'),
  ]),
];

function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const MenuClick = (value) => {
    navigate(value.key);
  }
  const breadcrumb = pathname.split('/').map(segment => {
    if (!segment) return ''; // Xử lý trường hợp chuỗi rỗng

    // 1. Loại bỏ ký tự đặc biệt (giữ lại chữ và số), thay bằng khoảng trắng
    // Regex /[^a-zA-Z0-9]/g sẽ tìm tất cả ký tự KHÔNG phải chữ hoặc số
    let cleanSegment = segment.replace(/[^a-zA-Z0-9]/g, ' ');

    // 2. Viết hoa chữ cái đầu tiên của chuỗi
    return cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1);
  });


  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible
        collapsed={!collapsed}
        onMouseEnter={() => setCollapsed(true)} // Mở khi di chuột vào
        onMouseLeave={() => setCollapsed(false)}  // Đóng khi di chuột ra
        onCollapse={(value) => setCollapsed(value)}
        style={{
          position: 'absolute', // Chìa khóa để nằm đè lên
          zIndex: 100,         // Đảm bảo nằm trên bảng
          height: '100vh',
          left: 0,
          transition: 'all 0.2s', // Hiệu ứng trượt mượt mà
        }}
      >
        <div className="logo" >
          <a href="/">
            <Image src="https://cybersoft.edu.vn/wp-content/uploads/2021/03/logo-cyber-nav.svg" width={100} preview={false} />
          </a>
        </div>
        <Menu
          defaultSelectedKeys={['/admin/movie-management']}
          mode="inline"
          theme="dark"
          // inlineCollapsed={collapsed}
          items={items}
          selectedKeys={[
            items.find(item => pathname.includes(item.key))?.key ||
            items.flatMap(i => i.children || []).find(child => pathname.includes(child.key))?.key ||
            pathname
          ]}
          onClick={MenuClick}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
          }}
        />
        <Content
          style={{
            margin: '0 16px',            
          }}
        >
          {/* <Breadcrumb
            style={{
              margin: '16px 0',
              paddingLeft: '50px',
            }}
          >
            <Breadcrumb.Item>{breadcrumb[1]}</Breadcrumb.Item>
            <Breadcrumb.Item>{breadcrumb[2]}</Breadcrumb.Item>
          </Breadcrumb> */}
          <div
            className="site-layout-background"
            style={{
              paddingTop: 24,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
