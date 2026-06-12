import React from 'react';
import './Frame.css';
import Icon_SVG_152_94 from '../../assets/generated/svg_152_94.svg';
import Icon_SVG_152_102 from '../../assets/generated/svg_152_102.svg';
import Icon_Overlay_152_109 from '../../assets/generated/overlay_152_109.svg';
import Icon_SVG_152_118 from '../../assets/generated/svg_152_118.svg';
import Icon_SVG_152_243 from '../../assets/generated/svg_152_243.svg';
import Icon_Vector_152_491 from '../../assets/generated/vector_152_491.svg';
import Icon_SVG_152_487 from '../../assets/generated/svg_152_487.svg';

const SHADOW_DATA = [
  { raspberry_pi: 'Raspberry Pi.' },
  { ngay_trong_trnh_duyt_ca_bn: 'Ngay trong trình duyệt của bạn.' },
];

const BUTTON_DATA = [
  { svg: 'svg_152_76.svg', khi_chy_trnh_m_phng: 'Khởi chạy Trình mô phỏng' },
  { svg: 'svg_152_80.svg', c_ti_liu_core: 'Đọc tài liệu Core' },
];

const HEADING_2_DATA = [
  { vit_code_chy_kim_th_thi_gian_thc: 'Viết code & Chạy kiểm thử thời\\ngian thực' },
  {
    trnh_son_tho_code_tch_hp_b_th_vin_chun_ca_arduinoesp_idf_tch_hp_thanh_theo_di_serial_monitor_v_phn_tch_dng_sng_trc_quan_gip_bn_g_li_phn_mm_d_dng:
      'Trình soạn thảo code tích hợp bộ thư viện chuẩn của Arduino/ESP-\\nIDF. Tích hợp thanh theo dõi Serial Monitor và phân tích dạng sóng\\ntrực quan giúp bạn gỡ lỗi phần mềm dễ dàng.',
  },
];

const ITEM_DATA = [
  {
    svg: 'svg_152_253.svg',
    t_ng_kim_tra_li_bin_dch_c_php: 'Tự động kiểm tra lỗi biên dịch cú pháp',
  },
  {
    svg: 'svg_152_258.svg',
    hn_500_th_vin_cm_bin_tch_hp_sn: 'Hơn 500+ thư viện cảm biến tích hợp sẵn',
  },
];

const HEADING_2_DATA = [
  { nng_lc_ti_tn_ca_lab_in_t_o: 'Năng lực Tối tân của Lab điện tử ảo' },
  {
    mi_cng_c_h_tr_cho_vic_nghin_cu_v_lm_n_k_thut_phn_cng_nhng:
      'Mọi công cụ hỗ trợ cho việc nghiên cứu và làm đồ án kỹ thuật phần cứng nhúng.',
  },
];

const OVERLAYBORDER_DATA = [
  {
    svg: 'svg_152_299.svg',
    oscilloscope_logic_analyzer: 'Oscilloscope & Logic Analyzer',
    o_c_chnh_xc_xung_nhp_ca_cc_chn_pwm_v_phn_tch_chnh_xc_m_sng_nh_phn_ca_tn_hiu_truyn_thng:
      'Đo đạc chính xác xung nhịp của các chân PWM và phân tích\\nchính xác mã sóng nhị phân của tín hiệu truyền thông.',
  },
  {
    kho_ko_th_linh_kin_s: 'Kho Kéo-Thả Linh Kiện Đồ Sộ',
    h_tr_y_mn_hnh_lcdoled_cm_bin_nhit_dht11_cm_bin_khong_cch_ng_c_servo_v_nhiu_linh_kin_th_ng_khc:
      'Hỗ trợ đầy đủ màn hình LCD/OLED, cảm biến nhiệt độ\\nDHT11, cảm biến khoảng cách, động cơ Servo và nhiều linh\\nkiện thụ động khác.',
  },
  {
    svg: 'svg_152_331.svg',
    chia_s_lm_vic_nhm: 'Chia sẻ & Làm việc nhóm',
    xut_bn_v_s_nguyn_l_mch_hoc_chia_s_ton_b_d_n_cho_bn_b_trong_nhm_cng_lm_n_qua_mt_ng_dn_duy_nht:
      'Xuất bản vẽ sơ đồ nguyên lý mạch hoặc chia sẻ toàn bộ dự\\nán cho bạn bè trong nhóm cùng làm đồ án qua một đường\\ndẫn duy nhất.',
  },
  {
    svg: 'svg_152_343.svg',
    powered_by_autonomous_ai_agent: 'Powered by Autonomous AI Agent',
    tr_l_tc_t_ai_sa_code_v_ti_u_mch: 'Trợ lý Tác tử AI sửa code và tối ưu mạch',
    vit_yu_cu_bng_ting_vit_v_d_vit_code_c_cm_bin_dht11_v_hin_th_ln_mn_hnh_oled_ai_s_t_ng_sinh_m_ngun_chun_v_gi_cch_u_ni_chn_mt_cch_chnh_xc:
      '\'Viết yêu cầu bằng tiếng Việt \\(ví dụ: "Viết code đọc cảm biến DHT11 và hiển thị lên màn hình OLED"\\), AI sẽ tự động sinh mã\\nnguồn chuẩn và gợi ý cách đấu nối chân một cách chính xác.\'',
    kch_hot_tr_l_ai: 'Kích hoạt Trợ lý AI',
  },
];

