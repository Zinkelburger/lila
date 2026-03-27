import { storedBooleanPropWithEffect } from 'lib/storage';
import { Expand, List } from 'lib/licon';

site.load.then(() => {
  const container = document.querySelector('.studies') as HTMLElement | null;
  const toggle = document.querySelector('.study-view-toggle') as HTMLElement | null;
  if (!container || !toggle) return;

  const compact = storedBooleanPropWithEffect('study.compact.view', false, apply);

  function apply(enabled: boolean) {
    container!.classList.toggle('compact', enabled);
    toggle!.dataset.icon = enabled ? Expand : List;
    toggle!.title = enabled ? 'Full view' : 'Compact view';
  }

  apply(compact());

  toggle.addEventListener('click', () => compact(!compact()));
});
