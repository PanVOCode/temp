// ATPM chrome: Nav, Ticker, CTA, Footer

function Nav() {
  const [open, setOpen] = React.useState(false);
  const links = [['О компании', '#about'], ['Процесс', '#process'], ['Контакты', '#contact']];
  return (
    <header className="atpm-nav" id="atpm-nav">
      <div className="atpm-nav-inner cx">
        <a href="#hero" className="atpm-logo" aria-label="АДДИТЕХПРОММАШ">
          <span className="atpm-logo-dot" aria-hidden="true"></span>
          <span className="atpm-logo-mark">АДДИТЕХПРОММАШ</span>
        </a>
        <nav className="atpm-nav-links" aria-label="Основная навигация">
          {links.map(([l, h]) => <a href={h} className="atpm-nav-link" key={h}>{l}</a>)}
        </nav>
        <div className="atpm-nav-right">
          <button className="atpm-nav-phone" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }} onClick={() => window.__openPhone()}>+7 (991) 097-90-59</button>
          <button className="btn-atpm atpm-nav-cta" onClick={() => window.__openPhone()}>
            <span>Позвонить</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="atpm-nav-burger" aria-label="Меню" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span className="burger-line"></span><span className="burger-line"></span>
          </button>
        </div>
      </div>
      {open && (
        <div className="atpm-nav-mobile">
          {links.map(([l, h]) => <a href={h} key={h} onClick={() => setOpen(false)}>{l}</a>)}
        </div>
      )}
    </header>
  );
}

function Ticker() {
  const items = ['ПРОЕКТИРОВАНИЕ ПРЕСС-ФОРМ', 'ПРОИЗВОДСТВО ПРЕСС-ФОРМ', 'МЕЛКО- И КРУПНОСЕРИЙНОЕ ЛИТЬЁ', 'МЕТАЛЛООБРАБОТКА', 'РАЗРАБОТКА КД ПО ЕСКД', 'АДДИТИВНЫЕ ТЕХНОЛОГИИ', 'DMLS · SLM · FDM', 'СРОКИ — НЕДЕЛИ, НЕ МЕСЯЦЫ', 'ДЕШЕВЛЕ КИТАЯ', 'ВЛАДИМИР · РОССИЯ'];
  const all = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="marquee-outer"><div className="marquee-inner">
        {all.map((it, i) => (<span className="ticker-item" key={i}>{it}<span className="ticker-sep">·</span></span>))}
      </div></div>
    </div>
  );
}

function CTA() {
  return (
    <section id="contact" className="cta-sec">
      <img src="../../assets/photo-mold-01.png" className="cta-mold-photo" aria-hidden="true" />
      <div className="cta-giant-wrap">
        <div data-reveal><span className="cg-solid">РАССЧИТАТЬ</span></div>
        <div data-reveal data-delay="1"><span className="cg-outline">ПРОЕКТ</span></div>
      </div>
      <div className="cta-strip">
        <div className="ctas-left" data-reveal data-delay="2">
          <p className="ctas-desc">Пришлите чертёж или 3D-модель — в течение суток подготовим КП с ценой и сроками. Индивидуальный расчёт под каждый проект.</p>
          <div className="ctas-contacts">
            <div className="ctac-item" onClick={() => window.__openPhone()}><span className="ctac-k">Александр Семенец</span><span className="ctac-v">+7 (991) 097-90-59</span></div>
            <div className="ctac-item" onClick={() => window.__openPhone()}><span className="ctac-k">Даниил Воробьев</span><span className="ctac-v">+7 (906) 055-45-25</span></div>
            <div className="ctac-item" onClick={() => window.__openQuote()}><span className="ctac-k">Email</span><span className="ctac-v">additechprommash@yandex.ru</span></div>
          </div>
        </div>
        <div className="ctas-right" data-reveal data-delay="3">
          <button className="btn-atpm-white" style={{ padding: '16px 32px', fontSize: '11px' }} onClick={() => window.__openQuote()}>
            Запросить КП
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <div className="ctas-note"><span className="ctas-dot"></span>Круглосуточно · кроме выходных</div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="cx">
        <div className="footer-top">
          <div className="ft-brand">
            <div className="ft-logo">АДДИТЕХПРОММАШ</div>
            <p className="ft-tagline">Пресс-формы для литья пластмасс под давлением</p>
            <p className="ft-full">ООО «НПК «АДДИТЕХПРОММАШ»</p>
          </div>
          <div className="ft-col">
            <h3 className="ft-col-label">Контакты</h3>
            <ul className="ft-list">
              <li><a href="#contact" className="ft-link">+7 (991) 097-90-59</a></li>
              <li><a href="#contact" className="ft-link">+7 (906) 055-45-25</a></li>
              <li><a href="#contact" className="ft-link">additechprommash@yandex.ru</a></li>
              <li className="ft-muted">Офис — Москва</li>
              <li className="ft-muted">Производство — г. Владимир</li>
            </ul>
          </div>
          <div className="ft-col">
            <h3 className="ft-col-label">Реквизиты</h3>
            <div className="ft-legal">
              <div className="fl-row"><span className="fl-k">ИНН</span><span className="fl-v">7733472230</span></div>
              <div className="fl-row"><span className="fl-k">ОГРН</span><span className="fl-v">1257700330403</span></div>
              <div className="fl-row"><span className="fl-k">КПП</span><span className="fl-v">773301001</span></div>
              <div className="fl-row"><span className="fl-k">Статус</span><span className="fl-v" style={{ color: 'var(--atpm-accent)' }}>Действует</span></div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="fb-copy">© 2026 АДДИТЕХПРОММАШ. Все права защищены.</span>
          <span className="fb-site"><span className="fb-dot"></span>additechprom.ru · Российское производство</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Ticker, CTA, Footer });
