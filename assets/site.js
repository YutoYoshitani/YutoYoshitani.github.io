/* Core reading and navigation work without JavaScript */
(() => {
  "use strict";
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  function revealHashTarget() {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    let parent = target;
    while (parent) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
      parent = parent.parentElement;
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "instant" }));
  }
  window.addEventListener("hashchange", revealHashTarget);
  revealHashTarget();

  /* Native dialog keeps keyboard focus inside, supports Escape, and leaves
     ordinary image links as the no-script/unsupported-browser fallback */
  if (typeof HTMLDialogElement !== "undefined" && HTMLDialogElement.prototype.showModal) {
    const dialog = document.createElement("dialog");
    dialog.className = "image-viewer";
    dialog.setAttribute("aria-labelledby", "viewer-title");
    const bar = document.createElement("div");
    bar.className = "viewer-bar";
    const title = document.createElement("p");
    title.id = "viewer-title";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "viewer-close";
    close.textContent = "閉じる ×";
    const image = document.createElement("img");
    bar.append(title, close);
    dialog.append(bar, image);
    document.body.append(dialog);
    let returnFocus = null;
    let previousOverflow = "";
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("keydown", (event) => {
      // The close button is the viewer's only interactive control
      if (event.key === "Tab") {
        event.preventDefault();
        close.focus();
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.documentElement.style.overflow = previousOverflow;
      returnFocus?.focus({ preventScroll: true });
    });
    document.querySelectorAll("a[data-image-preview]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const original = link.querySelector("img");
        if (!original) return;
        event.preventDefault();
        returnFocus = link;
        title.textContent = original.alt;
        image.alt = original.alt;
        image.src = link.href;
        previousOverflow = document.documentElement.style.overflow;
        dialog.showModal();
        document.documentElement.style.overflow = "hidden";
        close.focus();
      });
    });
  }

  let printStates = [];
  window.addEventListener("beforeprint", () => {
    printStates = Array.from(document.querySelectorAll("details"), node => [node, node.open]);
    printStates.forEach(([node]) => { node.open = true; });
  });
  window.addEventListener("afterprint", () => {
    printStates.forEach(([node, open]) => { node.open = open; });
    printStates = [];
  });
})();
