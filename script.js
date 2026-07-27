document.addEventListener("DOMContentLoaded", () => {
    // Array tracker para sa tamang function ng back button
    let navigationHistory = ["loginScreen"]; 

    // Function para sa maayos na paglipat ng screen
    function navigateTo(screenId) {
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
        document.getElementById(screenId).classList.add("active");
        
        if (navigationHistory[navigationHistory.length - 1] !== screenId) {
            navigationHistory.push(screenId);
        }
    }

    // WAstong BACK LOGIC: Babalik kung saan huling umalis nang tama
    function goBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop(); 
            const previousScreen = navigationHistory[navigationHistory.length - 1];
            
            document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
            document.getElementById(previousScreen).classList.add("active");
        }
    }

    // 1. Toggle Password Visibility (Mata 👀 Icon function)
    const passwordInput = document.getElementById("passwordInput");
    const viewPasswordIcon = document.querySelector(".view-password-icon");

    if (viewPasswordIcon && passwordInput) {
        viewPasswordIcon.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                viewPasswordIcon.innerText = "🕶️"; 
            } else {
                passwordInput.type = "password";
                viewPasswordIcon.innerText = "👀";
            }
        });
    }

    // 2. Login Trigger Button Action
    document.getElementById("loginBtn").addEventListener("click", () => {
        navigateTo("homeScreen");
    });

    // 3. Pagpasok sa Album Card (Click event delegation)
    document.getElementById("albumGrid").addEventListener("click", (e) => {
        const card = e.target.closest(".album-card");
        if (card) {
            const albumTitle = card.querySelector("h4").innerText;
            document.getElementById("currentAlbumTitle").innerText = albumTitle;
            navigateTo("albumViewScreen"); 
        }
    });

    // 4. WAstong Back Button Trigger sa loob ng Folder View
    document.getElementById("backToHomeBtn").addEventListener("click", () => {
        goBack(); 
    });

    // 5. Create Album Function Box
    document.getElementById("createAlbumBtn").addEventListener("click", () => {
        const albumName = prompt("Ipasok ang pangalan ng bagong album:");
        if (albumName && albumName.trim() !== "") {
            const grid = document.getElementById("albumGrid");
            const newAlbum = document.createElement("div");
            newAlbum.className = "album-card";
            newAlbum.innerHTML = `
                <div class="album-cover-placeholder">📂</div>
                <h4>${albumName}</h4>
            `;
            grid.appendChild(newAlbum);
        }
    });

    // 6. Local Media Upload Simulation Control
    const fileInput = document.getElementById("mediaUploadInput");
    document.getElementById("triggerUploadBtn").addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const mediaGrid = document.getElementById("mediaGrid");
        const files = e.target.files;

        for (let file of files) {
            const fileUrl = URL.createObjectURL(file);
            if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.src = fileUrl;
                img.className = "media-item zoomable";
                mediaGrid.insertBefore(img, mediaGrid.firstChild);
            } else if (file.type.startsWith("video/")) {
                const vid = document.createElement("video");
                vid.src = fileUrl;
                vid.className = "media-item clickable-video";
                vid.controls = true;
                mediaGrid.insertBefore(vid, mediaGrid.firstChild);
            }
        }
    });

    // 7. LIGHTBOX FUNCTION: Pop-up Zoom sa mga Photos at Videos
    const lightbox = document.getElementById("lightbox");
    const lightboxContent = document.getElementById("lightboxContent");

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("zoomable")) {
            lightboxContent.innerHTML = `<img src="${e.target.src}" alt="Zoomed">`;
            lightbox.style.display = "flex";
        }
        if (e.target.classList.contains("clickable-video")) {
            lightboxContent.innerHTML = `<video src="${e.target.src}" controls autoplay></video>`;
            lightbox.style.display = "flex";
        }
    });

    // Isara ang Lightbox Zoom
    document.querySelector(".close-btn").addEventListener("click", () => {
        lightbox.style.display = "none";
        lightboxContent.innerHTML = ""; 
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
            lightboxContent.innerHTML = "";
        }
    });
});
