import React from 'react';
import './LandingPage.css';
import { AppHeader } from '../components/layout/AppHeader';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import Icon_Vector_167_439 from '../assets/generated/vector_167_439.svg';
import Icon_Vector_1_167_537 from '../assets/generated/vector_1_167_537.svg';
import Icon_SVG_152_265 from '../assets/generated/svg_152_265.svg';
import Icon_Vector_185_360 from '../assets/generated/vector_185_360.svg';
import Icon_SVG_186_379 from '../assets/generated/svg_186_379.svg';
import Icon_mynauimicrochip_186_390 from '../assets/generated/mynauimicrochip_186_390.svg';
import Icon_Customize_186_482 from '../assets/generated/customize_186_482.svg';
import Icon_heroiconscpu_chip_186_478 from '../assets/generated/heroiconscpu_chip_186_478.svg';
import Icon_icon_park_outlineconnect_186_498 from '../assets/generated/icon_park_outlineconnect_186_498.svg';
import Icon_Vector_186_503 from '../assets/generated/vector_186_503.svg';
import Icon_SVG_186_589 from '../assets/generated/svg_186_589.svg';
import Icon_Vector_186_600 from '../assets/generated/vector_186_600.svg';
import Icon_Frame_10_186_712 from '../assets/generated/frame_10_186_712.svg';
import Icon_Frame_10_186_740 from '../assets/generated/frame_10_186_740.svg';
import Icon_Frame_10_186_749 from '../assets/generated/frame_10_186_749.svg';
import Icon_SVG_186_428 from '../assets/generated/svg_186_428.svg';
import Icon_SVG_186_432 from '../assets/generated/svg_186_432.svg';

const CONTAINER_DATA = [
  {"include_wifih":"'#include{ts1} {/ts1}{ts2}<WiFi.h>{/ts2}'"},
  {"void_setup":"void{ts1} {/ts1}{ts3}setup{/ts3}{ts1}\\(\\) \\{{/ts1}"},
  {"serialbegin115200":"Serial.{ts3}begin{/ts3}\\({ts4}115200{/ts4}\\);"},
  {"wifibeginvirtual_router_pass123":"WiFi.{ts3}begin{/ts3}\\({ts5}\"Virtual\\_Router\"{/ts5}, {ts5}\"pass123\"{/ts5}\\);"},
  {"ang_kt_ni_mng_vi_mch":"// Đang kết nối mạng vi mạch..."},
  {"text":"\\}"},
  {"void_loop":"void{ts1} {/ts1}{ts3}loop{/ts3}{ts1}\\(\\) \\{\\}{/ts1}"},
];

const parseSyntaxHighlight = (text: string) => {
  if (!text) return null;
  let processed = text
    .replace(/\\\\\(/g, '(')
    .replace(/\\\\\)/g, ')')
    .replace(/\\\\\{/g, '{')
    .replace(/\\\\\}/g, '}')
    .replace(/\\\\_/g, '_')
    .replace(/'/g, '');

  const regex = /\{ts(\d)\}(.*?)\{\/ts\1\}/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(processed)) !== null) {
    const textBefore = processed.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(textBefore);
    }

    const tagNum = match[1];
    const tagText = match[2];
    elements.push(
      <span key={match.index} className={`code-token-${tagNum}`}>
        {tagText}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  const textAfter = processed.substring(lastIndex);
  if (textAfter) {
    elements.push(textAfter);
  }

  return elements.length > 0 ? elements : processed;
};

const ContainerItem = ({ data }: { data: any }) => {
  const value = Object.values(data)[0] as string;
  return (
    <div className="container code-line">
      <p className="include_wifih">{parseSyntaxHighlight(value)}</p>
    </div>
  );
};



