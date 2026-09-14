// Frontend
(() => {
  "use strict";

  // Bootstrap form validation
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    }, false);
  });

  // Review star rating interaction
  const reviewForms = document.querySelectorAll(".review-form");
  reviewForms.forEach((reviewForm) => {
    const hiddenRating = reviewForm.querySelector("#rating");
    if (!hiddenRating) return;

    const starButtons = [...reviewForm.querySelectorAll(".star-rating-btn")];
    let selectedValue = Number(hiddenRating.value || 0);

    const updateStars = (value) => {
      const activeValue = Number(value || 0);

      starButtons.forEach((button) => {
        const starValue = Number(button.dataset.value);
        const isSelected = starValue <= activeValue;
        button.classList.toggle("filled", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
    };

    starButtons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        updateStars(button.dataset.value);
      });

      button.addEventListener("mouseleave", () => {
        updateStars(selectedValue);
      });

      button.addEventListener("click", () => {
        selectedValue = Number(button.dataset.value);
        hiddenRating.value = selectedValue;
        updateStars(selectedValue);
      });
    });

    updateStars(selectedValue);
  });

  // Auto-dismiss and hover-pause for Bootstrap alerts
  document.addEventListener("DOMContentLoaded", () => {
    const ALERT_AUTO_DISMISS_MS = 5000;

    document.addEventListener("click", (event) => {
      const closeButton = event.target.closest("[data-bs-dismiss='alert']");
      if (!closeButton) return;

      const alertEl = closeButton.closest(".flash-alert");
      if (!alertEl) return;

      if (window.bootstrap && bootstrap.Alert) {
        const bootstrapAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
        bootstrapAlert.close();
      } else {
        alertEl.classList.remove("show");
        setTimeout(() => alertEl.remove(), 150);
      }
    });

    document.querySelectorAll("#flash-container .flash-alert, #flash-container .alert").forEach((alertEl) => {
      if (!alertEl.classList.contains("fade")) {
        alertEl.classList.add("fade", "show");
      }

      let timeoutId;
      let start = Date.now();
      let remaining = ALERT_AUTO_DISMISS_MS;

      const startTimer = () => {
        timeoutId = setTimeout(() => {
          if (window.bootstrap && bootstrap.Alert) {
            bootstrap.Alert.getOrCreateInstance(alertEl).close();
          } else {
            alertEl.remove();
          }
        }, remaining);
        start = Date.now();
      };

      const clearTimer = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          remaining -= Date.now() - start;
        }
      };

      alertEl.addEventListener("mouseenter", clearTimer);
      alertEl.addEventListener("mouseleave", () => {
        start = Date.now();
        startTimer();
      });

      startTimer();
    });
  });

})();
