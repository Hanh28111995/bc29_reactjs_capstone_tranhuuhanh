import { useAsync } from 'hooks/useAsync';
import React, { useEffect, useState } from 'react';
import { fetchBranchesAPI, fetchLocationListAPI } from '../../services/general';
import { Button } from 'antd';
import { AimOutlined, SyncOutlined } from '@ant-design/icons';
import { getDistance } from 'constants/common';
import "./index.scss";

function MovieTheater() {
    const [selectedVungMien, setSelectedVungMien] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    // State lưu chi tiết vị trí để hiển thị hoặc dùng cho việc khác nếu cần
    const [myLocation, setMyLocation] = useState({
        district: "", // Quận
        city: "" // Thành phố
    });
    const [isLocating, setIsLocating] = useState(false);

    const { state: locations = [] } = useAsync({
        dependencies: [],
        service: fetchLocationListAPI,
    });

    const { state: allCinemas = [] } = useAsync({
        dependencies: [],
        service: fetchBranchesAPI
    });

    useEffect(() => {
        // 1. Kiểm tra trình duyệt hỗ trợ
        if (!navigator.geolocation) return;
        const autoLocate = async () => {
            if (locations.length === 0) return;
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                    );
                    const data = await res.json();

                    let addrCity = data.address.city || data.address.state || "";
                    // let addrDis = data.address.city_district || data.address.suburb || "";

                    // 1. Chuẩn hóa tên Thành phố để khớp với Database (vungMien: "TP.HCM")
                    if (addrCity.includes("Ho Chi Minh")) {
                        addrCity = "TP.HCM";
                    }

                    // 2. Tìm Vùng Miền trong list locations
                    const foundVung = locations.find(item => item.vungMien === addrCity);
                    if (foundVung) {
                        // Gán Vùng Miền cho Select 1
                        setSelectedVungMien(foundVung);
                        // Lấy tất cả rạp thuộc Vùng Miền này
                        const cinemasInCity = allCinemas.filter(cinema =>
                            cinema.address.includes(addrCity)
                        );

                        console.log(cinemasInCity)

                        if (cinemasInCity.length > 0) {
                            // Tìm rạp có khoảng cách ngắn nhất tới User
                            let closestCinema = cinemasInCity[0];
                            let coords = JSON.parse(closestCinema.coordinates)
                            let minDistance = getDistance(
                                latitude, longitude,
                                coords[0],
                                coords[1]
                            );

                            cinemasInCity.forEach(cinema => {
                                const dist = getDistance(
                                    latitude, longitude,
                                    cinema.coordinates[0],
                                    cinema.coordinates[1]
                                );
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    closestCinema = cinema;
                                }
                            });

                            // Từ rạp gần nhất, ta trích xuất tên Quận từ địa chỉ của rạp đó
                            // Ví dụ địa chỉ rạp: "... Quận 1, TP.HCM"
                            const foundDistInList = foundVung.cumRap.find(distName =>
                                closestCinema.address.includes(distName)
                            );
                            console.log(foundDistInList, foundVung)
                            // 3. Điền vào ô Select thứ 2 dựa trên kết quả tính toán vật lý
                            if (foundDistInList) {
                                setSelectedDistrict(foundDistInList);
                            } else {
                                // Fallback nếu không trích xuất được quận từ rạp gần nhất
                                setSelectedDistrict(foundVung.cumRap[0]);
                            }
                        }
                    }
                }
                catch (error) {
                    console.error("Lỗi xử lý định vị:", error);
                }
            });
        };

        autoLocate();
    }, [locations]); // Dependency là locations để chạy ngay khi có dữ liệu tỉnh thành

    // Hàm xử lý định vị và tự động điền
    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert("Trình duyệt không hỗ trợ định vị!");

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;

                // Gọi API lấy địa chỉ từ tọa độ
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                );
                const data = await res.json();
                const addr = data.address;

                // 1. Lưu vào state vị trí chi tiết
                const locationInfo = {
                    road: addr.road || "",
                    suburb: addr.suburb || addr.neighbourhood || "",
                    district: addr.district || addr.city_district || addr.suburb || "",
                    city: addr.city || addr.state || ""
                };
                setMyLocation(locationInfo);

                // 2. Logic tự động điền vào 2 ô Select
                // Tìm vùng miền khớp (ưu tiên TP.HCM hoặc Hà Nội...)
                const foundVung = locations.find(loc =>
                    locationInfo.city.includes(loc.vungMien.replace("TP.", "").trim())
                );

                if (foundVung) {
                    setSelectedVungMien(foundVung);
                    // Sau khi tìm thấy vùng, tìm quận khớp trong mảng cumRap
                    const foundDist = foundVung.cumRap.find(d =>
                        locationInfo.district.includes(d.replace("Quận", "").trim()) ||
                        d.includes(locationInfo.district)
                    );
                    if (foundDist) {
                        setSelectedDistrict(foundDist);
                    }
                }

                setIsLocating(false);
            } catch (error) {
                console.error("Lỗi lấy địa chỉ:", error);
                setIsLocating(false);
            }
        }, () => {
            alert("Vui lòng cho phép truy cập vị trí!");
            setIsLocating(false);
        });
    };

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
                    onClick={handleGetLocation}
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