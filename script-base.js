document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const botCtas = document.querySelectorAll('.bot-cta');

const updateBotCta = (section, { label, title, text, button, className, status }) => {
  if (!section) return;

  section.classList.add(className);
  const kicker = section.querySelector('.section-kicker');
  const heading = section.querySelector('h2');
  const description = section.querySelector('p:not(.section-kicker)');
  const link = section.querySelector('a.button');

  if (kicker) kicker.textContent = label;
  if (heading) heading.textContent = title;
  if (description) description.textContent = text;

  if (link) {
    link.textContent = button;
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = ' ↗';
    link.append(arrow);
  }

  if (status) {
    const statusLine = document.createElement('span');
    statusLine.className = 'bot-status';
    statusLine.textContent = status;
    section.prepend(statusLine);
  }
};

updateBotCta(botCtas[0], {
  label: 'Швидкий старт',
  title: 'Не знаєте, з чого почати?',
  text: 'Відповідайте на кілька коротких запитань у Telegram — бот допоможе побачити головну перешкоду й обрати один реалістичний крок.',
  button: 'Знайти перший крок',
  className: 'bot-cta-start'
});

updateBotCta(botCtas[1], {
  label: 'Потрібна допомога?',
  title: 'Розберіть свою ситуацію крок за кроком',
  text: 'Натисніть кнопку, коротко опишіть, що відкладаєте або що не виходить. Бот допоможе структурувати ситуацію без осуду.',
  button: 'Розбір ситуації',
  className: 'bot-cta-help',
  status: '● Telegram-помічник'
});

if (botCtas.length) {
  const style = document.createElement('style');
  style.textContent = '.bot-cta-start{border-style:dashed;background:linear-gradient(145deg,#eef9ff,#fff)}.bot-cta-start .button{box-shadow:none}.bot-cta-help{position:relative;overflow:hidden;border:2px solid #63bce6;background:linear-gradient(145deg,#d7f1ff 0%,#fff 70%);box-shadow:0 24px 60px rgba(13,111,168,.18)}.bot-cta-help:after{position:absolute;right:-76px;bottom:-92px;width:230px;height:230px;border:34px solid rgba(73,173,219,.11);border-radius:50%;content:""}.bot-cta-help>*{position:relative;z-index:1}.bot-status{display:inline-flex;margin-bottom:18px;padding:8px 12px;border:1px solid #9dd5ee;border-radius:999px;color:#075783;background:rgba(255,255,255,.86);font-size:.78rem;font-weight:900;letter-spacing:.02em}.bot-cta-help .button{min-width:210px}.bot-cta-help .section-kicker{margin-bottom:10px}@media(max-width:719px){.bot-cta-help .button{width:100%}}';
  document.head.append(style);
}

const articleSearch = document.querySelector('[data-article-search]');

if (articleSearch) {
  const input = articleSearch.querySelector('input[type="search"]');
  const clearButton = articleSearch.querySelector('[data-search-clear]');
  const status = articleSearch.querySelector('[data-search-status]');
  const cards = Array.from(document.querySelectorAll('[data-article-card]'));
  const emptyState = document.querySelector('[data-search-empty]');

  const normalize = (value) =>
    value
      .toLocaleLowerCase('uk-UA')
      .replace(/[’']/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const materialWord = (count) => {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return 'матеріалів';
    if (last === 1) return 'матеріал';
    if (last >= 2 && last <= 4) return 'матеріали';
    return 'матеріалів';
  };

  const updateResults = () => {
    const query = normalize(input.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = !query || normalize(card.textContent).includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    clearButton.hidden = !query;
    emptyState.hidden = visibleCount !== 0;
    status.textContent = `Показано ${visibleCount} ${materialWord(visibleCount)}`;
  };

  articleSearch.addEventListener('submit', (event) => event.preventDefault());
  input.addEventListener('input', updateResults);
  clearButton.addEventListener('click', () => {
    input.value = '';
    updateResults();
    input.focus();
  });

  updateResults();
}
