
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeBtn = document.querySelector(".close-btn");

    // Makikinig sa click event sa buong katawan ng gallery para sa mga 'zoomable' images
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("zoomable")) {
            lightboxImg.src = e.target.src; // Kukunin ang URL ng pinindot na larawan
            lightbox.classList.add("active"); // Ipakita ang zoom view
            document.body.style.overflow = "hidden"; // I-disable ang scroll ng page habang naka-zoom
        }
    });

    // Isara ang zoom kapag pinindot ang Close (X) button
    closeBtn.addEventListener("click", () => {
        closeLightbox();
    });

    // Isara rin ang zoom kapag pinindot ang itim na background sa labas ng larawan
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Isara kapag pinindot ang 'Escape' key sa keyboard
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto"; // Ibalik ang scroll ng page
    }
});
