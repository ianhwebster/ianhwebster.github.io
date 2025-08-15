// photography-loader.js
// Dynamically loads all images from content/photography/url_list.json into the #photography .gallery columns
// Each image gets an ID based on its category and index. Every other image goes into the second column.

(function() {
    // Helper to create an img element with a given id
    function createImg(src, id) {
        var img = document.createElement('img');
        img.src = src;
        img.id = id;
        img.onerror = function() {
            console.warn('[photography-loader] Failed to load:', src, 'ID:', id);
        };
        return img;
    }

    // Fetch the list of images from the server
    function fetchPhotographyImages(callback) {
        fetch('content/photography/url_list.json')
            .then(function(response) { return response.json(); })
            .then(function(data) { 
                if (!data.urls || !Array.isArray(data.urls)) {
                    console.error('[photography-loader] Malformed url_list.json');
                    return;
                }
                callback(data.urls[0]); // The first (and only) object
            })
            .catch(function(err) {
                console.error('[photography-loader] Could not fetch url_list.json:', err);
            });
    }

    function populatePhotographyGallery(categories) {
        var gallery = document.querySelector('#photography .gallery .row');
        if (!gallery) return;
        // Remove existing columns
        gallery.innerHTML = '';
        // Create two columns
        var col1 = document.createElement('div');
        col1.className = 'column';
        var col2 = document.createElement('div');
        col2.className = 'column';
        // Flatten all images with their category
        var allImages = [];
        Object.entries(categories).forEach(function([cat, arr]) {
            arr.forEach(function(url) {
                allImages.push({ url, id: cat });
            });
        });
        // Distribute images: even index to col1, odd to col2
        allImages.forEach(function(img, i) {
            var imgElem = createImg(img.url, img.id);
            imgElem.setAttribute('data-category', img.id);
            if (i % 2 === 0) col1.appendChild(imgElem);
            else col2.appendChild(imgElem);
        });
        gallery.appendChild(col1);
        gallery.appendChild(col2);
        console.log('[photography-loader] Populated', allImages.length, 'images.');
    }

    // Filtering logic
    function setupFilterNav() {
        var nav = document.querySelector('#photography .photo-filter-nav');
        if (!nav) return;
        nav.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') return;
            // Set active class
            nav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            var filter = e.target.getAttribute('data-filter');
            var imgs = document.querySelectorAll('#photography .gallery img');
            imgs.forEach(function(img) {
                // Compare ID case-insensitively
                if (filter === 'all' || img.id.toLowerCase() === filter.toLowerCase()) {
                    img.style.display = '';
                } else {
                    img.style.display = 'none';
                }
            });
        });
    }

    // Only run on #photography section
    function onPhotographyVisible() {
        fetchPhotographyImages(populatePhotographyGallery);
    }

    // Run on page load if #photography is visible
    document.addEventListener('DOMContentLoaded', function() {
        var section = document.getElementById('photography');
        setupFilterNav();
        if (section && section.style.display !== 'none') {
            onPhotographyVisible();
        }
    });
    // Also run when switching to #photography
    window.addEventListener('hashchange', function() {
        var section = document.getElementById('photography');
        if (window.location.hash === '#photography' && section && section.style.display !== 'none') {
            onPhotographyVisible();
        }
    });
})();
