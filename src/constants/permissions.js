import { MaLoaiNguoiDung } from "enums/common";

const { QuanTri, NhanVien, KhachHang } = MaLoaiNguoiDung;

// Mỗi key là một action, value là danh sách role được phép
export const PERMISSIONS = {
  // Booking
  canReserveTicket:     [KhachHang],
  canBuyTicket:         [KhachHang, NhanVien, QuanTri],
  canPayCash:           [NhanVien, QuanTri],
  canSearchCustomer:    [NhanVien, QuanTri],

  // Admin panel
  canManageMovies:      [QuanTri],
  canManageUsers:       [QuanTri],
  canManageTheaters:    [QuanTri],
  canManageShowtimes:   [QuanTri],
  canManageTickets:     [NhanVien, QuanTri],
  canManageBranches:    [QuanTri],
  canManageSeatTypes:   [QuanTri],
};

// Helper: kiểm tra role có quyền không
export const hasPermission = (role, action) =>
  PERMISSIONS[action]?.includes(role) ?? false;
