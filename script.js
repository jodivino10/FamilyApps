document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // KOPYAHIN AT PALITAN MULA SA SUPABASE MO:
    // ==========================================
    const SUPABASE_URL = "IYONG_SUPABASE_PROJECT_URL_DITO"; 
    const SUPABASE_ANON_KEY = "IYONG_SUPABASE_ANON_KEY_DITO"; 

    // Pag-initialize sa Supabase client gamit ang global bundle
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Default credentials para sa login screen app access
    let currentUsername = "admin";
    let currentPassword = "admin123";
    let navigationHistory = ["loginScreen"]; 
    let activeAlbumId = null;

    // --- NAVIGATION ARCHITECTURE ---
    function navigateTo(screenId) {
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
        document.getElementById(screenId).classList.add("active");
        
        if (navigationHistory[navigationHistory.length - 1] !== screenId) {
            navigationHistory.push(screenId);
        }
    }

    function goBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop(); 
            const previousScreen = navigationHistory[navigationHistory.length - 1];
            
            document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
            document.getElementById(previousScreen).classList.add("active");
            
            document.getElementById("settingsPanel").style.display = "none";
            document.getElementById("mainDashboardContent").style.display = "block";
        }
    }

    // --- LOGIN VALIDATION ---
    document.getElementById("loginBtn").addEventListener("click", () => {
        const userInp = document.getElementById("usernameInput").value.trim();
        const passInp = document.getElementById("passwordInput").value.trim();
        const errorBox = document.getElementById("loginError");

        if (userInp === currentUsername && passInp === currentPassword) {
            errorBox.style.display = "none";
            loadAlbums(); // Hilahin ang mga album mula database kapag pumasok
            navigateTo("homeScreen");
        } else {
            errorBox.style.display = "block";
        }
    });

    // Eye visibility indicator toggle
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

    // --- SETTINGS VIEW SWITCH SYSTEM ---
    const settingsBtn = document.getElementById("settingsTabBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const mainDashboardContent = document.getElementById("mainDashboardContent");

    settingsBtn.addEventListener("click", () => {
        if (settingsPanel.style.display === "none") {
            settingsPanel.style.display = "block";
            mainDashboardContent.style.display = "none";
            settingsBtn.innerText = "📁 Dashboard";
        } else {
            settingsPanel.style.display = "none";
            mainDashboardContent.style.display = "block";
            settingsBtn.innerText = "⚙️ Settings";
        }
    });

    document.getElementById("saveSettingsBtn").addEventListener("click", () => {
        const newU = document.getElementById("newUsername").value.trim();
        const newP = document.getElementById("newPassword").value.trim();
        if (newU !== "") currentUsername = newU;
        if (newP !== "") currentPassword = newP;
        alert("Credentials changed successfully!");
        settingsPanel.style.display = "none";
        mainDashboardContent.style.display = "block";
        settingsBtn.innerText = "⚙️ Settings";
    });

    // --- SUPABASE STORAGE: COVER & DP REALTIME PREVIEW ---
    document.getElementById("dpUploadInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById("profileDp").src = URL.createObjectURL(file);
            // Dito mo pwedeng isunod ang supabase storage upload block code kung gusto mo i-permanent save
        }
    });

    document.getElementById("coverUploadInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById("coverPhotoBg").style.backgroundImage = `url('${URL.createObjectURL(file)}')`;
        }
    });

    // --- SUPABASE DATABASE & STORAGE LOGIC ---

    // A. Kumuha ng mga Album mula sa Supabase Table (Database Table name: 'albums')
    async function loadAlbums() {
        const { data, error } = await _supabase.from('albums').select('*').order('created_at', { ascending: false });
        const grid = document.getElementById("albumGrid");
        grid.innerHTML = "";

        if (error) {
            console.error("Error fetching albums:", error);
            return;
        }

        data.forEach(album => {
            const card = document.createElement("div");
            card.className = "album-card";
            card.setAttribute("data-album-id", album.id);
            card.innerHTML = `
                <div class="album-cover-placeholder">📂</div>
                <h4>${album.name}</h4>
            `;
            grid.appendChild(card);
        });
    }

    // B. Gumawa ng Bagong Album Folder patungong Supabase Database
    document.getElementById("createAlbumBtn").addEventListener("click", async () => {
        const albumName = prompt("Ipasok ang pangalan ng bagong album:");
        if (albumName && albumName.trim() !== "") {
            const { data, error } = await _supabase.from('albums').insert([{ name: albumName.trim() }]).select();
            if (error) alert("Error creating album database record: " + error.message);
            else loadAlbums();
        }
    });

    // C. Pagpasok sa Isang Folder at Paghila sa mga Larawan nito mula sa Supabase Storage Bucket ('family-bucket')
    document.getElementById("albumGrid").addEventListener("click", async (e) => {
        const card = e.target.closest(".album-card");
        if (card) {
            activeAlbumId = card.getAttribute("data-album-id");
            const albumTitle = card.querySelector("h4").innerText;
            document.getElementById("currentAlbumTitle").innerText = albumTitle;
            
            loadMedia(activeAlbumId); // Tawagin ang loader ng photos
            navigateTo("albumViewScreen"); 
        }
    });

    async function loadMedia(albumId) {
        const mediaGrid = document.getElementById("mediaGrid");
        mediaGrid.innerHTML = "Lumaload...";

        // Nagbabasa ng files mula sa folder sa storage base sa id ng album
        const { data, error } = await _supabase.storage.from('family-bucket').list(`album_${albumId}`);
        mediaGrid.innerHTML = "";

        if (error || !data) {
            console.error("Error fetching storage elements:", error);
            return;
        }

        data.forEach(file => {
            if(file.name === ".emptyFolderPlaceholder") return;

            // Kunin ang Public Download URL ng bawat file
            const { data: urlData } = _supabase.storage.from('family-bucket').getPublicUrl(`album_${albumId}/${file.name}`);
            const fileUrl = urlData.publicUrl;

            // Alamin kung litrato o video file
            if (file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                const img = document.createElement("img");
                img.src = fileUrl;
                img.className = "media-item zoomable";
                mediaGrid.appendChild(img);
            } else if (file.name.match(/\.(mp4|webm|ogg|mov)$/i)) {
                const vid = document.createElement("video");
                vid.src = fileUrl;
                vid.className = "media-item clickable-video";
                vid.controls = true;
                mediaGrid.appendChild(vid);
            }
        });
    }

    // D. Mag-upload ng mga bagong Photos/Videos diretso sa folder ng Supabase Storage Bucket
    const fileInput = document.getElementById("mediaUploadInput");
    document.getElementById("triggerUploadBtn").addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (e) => {
        const files = e.target.files;
        if (!files.length || !activeAlbumId) return;

        for (let file of files) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `album_${activeAlbumId}/${fileName}`;

            // I-execute ang direct upload block stream command
            const { error } = await _supabase.storage.from('family-bucket').upload(filePath, file);
            
            if (error) alert("Upload failure: " + error.message);
        }
        
        loadMedia(activeAlbumId); // I-refresh ang gallery view pagkatapos ng loop
    });

    document.getElementById("backToHomeBtn").addEventListener("click", () => goBack());

    // --- LIGHTBOX ZOOM RUNNER ---
    const lightbox = document.getElementById("lightbox");
    const lightboxContent = document.getElementById("lightboxContent");

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("zoomable")) {
            lightboxContent.innerHTML = `<img src="${e.target.src}" alt="Zoomed">`;
            lightbox.style.display = "flex";
        }
        if (e.target.classList.contains("clickable-video")) {
            lightboxContent.innerHTML = `<video src="${e.target.src}" controls autoplay></video>`;
