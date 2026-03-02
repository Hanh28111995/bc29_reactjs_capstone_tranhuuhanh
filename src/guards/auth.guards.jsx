export default function AuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const { openLogin } = useAuth();

  useEffect(() => {
    if (!userState.userInfor) {
      openLogin();
    }
  }, [userState.userInfor, openLogin]);

  // Nếu chưa đăng nhập, không trả về Outlet để tránh render trang bảo mật
  if (!userState.userInfor) {
    return null; // Hoặc một trang Loading/thông báo
  }

  return <Outlet />;
}