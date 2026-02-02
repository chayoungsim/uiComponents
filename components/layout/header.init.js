import { isMobile } from './header.common.js';
import { initHeaderPC } from './header.pc.js';
import { initHeaderMO } from './header.mo.js';

export function initHeader(options) {
  if (isMobile()) {
    initHeaderMO(options);
  } else {
    initHeaderPC(options);
  }
}
