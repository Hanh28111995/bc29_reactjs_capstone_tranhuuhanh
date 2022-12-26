import { useAsync } from "hooks/useAsync";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetailAPI } from "services/movie";
import { Modal } from 'antd';
import ReactPlayer from 'react-player';
import "./index.scss";

export default function TrailerContent() {

    const param = useParams();
    const [option1, setOption1] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [play, setPlay] = useState(false);

    const showModal = () => {
        setPlay(true)
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setPlay(false)
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setPlay(false)
        setIsModalVisible(false);
    };

    const { state: movieDetail = [] } = useAsync({
        dependencies: [],
        service: () => fetchMovieDetailAPI(param.movieId),
    })

    useEffect(() => {
        let imgURL = '';
        if (movieDetail) {
            imgURL = (movieDetail.trailer)?.split('/');
            if (imgURL) { setOption1(`https://i2.ytimg.com/vi/${imgURL[3]}/maxresdefault.jpg`); }
        }
    }, [movieDetail])

    return (
        <div className="py-5 ">
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
                <p>TRAILER</p>
            </div>
            <div className="ant-row ant-row-center" style={{ backgroundColor: '#dad2b4' }}>
                <div className="ant-col ant-col-16 text-center">
                    <img src={option1} alt="" style={{ objectFit: 'cover', width: '85%', height: '600px' }} />
                    <img className="icon_play" src="/btnc_play.png" alt="image" onClick={showModal} onBlur={handleCancel}/>
                </div>
            </div>
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
            </div>
            <Modal 
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} centered={true}  width={'70%'} height={800} destroyOnClose={true}>
                <ReactPlayer 
                    url={movieDetail.trailer}
                    playing={play}
                    controls={true}
                    className='mx-auto w-100'
                    width={800}
                    height={500}
                />
            </Modal>
        </div>

    );
}
