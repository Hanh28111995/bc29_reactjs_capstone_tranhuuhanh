import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { setUserInfoAction } from "../../store/actions/user.action";
import { useAsync } from "hooks/useAsync";
import { userDetailApi } from "services/user";
import "./index.scss";
import { useEffect } from "react";
import { useState } from "react";



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
    dependencies: [userState.userInfor],
    codintion: userState.userInfor,
  });

  const [render, setRender] = useState([]);
  const [render1, setRender1] = useState([]);

  useEffect(() => {
    console.log(userState.userInfor? 'true': 'false')
    if (userDetail.length !== 0) {
      let render_card1 =
        userDetail.thongTinDatVe?.map(ele => {
          return [
            ele.tenPhim,
            ele.giaVe,
          ]
        })
      let render_card2 =
        userDetail.thongTinDatVe?.map(ele => {
          return (ele.danhSachGhe.map(eles => {
            return [
              eles.tenGhe,
              eles.tenHeThongRap,
            ]
          }))
        })
      let render_card = [];
      if ((render_card1) && (render_card2)) {
        for (let i = 0; i < render_card2.length; i++) {
          render_card[i] = render_card1[i].concat(render_card2[i]);
        }
      }
      setRender1(render_card1)
      setRender(render_card)
    }

  }, [userDetail])

  const sumTotal = (x) => {
    let total = 0;
    x.map(ele => {
      total += (ele[1] * (ele.length - 2));
    })
    return total
  }

  const render_in_cart =
    render.map((ele, index) => {
      return (

        <tr key={index}>
          <td>{index + 1}</td>
          <td>{ele[0]}</td>
          <td>
            {
              ele.slice(2).map(item => {
                return (item[0] + [', '])
              })
            }
          </td>
          <td> {
            ele.slice(2).map((item, index) => {
              if (index === 0) {
                return item[1]
              }
            })
          }</td>
          <td>{ele[1].toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</td>
        </tr>

      )
    })

  // console.log(render_card1, render_card2)
  return (
    < div >
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
                    <td>Name of Movie</td>
                    <td>Seat</td>
                    <td>Address</td>
                    <td>Price</td>
                    <td />
                  </tr></thead>
                <tbody >
                  {render_in_cart}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ textAlign: 'right', fontWeight: 700 }} colSpan={6}>Total price:
                      <span>{
                        ' '+sumTotal(render).toLocaleString('it-IT', { style: 'currency', currency: 'VND' })
                      }
                      </span>
                    </td>

                  </tr>
                </tfoot>
              </table>
            </div>
            {/* Modal footer */}
            <div className="modal-footer">
              {/* <button className="btn btn-success" id="showBill" data-toggle="modal" data-target="#myPayment" >Purchase</button>
              <button className="btn btn-warning" >Clear</button> */}
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light py-3">
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
              <NavLink className={((pathname.includes('/movie/')) || (pathname === '/')) ? 'nav-link nav-header active' : 'nav-link nav-header inactive'} to="/" >
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
                <p className="numCartItem">{render1.length}</p>
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
    </div>
  );
}