/* ── 2. Component Hero Section ── */
const HeroSection = () => {
  return (
    <>
      <div className="ellipse_5" />
      <div className="ellipse_6" />
      <img src={Icon_Vector_167_439} className="vector-bg vector-hero" alt="Vector Background" />
      <ScrollReveal className="hero-left" eager delay={80}>
        <h1 className="hero-title">
          <span className="title-line-1">Arduino, ESP32 & <span className="text-gradient">Raspberry Pi</span>.</span>
        </h1>
        <h2 className="hero-subtitle">Ngay trong trình duyệt của bạn.</h2>
        <p className="hero-description">
          Nền tảng giả lập phần cứng biên chuyên sâu. Kết nối linh kiện điện tử, viết mã nhúng, và phân tích luồng dữ liệu thời gian thực mà không cần chạm vào phần cứng vật lý.
        </p>
        <div className="hero-buttons">
          <button className="cta-button primary">
            <img src={Icon_SVG_186_428} className="svg" alt="Play Icon" />
            <span>Khởi chạy Trình mô phỏng</span>
          </button>
          <button className="cta-button secondary">
            <img src={Icon_SVG_186_432} className="svg" alt="Doc Icon" />
            <span>Đọc tài liệu Core</span>
          </button>
        </div>
      </ScrollReveal>
      <div className="ffff_1" />
    </>
  );
};

