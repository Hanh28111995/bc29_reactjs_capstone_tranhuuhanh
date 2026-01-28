import React, { useEffect, useState } from "react";
import { Modal } from 'antd';
import ReactPlayer from 'react-player';
import "./index.scss";

export default function TrailerContent(props) {

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


    useEffect(() => {
        let imgURL = '';
        if (props.trailer) {
            imgURL = (props.trailer)?.split(/[/=]/);
            console.log(imgURL)
            if (imgURL) { setOption1(imgURL[4]); }
        }
    }, [props])

    return (
        <div className="py-5 ">
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
                <p>TRAILER</p>
            </div>
            <div className="ant-row ant-row-center" style={{ backgroundColor: '#dad2b4', justifyItems: 'center' }}>
                <div className="ant-col ant-col-16 text-center">                    
                    <img
                        src={`https://i2.ytimg.com/vi/${option1}/maxresdefault.jpg`}
                        onError={(e) => {
                            // Nếu link maxres lỗi, nó sẽ tự nhảy sang link hqdefault
                            e.target.src = `https://img.youtube.com/vi/${option1}/hqdefault.jpg`;
                        }}
                        alt="Movie Thumbnail"
                        style={{ objectFit: 'cover', width: '85%', height: '600px' }}
                    />
                    <img className="icon_play" src="/btnc_play.png" alt="image" onClick={showModal} onBlur={handleCancel} />
                </div>
            </div>
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
            </div>
            <Modal
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} centered={true} width={'70%'} height={800} destroyOnClose={true}>
                <ReactPlayer
                    url={props.trailer}
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
