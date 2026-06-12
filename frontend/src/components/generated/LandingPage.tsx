import React from 'react';
import './LandingPage.css';
import Icon_Vector_167_439 from '../../assets/generated/vector_167_439.svg';
import Icon_Vector_185_152 from '../../assets/generated/vector_185_152.svg';
import Icon_Vector_1_167_537 from '../../assets/generated/vector_1_167_537.svg';
import Icon_SVG_185_159 from '../../assets/generated/svg_185_159.svg';
import Icon_SVG_152_265 from '../../assets/generated/svg_152_265.svg';
import Icon_Vector_185_360 from '../../assets/generated/vector_185_360.svg';
import Icon_SVG_186_379 from '../../assets/generated/svg_186_379.svg';
import Icon_mynauimicrochip_186_390 from '../../assets/generated/mynauimicrochip_186_390.svg';
import Icon_Customize_186_482 from '../../assets/generated/customize_186_482.svg';
import Icon_heroiconscpu_chip_186_478 from '../../assets/generated/heroiconscpu_chip_186_478.svg';
import Icon_icon_park_outlineconnect_186_498 from '../../assets/generated/icon_park_outlineconnect_186_498.svg';
import Icon_Vector_186_503 from '../../assets/generated/vector_186_503.svg';
import Icon_SVG_186_589 from '../../assets/generated/svg_186_589.svg';
import Icon_Vector_186_600 from '../../assets/generated/vector_186_600.svg';
import Icon_Frame_10_186_712 from '../../assets/generated/frame_10_186_712.svg';
import Icon_Frame_10_186_740 from '../../assets/generated/frame_10_186_740.svg';
import Icon_Frame_10_186_749 from '../../assets/generated/frame_10_186_749.svg';
import Icon_SVG_186_428 from '../../assets/generated/svg_186_428.svg';

const CONTAINER_DATA = [
  { include_wifih: "'#include{ts1} {/ts1}{ts2}<WiFi.h>{/ts2}'" },
  { void_setup: 'void{ts1} {/ts1}{ts3}setup{/ts3}{ts1}\\(\\) \\{{/ts1}' },
  { serialbegin115200: 'Serial.{ts3}begin{/ts3}\\({ts4}115200{/ts4}\\);' },
  {
    wifibeginvirtual_router_pass123:
      'WiFi.{ts3}begin{/ts3}\\({ts5}"Virtual\\_Router"{/ts5}, {ts5}"pass123"{/ts5}\\);',
  },
  { ang_kt_ni_mng_vi_mch: '// Đang kết nối mạng vi mạch...' },
  { text: '\\}' },
  { void_loop: 'void{ts1} {/ts1}{ts3}loop{/ts3}{ts1}\\(\\) \\{\\}{/ts1}' },
];

const SHADOW_DATA = [
  { raspberry_pi: 'Raspberry Pi.' },
  { ngay_trong_trnh_duyt_ca_bn: 'Ngay trong trình duyệt của bạn.' },
];

const BUTTON_DATA = [
  { svg: 'svg_186_428.svg', khi_chy_trnh_m_phng: 'Khởi chạy Trình mô phỏng' },
  { svg: 'svg_186_432.svg', c_ti_liu_core: 'Đọc tài liệu Core' },
];

const ContainerItem = ({ data }: { data: any }) => {
  return (
    <div className="container">
      <p className="include_wifih">{data.include_wifih}</p>
    </div>
  );
};

const ShadowItem = ({ data }: { data: any }) => {
  return (
    <div className="shadow">
      <h1 className="raspberry_pi">{data.raspberry_pi}</h1>
    </div>
  );
};

const ButtonItem = ({ data }: { data: any }) => {
  return (
    <button className="button">
      <img src={data.svg || Icon_SVG_186_428} className="svg" alt="SVG" />
      <p className="khi_chy_trnh_m_phng">{data.khi_chy_trnh_m_phng}</p>
    </button>
  );
};

/* ── 1. Component Navbar ── */
const Navbar = () => {
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
        <div className="link">
          <p className="ng_k">Đăng ký</p>
        </div>
        <button className="button">
          <p className="workspace">Workspace</p>
          <img src={Icon_SVG_185_159} className="svg" alt="SVG" />
        </button>
      </div>
    </nav>
  );
};

/* ── 2. Component Hero Section ── */
const HeroSection = () => {
  return (
    <>
      <div className="ellipse_7" />
      <div className="image_7" />
      <div className="gradient" />
      <div className="ellipse_6" />
      <img src={Icon_Vector_167_439} className="vector" alt="Vector" />
      <div className="ellipse_5" />
      <div className="ffff_1" />
      <div className="container">
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
    </>
  );
};

