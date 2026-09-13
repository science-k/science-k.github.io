// Count the title's rendered lines, independent of the institution text.
function layoutLectureInstitutions() {
  const mobile = matchMedia('(max-width: 650px)').matches;
  const rows = [...document.querySelectorAll('.lecture-entry:not([hidden])')];
  const states = rows.map(row => {
    if (!mobile) return [row, false];
    const range = document.createRange();
    range.selectNodeContents(row.querySelector('strong'));
    const tops = [...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top));
    return [row, new Set(tops).size === 1];
  });
  states.forEach(([row, single]) => row.classList.toggle('lecture-single-line', single));
}
let layoutPending = false;
function scheduleLectureLayout() {
  if (layoutPending) return;
  layoutPending = true;
  requestAnimationFrame(() => { layoutPending = false; layoutLectureInstitutions(); });
}
addEventListener('resize', scheduleLectureLayout, {passive:true});
document.fonts.ready.then(scheduleLectureLayout);
const input = document.querySelector('#lecture-search');
if (input) {
  const search = document.querySelector('.lecture-search');
  const rows = [...document.querySelectorAll('.lecture-entry')];
  const normalize = text => text.toLocaleLowerCase().replace(/\s+/g, '');
  const entries = rows.map(row => [row, normalize(row.textContent)]);
  const update = () => {
    const query = normalize(input.value);
    let count = 0;
    entries.forEach(([row, text]) => { row.hidden = !text.includes(query); if (!row.hidden) count++; });
    document.querySelectorAll('.lecture-month-group').forEach(group => { group.hidden = ![...group.querySelectorAll('.lecture-entry')].some(row => !row.hidden); });
    document.querySelectorAll('.lecture-table-year').forEach(group => { group.hidden = ![...group.querySelectorAll('.lecture-month-group')].some(month => !month.hidden); });
    document.querySelector('#search-status').textContent = query ? (count ? `${count}개 강의 항목을 찾았습니다.` : '검색 결과가 없습니다. 다른 주제나 기관명을 입력해 주세요.') : `전체 ${rows.length}개 강의 항목`;
    scheduleLectureLayout();
  };
  search.hidden = false;
  input.addEventListener('input', update);
  document.querySelector('#search-clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  update();
}
const links = [...document.querySelectorAll('.profile-nav a')];
if (links.length) {
  const targets = links.map(link => document.getElementById(link.hash.slice(1)));
  let queued = false;
  const update = () => {
    queued = false;
    let active = 0;
    targets.forEach((target, i) => { if (target && target.getBoundingClientRect().top < 150) active = i; });
    links.forEach((link, i) => { if(i === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', () => { if(!queued) { queued = true; requestAnimationFrame(update); } }, {passive:true});
  update();
}
