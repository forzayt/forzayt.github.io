
        document.addEventListener("DOMContentLoaded", function () {
            function removeLogo() {
                const splineViewer = document.querySelector("spline-viewer");
                if (!splineViewer) return;
    
                const logo = splineViewer.shadowRoot?.querySelector("#logo");
                if (logo) {
                    logo.remove();
                } else {
                    requestAnimationFrame(removeLogo); // Keep checking until found
                }
            }
    
            requestAnimationFrame(removeLogo);
        });
    