/* ── 3. Component Hardware Architectures ── */
const HardwareArchitectures = () => {
  return (
    <>
      <div className="cleaning_2021_09_02_08_09_16_utc_1" />
      <img src={Icon_Vector_185_360} className="vector" alt="Vector" />
      <div className="text">
        <div className="tx">
          <div className="container">
            <img src={Icon_SVG_186_379} className="svg" alt="SVG" />
            <h3 className="kin_trc_phn_cng_h_tr">Kiến trúc phần cứng hỗ trợ</h3>
          </div>
          <h1 className="mi_kin_trc_mt_cng_c_duy_nht">Mọi kiến trúc. Một công cụ duy nhất.</h1>
        </div>
        <p className="trnh_son_tho_code_tch_hp_b_th_vin_chun_ca_arduinoesp_idf_tch_hp_thanh_theo_di_serial_monitor_v_phn_tch_dng_sng_trc_quan_gip_bn_g_li_phn_mm_d_dng">
          Trình soạn thảo code tích hợp bộ thư viện chuẩn của Arduino/ESP-\nIDF. Tích hợp thanh theo
          dõi Serial Monitor và phân tích dạng sóng\ntrực quan giúp bạn gỡ lỗi phần mềm dễ dàng.
        </p>
      </div>
      <div className="ellipse_3" />
      <div className="tx">
        <div className="overlayborder">
          <p className="espressif">Espressif</p>
        </div>
        <div className="tx">
          <h3 className="esp32_series">ESP32 Series</h3>
          <p className="gi_lp_chun_mng_wi_fi_v_bluetooth_low_energy_ble_d_dng_test_clientserver">
            Giả lập chuẩn mạng Wi-Fi và Bluetooth Low Energy \(BLE\), dễ dàng test Client/Server
          </p>
        </div>
        <img
          src={Icon_mynauimicrochip_186_390}
          className="mynauimicrochip"
          alt="mynaui:microchip"
        />
      </div>
      <div className="tx">
        <img src={Icon_Customize_186_482} className="customize" alt="Customize" />
        <div className="overlayborder">
          <p className="stmicro">STMicro</p>
        </div>
        <div className="tx">
          <h3 className="stm32_blue_pill">STM32 Blue Pill</h3>
          <p className="m_phng_kin_trc_arm_cortex_chuyn_su_phc_v_hc_tp_h_thng_nhng_cng_nghip">
            Mô phỏng kiến trúc ARM Cortex chuyên sâu, phục vụ học tập hệ thống nhúng công nghiệp.
          </p>
        </div>
      </div>
      <div className="tx">
        <div className="overlayborder">
          <p className="arduino">Arduino</p>
        </div>
        <div className="tx">
          <h3 className="arduino_uno_r3r4">Arduino UNO R3/R4</h3>
          <p className="h_thng_th_vin_m_ngun_phong_ph_thch_hp_cho_vic_pht_trin_t_duy_thut_ton">
            Hệ thống thư viện mã nguồn phong phú, thích hợp cho việc phát triển tư duy thuật toán.
          </p>
        </div>
        <img
          src={Icon_heroiconscpu_chip_186_478}
          className="heroiconscpu_chip"
          alt="heroicons:cpu-chip"
        />
      </div>
      <div className="tx">
        <div className="overlayborder">
          <p className="raspberry_pi">Raspberry Pi</p>
        </div>
        <div className="tx">
          <h3 className="arduino_uno_r3r4">Arduino UNO R3/R4</h3>
          <p className="h_tr_y_trnh_thng_dch_micropython_vit_code_iu_khin_tinh_gin_gn_gng">
            Hỗ trợ đầy đủ trình thông dịch MicroPython để viết code điều khiển tinh giản gọn gàng.
          </p>
        </div>
        <img
          src={Icon_icon_park_outlineconnect_186_498}
          className="icon_park_outlineconnect"
          alt="icon-park-outline:connect"
        />
      </div>
    </>
  );
};

