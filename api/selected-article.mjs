import articleHandler from './article-final.mjs';

const TITLES = new Map([
  ['yak-poboroty-lin', ['Як побороти лінь і почати діяти', 'Як побороти лінь']],
  ['prychyny-lini', ['Чому виникає лінь: 8 причин і що з ними робити', 'Чому виникає лінь і що з цим робити']],
  ['yak-diiaty-koly-nemaie-motyvatsii', ['Як діяти, коли немає мотивації', 'Що робити, коли немає мотивації']],
  ['yak-vstaty-z-lizhka-vrantsi', ['Як змусити себе встати з ліжка вранці', 'Як прокидатися зранку']],
  ['apatiia-u-pidlitkiv', ['Апатія у підлітків: ознаки, причини та коли потрібна допомога', 'Апатія у підлітків: ознаки, причини та коли потрібна допомога']],
  ['nichogo-ne-raduie-yak-povernuty-interes-do-zhyttia', ['Нічого не радує: як повернути інтерес до життя', 'Нічого не радує: як повернути інтерес до життя']],
  ['apatiia-shcho-robyty', ['Апатія: що робити, коли нічого не хочеться', 'Апатія: що робити, коли нічого не хочеться']],
  ['yak-vybraty-priorytet-koly-vse-terminove', ['Як вибрати пріоритет, коли все здається терміновим', 'Як вибирати пріоритети']],
  ['sduh-i-prokrastynatsiia', ['Як зосередитися й не відволікатися під час роботи або навчання', 'Як зосередитися на навчанні']]
]);

class CaptureResponse {
  constructor(){ this.statusCode=200; this.headers=new Map(); this.body=''; }
  status(code){ this.statusCode=code; return this; }
  setHeader(name,value){ this.headers.set(String(name), String(value)); return this; }
  send(body){ this.body=String(body); return this; }
}

export default function handler(request, response) {
  const slug = String(request.query?.slug || '').trim().toLowerCase();
  const pair = TITLES.get(slug);
  if (!pair) {
    response.status(404).setHeader('Content-Type','text/plain; charset=utf-8').send('Article not found');
    return;
  }

  const captured = new CaptureResponse();
  articleHandler(request, captured);
  for (const [name,value] of captured.headers) response.setHeader(name,value);
  if (captured.statusCode !== 200) {
    response.status(captured.statusCode).send(captured.body);
    return;
  }

  const [oldTitle,newTitle] = pair;
  const body = oldTitle === newTitle ? captured.body : captured.body.split(oldTitle).join(newTitle);
  response.status(200).send(body);
}
