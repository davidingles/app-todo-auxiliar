export function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => {
    const isHidden = element.getAttribute('aria-hidden') === 'true' || element.hidden;
    const isDisabled = element.disabled;
    return !isHidden && !isDisabled && element.tabIndex !== -1;
  });
}