const HEADING_3_DATA = [
  { oscilloscope_logic_analyzer: 'Oscilloscope & Logic Analyzer' },
  {
    o_c_chnh_xc_xung_nhp_ca_cc_chn_pwm_v_phn_tch_chnh_xc_m_sng_nh_phn_ca_tn_hiu_truyn_thng:
      'Đo đạc chính xác xung nhịp của các chân PWM và phân tích\\nchính xác mã sóng nhị phân của tín hiệu truyền thông.',
  },
];

const HEADING_3_DATA = [
  { kho_ko_th_linh_kin_s: 'Kho Kéo-Thả Linh Kiện Đồ Sộ' },
  {
    h_tr_y_mn_hnh_lcdoled_cm_bin_nhit_dht11_cm_bin_khong_cch_ng_c_servo_v_nhiu_linh_kin_th_ng_khc:
      'Hỗ trợ đầy đủ màn hình LCD/OLED, cảm biến nhiệt độ\\nDHT11, cảm biến khoảng cách, động cơ Servo và nhiều linh\\nkiện thụ động khác.',
  },
];

const HEADING_3_DATA = [
  { chia_s_lm_vic_nhm: 'Chia sẻ & Làm việc nhóm' },
  {
    xut_bn_v_s_nguyn_l_mch_hoc_chia_s_ton_b_d_n_cho_bn_b_trong_nhm_cng_lm_n_qua_mt_ng_dn_duy_nht:
      'Xuất bản vẽ sơ đồ nguyên lý mạch hoặc chia sẻ toàn bộ dự\\nán cho bạn bè trong nhóm cùng làm đồ án qua một đường\\ndẫn duy nhất.',
  },
];

const HEADING_3_DATA = [
  { tr_l_tc_t_ai_sa_code_v_ti_u_mch: 'Trợ lý Tác tử AI sửa code và tối ưu mạch' },
  {
    vit_yu_cu_bng_ting_vit_v_d_vit_code_c_cm_bin_dht11_v_hin_th_ln_mn_hnh_oled_ai_s_t_ng_sinh_m_ngun_chun_v_gi_cch_u_ni_chn_mt_cch_chnh_xc:
      '\'Viết yêu cầu bằng tiếng Việt \\(ví dụ: "Viết code đọc cảm biến DHT11 và hiển thị lên màn hình OLED"\\), AI sẽ tự động sinh mã\\nnguồn chuẩn và gợi ý cách đấu nối chân một cách chính xác.\'',
  },
];

const CONTAINER_DATA = [
  {
    bng_gi_linh_hot_cho_mi_i_tng: 'Bảng giá Linh hoạt cho mọi Đối tượng',
    m_phng_phn_cng_min_ph_trn_i_ch_tr_chi_ph_khi_dng_tc_t_ai_hiu_nng_cao:
      'Mô phỏng phần cứng miễn phí trọn đời. Chỉ trả chi phí khi dùng Tác tử AI hiệu năng cao.',
  },
  {
    gi_starter: 'Gói Starter',
    svg: 'svg_152_427.svg',
    dnh_cho_c_nhn_hc_tp_c_bn: 'Dành cho cá nhân học tập cơ bản',
    _0: "'0đ '",
    vnh_vin: '/ vĩnh viễn',
    gi_lp_khng_gii_hn_s_lng_bo_mch: 'Giả lập không giới hạn số lượng bo mạch',
    truy_cp_kho_200_linh_kin_thng_dng: 'Truy cập kho 200+ linh kiện thông dụng',
    khng_h_tr_tc_t_ai_sa_li_m_nhng: 'Không hỗ trợ Tác tử AI sửa lỗi mã nhúng',
    khi_chy_min_ph: 'Khởi chạy miễn phí',
    tc_t_ai_pro: 'Tác tử AI Pro',
    dnh_cho_k_s_sinh_vin_lm_n_ln: 'Dành cho kỹ sư & Sinh viên làm đồ án lớn',
    _149000: "'149.000đ '",
    thng: '/ tháng',
    bao_gm_ton_b_tnh_nng_gi_starter: 'Bao gồm toàn bộ tính năng gói Starter',
    khng_gii_hn_lt_dng_ai_sinh_code_sa_li_mch:
      'Không giới hạn lượt dùng AI sinh code & sửa lỗi mạch',
    m_kha_cc_linh_kin_nng_cao_mn_hnh_mu_tft_th_sd:
      'Mở khóa các linh kiện nâng cao \\(Màn hình màu TFT, Thẻ\\nSD...\\)',
    nng_cp_bn_pro_ngay: 'Nâng cấp bản Pro ngay',
    recommended: 'RECOMMENDED',
  },
];

