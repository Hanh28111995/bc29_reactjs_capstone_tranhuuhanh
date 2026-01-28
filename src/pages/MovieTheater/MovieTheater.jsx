import { useAsync } from 'hooks/useAsync';
import React from 'react';
import { HethongrapListApi } from 'services/showtime';

import { useState } from "react";
import { HethongrapCumrapListApi } from "services/showtime";
import "./index.scss";



function MovieTheater() {

    return (
        <div className="container px-0" >
            {/* Nav pills */}
            <div className='my-4' width="100%">
                <ul className="nav nav-pills list-theater text-center mx-auto row" style={{ width: '100%' }} role="tablist">

                </ul>
            </div>
            {/* Tab panes */}
            <div className="tab-content pt-2">

            </div>
        </div>

    )
}

export default MovieTheater