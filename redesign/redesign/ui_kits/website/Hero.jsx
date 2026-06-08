// ATPM Hero — split: giant type left, full-bleed mould photo right
function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="h-topstrip">
        <div className="h-topstrip-inner cx">
          <div className="hts-left">
            <span className="hts-bar"></span>
            <span className="hts-desc">ПРЕСС-ФОРМЫ ДЛЯ ЛИТЬЯ ПЛАСТМАСС</span>
          </div>
          <div className="hts-right">
            <span className="hts-tag">ООО НПК АДДИТЕХПРОММАШ</span>
            <span className="hts-tag hts-tag-num">ВЛАДИМИР · 2023</span>
          </div>
        </div>
      </div>

      <div className="h-main">
        <div className="h-textcol">
          <div className="h-textcol-inner">
            <h1 className="h-title" data-reveal>
              <span className="ht">ПРЕСС</span>
              <span className="ht">ФОРМЫ</span>
            </h1>
            <p className="h-tagline" data-reveal data-delay="1">
              Российское производство.<br />Сроки — недели.
            </p>
            <span className="h-orange-line" data-reveal data-delay="2"></span>
            <div className="h-params" data-reveal data-delay="3">
              <span className="h-param">DMLS · SLM · ЧПУ</span>
              <span className="h-param-sep">·</span>
              <span className="h-param">1—32 ГНЕЗДА</span>
              <span className="h-param-sep">·</span>
              <span className="h-param">±0.01 ММ</span>
            </div>
          </div>
        </div>

        <div className="h-visual">
          <span className="h-bg-num" aria-hidden="true">01</span>
          <img src="../../assets/photo-atpm-mold.png" alt="Пресс-форма АДДИТЕХПРОММАШ" className="h-photo" />
        </div>
      </div>

      <div className="h-specbar">
        <div className="h-specbar-inner cx">
          <div className="h-spec-frame" data-reveal>
            <span className="hsf-corner hsf-tl"></span>
            <span className="hsf-corner hsf-br"></span>
            <span className="hsf-plus" aria-hidden="true">+</span>
            <div className="hsf-text">
              <span className="hsf-brand">АДДИТЕХПРОММАШ / 2026</span>
              <span className="hsf-sub">MOLD ENGINEERING</span>
              <span className="hsf-sub">PRECISION. QUALITY. RESULTS.</span>
            </div>
          </div>
          <div className="h-specs" data-reveal data-delay="1">
            <div className="hsp-item"><span className="hsp-k">СРОКИ</span><span className="hsp-v">НЕДЕЛИ, НЕ МЕСЯЦЫ</span></div>
            <span className="hsp-div"></span>
            <div className="hsp-item"><span className="hsp-k">СТОИМОСТЬ</span><span className="hsp-v">ДЕШЕВЛЕ КИТАЯ</span></div>
            <span className="hsp-div"></span>
            <div className="hsp-item"><span className="hsp-k">ЦИКЛ</span><span className="hsp-v">ПОЛНЫЙ — ОТ КД ДО ОТК</span></div>
          </div>
          <button className="h-arrow" onClick={() => window.__openPhone && window.__openPhone()} aria-label="Обсудить проект">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17L17 7M9 7h8v8" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