/* ── 3. Component Hardware Support ── */
const HardwareArchitectures = () => {
  return (
    <>
      <div className="ellipse_3" />
      <img src={Icon_Vector_185_360} className="vector-bg vector-hardware" alt="Vector Background" />
      
      <div className="hardware-right">
        <ScrollReveal className="text-hardware">
          <div className="category-tag">
            <img src={Icon_SVG_186_379} className="svg" alt="Chip Icon" />
            <h3>Kiến trúc phần cứng hỗ trợ</h3>
          </div>
          <h2 className="section-title">Mọi Kiến Trúc. Một Công Cụ Duy Nhất.</h2>
          <p className="section-desc">
            Trình soạn thảo code tích hợp bộ thư viện chuẩn của Arduino/ESP-IDF. Tích hợp thanh theo dõi Serial Monitor và phân tích dạng sóng trực quan giúp bạn gỡ lỗi phần mềm dễ dàng.
          </p>
        </ScrollReveal>

        <div className="hardware-cards-grid">
          {[
            {
              className: 'card-hardware card-espressif',
              badge: 'Espressif',
              icon: Icon_mynauimicrochip_186_390,
              iconAlt: 'Espressif Chip',
              title: 'ESP32 Series',
              desc: 'Giả lập chuẩn mạng Wi-Fi và Bluetooth Low Energy (BLE), dễ dàng test Client/Server',
            },
            {
              className: 'card-hardware card-arduino',
              badge: 'Arduino',
              icon: Icon_heroiconscpu_chip_186_478,
              iconAlt: 'Arduino Chip',
              title: 'Arduino UNO R3/R4',
              desc: 'Hệ thống thư viện mã nguồn phong phú, thích hợp cho việc phát triển tư duy thuật toán.',
            },
            {
              className: 'card-hardware card-stmicro',
              badge: 'STMicro',
              icon: Icon_Customize_186_482,
              iconAlt: 'STMicro Chip',
              title: 'STM32 Blue Pill',
              desc: 'Mô phỏng kiến trúc ARM Cortex chuyên sâu, phục vụ học tập hệ thống nhúng công nghiệp.',
            },
            {
              className: 'card-hardware card-raspberry',
              badge: 'Raspberry Pi',
              icon: Icon_icon_park_outlineconnect_186_498,
              iconAlt: 'Raspberry Chip',
              title: 'Arduino UNO R3/R4',
              desc: 'Hỗ trợ đầy đủ trình thông dịch MicroPython để viết code điều khiển tinh giản gọn gàng.',
            },
          ].map((card, index) => (
            <ScrollReveal key={card.badge} className={card.className} delay={index * 90}>
              <div className="card-badge">{card.badge}</div>
              <img src={card.icon} className="card-icon" alt={card.iconAlt} />
              <h4 className="card-title">{card.title}</h4>
              <p className="card-desc">{card.desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </>
  );
};

/* ── 4. Component Simulator Integration ── */
const SimulatorIntegration = () => {
  return (
    <>
      <img src={Icon_Vector_186_503} className="vector-bg vector-simulator" alt="Vector Background" />
      <ScrollReveal className="mockup_khung_son_tho_code" direction="left" delay={60}>
        <div className="overlayhorizontalborder">
          <div className="container">
            <img src={Icon_SVG_152_265} className="svg" alt="SVG" />
            <p className="mainino">main.ino</p>
          </div>
          <div className="overlay">
            <p className="auto_save">AUTO_SAVE</p>
          </div>
        </div>
        <div className="container code-lines-container">
          {CONTAINER_DATA.map((item, index) => (
            <ContainerItem key={index} data={item} />
          ))}
        </div>
      </ScrollReveal>
      <div className="cleaning_2021_09_02_08_09_16_utc_1" />

      <ScrollReveal className="text-simulator" direction="right" delay={120}>
        <div className="category-tag">
          <img src={Icon_SVG_186_589} className="svg" alt="Chip Icon" />
          <h3>tích hợp giả lập & thử nghiệm vi điều khiển</h3>
        </div>
        <h2 className="section-title">Hỗ Trợ Viết Mã Nguồn Và Kiểm Thử Bo Mạch Trực Tiếp Theo Thời Gian Thực</h2>
        <p className="section-desc">
          Trình soạn thảo code tích hợp bộ thư viện chuẩn của Arduino/ESP-IDF. Tích hợp thanh theo dõi Serial Monitor và phân tích dạng sóng trực quan giúp bạn gỡ lỗi phần mềm dễ dàng.
        </p>
      </ScrollReveal>
    </>
  );
};

/* ── 5. Component Virtual Lab Features ── */
const VirtualLabFeatures = () => {
  return (
    <div className="features-section-container">
      <div className="ellipse_4" />
      <img src={Icon_Vector_186_600} className="vector-bg vector-features" alt="Vector Background" />
      
      <ScrollReveal className="text-lab-features">
        <h2 className="section-title text-center">Năng Lực Tối Tân Của<br />Lab Điện Tử Ảo</h2>
        <p className="section-desc text-center">
          Mọi công cụ hỗ trợ cho việc nghiên cứu và làm đồ án kỹ thuật phần cứng nhúng.
        </p>
      </ScrollReveal>

      <div className="features-cards-container">
        {[
          {
            className: 'card-features card-oscilloscope',
            icon: Icon_Frame_10_186_712,
            iconAlt: 'Oscilloscope Icon',
            title: 'Oscilloscope & Logic Analyzer',
            desc: 'Đo đạc chính xác xung nhịp của các chân PWM và phân tích chính xác mã sóng nhị phân của tín hiệu truyền thông.',
          },
          {
            className: 'card-features card-library',
            icon: Icon_Frame_10_186_740,
            iconAlt: 'Parts Icon',
            title: 'Kho linh kiện đồ sộ, hỗ trợ kéo-thả trực quan',
            desc: 'Hỗ trợ đầy đủ màn hình LCD/OLED, cảm biến nhiệt độ DHT11, cảm biến khoảng cách, động cơ Servo và nhiều linh kiện thụ động khác.',
          },
          {
            className: 'card-features card-collaboration',
            icon: Icon_Frame_10_186_749,
            iconAlt: 'Collab Icon',
            title: 'Chia sẻ & Làm việc nhóm',
            desc: 'Xuất bản vẽ sơ đồ nguyên lý mạch hoặc chia sẻ dự án cho bạn bè trong nhóm cùng làm đồ án qua một liên kết duy nhất',
          },
        ].map((card, index) => (
          <ScrollReveal key={card.className} className={card.className} delay={index * 100}>
            <div className="frame_10">
              <img src={card.icon} alt={card.iconAlt} />
            </div>
            <div className="text-block-vertical">
              <h3 className="feature-card-title">{card.title}</h3>
              <p className="feature-card-desc">{card.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* 1. Header & Hero Section */}
      <section className="section-hero">
        <AppHeader />
        <div className="section-content-centered">
          <HeroSection />
        </div>
      </section>

      {/* 2. Hardware Support Section */}
      <section className="section-hardware">
        <div className="image_7" />
        <div className="section-content-centered">
          <HardwareArchitectures />
        </div>
      </section>

      {/* 3. Simulator Integration Section */}
      <section className="section-simulator">
        <div className="section-content-centered">
          <SimulatorIntegration />
        </div>
      </section>

      {/* 4. Virtual Lab Features Section */}
      <section className="section-features">
        <div className="section-content-centered">
          <VirtualLabFeatures />
        </div>
      </section>
    </div>
  );
};
