import DetailShowTime from 'modules/showTime/DetailShowTime';
import ShowTimeForm from 'modules/showTime/ShowTimeForm';
import React from 'react'

export default function EditShowTime() {

  return (
    <div className="py-5">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <DetailShowTime />
          </div>
          <div className="col-12 mt-5">
            <ShowTimeForm />
          </div>
        </div>
      </div>
    </div>
  );

}
