import React from 'react';
import "./index.scss";

export default function Footer() {
 
  return (
    <footer className="footer pb-3 text-center">
      <div className="footer-content">
        <div className="footer-bottom">
          <div className="container-fluid">
            <div className="row col-12">

              <div className='col-12 col-lg-6'>
                <a href="/" className=''>
                  <img src='/BHD_Cinema.png' alt="BHD Cinema" className="img-fluid" style={{ width: '80px' }} />
                </a>
                <a href="/" className=''>
                  <img src="/CGV.png" alt="CGV Cinema" className="img-fluid" style={{ width: '50px' }} />
                </a>
                <a href="/" className=''>
                  <img src="https://cinestar.com.vn/pictures/cache/moi/9Logo/trang-100x100.png" alt="Cinestar Cinema" className="img-fluid" style={{ width: '90px' }} />
                </a>
              </div>
              <div className='col-12 col-lg-6'>
                <a href="/" className=''>
                  <img src="https://www.galaxycine.vn/website/images/galaxy-logo.png" alt="Galaxy Cinema" className="img-fluid" style={{ width: '150px' }} />
                </a>
                <a href="/" className=''>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Lotte_Logo_%282017%29.svg/1920px-Lotte_Logo_%282017%29.svg.png?20220405153618" alt="Lotte Cinema" className="img-fluid" style={{ width: '90px' }} />
                </a>
                <a href="/" className=''>
                  <img src="/MegaGS.png" alt="MegaGS Cinema" className="img-fluid" style={{ width: '50px' }} />
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
