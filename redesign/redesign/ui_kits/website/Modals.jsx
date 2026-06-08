// ATPM modals: phone chooser + quote request (interactive, fake submit)
const ArrowR = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const CloseX = () => (<svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="#000" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>);

function PhoneModal({ onClose }) {
  const people = [['+7 (991) 097-90-59', 'Александр Семенец'], ['+7 (906) 055-45-25', 'Даниил Воробьев']];
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card">
        <div className="modal-head">
          <div><h2 className="modal-title">Связаться</h2><p className="modal-sub">Выберите номер для звонка</p></div>
          <button className="modal-close" onClick={onClose} aria-label="Закрыть"><CloseX /></button>
        </div>
        <div className="modal-body">
          {people.map(([num, name]) => (
            <a className="phone-link" href={`tel:${num.replace(/[^\d+]/g, '')}`} key={num}>
              <div style={{ flex: 1 }}><div className="phone-num">{num}</div><div className="phone-name">{name}</div></div>
              <ArrowR />
            </a>
          ))}
        </div>
        <div className="modal-foot"><p>Круглосуточно · кроме выходных</p></div>
      </div>
    </div>
  );
}

function QuoteModal({ onClose }) {
  const [sent, setSent] = React.useState(false);
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card">
        <div className="modal-head">
          <div><h2 className="modal-title">Запросить КП</h2><p className="modal-sub">Ответим в течение суток</p></div>
          <button className="modal-close" onClick={onClose} aria-label="Закрыть"><CloseX /></button>
        </div>
        {sent ? (
          <div className="modal-success">
            <span className="chk"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg></span>
            <div className="modal-title">Заявка отправлена</div>
            <p className="modal-sub" style={{ textAlign: 'center' }}>Свяжемся с вами в ближайшее время.</p>
            <button className="btn-atpm" style={{ marginTop: 8 }} onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <form className="modal-body" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="field"><label>Имя</label><input required placeholder="Как к вам обращаться" /></div>
            <div className="field"><label>Телефон</label><input required placeholder="+7 (___) ___-__-__" /></div>
            <div className="field"><label>Изделие / задача</label><input placeholder="Например: корпус под литьё, 8 гнёзд" /></div>
            <button className="btn-atpm" type="submit" style={{ justifyContent: 'center', marginTop: 6 }}>
              Отправить заявку <ArrowR />
            </button>
            <p className="modal-sub" style={{ textAlign: 'center', margin: 0 }}>Или приложите чертёж на additechprommash@yandex.ru</p>
          </form>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PhoneModal, QuoteModal });
