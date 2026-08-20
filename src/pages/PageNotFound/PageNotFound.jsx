import React, { Component } from 'react';
import "./index.scss";

export default class PageNotFound extends Component {
  render() {
    return (
      <div className="bg404">
        <div id="da-wrapper" className="fluid">
          <div id="da-content">
            <div className="da-container">
              <div id="da-error-wrapper">
                <div id="da-error-pin" />
                <div id="da-error-code">
                  error <span>404</span></div>
                <h1 className="da-error-heading">Page not found<br/>Sorry, we're building this page.</h1>
                <center className='mt-3 da-hompage'>
                  <a href="/">
                  <h1 className="da-error-heading text-primary"><i className="fa fa-chevron-right"></i>Back to HomePage<i className="fa fa-chevron-left"></i></h1>
                </a>
                </center>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
