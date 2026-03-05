import { useAsync } from 'hooks/useAsync';
import React, { useState, useEffect } from 'react';
import {fetchBranchesAPI, fetchLocationListAPI } from '../../services/general';
import "./index.scss";

function MovieTheater() {
    const [selectedVungMien, setSelectedVungMien] = useState(null); 
    const [selectedDistrict, setSelectedDistrict] = useState("");

    // 1. Chỉ gọi lấy danh sách Locations khi load trang
    const { state: locations = [],  } = useAsync({
            dependencies: [toggle],
            service: fetchLocationListAPI,
        });

        const { state: allCinemas = [],  } = useAsync({
            dependencies: [toggle],
            service: fetchBranchesAPI
        });

    // 2. Lọc danh sách rạp (Cinemas) dựa trên filter
    // Nếu dữ liệu rạp ít (<100 rạp), có thể gọi 1 lần rồi filter FE. 
    // Nếu nhiều, nên truyền params vào API.    

    const filteredCinemas = allCinemas?.filter(cinema => {
        if (!selectedDistrict) return true;
        // Kiểm tra xem địa chỉ rạp có chứa tên Quận đang chọn không
        return cinema.address.includes(selectedDistrict);
    });

    return (
        <div className="container px-0">
            <div className='d-flex gap-3 my-4'>
                {/* Select Vùng Miền (Tỉnh/Thành) */}
                <select 
                    className="form-select"
                    onChange={(e) => {
                        const vung = locations.find(item => item._id === e.target.value);
                        setSelectedVungMien(vung);
                        setSelectedDistrict(""); // Reset quận khi đổi tỉnh
                    }}
                >
                    <option value="">Chọn Tỉnh thành</option>
                    {locations?.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.vungMien}</option>
                    ))}
                </select>

                {/* Select Quận Huyện (Lấy từ mảng cumRap trong location) */}
                <select 
                    className="form-select"
                    disabled={!selectedVungMien}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                    <option value="">Chọn Khu vực</option>
                    {selectedVungMien?.cumRap.map((dist, index) => (
                        <option key={index} value={dist}>{dist}</option>
                    ))}
                </select>
            </div>

            {/* Hiển thị kết quả */}
            <div className="row">
                {filteredCinemas?.map(cinema => (
                    <div key={cinema._id} className="col-md-6 mb-3">
                        <div className="card p-3">
                            <h5>{cinema.cinemaName}</h5>
                            <p className="small text-muted">{cinema.address}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieTheater;