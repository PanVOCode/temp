// ATPM content sections: About, Process, Stats, Specs, Benefits

function About() {
  const specs = [
    ['Деятельность', 'Пресс-формы любой сложности и конфигурации'],
    ['Офис · Производство', 'Москва · г. Владимир'],
    ['Технологии', 'DMLS · SLM · ЧПУ · FDM'],
    ['Проектов', '30+ успешно введены в эксплуатацию'],
    ['Инженеров', '15 специалистов'],
  ];
  return (
    <section id="about" className="about-panel split-panel">
      <div className="abt-photo panel-photo">
        <img src="../../assets/photo-mold-industrial.png" alt="Пресс-форма АДДИТЕХПРОММАШ" className="abt-img" />
        <span className="panel-ghost" aria-hidden="true">02</span>
      </div>
      <div className="panel-text" data-reveal>
        <div className="panel-inner">
          <div className="sw-label">01 / КОМПАНИЯ</div>
          <h2 className="abt-title">
            <span className="abt-line">АДДИТЕХ</span>
            <span className="abt-line abt-outline">ПРОММАШ</span>
          </h2>
          <div className="sw-rule"></div>
          <div className="sw-specs">
            {specs.map(([k, v]) => (
              <div className="st-row" key={k}><span className="st-k">{k}</span><span className="st-v">{v}</span></div>
            ))}
          </div>
          <div className="abt-metrics-row">
            <div className="abt-metric"><span className="abt-m-val">−25%</span><span className="abt-m-lab">vs импорт</span></div>
            <div className="abt-metric-div"></div>
            <div className="abt-metric"><span className="abt-m-val">3 нед.</span><span className="abt-m-lab">средний срок</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROC_STEPS = [
  { num: '01', total: '04', title: 'АНАЛИЗ', dur: '1—3', unit: 'дня', items: ['Получаем чертёж или 3D-модель изделия', 'Определяем число гнёзд и точки впрыска', 'Проектируем систему охлаждения'], photoSrc: '../../assets/photo-atpm-mold.png', photoBg: '#F0F0EE', photoRight: true },
  { num: '02', total: '04', title: 'КД', dur: '5—14', unit: 'дней', items: ['3D-моделирование оснастки', 'Расчёт и топология охлаждения', 'Конструкторская документация по ЕСКД'], photoSrc: '../../assets/photo-mold-nobg.png', photoBg: '#060606', photoRight: false },
  { num: '03', total: '04', title: 'ПРОИЗ\u00ADВОДСТВО', dur: '14—30', unit: 'дней', items: ['5-осевая ЧПУ-обработка', 'Аддитивные технологии — сложные элементы', 'Термообработка · Сборка оснастки'], photoSrc: '../../assets/photo-hotrunner-01.jpg', photoBg: '#060606', photoRight: true },
  { num: '04', total: '04', title: 'ОТК', dur: '2—5', unit: 'дней', items: ['Пробные отливки на нашем оборудовании', 'Контроль всех размеров по КД', 'Передача полного комплекта документации'], photoSrc: '../../assets/photo-machine-01.jpg', photoBg: '#060606', photoRight: false },
];

function ProcessStep({ s }) {
  const photo = (
    <div className="proc-photo" style={{ order: s.photoRight ? 2 : 1, background: s.photoBg }}>
      <img src={s.photoSrc} alt="" aria-hidden="true" className="proc-photo-img" />
      <span className="proc-ghost" aria-hidden="true" style={{ color: s.photoBg === '#F0F0EE' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>{s.num}</span>
    </div>
  );
  const text = (
    <div className="proc-text" style={{ order: s.photoRight ? 1 : 2 }} data-reveal>
      <div className="panel-inner">
        <div className="sw-label">{s.num} / {s.total} · ПРОЦЕСС</div>
        <h2 className="proc-title">{s.title}</h2>
        <div className="proc-dur"><span className="proc-dur-num">{s.dur}</span><span className="proc-dur-unit">{s.unit}</span></div>
        <div className="sw-rule"></div>
        <ul className="proc-list">
          {s.items.map((it) => (<li className="proc-item" key={it}><span className="proc-bullet"></span>{it}</li>))}
        </ul>
      </div>
    </div>
  );
  return (
    <section id={s.num === '01' ? 'process' : undefined} className={`proc-panel ${s.photoRight ? 'proc-pr' : 'proc-pl'}`}>
      {photo}{text}
    </section>
  );
}

function Process() { return <>{PROC_STEPS.map((s) => <ProcessStep s={s} key={s.num} />)}</>; }

function Stats() {
  return (
    <section className="stats-sec" id="stats">
      <img src="../../assets/photo-mold-02.png" className="stats-photo" aria-hidden="true" />
      <div className="stats-content cx">
        <span className="stats-num" data-reveal>30+</span>
        <div className="stats-bottom" data-reveal data-delay="2">
          <div className="stats-left">
            <span className="stats-word">ПРОЕКТОВ<br />В ЭКСПЛУАТАЦИИ</span>
            <p className="stats-desc">Литьё пластмасс · упаковка · электротехника · авиация · БПЛА · медицина. Литейные заводы и производственные предприятия по всей России.</p>
          </div>
          <div className="stats-metrics">
            <div className="sm-item"><span className="sm-val">15</span><span className="sm-lab">Инженеров</span></div>
            <div className="sm-div"></div>
            <div className="sm-item"><span className="sm-val">3</span><span className="sm-lab">нед. срок</span></div>
            <div className="sm-div"></div>
            <div className="sm-item"><span className="sm-val">−25%</span><span className="sm-lab">vs импорт</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs() {
  const specs = [
    ['Материал', 'P20 · H13 · S136 (инструментальная сталь)'],
    ['Гнёзд', '1 — 32'],
    ['Ресурс', 'до 1 000 000 циклов'],
    ['Точность', '±0.01 мм · IT6–IT7'],
    ['Габариты', 'до 1000 × 800 × 600 мм'],
    ['Тип литья', 'Горячий / холодный канал'],
    ['Охлаждение', 'Конформное · каскадное · прямолинейное'],
  ];
  return (
    <section className="specs-panel" id="catalog">
      <div className="specs-text" data-reveal>
        <div className="panel-inner">
          <div className="sw-label">02 / ВОЗМОЖНОСТИ</div>
          <h2 className="specs-title">ТЕХНИ&shy;ЧЕСКИЕ<br />ХАРАК&shy;ТЕРИСТИКИ</h2>
          <div className="sw-rule"></div>
          <div className="specs-table">
            {specs.map(([k, v]) => (<div className="st-row" key={k}><span className="st-k">{k}</span><span className="st-v">{v}</span></div>))}
          </div>
          <div className="specs-cta-row">
            <button className="specs-cta" onClick={() => window.__openQuote && window.__openQuote()}>
              Запросить расчёт
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <span className="specs-cta-phone">+7 991 097-90-59</span>
          </div>
        </div>
      </div>
      <div className="specs-photo">
        <img src="../../assets/photo-atpm-mold.png" alt="Пресс-форма АДДИТЕХПРОММАШ" className="specs-photo-img" />
        <span className="specs-photo-ghost" aria-hidden="true">03</span>
      </div>
    </section>
  );
}

function Benefits() {
  const benefits = [
    ['01', 'Аддитивные технологии', 'DMLS · SLM · ЧПУ — элементы любой сложности, включая конформное охлаждение'],
    ['02', 'Сроки — недели, не месяцы', 'Исключили из цикла всё, что не влияет на качество. Полный цикл от анализа до ОТК'],
    ['03', 'Дешевле и качественнее Китая', 'Российское производство · без таможенных рисков · предсказуемые сроки поставки'],
    ['04', 'Полный цикл под контролем', 'От КД по ЕСКД до пробных отливок на нашем оборудовании — без субподряда'],
  ];
  return (
    <section id="benefits" className="ben-panel">
      <div className="ben-text" data-reveal>
        <div className="panel-inner">
          <div className="sw-label">03 / ПРЕИМУЩЕСТВА</div>
          <h2 className="ben-title">ПОЧЕМУ<br />МЫ</h2>
          <div className="sw-rule"></div>
          <div className="ben-list">
            {benefits.map(([num, title, spec]) => (
              <div className="ben-row" key={num}>
                <span className="ben-num">{num}</span>
                <div className="ben-body"><span className="ben-name">{title}</span><span className="ben-spec">{spec}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ben-photo">
        <img src="../../assets/photo-mold-industrial.png" alt="" aria-hidden="true" className="ben-img" />
        <span className="panel-ghost" aria-hidden="true" style={{ color: 'rgba(255,255,255,0.04)' }}>04</span>
      </div>
    </section>
  );
}

Object.assign(window, { About, Process, Stats, Specs, Benefits });