/* ── 4. Component Simulator Integration ── */
const SimulatorIntegration = () => {
  return (
    <>
      <div className="mockup_khung_son_tho_code">
        <div className="overlayhorizontalborder">
          <div className="container">
            <img src={Icon_SVG_152_265} className="svg" alt="SVG" />
            <p className="mainino">main.ino</p>
          </div>
          <div className="overlay">
            <p className="auto_save">AUTO\_SAVE</p>
          </div>
        </div>
        <div className="container">
          {CONTAINER_DATA.map((item, index) => (
            <ContainerItem key={index} data={item} />
          ))}
        </div>
      </div>
      <img src={Icon_Vector_186_503} className="vector" alt="Vector" />
      <div className="text">
        <div className="tx">
          <div className="container">
            <img src={Icon_SVG_186_589} className="svg" alt="SVG" />
            <h3 className="tch_hp_gi_lp_th_nghim_vi_iu_khin">
              tích hợp giả lập & thử nghiệm vi điều khiển
            </h3>
          </div>
          <h1 className="h_tr_vit_m_ngun_v_kim_th_bo_mch_trc_tip_theo_thi_gian_thc">
            Hỗ trợ viết mã nguồn và kiểm thử bo mạch trực tiếp theo thời gian thực
          </h1>
        </div>
        <p className="trnh_son_tho_code_tch_hp_b_th_vin_chun_ca_arduinoesp_idf_tch_hp_thanh_theo_di_serial_monitor_v_phn_tch_dng_sng_trc_quan_gip_bn_g_li_phn_mm_d_dng">
          Trình soạn thảo code tích hợp bộ thư viện chuẩn của Arduino/ESP-\nIDF. Tích hợp thanh theo
          dõi Serial Monitor và phân tích dạng sóng\ntrực quan giúp bạn gỡ lỗi phần mềm dễ dàng.
        </p>
      </div>
    </>
  );
};

/* ── 5. Component Virtual Lab Features ── */
const VirtualLabFeatures = () => {
  return (
    <>
      <div className="ellipse_4" />
      <img src={Icon_Vector_186_600} className="vector" alt="Vector" />
      <div className="tx">
        <img src={Icon_Frame_10_186_712} className="frame_10" alt="Frame 10" />
        <div className="tx">
          <h2 className="oscilloscope_logic_analyzer">Oscilloscope & Logic Analyzer</h2>
          <p className="o_c_chnh_xc_xung_nhp_ca_cc_chn_pwm_v_phn_tch_chnh_xc_m_sng_nh_phn_ca_tn_hiu_truyn_thng">
            Đo đạc chính xác xung nhịp của các chân PWM và phân tích chính xác mã sóng nhị phân của
            tín hiệu truyền thông.
          </p>
        </div>
      </div>
      <div className="tx">
        <img src={Icon_Frame_10_186_740} className="frame_10" alt="Frame 10" />
        <div className="tx">
          <h2 className="kho_linh_kin_s_h_tr_ko_th_trc_quan">
            Kho linh kiện đồ sộ, hỗ trợ kéo-thả trực quan
          </h2>
          <p className="h_tr_y_mn_hnh_lcdoled_cm_bin_nhit_dht11_cm_bin_khong_cch_ng_c_servo_v_nhiu_linh_kin_th_ng_khc">
            Hỗ trợ đầy đủ màn hình LCD/OLED, cảm biến nhiệt độ DHT11, cảm biến khoảng cách, động cơ
            Servo và nhiều linh kiện thụ động khác.
          </p>
        </div>
      </div>
      <div className="tx">
        <img src={Icon_Frame_10_186_749} className="frame_10" alt="Frame 10" />
        <div className="tx">
          <h2 className="chia_s_lm_vic_nhm">Chia sẻ & \nLàm việc nhóm</h2>
          <p className="xut_bn_v_s_nguyn_l_mch_hoc_chia_s_d_n_cho_bn_b_trong_nhm_cng_lm_n_qua_mt_lin_kt_duy_nht">
            Xuất bản vẽ sơ đồ nguyên lý mạch hoặc chia sẻ dự án cho bạn bè trong nhóm cùng làm đồ án
            qua một liên kết duy nhất
          </p>
        </div>
      </div>
      <div className="text">
        <h1 className="nng_lc_ti_tn_ca_lab_in_t_o">Năng lực Tối tân của Lab điện tử ảo</h1>
        <p className="mi_cng_c_h_tr_cho_vic_nghin_cu_v_lm_n_k_thut_phn_cng_nhng">
          Mọi công cụ hỗ trợ cho việc nghiên cứu và làm đồ án kỹ thuật phần cứng nhúng.
        </p>
      </div>
    </>
  );
};

export const LandingPage = () => {
  return (
    <div className="hero">
      <Navbar />
      <HeroSection />
      <HardwareArchitectures />
      <SimulatorIntegration />
      <VirtualLabFeatures />
    </div>
  );
};
