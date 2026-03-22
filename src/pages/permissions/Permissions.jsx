import React from "react";
import { Table, Tag, Card } from "antd";
import { PERMISSIONS } from "constants/permissions";
import { MaLoaiNguoiDung } from "enums/common";

const roles = Object.values(MaLoaiNguoiDung);

const columns = [
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
  },
  ...roles.map((role) => ({
    title: (
      <Tag color={role === "admin" ? "red" : role === "staff" ? "blue" : "green"}>
        {role}
      </Tag>
    ),
    key: role,
    align: "center",
    render: (_, row) =>
      PERMISSIONS[row.key]?.includes(role) ? (
        <Tag color="success">✓</Tag>
      ) : (
        <Tag color="default">—</Tag>
      ),
  })),
];

const dataSource = Object.keys(PERMISSIONS).map((key) => ({
  key,
  action: key.replace(/([A-Z])/g, " $1").trim(),
}));

export default function Permissions() {
  return (
    <Card title="Role Permission Matrix">
      <Table
        rowKey="key"
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </Card>
  );
}
