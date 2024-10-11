const toast = (message: string, duration: number) => {
  const enterDuration = 300;
  const exitDuration = 300;

  const dom = document.createElement("div");
  dom.classList.add("toast");

  const computedStyles = window.getComputedStyle(dom);

  const messageDom = document.createElement("div");
  messageDom.classList.add("toast-message");
  messageDom.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("toast-close-btn");
  const closeBtnIcon = document.createElement("i");
  closeBtnIcon.classList.add("ri-close-line");
  closeBtn.append(closeBtnIcon);

  const removeToast = () => {
    dom.classList.remove("display");

    setTimeout(() => {
      document.body.removeChild(dom);
      const toasts = document.querySelectorAll<HTMLElement>(".toast");
      for (const [index, toast] of toasts.entries()) {
        toast.style.bottom = `${
          toastBottom + (toastTotalHeight + 12) * index
        }px`;
      }
    }, exitDuration);
  };

  closeBtn.addEventListener("click", removeToast);

  dom.append(messageDom, closeBtn);
  document.body.append(dom);

  // Ensure the toast is off-screen initially
  dom.style.right = `${-dom.clientWidth}px`;

  const toastTotalHeight =
    parseInt(computedStyles.padding) * 2 + parseInt(computedStyles.height);

  const toastBottom = parseInt(computedStyles.bottom);

  const toastCount = document.querySelectorAll(".toast").length;

  dom.style.bottom = `${
    toastBottom + (toastTotalHeight + 12) * (toastCount - 1)
  }px`;

  // Force a reflow to ensure the style change is applied before animation
  dom.offsetHeight; // This line forces the browser to recalculate styles (reflow)

  // After a tiny delay, add the class to trigger the slide-in animation
  dom.classList.add("display");

  setTimeout(removeToast, duration + enterDuration); // Match the duration of the fade-out transition
};

export default toast;
