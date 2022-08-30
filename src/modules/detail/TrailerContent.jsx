
import { useAsync } from "hooks/useAsync";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieDetailAPI } from "services/movie";
import "./index.scss";


export default function TrailerContent() {

    const param = useParams();
    const [option1, setOption1] = useState();

    const { state: movieDetail = [] } = useAsync({
        dependencies: [],
        service: () => fetchMovieDetailAPI(param.movieId),
    })

    useEffect(() => {
        let imgURL = '';
        if (movieDetail) {
            imgURL = (movieDetail.trailer)?.split('=');
            if (imgURL) { setOption1(`https://i2.ytimg.com/vi/${imgURL[1]}/hqdefault.jpg`); }
        }
    }, [movieDetail])

    return (
        <div className="py-5 ">
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
                <p>TRAILER</p>
            </div>
            <div className="ant-row ant-row-center" style={{backgroundColor:'#dad2b4'}}>
                <div className="ant-col ant-col-16 text-center">
                    <img  src={option1} alt="" style={{objectFit: 'fill', width: '80%', height: '500px'}}/>
                </div>
            </div>
            <div className="TitleCarousel" style={{ marginBottom: 0 }}>
            </div>
        </div>



    );
}
