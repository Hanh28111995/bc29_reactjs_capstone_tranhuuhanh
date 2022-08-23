import {
  DesktopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { NavLink, Route, } from 'react-router-dom';
import { Breadcrumb, Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;


 function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu defaultSelectedKeys={['link1']} theme="dark">
          <Menu.Item key='link1' theme="dark" mode="vertical"  >
            <NavLink to={'/admin/movie-management'} className='d-flex align-items-center text-decoration-none'><DesktopOutlined className="mr-2"/> Movie management</NavLink>
          </Menu.Item>
          <Menu.Item key='link2' theme="dark" mode="inline" >
            <NavLink to={'/admin/user-management'} className='d-flex align-items-center text-decoration-none'><UserOutlined className="mr-2"/>User management</NavLink>
          </Menu.Item>
        </Menu>
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
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
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