const HEADING_2_DATA = [
  { bng_gi_linh_hot_cho_mi_i_tng: 'Bảng giá Linh hoạt cho mọi Đối tượng' },
  {
    m_phng_phn_cng_min_ph_trn_i_ch_tr_chi_ph_khi_dng_tc_t_ai_hiu_nng_cao:
      'Mô phỏng phần cứng miễn phí trọn đời. Chỉ trả chi phí khi dùng Tác tử AI hiệu năng cao.',
  },
];

const ITEM_DATA = [
  {
    svg: 'svg_152_380.svg',
    gi_lp_khng_gii_hn_s_lng_bo_mch: 'Giả lập không giới hạn số lượng bo mạch',
  },
  {
    svg: 'svg_152_384.svg',
    truy_cp_kho_200_linh_kin_thng_dng: 'Truy cập kho 200+ linh kiện thông dụng',
  },
  {
    svg: 'svg_152_388.svg',
    khng_h_tr_tc_t_ai_sa_li_m_nhng: 'Không hỗ trợ Tác tử AI sửa lỗi mã nhúng',
  },
];

const ITEM_DATA = [
  {
    svg: 'svg_152_412.svg',
    bao_gm_ton_b_tnh_nng_gi_starter: 'Bao gồm toàn bộ tính năng gói Starter',
  },
  {
    svg: 'svg_152_416.svg',
    khng_gii_hn_lt_dng_ai_sinh_code_sa_li_mch:
      'Không giới hạn lượt dùng AI sinh code & sửa lỗi mạch',
  },
  {
    svg: 'svg_152_420.svg',
    m_kha_cc_linh_kin_nng_cao_mn_hnh_mu_tft_th_sd:
      'Mở khóa các linh kiện nâng cao \\(Màn hình màu TFT, Thẻ\\nSD...\\)',
  },
];

const LINK_DATA = [
  { terms_of_service: 'Terms of Service' },
  { privacy_policy: 'Privacy Policy' },
  { support_center: 'Support Center' },
];

const LINK_DATA = [
  { trang_ch: 'Trang chủ' },
  { ti_liu: 'Tài liệu' },
  { v_d: 'Ví dụ' },
  { thc_hnh: 'Thực hành' },
  { gii_thiu: 'Giới thiệu' },
];

const ShadowItem = ({ data }) => {
  return (
    <div className="shadow">
      <h1 className="raspberry_pi">{data.raspberry_pi}</h1>
    </div>
  );
};

const ButtonItem = ({ data }) => {
  return (
    <button className="button">
      <img src={data.svg || Icon_SVG_152_76} className="svg" alt="SVG" />
      <p className="khi_chy_trnh_m_phng">{data.khi_chy_trnh_m_phng}</p>
    </button>
  );
};

const Heading_2Item = ({ data }) => {
  return (
    <div className="heading_2">
      <h2 className="vit_code_chy_kim_th_thi_gian_thc">{data.vit_code_chy_kim_th_thi_gian_thc}</h2>
    </div>
  );
};

const ItemItem = ({ data }) => {
  return (
    <div className="item">
      <img src={data.svg || Icon_SVG_152_253} className="svg" alt="SVG" />
      <p className="t_ng_kim_tra_li_bin_dch_c_php">{data.t_ng_kim_tra_li_bin_dch_c_php}</p>
    </div>
  );
};

const Heading_2Item = ({ data }) => {
  return (
    <div className="heading_2">
      <h2 className="nng_lc_ti_tn_ca_lab_in_t_o">{data.nng_lc_ti_tn_ca_lab_in_t_o}</h2>
    </div>
  );
};

