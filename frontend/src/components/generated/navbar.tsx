import React from 'react';
import './navbar.css';
import Icon_Vector_185_152 from '../../assets/generated/vector_185_152.svg';
import Icon_Vector_1_167_537 from '../../assets/generated/vector_1_167_537.svg';
import Icon_SVG_185_159 from '../../assets/generated/svg_185_159.svg';

export const navbar = () => {
  return (
    <nav className="navbar">
      <img src={Icon_Vector_185_152} className="vector" alt="Vector" />
      <div className="frame">
        <button className="button">
          <p className="trang_ch">Trang chủ</p>
        </button>
        <p className="ti_liu">Tài liệu</p>
        <p className="v_d">Ví dụ</p>
        <p className="thc_hnh">Thực hành</p>
        <p className="gii_thiu">Giới thiệu</p>
        <img src={Icon_Vector_1_167_537} className="vector_1" alt="Vector 1" />
      </div>
      <div className="container">
        {/* <div className="link">
          <p className="ng_k">Đăng ký</p>
        </div> */}
        <button className="button">
          <p className="workspace">Workspace</p>
          <img src={Icon_SVG_185_159} className="svg" alt="SVG" />
        </button>
      </div>
    </nav>
  );
};
