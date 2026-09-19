const q = document.querySelector('#q');
const buttons = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('[data-tags]')];
const normalise = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Index all filenames, including those inside closed details and hidden cards.
const searchText = new Map(cards.map(card => [card, normalise(card.textContent)]));
let active = 'all';
function apply() {
  const needle = normalise((q?.value || '').trim());
  let shown = 0;
  for (const card of cards) {
    const tags = (card.dataset.tags || '').split(/\s+/);
    const visible = (active === 'all' || tags.includes(active)) && (!needle || searchText.get(card).includes(needle));
    card.classList.toggle('hidden', !visible);
    if (visible) shown++;
  }
  for (const button of buttons) {
    const selected = button.dataset.filter === active;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const count = document.querySelector('#result-count');
  if (count) count.textContent = shown ? shown + ' item' + (shown === 1 ? '' : 's') + ' shown' : 'No methods match. Try a different search or select All.';
}
q?.addEventListener('input', apply);
buttons.forEach(button => button.addEventListener('click', () => { active = button.dataset.filter; apply(); }));
apply();
const mentorButton=document.querySelector('#mentor-open');const mentorText=document.querySelector('#mentor-question');const mentorStatus=document.querySelector('#mentor-status');mentorButton?.addEventListener('click',async()=>{const text=mentorText.value.trim();if(text){try{await navigator.clipboard.writeText(text);mentorStatus.textContent='Question copied. Paste it into the mentor when it opens.';}catch(e){mentorStatus.textContent='Copy the question, then paste it into the mentor.';}}else{mentorStatus.textContent='The mentor will open. Add the live situation, scale, constraints and what must be different afterwards.';}window.open(mentorButton.dataset.href,'_blank','noopener');});