const OverlayBorderItem = ({ data }) => {
  return (
    <div className="overlayborder">
      <div className="margin">
        <div className="overlay">
          <img src={data.svg || Icon_SVG_152_299} className="svg" alt="SVG" />
        </div>
      </div>
      <div className="container">
        <div className="heading_3">
          <p className="oscilloscope_logic_analyzer">{data.oscilloscope_logic_analyzer}</p>
        </div>
        <div className="container">
          <p className="o_c_chnh_xc_xung_nhp_ca_cc_chn_pwm_v_phn_tch_chnh_xc_m_sng_nh_phn_ca_tn_hiu_truyn_thng">
            {
              data.o_c_chnh_xc_xung_nhp_ca_cc_chn_pwm_v_phn_tch_chnh_xc_m_sng_nh_phn_ca_tn_hiu_truyn_thng
            }
          </p>
        </div>
      </div>
    </div>
  );
};

const Heading_3Item = ({ data }) => {
  return (
    <div className="heading_3">
      <p className="oscilloscope_logic_analyzer">{data.oscilloscope_logic_analyzer}</p>
    </div>
  );
};

const Heading_3Item = ({ data }) => {
  return (
    <div className="heading_3">
      <p className="kho_ko_th_linh_kin_s">{data.kho_ko_th_linh_kin_s}</p>
    </div>
  );
};

const Heading_3Item = ({ data }) => {
  return (
    <div className="heading_3">
      <h3 className="chia_s_lm_vic_nhm">{data.chia_s_lm_vic_nhm}</h3>
    </div>
  );
};

const Heading_3Item = ({ data }) => {
  return (
    <div className="heading_3">
      <h3 className="tr_l_tc_t_ai_sa_code_v_ti_u_mch">{data.tr_l_tc_t_ai_sa_code_v_ti_u_mch}</h3>
    </div>
  );
};

const ContainerItem = ({ data }) => {
  return (
    <div className="container">
      <div className="heading_2">
        <h2 className="bng_gi_linh_hot_cho_mi_i_tng">{data.bng_gi_linh_hot_cho_mi_i_tng}</h2>
      </div>
      <div className="container">
        <p className="m_phng_phn_cng_min_ph_trn_i_ch_tr_chi_ph_khi_dng_tc_t_ai_hiu_nng_cao">
          {data.m_phng_phn_cng_min_ph_trn_i_ch_tr_chi_ph_khi_dng_tc_t_ai_hiu_nng_cao}
        </p>
      </div>
    </div>
  );
};

const Heading_2Item = ({ data }) => {
  return (
    <div className="heading_2">
      <h2 className="bng_gi_linh_hot_cho_mi_i_tng">{data.bng_gi_linh_hot_cho_mi_i_tng}</h2>
    </div>
  );
};

const ItemItem = ({ data }) => {
  return (
    <div className="item">
      <img src={data.svg || Icon_SVG_152_380} className="svg" alt="SVG" />
      <p className="gi_lp_khng_gii_hn_s_lng_bo_mch">{data.gi_lp_khng_gii_hn_s_lng_bo_mch}</p>
    </div>
  );
};

const ItemItem = ({ data }) => {
  return (
    <div className="item">
      <img src={data.svg || Icon_SVG_152_412} className="svg" alt="SVG" />
      <p className="bao_gm_ton_b_tnh_nng_gi_starter">{data.bao_gm_ton_b_tnh_nng_gi_starter}</p>
    </div>
  );
};

const LinkItem = ({ data }) => {
  return (
    <div className="link">
      <p className="terms_of_service">{data.terms_of_service}</p>
    </div>
  );
};

const LinkItem = ({ data }) => {
  return (
    <div className="link">
      <p className="trang_ch">{data.trang_ch}</p>
    </div>
  );
};

