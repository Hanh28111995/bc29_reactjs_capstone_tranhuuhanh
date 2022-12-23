import React from 'react';
import Detail from 'modules/detail/Detail';
import TrailerContent from 'modules/detail/TrailerContent';
import "./index.scss";

export default function MovieDtail() {
  return (
    <div className="trailerPage py-3" >
            <TrailerContent/>
            <Detail />    
    </div>

  )
}
