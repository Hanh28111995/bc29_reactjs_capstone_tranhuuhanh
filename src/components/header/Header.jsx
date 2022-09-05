import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { setUserInfoAction } from "../../store/actions/user.action";
import "./index.scss";
import { useAsync } from "hooks/useAsync";
import { userDetailApi } from "services/user";

export default function Header() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setUserInfoAction(null));
    navigate('/');
  }

  const { state: userDetail = [] } = useAsync({
    service: () => userDetailApi(userState.userInfor.taiKhoan),
    dependencies: [userState],
    codintion: userState,
  });

  const render_card1 =
    userDetail?.thongTinDatVe?.map(ele => {
      return [
        ele.tenPhim,
        ele.giaVe,
        ]
    })
    const render_card2 =  
    userDetail?.thongTinDatVe?.map(ele=>{
      return (ele.danhSachGhe.map(eles=>{
        return [
          eles.tenGhe,
          eles.tenHeThongRap,
        ]
      }))
    })


  // console.log(render_card1, render_card2);

  return (
    <>
      <div className="modal fade show" id="myModal" aria-modal="true" style={{ display: 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h4 className="modal-title">YOUR CART</h4>
              <button type="button" className="close" data-dismiss="modal">×</button>
            </div>
            {/* Modal body */}
            <div className="modal-body">
              <table className="table">
                <thead>
                  <tr><td>Order</td>
                    <td>Name of product</td>
                    <td>Price</td>
                    <td>Quantity</td>
                    <td>Total Price</td>
                    <td />
                  </tr></thead>
                <tbody id="tableContent" />
                <tfoot>
                  <tr>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} colSpan={6}>Total price: $<span id="totalPrice" >0</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Modal footer */}
            <div className="modal-footer">
              <button className="btn btn-success" id="showBill" data-toggle="modal" data-target="#myPayment" >Purchase</button>
              <button className="btn btn-warning" >Clear</button>
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">
          <img src="https://cybersoft.edu.vn/wp-content/uploads/2017/03/MIN-OP1.png" alt="" style={{ height: '45px', marginLeft: '10%' }} />
        </a>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavId"
          aria-controls="collapsibleNavId"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse " id="collapsibleNavId">
          <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
            <li className="nav-item ">
              <NavLink className={((pathname.includes('/movie/')) || (pathname == '/')) ? 'nav-link nav-header active' : 'nav-link nav-header inactive'} to="/" >
                PHIM
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-theater">
                RẠP CHIẾU PHIM
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/khuyenmai">
                KHUYẾN MÃI
              </NavLink>
            </li>
          </ul>
          {!userState.userInfor ? (
            <div className="ml-auto d-flex align-items-center">
              <button
                onClick={() => navigate("/register")}
                className="btn-more-infor my-2 my-sm-0 mr-2"
                style={{ height: "40px", width: "100px", display: 'inline-block' }}
              >
                Đăng ký
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn-more-infor my-2 my-sm-0 mr-2"
                style={{ height: "40px", width: "100px", display: 'inline-block' }}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="ml-auto d-flex align-items-center justify-content-between pl-2" >
              <button className="btn mx-2" id="showCartBtn" data-toggle="modal" data-target="#myModal">
                <i className="fa fa-shopping-cart" />
                <p  className="numCartItem">{render_card1?.length}</p>
              </button>
              <div style={{ fontSize: '12px', flexDirection: 'column' }}>
                <button
                  onClick={handleLogout}
                  className="btn-more-infor my-2 my-sm-0 mr-2"
                  style={{ height: "40px", width: "100px", display: 'inline-block' }}
                  type="sumit"
                >
                  Đăng xuất
                </button>
                <p className="my-0">Xin chào! {userState.userInfor.hoTen} </p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
