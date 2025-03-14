document.addEventListener("DOMContentLoaded", function () {
    function removeAllLogos() {
        const splineViewers = document.querySelectorAll("spline-viewer");
        if (splineViewers.length === 0) return;

        splineViewers.forEach((viewer) => {
            const removeLogo = () => {
                const logo = viewer.shadowRoot?.querySelector("#logo");
                if (logo) {
                    logo.remove();
                } else {
                    requestAnimationFrame(removeLogo); // Keep checking until found
                }
            };
            requestAnimationFrame(removeLogo);
        });
    }

    requestAnimationFrame(removeAllLogos);
});
