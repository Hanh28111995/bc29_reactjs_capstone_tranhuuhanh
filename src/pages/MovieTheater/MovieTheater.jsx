import { useAsync } from 'hooks/useAsync';
import React, { useEffect, useState } from 'react';
import { fetchBranchesAPI, fetchLocationListAPI } from '../../services/general';
import { Button } from 'antd';
import { AimOutlined, SyncOutlined } from '@ant-design/icons';
import "./index.scss";
import { useGeoLocationSelect } from 'hooks/useGeoLocationSelect';

function MovieTheater() {
    const [selectedVungMien, setSelectedVungMien] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    // State lưu chi tiết vị trí để hiển thị hoặc dùng cho việc khác nếu cần
    const [myLocation, setMyLocation] = useState({
        district: "", // Quận
        city: "" // Thành phố
    });

    const { state: locations = [] } = useAsync({
        dependencies: [],
        service: fetchLocationListAPI,
    });

    const { state: allCinemas = [] } = useAsync({
        dependencies: [],
        service: fetchBranchesAPI
    });

    const { decision, isLocating, locate } = useGeoLocationSelect({
        locations,
        cinemas: allCinemas,
        askOnMount: true,
        onSelect: ({ region, district, raw }) => {
            setSelectedVungMien(region);
            setSelectedDistrict(district || "");
            const locationInfo = {
                road: raw?.address?.road || "",
                suburb: raw?.address?.suburb || raw?.address?.neighbourhood || "",
                district: raw?.district || "",
                city: raw?.city || "",
            };
            setMyLocation(locationInfo);
        },
        title: "Chia sẻ vị trí",
        content: "Bạn có muốn chia sẻ vị trí để tự động chọn khu vực không?",
    });

    useEffect(() => {
        if (decision !== "denied") return;
        if (selectedVungMien) return;
        if (!Array.isArray(locations) || locations.length === 0) return;

        const preferred =
            locations.find((r) => r?.vungMien === "TP.HCM") ||
            locations.find((r) => String(r?.vungMien || "").toLowerCase().includes("hcm")) ||
            locations[0];

        setSelectedVungMien(preferred || null);
        const firstDistrict = preferred?.cumRap?.[0] || "";
        setSelectedDistrict(firstDistrict);
    }, [decision, locations, selectedVungMien]);

    const filteredCinemas = allCinemas?.filter(cinema => {
        if (!selectedDistrict) return true;
        return cinema.address.includes(selectedDistrict);
    });

    return (
        <div className="container px-0">
            {/* Hàng Filter gồm Nút bấm và 2 Select */}
            <div className='d-flex gap-3 my-4 align-items-center'>



                {/* Select Vùng Miền */}
                <select
                    className="form-select"
                    value={selectedVungMien?._id || ""}
                    onChange={(e) => {
                        const vung = locations.find(item => item._id === e.target.value);
                        setSelectedVungMien(vung);
                        setSelectedDistrict("");
                    }}
                >
                    <option value="">Chọn Tỉnh thành</option>
                    {locations?.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.vungMien}</option>
                    ))}
                </select>

                {/* Select Quận Huyện */}
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

                {/* Nút định vị */}
                <Button
                    type="default"
                    shape="round" // Bo tròn để giống phong cách Google Maps
                    icon={isLocating ? <SyncOutlined spin /> : <AimOutlined />}
                    onClick={locate}
                    loading={isLocating}
                    disabled={isLocating}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: '500',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Đổ bóng nhẹ chuẩn Google
                        border: '1px solid #dadce0', // Màu viền nhẹ
                        color: '#1a73e8', // Màu xanh đặc trưng của Google
                        height: '40px',
                    }}
                >
                    {isLocating ? 'Đang xác định...' : 'Vị trí của tôi'}
                </Button>
            </div>

            {/* Thông báo vị trí hiện tại (Optional) */}
            {myLocation.district && (
                <div className="alert alert-info py-2">
                    Vị trí của bạn: {myLocation.road}, {myLocation.suburb}, {myLocation.district}
                </div>
            )}

            {/* Hiển thị kết quả */}
            <div className="row mt-4">
                {filteredCinemas?.length > 0 ? (
                    filteredCinemas.map(cinema => (
                        <div key={cinema._id} className="col-md-6 mb-3">
                            <div className="card p-3 shadow-sm">
                                <h5 className="text-primary">{cinema.branch}</h5>
                                <p className="small text-muted mb-0"><i className="fas fa-map-pin me-2"></i>{cinema.address}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center w-100">Không tìm thấy rạp nào ở khu vực này.</div>
                )}
            </div>
        </div>
    );
}

export default MovieTheater;
