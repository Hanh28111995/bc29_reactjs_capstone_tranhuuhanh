import { useAsync } from 'hooks/useAsync';
import React from 'react';
import { HethongrapListApi } from 'services/showtime';
import { banner_theater } from 'constants/common';
import {  useState } from "react";
import { HethongrapCumrapListApi } from "services/showtime";
import "./index.scss";



function MovieTheater() {
    const [moreOption, setmoreOption] = useState('BHDStar');

    const { state: Hethongrap = [] } = useAsync({
        service: () => HethongrapListApi(),
        dependencies: [],
    })

    const { state: Cumrap = [] } = useAsync({
        service: () => HethongrapCumrapListApi(moreOption),
        dependencies: [moreOption],
    })

    const uploadAddress = (value) => {
        setmoreOption(value);
        // console.log(value)
    };

    const Nav_Hethongrap1 = () => {
        return Hethongrap.map((ele, index) => {
            return (
                <li key={index} className="nav-item col-4 col-md-2 col-lg-2" onClick={() => uploadAddress(ele.maHeThongRap)} >
                    <a className={`nav-link nav-theater ${index === 0 && "active"}`} data-toggle="pill" href={'#' + ele.maHeThongRap}>{ele.maHeThongRap}</a>
                </li>
            )
        })
    }

    const Nav_Hethongrap2 = () => {
        return Hethongrap.map((ele, index) => {
            return (
                <div key={ele.maHeThongRap} id={ele.maHeThongRap} className={`tab-pane ${index === 0 && "active"}`}>
                    {/* <h3>{ele.maHeThongRap}</h3> */}
                    <div className='text-center'>
                        <img src={banner_theater[index]} width={'100%'} height="525px" alt="" />
                    </div>
                    <div className='my-5'>
                        <table className='mx-auto' style={{ tableLayout: 'auto' ,width:'100%'}}>
                            <colgroup></colgroup>
                            <thead className="ant-table-thead" style={{backgroundColor: '#dad2b4'}}>
                                <tr>
                                    <th className="ant-table-cell header-table" style={{width:'10%'}}>STT</th>
                                    <th className="ant-table-cell header-table" style={{width:'40%'}}>Tên rạp</th>
                                    <th className="ant-table-cell header-table" style={{width:'40%'}}>Địa chỉ</th>
                                </tr>
                            </thead>
                            <tbody className="ant-table-tbody">
                                {Cumrap.map((item, index) => {
                                    return (
                                        <tr key={index} className="ant-table-row ">
                                            <td className="ant-table-cell">{index+1}</td>
                                            <td className="ant-table-cell text-left">{item.tenCumRap}</td>
                                            <td className="ant-table-cell text-left">{item.diaChi}</td>
                                        </tr>
                                    )
                                })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="container px-0" >
            {/* Nav pills */}
            <div className='my-4' width="100%">
                <ul className="nav nav-pills list-theater text-center mx-auto row" style={{width:'100%'}} role="tablist">
                    {Nav_Hethongrap1()}
                </ul>
            </div>
            {/* Tab panes */}
            <div className="tab-content pt-2">
                {Nav_Hethongrap2()}
            </div>
        </div>

    )
}

export default MovieTheater