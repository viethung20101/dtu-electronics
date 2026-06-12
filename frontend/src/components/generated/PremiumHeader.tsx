import React from 'react';
import './PremiumHeader.css';
import Icon_Vector_151_15708 from '../../assets/generated/vector_151_15708.svg';
import Icon_SVG_151_15726 from '../../assets/generated/svg_151_15726.svg';

const LINK_DATA = [
  { trang_ch: 'Trang chủ' },
  { ti_liu: 'Tài liệu' },
  { v_d: 'Ví dụ' },
  { thc_hnh: 'Thực hành' },
  { gii_thiu: 'Giới thiệu' },
];

const LinkItem = ({ data }) => {
  return (
    <div className="link">
      <p className="trang_ch">{data.trang_ch}</p>
    </div>
  );
};

export const PremiumHeader = () => {
  return (
    <header className="header_1_premium_header">
      <div className="container">
        <img src={Icon_Vector_151_15708} className="vector" alt="Vector" />
      </div>
      <nav className="nav">
        {LINK_DATA.map((item, index) => (
          <LinkItem key={index} data={item} />
        ))}
      </nav>
      <div className="container">
        <div className="link">
          <p className="ng_nhp">Đăng nhập</p>
        </div>
        <button className="button">
          <p className="workspace">Workspace</p>
          <img src={Icon_SVG_151_15726} className="svg" alt="SVG" />
        </button>
      </div>
    </header>
  );
};
