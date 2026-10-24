/** The server's clock, read through a function so pages can show "checked 2 days ago" without calling Date.now during render. */
export const serverNow = (): number => Date.now();
