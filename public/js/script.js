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

  // Auto-dismiss and hover-pause for Bootstrap alerts
  document.addEventListener("DOMContentLoaded", () => {
    const ALERT_AUTO_DISMISS_MS = 5000;
    document.querySelectorAll("#flash-container .alert").forEach((alertEl) => {
      // ensure fade/show classes for smooth transition
      if (!alertEl.classList.contains('fade')) {
        alertEl.classList.add('fade', 'show');
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

      alertEl.addEventListener('mouseenter', clearTimer);
      alertEl.addEventListener('mouseleave', () => {
        start = Date.now();
        startTimer();
      });

      startTimer();
    });
  });

})();
