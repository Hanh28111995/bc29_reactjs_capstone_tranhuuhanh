import {
  DesktopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { NavLink, Route, useLocation, } from 'react-router-dom';
import { Breadcrumb, Layout, Menu, Image } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
  getItem('Movie management', '/admin/movie-management', <DesktopOutlined/>),
  getItem('User management', '/admin/user-management', <UserOutlined />),
]

 function AdminLayout() {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const MenuClick =(value) => {
    navigate(value.key);
  }
  const breadcrumb = pathname.split('/');
  // console.log(breadcrumb)
  
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" >
          <Image  src="https://cybersoft.edu.vn/wp-content/uploads/2021/03/logo-cyber-nav.svg" width={100} preview={false} />
          </div>
        <Menu
        defaultSelectedKeys={['/admin/movie-management']}
        mode="inline"
        theme="dark"
        // inlineCollapsed={collapsed}
        items={items}
        selectedKeys={[pathname]}
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
          <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item>{breadcrumb[1]}</Breadcrumb.Item>
            <Breadcrumb.Item>{breadcrumb[2]}</Breadcrumb.Item>
          </Breadcrumb>
          <div
            className="site-layout-background"
            style={{
              padding: 24,
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
