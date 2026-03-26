import {
  DesktopOutlined,
  UserOutlined,
  DatabaseOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { /* Breadcrumb, */ Layout, Menu, Image } from "antd";
import { ProConfigProvider } from "@ant-design/pro-components";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./index.scss";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children, type) {
  return { key, icon, children, label, type };
}

const items = [
  getItem('Movie management', '/admin/movie-management', <DesktopOutlined />),
  getItem('User management', '/admin/user-management', <UserOutlined />),
  getItem('Theater management', 'theater', <DatabaseOutlined />, [
    getItem('Seat Types', '/admin/seat-types'),
    getItem('Branches', '/admin/branches'),
    getItem('Theaters', '/admin/theater-management'),
    getItem('Showtimes', '/admin/showtimes'),
    getItem('Tickets', '/admin/ticket-management'),
  ]),
  getItem('Tools', 'tools', <ToolOutlined />, [
    getItem('Schedule Generator', '/admin/tools/schedule-generator'),
  ]),
];

// // Tách riêng để chỉ component này rerender khi pathname thay đổi
// const AdminBreadcrumb = memo(() => {
//   const { pathname } = useLocation();
//   const breadcrumb = pathname.split('/').map(segment => {
//     if (!segment) return '';
//     return segment.replace(/[^a-zA-Z0-9]/g, ' ').replace(/^\w/, c => c.toUpperCase());
//   });
//   return (
//     <Breadcrumb>
//       <Breadcrumb.Item>{breadcrumb[1]}</Breadcrumb.Item>
//       <Breadcrumb.Item>{breadcrumb[2]}</Breadcrumb.Item>
//     </Breadcrumb>
//   );
// });

// Tách riêng để chỉ component này rerender khi pathname thay đổi
const AdminMenu = memo(({ setCollapsed }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const selectedKeys = useMemo(() => {
    const flat = items.flatMap(i => i.children ? i.children : [i]);
    const match = flat.find(i => pathname.startsWith(i.key));
    return [match?.key || pathname];
  }, [pathname]);

  const handleClick = (e) => {
    e.domEvent.stopPropagation();
    navigate(e.key);
    setCollapsed(true);
  };

  return (
    <Menu
      defaultSelectedKeys={['/admin/movie-management']}
      mode="inline"
      theme="dark"
      items={items}
      selectedKeys={selectedKeys}
      onClick={handleClick}
    />
  );
});

// Tách Sider ra riêng để collapsed state không làm rerender Outlet
const AdminSider = memo(({ onContentCollapse }) => {
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = useCallback((value) => setCollapsed(value), []);
  const handleMouseEnter = useCallback(() => setCollapsed(false), []);
  const handleMouseLeave = useCallback(() => setCollapsed(true), []);
  const handleSiderClick = useCallback(() => setCollapsed(false), []);

  const handleSetCollapsed = useCallback((v) => {
    setCollapsed(v);
    onContentCollapse?.(v);
  }, [onContentCollapse]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onClick={handleSiderClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onCollapse={handleCollapse}
      style={{
        position: 'fixed',
        zIndex: 100,
        height: '100vh',
        left: 0,
        transition: 'all 0.2s',
      }}
    >
      <div className="logo">
        <a href="/">
          <Image src="/images/logo-admin.svg" width={100} preview={false} />
        </a>
      </div>
      <AdminMenu setCollapsed={handleSetCollapsed} />
    </Sider>
  );
});

// Content tách riêng để không rerender khi Sider collapsed thay đổi
const AdminContent = memo(({ onCollapse }) => {
  const handleContentClick = useCallback(() => onCollapse?.(true), [onCollapse]);

  return (
    <Layout className="site-layout">
      <Header className="site-layout-background" style={{ padding: 0 }} />
      <Content onClick={handleContentClick} style={{ margin: '0 16px' }}>
        {/* <AdminBreadcrumb /> */}
        <div className="site-layout-background" style={{ paddingTop: 24, minHeight: 360 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©2018 Created by Ant UED
      </Footer>
    </Layout>
  );
});

function AdminLayout() {
  // Dùng ref để truyền callback collapse xuống mà không gây rerender AdminLayout
  const collapseRef = useRef(null);

  const handleContentCollapse = useCallback((v) => {
    collapseRef.current?.(v);
  }, []);

  return (
    <ProConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSider onContentCollapse={collapseRef} />
        <AdminContent onCollapse={handleContentCollapse} />
      </Layout>
    </ProConfigProvider>
  );
}

export default AdminLayout;