export const Frame = () => {
  return (
    <div className="frame">
      <section className="section_2_hero_ultimate_section">
        <div className="ambient_blur_glows" />
        <div className="overlayblur" />
        <div className="container">
          <div className="overlayborder">
            <div className="background" />
            <div className="container">
              <p className="new_v30_engine_at_speed_overclock">
                NEW v3.0 ENGINE AT SPEED OVERCLOCK //
              </p>
            </div>
          </div>
          <div className="heading_1">
            <h1 className="arduino_esp32">Arduino, ESP32 &</h1>
            {SHADOW_DATA.map((item, index) => (
              <ShadowItem key={index} data={item} />
            ))}
          </div>
          <div className="container">
            <p className="nn_tng_gi_lp_phn_cng_bin_chuyn_su_kt_ni_linh_kin_in_t_vit_m_nhng_v_phn_tch_lung_d_liu_thi_gian_thc_m_khng_cn_chm_vo_phn_cng_vt_l">
              Nền tảng giả lập phần cứng biên chuyên sâu. Kết nối linh kiện điện tử,\nviết mã nhúng,
              và phân tích luồng dữ liệu thời gian thực mà không cần\nchạm vào phần cứng vật lý.
            </p>
          </div>
          <div className="container">
            {BUTTON_DATA.map((item, index) => (
              <ButtonItem key={index} data={item} />
            ))}
          </div>
        </div>
        <div className="khi_ui_gi_lp_3d_mockup">
          <div className="overlayborderoverlayblur">
            <div className="overlayshadow" />
            <div className="margin">
              <div className="horizontalborder">
                <div className="container">
                  <div className="background" />
                  <div className="background" />
                  <div className="background" />
                </div>
                <div className="overlay">
                  <img src={Icon_SVG_152_94} className="svg" alt="SVG" />
                  <p className="status_running">'STATUS: RUNNING'</p>
                </div>
              </div>
            </div>
            <div className="m_phng_bng_mch_logic_ha_tit_cao_cp">
              <div className="backgroundbordershadow">
                <div className="container">
                  <div className="container">
                    <p className="esp32_s3">ESP32-S3</p>
                  </div>
                  <img src={Icon_SVG_152_102} className="svg" alt="SVG" />
                </div>
                <div className="container">
                  <p className="mcu_core">MCU CORE</p>
                </div>
                <img src={Icon_Overlay_152_109} className="overlay" alt="Overlay" />
              </div>
              <div className="gradient" />
              <div className="cc_chm_n_led_gi_lp_ngu_nhin" />
              <div className="backgroundshadow" />
            </div>
          </div>
        </div>
      </section>
      <section className="section_3_premium_component_architecture">
        <div className="container">
          <div className="container">
            <div className="container">
              <img src={Icon_SVG_152_118} className="svg" alt="SVG" />
              <p className="kin_trc_phn_cng_h_tr">Kiến trúc phần cứng hỗ trợ</p>
            </div>
            <div className="heading_2">
              <h2 className="mi_kin_trc_mt_cng_c_duy_nht">Mọi kiến trúc. Một công cụ duy nhất.</h2>
            </div>
          </div>
          <div className="container">
            <p className="khng_cn_ci_t_driver_khng_lo_hng_mch_tht_chn_dng_chip_yu_thch_ca_bn_v_lp_trnh_tc_th">
              Không cần cài đặt Driver, không lo hỏng mạch thật. Chọn dòng chip yêu\nthích của bạn
              và lập trình tức thì.
            </p>
          </div>
        </div>
      </section>
      <section className="section_4_code_playground_studio_section_tnh_nng_c_quyn_mi_b_sung">
        <div className="backgroundborder">
          <div className="container">
            <div className="container">
              <div className="container">
                <img src={Icon_SVG_152_243} className="svg" alt="SVG" />
                <p className="integrated_studio_playground">Integrated Studio Playground</p>
              </div>
              {HEADING_2_DATA.map((item, index) => (
                <Heading_2Item key={index} data={item} />
              ))}
              <div className="list">
                {ITEM_DATA.map((item, index) => (
                  <ItemItem key={index} data={item} />
                ))}
              </div>
            </div>
          </div>
          <div className="overlayblur" />
        </div>
      </section>
      <section className="section_5_bento_grid_features_system">
        <div className="container">
          {HEADING_2_DATA.map((item, index) => (
            <Heading_2Item key={index} data={item} />
          ))}
        </div>
        <div className="container">
          {OVERLAYBORDER_DATA.map((item, index) => (
            <OverlayBorderItem key={index} data={item} />
          ))}
        </div>
      </section>
      <section className="section_6_ultimate_saas_pricing_matrix">
        {CONTAINER_DATA.map((item, index) => (
          <ContainerItem key={index} data={item} />
        ))}
      </section>
      <footer className="footer_7_footer">
        <div className="container">
          <p className="_2026_circuitos_cloud_platform_built_for_developers">
            © 2026 CircuitOS Cloud Platform. Built for developers.
          </p>
        </div>
        <div className="container">
          {LINK_DATA.map((item, index) => (
            <LinkItem key={index} data={item} />
          ))}
        </div>
      </footer>
      <header className="header_1_premium_header">
        <div className="container">
          <img src={Icon_Vector_152_491} className="vector" alt="Vector" />
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
            <img src={Icon_SVG_152_487} className="svg" alt="SVG" />
          </button>
        </div>
      </header>
    </div>
  );
};
