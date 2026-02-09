/* ============================================================
   NapsBlocks - app.js
   Main application: homepage, engine, UI, game loader
   ============================================================ */
(function () {
    'use strict';

    /* ---- Global namespace ---- */
    var NB = {};
    window.NB = NB;

    /* ---- Game registry ---- */
    NB._games = {};
    NB.registerGame = function (id, def) {
        NB._games[id] = def;
    };

    /* ---- Constants ---- */
    var GRAVITY = -30;
    var JUMP_FORCE = 14;
    var MOVE_SPEED = 14;
    var PLAYER_HALF_W = 0.7;
    var PLAYER_FULL_H = 4.4;
    var FALL_DEATH_Y = -60;

    /* ---- Name generator ---- */
    var adjectives = [
        'Happy', 'Swift', 'Brave', 'Cool', 'Epic', 'Lucky', 'Mighty',
        'Noble', 'Quick', 'Sly', 'Wild', 'Bold', 'Keen', 'Calm', 'Deft'
    ];
    var nouns = [
        'Panda', 'Tiger', 'Fox', 'Wolf', 'Eagle', 'Bear', 'Hawk',
        'Lion', 'Otter', 'Lynx', 'Raven', 'Shark', 'Viper', 'Moose', 'Cobra'
    ];
    function randomName() {
        var a = adjectives[Math.floor(Math.random() * adjectives.length)];
        var n = nouns[Math.floor(Math.random() * nouns.length)];
        var num = Math.floor(Math.random() * 9000) + 1000;
        return 'Guest_' + a + n + num;
    }

    /* ---- Avatar System ---- */
    var avatarDefaults = {
        skinColor: '#f5c6a0',
        torsoColor: '#4488ff',
        legColor: '#4488ff',
        armColor: null, /* null = use skin color */
        hairColor: '#3b2716',
        hairStyle: 'classic',
        face: 'default',
        hat: 'none',
        headColor: null /* null = use skin color */
    };

    var avatarState = JSON.parse(JSON.stringify(avatarDefaults));

    /* Try to load saved avatar from localStorage */
    try {
        var saved = localStorage.getItem('nb_avatar');
        if (saved) {
            var parsed = JSON.parse(saved);
            for (var k in parsed) {
                if (avatarState.hasOwnProperty(k)) avatarState[k] = parsed[k];
            }
        }
    } catch (e) {}

    function saveAvatar() {
        try { localStorage.setItem('nb_avatar', JSON.stringify(avatarState)); } catch (e) {}
    }

    /* Catalog Data */
    var catalogHats = [
        { id: 'none', name: 'None', emoji: '❌', category: 'None' },
        { id: 'tophat', name: 'Top Hat', emoji: '🎩', category: 'Classic', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.2 });
            var brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 16), mat);
            brim.position.set(0, 5.15, 0);
            brim.castShadow = true;
            group.add(brim);
            var top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 16), mat);
            top.position.set(0, 5.75, 0);
            top.castShadow = true;
            group.add(top);
            return [brim, top];
        }},
        { id: 'cap', name: 'Baseball Cap', emoji: '🧢', category: 'Sporty', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7, metalness: 0.1 });
            var dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
            dome.position.set(0, 5.0, 0);
            dome.castShadow = true;
            group.add(dome);
            var visor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.7), mat);
            visor.position.set(0, 5.0, 0.65);
            visor.castShadow = true;
            group.add(visor);
            return [dome, visor];
        }},
        { id: 'crown', name: 'Crown', emoji: '👑', category: 'Royal', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 });
            var base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.4, 16), mat);
            base.position.set(0, 5.2, 0);
            base.castShadow = true;
            group.add(base);
            var parts = [base];
            for (var i = 0; i < 5; i++) {
                var spike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), mat);
                var angle = (i / 5) * Math.PI * 2;
                spike.position.set(Math.cos(angle) * 0.55, 5.65, Math.sin(angle) * 0.55);
                spike.castShadow = true;
                group.add(spike);
                parts.push(spike);
            }
            return parts;
        }},
        { id: 'beanie', name: 'Beanie', emoji: '🧶', category: 'Casual', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x336699, roughness: 0.9, metalness: 0 });
            var dome = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), mat);
            dome.position.set(0, 4.95, 0);
            dome.castShadow = true;
            group.add(dome);
            var pompom = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat);
            pompom.position.set(0, 5.55, 0);
            pompom.castShadow = true;
            group.add(pompom);
            return [dome, pompom];
        }},
        { id: 'headphones', name: 'Headphones', emoji: '🎧', category: 'Music', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.3 });
            var band = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 16, Math.PI), mat);
            band.position.set(0, 5.2, 0);
            band.rotation.x = 0;
            band.castShadow = true;
            group.add(band);
            var earL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 12), mat);
            earL.position.set(-0.8, 4.4, 0);
            earL.rotation.z = Math.PI / 2;
            earL.castShadow = true;
            group.add(earL);
            var earR = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 12), mat);
            earR.position.set(0.8, 4.4, 0);
            earR.rotation.z = Math.PI / 2;
            earR.castShadow = true;
            group.add(earR);
            return [band, earL, earR];
        }},
        { id: 'viking', name: 'Viking Helmet', emoji: '⚔️', category: 'Epic', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.4 });
            var dome = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat);
            dome.position.set(0, 4.95, 0);
            dome.castShadow = true;
            group.add(dome);
            var hornMat = new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.6, metalness: 0.1 });
            var hornL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 6), hornMat);
            hornL.position.set(-0.75, 5.2, 0);
            hornL.rotation.z = Math.PI / 4;
            hornL.castShadow = true;
            group.add(hornL);
            var hornR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 6), hornMat);
            hornR.position.set(0.75, 5.2, 0);
            hornR.rotation.z = -Math.PI / 4;
            hornR.castShadow = true;
            group.add(hornR);
            return [dome, hornL, hornR];
        }},
        { id: 'wizard', name: 'Wizard Hat', emoji: '🧙', category: 'Magic', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0x5533aa, roughness: 0.7, metalness: 0.1 });
            var brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 16), mat);
            brim.position.set(0, 5.05, 0);
            brim.castShadow = true;
            group.add(brim);
            var cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 16), mat);
            cone.position.set(0, 5.85, 0);
            cone.castShadow = true;
            group.add(cone);
            var starMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.3, metalness: 0.5, emissive: 0xffdd00, emissiveIntensity: 0.3 });
            var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), starMat);
            star.position.set(0.2, 5.5, 0.5);
            group.add(star);
            return [brim, cone, star];
        }},
        { id: 'halo', name: 'Halo', emoji: '😇', category: 'Angelic', build: function (group) {
            var mat = new THREE.MeshStandardMaterial({ color: 0xffdd44, roughness: 0.2, metalness: 0.5, emissive: 0xffdd44, emissiveIntensity: 0.4 });
            var ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 8, 24), mat);
            ring.position.set(0, 5.6, 0);
            ring.rotation.x = Math.PI / 2;
            ring.castShadow = false;
            group.add(ring);
            return [ring];
        }}
    ];

    var catalogFaces = [
        { id: 'default', name: 'Default', emoji: '🙂', draw: function (ctx) {
            /* eyes */
            ctx.fillStyle = '#222';
            ctx.fillRect(76, 48, 16, 16);
            ctx.fillRect(164, 48, 16, 16);
            /* smile */
            ctx.fillStyle = '#333';
            ctx.fillRect(96, 96, 64, 8);
        }},
        { id: 'cool', name: 'Cool', emoji: '😎', draw: function (ctx) {
            /* sunglasses bar */
            ctx.fillStyle = '#111';
            ctx.fillRect(56, 44, 144, 24);
            /* lenses */
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(64, 46, 44, 20);
            ctx.fillRect(148, 46, 44, 20);
            /* smirk */
            ctx.fillStyle = '#333';
            ctx.fillRect(108, 96, 44, 8);
            ctx.fillRect(152, 92, 16, 8);
        }},
        { id: 'happy', name: 'Happy', emoji: '😄', draw: function (ctx) {
            /* big eyes */
            ctx.fillStyle = '#222';
            ctx.fillRect(72, 40, 22, 22);
            ctx.fillRect(162, 40, 22, 22);
            /* whites */
            ctx.fillStyle = '#fff';
            ctx.fillRect(78, 44, 8, 8);
            ctx.fillRect(168, 44, 8, 8);
            /* big smile */
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(128, 90, 36, 0, Math.PI, false);
            ctx.fill();
        }},
        { id: 'angry', name: 'Angry', emoji: '😠', draw: function (ctx) {
            /* eyebrows */
            ctx.fillStyle = '#222';
            ctx.save();
            ctx.translate(84, 38);
            ctx.rotate(-0.3);
            ctx.fillRect(-16, 0, 32, 8);
            ctx.restore();
            ctx.save();
            ctx.translate(172, 38);
            ctx.rotate(0.3);
            ctx.fillRect(-16, 0, 32, 8);
            ctx.restore();
            /* eyes */
            ctx.fillRect(72, 52, 18, 14);
            ctx.fillRect(166, 52, 18, 14);
            /* frown */
            ctx.beginPath();
            ctx.arc(128, 116, 28, Math.PI, 0, false);
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }},
        { id: 'silly', name: 'Silly', emoji: '🤪', draw: function (ctx) {
            /* wonky eyes */
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(84, 52, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(172, 48, 10, 0, Math.PI * 2);
            ctx.fill();
            /* tongue out */
            ctx.fillStyle = '#333';
            ctx.fillRect(100, 96, 56, 8);
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(128, 116, 14, 0, Math.PI, false);
            ctx.fill();
        }},
        { id: 'robot', name: 'Robot', emoji: '🤖', draw: function (ctx) {
            /* square eyes */
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(68, 40, 28, 28);
            ctx.fillRect(160, 40, 28, 28);
            /* pupil */
            ctx.fillStyle = '#003322';
            ctx.fillRect(76, 48, 12, 12);
            ctx.fillRect(168, 48, 12, 12);
            /* mouth grid */
            ctx.fillStyle = '#444';
            for (var i = 0; i < 4; i++) {
                ctx.fillRect(88 + i * 20, 96, 12, 8);
            }
        }},
        { id: 'uwu', name: 'UwU', emoji: 'UwU', draw: function (ctx) {
            /* closed eyes ^ ^ */
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(68, 60); ctx.lineTo(84, 44); ctx.lineTo(100, 60); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(156, 60); ctx.lineTo(172, 44); ctx.lineTo(188, 60); ctx.stroke();
            /* w mouth */
            ctx.beginPath();
            ctx.moveTo(96, 96);
            ctx.quadraticCurveTo(112, 116, 128, 96);
            ctx.quadraticCurveTo(144, 116, 160, 96);
            ctx.stroke();
        }},
        { id: 'skull', name: 'Skull', emoji: '💀', draw: function (ctx) {
            /* dark eye sockets */
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(86, 54, 18, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(170, 54, 18, 0, Math.PI * 2); ctx.fill();
            /* nose */
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.moveTo(122, 82); ctx.lineTo(128, 74); ctx.lineTo(134, 82);
            ctx.fill();
            /* teeth */
            ctx.fillStyle = '#ddd';
            for (var i = 0; i < 5; i++) {
                ctx.fillRect(92 + i * 16, 96, 10, 16);
            }
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            for (var i = 0; i < 5; i++) {
                ctx.strokeRect(92 + i * 16, 96, 10, 16);
            }
        }}
    ];

    var catalogHairStyles = [
        { id: 'classic', name: 'Classic' },
        { id: 'spiky', name: 'Spiky' },
        { id: 'long', name: 'Long' },
        { id: 'bald', name: 'Bald' },
        { id: 'mohawk', name: 'Mohawk' },
        { id: 'curly', name: 'Curly' }
    ];

    var skinColorPalette = [
        '#f5c6a0', '#e8b78e', '#d4a574', '#c49360', '#a87040',
        '#8b5e34', '#6b4226', '#4a2d18', '#fcdec0', '#f9d4b0',
        '#ffffff', '#ffcccc', '#ccddff', '#ccffcc', '#ffffaa',
        '#ffaaff', '#aaffff', '#ff9999', '#99ff99', '#9999ff'
    ];

    var bodyColorPalette = [
        '#4488ff', '#ff4444', '#44cc44', '#ffaa00', '#aa44ff',
        '#ff44aa', '#44ffff', '#ff8800', '#0088ff', '#8844ff',
        '#ff0066', '#00cc88', '#cc4400', '#0044cc', '#888888',
        '#222222', '#ffffff', '#cc9900', '#009944', '#990044',
        '#1a1a2e', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6',
        '#f39c12', '#1abc9c', '#e67e22', '#2c3e50', '#95a5a6'
    ];

    var hairColorPalette = [
        '#3b2716', '#1a0f08', '#654321', '#8b6914', '#d4a520',
        '#e8c35e', '#c0392b', '#e74c3c', '#f39c12', '#ffffff',
        '#808080', '#333333', '#5533aa', '#ff44aa', '#44aaff',
        '#00cc88'
    ];

    /* ---- State ---- */
    var playerName = randomName();
    var state = {
        running: false,
        currentGameId: null,
        scene: null,
        camera: null,
        renderer: null,
        clock: null,
        player: null,
        platforms: [],
        npcs: [],
        chatMessages: [],
        npcBubbles: [],
        checkpoint: null,
        spawnPoint: { x: 0, y: 5, z: 0 },
        keys: {},
        mouse: { dx: 0, dy: 0 },
        rightMouseDown: false,
        leftMouseDown: false,
        cameraYaw: 0,
        cameraPitch: 0.3,
        cameraDistance: 12,
        cameraTargetDistance: 12,
        velocity: { x: 0, y: 0, z: 0 },
        onGround: false,
        isDead: false,
        animTime: 0,
        health: 100,
        maxHealth: 100,
        settings: {
            sensitivity: 0.006,
            fov: 70,
            shadows: true,
            quality: 'medium',
            invertY: false,
            shiftLock: false
        }
    };

    /* ---- DOM references (set on DOMContentLoaded) ---- */
    var elHomepage, elGameDetail, elGameContainer;
    var elSearchInput, elGameCards, elDetailTitle, elDetailDesc;
    var elPlayBtn, elBackBtn;

    /* ---- In-game UI elements (created dynamically) ---- */
    var uiRoot, uiChat, uiChatLog, uiChatInput, uiChatInputWrap;
    var uiPlayerList, uiEscMenu, uiSettingsPanel, uiDeathScreen;
    var uiChatToggle, uiMenuBtn, uiHealthBar, uiHealthFill, uiHealthText;
    var uiCrosshair, uiShiftIndicator, uiBottomBar;
    var chatOpen = false;
    var escMenuOpen = false;
    var settingsOpen = false;

    /* ========================================================
       SECTION 1 - HOMEPAGE LOGIC
       ======================================================== */
    NB.initHomepage = function () {
        elHomepage = document.getElementById('homepage');
        elGameDetail = document.getElementById('game-detail');
        elGameContainer = document.getElementById('game-container');
        elSearchInput = document.getElementById('search-input');
        elGameCards = document.querySelectorAll('.game-card');
        elDetailTitle = document.getElementById('detail-title');
        elDetailDesc = document.getElementById('detail-description');
        elPlayBtn = document.getElementById('btn-play');
        elBackBtn = document.getElementById('detail-back-btn');

        /* Search filter */
        if (elSearchInput) {
            elSearchInput.addEventListener('input', function () {
                var q = elSearchInput.value.toLowerCase();
                elGameCards.forEach(function (card) {
                    var title = (card.getAttribute('data-title') || card.textContent).toLowerCase();
                    card.style.display = title.indexOf(q) !== -1 ? '' : 'none';
                });
            });
        }

        /* Game card click -> detail page */
        elGameCards.forEach(function (card) {
            card.addEventListener('click', function () {
                var id = card.getAttribute('data-game-id');
                var title = card.getAttribute('data-title') || 'Game';
                var desc = card.getAttribute('data-desc') || '';
                var emoji = card.getAttribute('data-emoji') || '';
                var thumb = card.getAttribute('data-thumb') || '';
                var creator = card.getAttribute('data-creator') || '@NapsStudio';
                var like = card.getAttribute('data-like') || '90';
                var players = card.getAttribute('data-players') || '0';
                var genre = card.getAttribute('data-genre') || 'Game';
                var maxplayers = card.getAttribute('data-maxplayers') || '20';
                var created = card.getAttribute('data-created') || '';
                var updated = card.getAttribute('data-updated') || '';
                showDetail(id, title, desc, emoji, thumb, creator, like, players, genre, maxplayers, created, updated);
            });
        });

        /* Back button */
        if (elBackBtn) elBackBtn.addEventListener('click', showHomepage);

        /* Logo click -> homepage */
        var logo = document.getElementById('navbar-logo');
        if (logo) logo.addEventListener('click', showHomepage);

        /* Play button */
        if (elPlayBtn) {
            elPlayBtn.addEventListener('click', function () {
                var id = elPlayBtn.getAttribute('data-game-id');
                if (id) NB.startGame(id);
            });
        }
    };

    function showDetail(id, title, desc, emoji, thumb, creator, like, players, genre, maxplayers, created, updated) {
        if (elDetailTitle) elDetailTitle.textContent = title;
        if (elDetailDesc) elDetailDesc.textContent = desc;
        if (elPlayBtn) elPlayBtn.setAttribute('data-game-id', id);

        var banner = document.getElementById('detail-banner');
        if (banner) {
            banner.className = 'detail-banner ' + (thumb || '');
            banner.textContent = emoji || '';
        }
        var detailThumb = document.getElementById('detail-thumb');
        if (detailThumb) {
            detailThumb.className = 'detail-thumb ' + (thumb || '');
            detailThumb.textContent = emoji || '';
        }
        var creatorEl = document.getElementById('detail-creator');
        if (creatorEl) creatorEl.textContent = creator || '@NapsStudio';
        var playersEl = document.getElementById('detail-players');
        if (playersEl) playersEl.textContent = players || '0';
        var likesEl = document.getElementById('detail-likes');
        if (likesEl) likesEl.textContent = (like || '90') + '%';
        var maxPlayersEl = document.getElementById('detail-maxplayers');
        if (maxPlayersEl) maxPlayersEl.textContent = maxplayers || '20';
        var genreEl = document.getElementById('detail-genre');
        if (genreEl) genreEl.textContent = genre || 'Game';
        var createdEl = document.getElementById('detail-created');
        if (createdEl) createdEl.textContent = created || '';
        var updatedEl = document.getElementById('detail-updated');
        if (updatedEl) updatedEl.textContent = updated || '';
        var tagsEl = document.getElementById('detail-tags');
        if (tagsEl) {
            tagsEl.innerHTML = '';
            var tags = [genre, 'Multiplayer', 'NapsBlocks'];
            for (var i = 0; i < tags.length; i++) {
                var tag = document.createElement('span');
                tag.className = 'detail-tag';
                tag.textContent = tags[i];
                tagsEl.appendChild(tag);
            }
        }

        if (elHomepage) elHomepage.style.display = 'none';
        var avatarPage = document.getElementById('avatar-page');
        if (avatarPage) avatarPage.style.display = 'none';
        var catalogPage = document.getElementById('catalog-page');
        if (catalogPage) catalogPage.style.display = 'none';
        if (elGameDetail) {
            elGameDetail.style.display = 'block';
            elGameDetail.scrollTop = 0;
        }
    }

    function showHomepage() {
        if (elGameDetail) elGameDetail.style.display = 'none';
        if (elGameContainer) elGameContainer.style.display = 'none';
        if (elHomepage) elHomepage.style.display = '';
        var avatarPage = document.getElementById('avatar-page');
        if (avatarPage) avatarPage.style.display = 'none';
        var catalogPage = document.getElementById('catalog-page');
        if (catalogPage) catalogPage.style.display = 'none';
        var navbar = document.querySelector('.navbar');
        var sidebar = document.querySelector('.sidebar');
        if (navbar) navbar.style.display = '';
        if (sidebar) sidebar.style.display = '';

        /* Update active sidebar item */
        var items = document.querySelectorAll('.sidebar-item');
        items.forEach(function (it) {
            it.classList.toggle('active', it.getAttribute('data-page') === 'home');
        });
    }

    /* ========================================================
       AVATAR EDITOR PAGE
       ======================================================== */
    var _avatarPreviewRenderer = null;
    var _avatarPreviewScene = null;
    var _avatarPreviewCamera = null;
    var _avatarPreviewChar = null;
    var _avatarPreviewAnimId = null;
    var _avatarPreviewTime = 0;

    function showAvatarPage() {
        if (elHomepage) elHomepage.style.display = 'none';
        if (elGameDetail) elGameDetail.style.display = 'none';
        if (elGameContainer) elGameContainer.style.display = 'none';
        var catalogPage = document.getElementById('catalog-page');
        if (catalogPage) catalogPage.style.display = 'none';
        var avatarPage = document.getElementById('avatar-page');
        if (avatarPage) avatarPage.style.display = 'block';

        /* Update active sidebar item (both profile and avatar point here) */
        var items = document.querySelectorAll('.sidebar-item');
        items.forEach(function (it) {
            var pg = it.getAttribute('data-page');
            it.classList.toggle('active', pg === 'avatar' || pg === 'profile');
        });

        /* Show navbar and sidebar */
        var navbar = document.querySelector('.navbar');
        var sidebar = document.querySelector('.sidebar');
        if (navbar) navbar.style.display = '';
        if (sidebar) sidebar.style.display = '';

        initAvatarPreview();
        buildAvatarEditorUI();
    }

    function initAvatarPreview() {
        var container = document.getElementById('avatar-preview-container');
        if (!container) return;

        /* Clean up any existing preview */
        cleanupAvatarPreview();
        container.innerHTML = '';

        /* Setup scene */
        _avatarPreviewScene = new THREE.Scene();
        _avatarPreviewScene.background = new THREE.Color(0x2a2a2a);

        _avatarPreviewCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
        _avatarPreviewCamera.position.set(0, 3.5, 10);
        _avatarPreviewCamera.lookAt(0, 2.5, 0);

        _avatarPreviewRenderer = new THREE.WebGLRenderer({ antialias: true });
        _avatarPreviewRenderer.setSize(container.clientWidth, container.clientHeight);
        _avatarPreviewRenderer.setPixelRatio(window.devicePixelRatio);
        _avatarPreviewRenderer.outputEncoding = THREE.sRGBEncoding;
        _avatarPreviewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        _avatarPreviewRenderer.toneMappingExposure = 1.0;
        container.appendChild(_avatarPreviewRenderer.domElement);

        /* Lighting */
        var hemi = new THREE.HemisphereLight(0xaabbcc, 0x555555, 0.5);
        _avatarPreviewScene.add(hemi);
        var amb = new THREE.AmbientLight(0xffffff, 0.3);
        _avatarPreviewScene.add(amb);
        var dir = new THREE.DirectionalLight(0xffeedd, 0.7);
        dir.position.set(5, 10, 7);
        _avatarPreviewScene.add(dir);
        var dir2 = new THREE.DirectionalLight(0xaaccff, 0.3);
        dir2.position.set(-5, 5, -3);
        _avatarPreviewScene.add(dir2);

        /* Floor */
        var floorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 });
        var floor = new THREE.Mesh(new THREE.CircleGeometry(3, 32), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        _avatarPreviewScene.add(floor);

        /* Character */
        refreshAvatarPreviewChar();

        /* Animate */
        _avatarPreviewTime = 0;
        function animate() {
            _avatarPreviewAnimId = requestAnimationFrame(animate);
            _avatarPreviewTime += 0.016;

            if (_avatarPreviewChar) {
                _avatarPreviewChar.rotation.y += 0.005;
            }

            _avatarPreviewRenderer.render(_avatarPreviewScene, _avatarPreviewCamera);
        }
        animate();

        /* Mouse drag rotation */
        var dragging = false;
        var lastX = 0;
        _avatarPreviewRenderer.domElement.addEventListener('mousedown', function (e) {
            dragging = true;
            lastX = e.clientX;
        });
        window.addEventListener('mousemove', function (e) {
            if (!dragging || !_avatarPreviewChar) return;
            var dx = e.clientX - lastX;
            _avatarPreviewChar.rotation.y += dx * 0.01;
            lastX = e.clientX;
        });
        window.addEventListener('mouseup', function () { dragging = false; });
    }

    function refreshAvatarPreviewChar() {
        if (!_avatarPreviewScene) return;

        /* Remove old character */
        if (_avatarPreviewChar) {
            _avatarPreviewScene.remove(_avatarPreviewChar);
            _avatarPreviewChar.traverse(function (obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
        }

        _avatarPreviewChar = createCharacter(playerName, null, false);
        _avatarPreviewScene.add(_avatarPreviewChar);
    }

    function cleanupAvatarPreview() {
        if (_avatarPreviewAnimId) {
            cancelAnimationFrame(_avatarPreviewAnimId);
            _avatarPreviewAnimId = null;
        }
        if (_avatarPreviewChar && _avatarPreviewScene) {
            _avatarPreviewScene.remove(_avatarPreviewChar);
            _avatarPreviewChar.traverse(function (obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
            _avatarPreviewChar = null;
        }
        if (_avatarPreviewRenderer) {
            _avatarPreviewRenderer.dispose();
            _avatarPreviewRenderer.forceContextLoss();
            _avatarPreviewRenderer = null;
        }
        _avatarPreviewScene = null;
        _avatarPreviewCamera = null;
    }

    function buildAvatarEditorUI() {
        var panel = document.getElementById('avatar-editor-panel');
        if (!panel) return;
        panel.innerHTML = '';

        /* -- Skin Color Section -- */
        buildColorSection(panel, 'Skin Color', skinColorPalette, avatarState.skinColor, function (c) {
            avatarState.skinColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Head Color Section -- */
        buildColorSection(panel, 'Head Color', skinColorPalette, avatarState.headColor || avatarState.skinColor, function (c) {
            avatarState.headColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        }, 'Same as Skin', function () {
            avatarState.headColor = null;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Torso Color -- */
        buildColorSection(panel, 'Torso Color', bodyColorPalette, avatarState.torsoColor, function (c) {
            avatarState.torsoColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Leg Color -- */
        buildColorSection(panel, 'Leg Color', bodyColorPalette, avatarState.legColor, function (c) {
            avatarState.legColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Arm Color -- */
        buildColorSection(panel, 'Arm Color', skinColorPalette.concat(bodyColorPalette), avatarState.armColor || avatarState.skinColor, function (c) {
            avatarState.armColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        }, 'Same as Skin', function () {
            avatarState.armColor = null;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Hair Color -- */
        buildColorSection(panel, 'Hair Color', hairColorPalette, avatarState.hairColor, function (c) {
            avatarState.hairColor = c;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Hair Style -- */
        buildItemSection(panel, 'Hair Style', catalogHairStyles.map(function (h) {
            return { id: h.id, name: h.name, emoji: '💇' };
        }), avatarState.hairStyle, function (id) {
            avatarState.hairStyle = id;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Face -- */
        buildItemSection(panel, 'Face', catalogFaces, avatarState.face, function (id) {
            avatarState.face = id;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* -- Hat -- */
        buildItemSection(panel, 'Hat', catalogHats, avatarState.hat, function (id) {
            avatarState.hat = id;
            saveAvatar();
            refreshAvatarPreviewChar();
        });

        /* Reset button */
        var resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset to Default';
        resetBtn.style.cssText = 'width:100%;padding:12px;border:none;border-radius:8px;background:#444;color:#ccc;font-size:14px;font-weight:600;cursor:pointer;margin-top:16px;transition:background 0.15s;';
        resetBtn.addEventListener('mouseenter', function () { resetBtn.style.background = '#555'; });
        resetBtn.addEventListener('mouseleave', function () { resetBtn.style.background = '#444'; });
        resetBtn.addEventListener('click', function () {
            avatarState = JSON.parse(JSON.stringify(avatarDefaults));
            saveAvatar();
            refreshAvatarPreviewChar();
            buildAvatarEditorUI();
        });
        panel.appendChild(resetBtn);
    }

    function buildColorSection(parent, label, colors, currentColor, onChange, resetLabel, onReset) {
        var section = document.createElement('div');
        section.style.cssText = 'margin-bottom:20px;';

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
        var lbl = document.createElement('div');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:13px;font-weight:700;color:#ccc;';
        header.appendChild(lbl);

        if (resetLabel && onReset) {
            var resetLink = document.createElement('span');
            resetLink.textContent = resetLabel;
            resetLink.style.cssText = 'font-size:11px;color:#4a9eff;cursor:pointer;';
            resetLink.addEventListener('click', function () {
                onReset();
                buildAvatarEditorUI();
            });
            header.appendChild(resetLink);
        }

        section.appendChild(header);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

        colors.forEach(function (c) {
            var swatch = document.createElement('div');
            var isSelected = c.toLowerCase() === (currentColor || '').toLowerCase();
            swatch.style.cssText = 'width:28px;height:28px;border-radius:6px;cursor:pointer;border:2px solid ' +
                (isSelected ? '#fff' : 'rgba(255,255,255,0.1)') +
                ';background:' + c + ';transition:border-color 0.15s,transform 0.1s;';
            swatch.addEventListener('mouseenter', function () { swatch.style.transform = 'scale(1.15)'; });
            swatch.addEventListener('mouseleave', function () { swatch.style.transform = 'scale(1)'; });
            swatch.addEventListener('click', function () {
                onChange(c);
                buildAvatarEditorUI();
            });
            grid.appendChild(swatch);
        });

        section.appendChild(grid);
        parent.appendChild(section);
    }

    function buildItemSection(parent, label, items, currentId, onChange) {
        var section = document.createElement('div');
        section.style.cssText = 'margin-bottom:20px;';

        var lbl = document.createElement('div');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:13px;font-weight:700;color:#ccc;margin-bottom:8px;';
        section.appendChild(lbl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;';

        items.forEach(function (item) {
            var isSelected = item.id === currentId;
            var card = document.createElement('div');
            card.style.cssText = 'background:' + (isSelected ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.05)') +
                ';border:2px solid ' + (isSelected ? '#4a9eff' : 'rgba(255,255,255,0.08)') +
                ';border-radius:8px;padding:10px 6px;text-align:center;cursor:pointer;transition:background 0.15s,border-color 0.15s,transform 0.1s;';
            card.addEventListener('mouseenter', function () {
                card.style.background = isSelected ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.1)';
                card.style.transform = 'scale(1.03)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.background = isSelected ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.05)';
                card.style.transform = 'scale(1)';
            });
            card.addEventListener('click', function () {
                onChange(item.id);
                buildAvatarEditorUI();
            });

            var emo = document.createElement('div');
            emo.textContent = item.emoji || '✦';
            emo.style.cssText = 'font-size:24px;margin-bottom:4px;';
            card.appendChild(emo);

            var name = document.createElement('div');
            name.textContent = item.name;
            name.style.cssText = 'font-size:10px;color:#aaa;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
            card.appendChild(name);

            grid.appendChild(card);
        });

        section.appendChild(grid);
        parent.appendChild(section);
    }

    /* ========================================================
       CATALOG PAGE
       ======================================================== */
    function showCatalogPage() {
        if (elHomepage) elHomepage.style.display = 'none';
        if (elGameDetail) elGameDetail.style.display = 'none';
        if (elGameContainer) elGameContainer.style.display = 'none';
        var avatarPage = document.getElementById('avatar-page');
        if (avatarPage) avatarPage.style.display = 'none';
        cleanupAvatarPreview();
        var catalogPage = document.getElementById('catalog-page');
        if (catalogPage) catalogPage.style.display = 'block';

        /* Update active sidebar item */
        var items = document.querySelectorAll('.sidebar-item');
        items.forEach(function (it) {
            it.classList.toggle('active', it.getAttribute('data-page') === 'catalog');
        });

        /* Show navbar and sidebar */
        var navbar = document.querySelector('.navbar');
        var sidebar = document.querySelector('.sidebar');
        if (navbar) navbar.style.display = '';
        if (sidebar) sidebar.style.display = '';

        buildCatalogUI();
    }

    function buildCatalogUI() {
        var container = document.getElementById('catalog-content');
        if (!container) return;
        container.innerHTML = '';

        /* Hats section */
        var hatsSection = document.createElement('div');
        hatsSection.style.cssText = 'margin-bottom:32px;';
        var hatsTitle = document.createElement('h2');
        hatsTitle.textContent = 'Hats';
        hatsTitle.style.cssText = 'font-size:20px;font-weight:700;color:#e0e0e0;margin-bottom:14px;';
        hatsSection.appendChild(hatsTitle);

        var hatsGrid = document.createElement('div');
        hatsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;';
        catalogHats.forEach(function (hat) {
            var card = createCatalogCard(hat.emoji, hat.name, hat.category || '', hat.id === avatarState.hat, function () {
                avatarState.hat = hat.id;
                saveAvatar();
                buildCatalogUI();
            });
            hatsGrid.appendChild(card);
        });
        hatsSection.appendChild(hatsGrid);
        container.appendChild(hatsSection);

        /* Faces section */
        var facesSection = document.createElement('div');
        facesSection.style.cssText = 'margin-bottom:32px;';
        var facesTitle = document.createElement('h2');
        facesTitle.textContent = 'Faces';
        facesTitle.style.cssText = 'font-size:20px;font-weight:700;color:#e0e0e0;margin-bottom:14px;';
        facesSection.appendChild(facesTitle);

        var facesGrid = document.createElement('div');
        facesGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;';
        catalogFaces.forEach(function (face) {
            var card = createCatalogCard(face.emoji, face.name, '', face.id === avatarState.face, function () {
                avatarState.face = face.id;
                saveAvatar();
                buildCatalogUI();
            });
            facesGrid.appendChild(card);
        });
        facesSection.appendChild(facesGrid);
        container.appendChild(facesSection);

        /* Hair Styles section */
        var hairSection = document.createElement('div');
        hairSection.style.cssText = 'margin-bottom:32px;';
        var hairTitle = document.createElement('h2');
        hairTitle.textContent = 'Hair Styles';
        hairTitle.style.cssText = 'font-size:20px;font-weight:700;color:#e0e0e0;margin-bottom:14px;';
        hairSection.appendChild(hairTitle);

        var hairGrid = document.createElement('div');
        hairGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;';
        catalogHairStyles.forEach(function (hs) {
            var card = createCatalogCard('💇', hs.name, '', hs.id === avatarState.hairStyle, function () {
                avatarState.hairStyle = hs.id;
                saveAvatar();
                buildCatalogUI();
            });
            hairGrid.appendChild(card);
        });
        hairSection.appendChild(hairGrid);
        container.appendChild(hairSection);
    }

    function createCatalogCard(emoji, name, subtitle, equipped, onClick) {
        var card = document.createElement('div');
        card.style.cssText = 'background:' + (equipped ? 'rgba(74,158,255,0.15)' : '#2a2a2a') +
            ';border:1px solid ' + (equipped ? '#4a9eff' : '#333') +
            ';border-radius:10px;overflow:hidden;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s,background 0.15s;';
        card.addEventListener('mouseenter', function () {
            card.style.transform = 'scale(1.03)';
            card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = 'none';
        });
        card.addEventListener('click', onClick);

        var emoDiv = document.createElement('div');
        emoDiv.style.cssText = 'height:100px;display:flex;align-items:center;justify-content:center;font-size:42px;background:rgba(0,0,0,0.2);';
        emoDiv.textContent = emoji;
        card.appendChild(emoDiv);

        var info = document.createElement('div');
        info.style.cssText = 'padding:10px 12px;';

        var nameDiv = document.createElement('div');
        nameDiv.textContent = name;
        nameDiv.style.cssText = 'font-size:13px;font-weight:600;color:#e0e0e0;margin-bottom:4px;';
        info.appendChild(nameDiv);

        if (subtitle) {
            var subDiv = document.createElement('div');
            subDiv.textContent = subtitle;
            subDiv.style.cssText = 'font-size:11px;color:#888;';
            info.appendChild(subDiv);
        }

        if (equipped) {
            var badge = document.createElement('div');
            badge.textContent = 'Equipped';
            badge.style.cssText = 'display:inline-block;margin-top:6px;padding:3px 10px;border-radius:10px;background:rgba(74,158,255,0.2);color:#4a9eff;font-size:10px;font-weight:600;';
            info.appendChild(badge);
        }

        card.appendChild(info);
        return card;
    }

    /* ========================================================
       SECTION 2 - THREE.JS ENGINE SETUP
       ======================================================== */

    function initEngine() {
        var renderer = new THREE.WebGLRenderer({ antialias: state.settings.quality !== 'low', logarithmicDepthBuffer: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(state.settings.quality === 'high' ? window.devicePixelRatio : 1);
        renderer.shadowMap.enabled = state.settings.shadows;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.95;
        renderer.outputEncoding = THREE.sRGBEncoding;
        state.renderer = renderer;
        elGameContainer.innerHTML = '';
        elGameContainer.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x6aafe0);
        scene.fog = new THREE.Fog(0x6aafe0, 80, 300);
        state.scene = scene;

        var camera = new THREE.PerspectiveCamera(state.settings.fov, window.innerWidth / window.innerHeight, 0.1, 500);
        state.camera = camera;

        var hemi = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.4);
        scene.add(hemi);

        var ambient = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambient);

        var dirLight = new THREE.DirectionalLight(0xffeedd, 0.6);
        dirLight.position.set(50, 80, 30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = state.settings.quality === 'high' ? 2048 : 1024;
        dirLight.shadow.mapSize.height = dirLight.shadow.mapSize.width;
        dirLight.shadow.camera.left = -60;
        dirLight.shadow.camera.right = 60;
        dirLight.shadow.camera.top = 60;
        dirLight.shadow.camera.bottom = -60;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 200;
        dirLight.shadow.bias = -0.002;
        scene.add(dirLight);

        state.clock = new THREE.Clock();

        window._nbResize = function () {
            if (!state.running) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', window._nbResize);
    }

    /* ========================================================
       SECTION 3 - CHARACTER CREATOR (Blocky Roblox style)
       ======================================================== */

    function createFaceTexture(faceId) {
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);

        var faceData = catalogFaces.find(function (f) { return f.id === faceId; });
        if (!faceData) faceData = catalogFaces[0];
        faceData.draw(ctx);

        var tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    function buildHairMeshes(group, style, hairColor) {
        var hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
        var parts = [];
        if (style === 'classic') {
            var hair = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), hairMat);
            hair.position.set(0, 5.1, -0.05);
            hair.castShadow = true;
            group.add(hair);
            parts.push(hair);
        } else if (style === 'spiky') {
            for (var i = 0; i < 5; i++) {
                var spike = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 4), hairMat);
                spike.position.set(-0.5 + i * 0.25, 5.35, -0.05 + (i % 2) * 0.15);
                spike.castShadow = true;
                group.add(spike);
                parts.push(spike);
            }
        } else if (style === 'long') {
            var top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 1.5), hairMat);
            top.position.set(0, 5.1, -0.05);
            top.castShadow = true;
            group.add(top);
            parts.push(top);
            var back = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.4), hairMat);
            back.position.set(0, 4.1, -0.65);
            back.castShadow = true;
            group.add(back);
            parts.push(back);
        } else if (style === 'bald') {
            /* no hair */
        } else if (style === 'mohawk') {
            for (var i = 0; i < 6; i++) {
                var strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6 + (i < 3 ? i * 0.15 : (5 - i) * 0.15), 0.25), hairMat);
                strip.position.set(0, 5.3, -0.5 + i * 0.2);
                strip.castShadow = true;
                group.add(strip);
                parts.push(strip);
            }
        } else if (style === 'curly') {
            for (var i = 0; i < 8; i++) {
                var angle = (i / 8) * Math.PI * 2;
                var ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), hairMat);
                ball.position.set(Math.cos(angle) * 0.55, 5.05, Math.sin(angle) * 0.55);
                ball.castShadow = true;
                group.add(ball);
                parts.push(ball);
            }
            var topBall = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), hairMat);
            topBall.position.set(0, 5.3, 0);
            topBall.castShadow = true;
            group.add(topBall);
            parts.push(topBall);
        }
        return parts;
    }

    function buildHatMeshes(group, hatId) {
        var hatData = catalogHats.find(function (h) { return h.id === hatId; });
        if (!hatData || hatData.id === 'none' || !hatData.build) return [];
        return hatData.build(group);
    }

    function createCharacter(name, color, isNPC) {
        var group = new THREE.Group();

        /* Determine colors based on avatar state or NPC defaults */
        var useAvatar = !isNPC;
        var skinCol = useAvatar ? avatarState.skinColor : '#f5c6a0';
        var torsoCol = useAvatar ? avatarState.torsoColor : (color ? '#' + new THREE.Color(color).getHexString() : '#4488ff');
        var legCol = useAvatar ? avatarState.legColor : torsoCol;
        var armCol = useAvatar ? (avatarState.armColor || avatarState.skinColor) : skinCol;
        var headCol = useAvatar ? (avatarState.headColor || avatarState.skinColor) : skinCol;
        var hairCol = useAvatar ? avatarState.hairColor : '#3b2716';
        var hairStyle = useAvatar ? avatarState.hairStyle : 'classic';
        var faceId = useAvatar ? avatarState.face : 'default';
        var hatId = useAvatar ? avatarState.hat : 'none';

        if (isNPC) {
            var npcColor = color ? '#' + new THREE.Color(color).getHexString() : '#4488ff';
            torsoCol = npcColor;
            legCol = npcColor;
        }

        var mat = new THREE.MeshStandardMaterial({ color: torsoCol, roughness: 0.7, metalness: 0.1 });
        var legMat = new THREE.MeshStandardMaterial({ color: legCol, roughness: 0.7, metalness: 0.1 });
        var skinMat = new THREE.MeshStandardMaterial({ color: armCol, roughness: 0.7, metalness: 0.1 });
        var headMat = new THREE.MeshStandardMaterial({ color: headCol, roughness: 0.7, metalness: 0.1 });

        var legs = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.9), legMat);
        legs.position.set(-0.25, 0.9, 0);
        legs.castShadow = true;
        legs.receiveShadow = true;
        group.add(legs);
        var legs2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.9), legMat);
        legs2.position.set(0.25, 0.9, 0);
        legs2.castShadow = true;
        legs2.receiveShadow = true;
        group.add(legs2);

        var torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.9), mat);
        torso.position.set(0, 2.7, 0);
        torso.castShadow = true;
        torso.receiveShadow = true;
        group.add(torso);

        var armL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.9), skinMat);
        armL.position.set(-1.25, 2.7, 0);
        armL.castShadow = true;
        group.add(armL);
        var armR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.9), skinMat);
        armR.position.set(1.25, 2.7, 0);
        armR.castShadow = true;
        group.add(armR);

        var head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), headMat);
        head.position.set(0, 4.3, 0);
        head.castShadow = true;
        group.add(head);

        /* Face - use canvas texture on a plane */
        var faceTex = createFaceTexture(faceId);
        var faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false });
        var facePlane = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.35), faceMat);
        facePlane.position.set(0, 4.3, 0.705);
        group.add(facePlane);

        /* Hair */
        var hairParts = buildHairMeshes(group, hairStyle, hairCol);

        /* Hat */
        var hatParts = buildHatMeshes(group, hatId);

        group.userData = {
            name: name || playerName,
            isNPC: !!isNPC,
            legs: legs,
            legs2: legs2,
            armL: armL,
            armR: armR,
            head: head,
            facePlane: facePlane,
            hairParts: hairParts,
            hatParts: hatParts
        };

        return group;
    }

    function animateCharacterWalk(char, t, speed) {
        var d = char.userData;
        var swing = Math.sin(t * 8) * 0.5 * speed;
        if (d.legs) d.legs.rotation.x = swing;
        if (d.legs2) d.legs2.rotation.x = -swing;
        if (d.armL) d.armL.rotation.x = -swing;
        if (d.armR) d.armR.rotation.x = swing;
    }

    function resetCharacterPose(char) {
        var d = char.userData;
        if (d.legs) d.legs.rotation.x = 0;
        if (d.legs2) d.legs2.rotation.x = 0;
        if (d.armL) d.armL.rotation.x = 0;
        if (d.armR) d.armR.rotation.x = 0;
    }

    /* ========================================================
       SECTION 4 - NAMETAG & BUBBLE CHAT RENDERING
       ======================================================== */

    function createNametag(name) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 64;
        ctx.clearRect(0, 0, 512, 64);
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.strokeText(name, 256, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, 256, 32);

        var tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        var spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        var sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4, 0.5, 1);
        sprite.position.set(0, 5.8, 0);
        sprite.renderOrder = 999;
        return sprite;
    }

    function createBubbleChat(text) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        ctx.clearRect(0, 0, 512, 128);

        var bx = 20, by = 10, bw = 472, bh = 80, r = 18;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(240, 90);
        ctx.lineTo(256, 118);
        ctx.lineTo(272, 90);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#222222';
        ctx.font = '28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var display = text.length > 40 ? text.substring(0, 37) + '...' : text;
        ctx.fillText(display, 256, 50);

        var tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        var spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        var sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(5, 1.2, 1);
        sprite.position.set(0, 6.8, 0);
        sprite.renderOrder = 1000;
        return sprite;
    }

    /* ========================================================
       SECTION 5 - PHYSICS & COLLISION (AABB)
       ======================================================== */

    function playerAABB(px, py, pz) {
        return {
            minX: px - PLAYER_HALF_W,
            maxX: px + PLAYER_HALF_W,
            minY: py,
            maxY: py + PLAYER_FULL_H,
            minZ: pz - PLAYER_HALF_W,
            maxZ: pz + PLAYER_HALF_W
        };
    }

    function platformAABB(p) {
        return {
            minX: p.position.x - p.userData.hw,
            maxX: p.position.x + p.userData.hw,
            minY: p.position.y - p.userData.hh,
            maxY: p.position.y + p.userData.hh,
            minZ: p.position.z - p.userData.hd,
            maxZ: p.position.z + p.userData.hd
        };
    }

    function aabbOverlap(a, b) {
        return a.minX < b.maxX && a.maxX > b.minX &&
               a.minY < b.maxY && a.maxY > b.minY &&
               a.minZ < b.maxZ && a.maxZ > b.minZ;
    }

    function resolveCollisions(pos, vel) {
        var newOnGround = false;

        /* Y axis FIRST - most important for ground collision */
        var testY = playerAABB(pos.x, pos.y + vel.y, pos.z);
        for (var i = 0; i < state.platforms.length; i++) {
            var pb = platformAABB(state.platforms[i]);
            if (aabbOverlap(testY, pb)) {
                if (vel.y < 0) {
                    /* Landing on top */
                    pos.y = pb.maxY + 0.001;
                    newOnGround = true;
                } else {
                    /* Hitting ceiling */
                    pos.y = pb.minY - PLAYER_FULL_H;
                }
                vel.y = 0;
                break;
            }
        }
        if (vel.y !== 0) {
            pos.y += vel.y;
        }

        /* X axis */
        var testX = playerAABB(pos.x + vel.x, pos.y, pos.z);
        for (var i = 0; i < state.platforms.length; i++) {
            var pb = platformAABB(state.platforms[i]);
            if (aabbOverlap(testX, pb)) {
                vel.x = 0;
                break;
            }
        }
        pos.x += vel.x;

        /* Z axis */
        var testZ = playerAABB(pos.x, pos.y, pos.z + vel.z);
        for (var i = 0; i < state.platforms.length; i++) {
            var pb = platformAABB(state.platforms[i]);
            if (aabbOverlap(testZ, pb)) {
                vel.z = 0;
                break;
            }
        }
        pos.z += vel.z;

        state.onGround = newOnGround;
    }

    /* Checkpoint detection */
    function checkCheckpoints() {
        var pBox = playerAABB(state.player.position.x, state.player.position.y, state.player.position.z);
        for (var i = 0; i < state.platforms.length; i++) {
            var plat = state.platforms[i];
            if (plat.userData.isCheckpoint) {
                var pb = platformAABB(plat);
                if (aabbOverlap(pBox, pb)) {
                    state.spawnPoint = {
                        x: plat.position.x,
                        y: plat.position.y + plat.userData.hh + 0.5,
                        z: plat.position.z
                    };
                    if (plat.userData.onCheckpoint) plat.userData.onCheckpoint();
                }
            }
        }
    }

    /* ========================================================
       SECTION 6 - CAMERA SYSTEM (Right-click orbit, Roblox-style)
       ======================================================== */

    function updateCamera() {
        /* Clamp pitch */
        if (state.cameraPitch < -1.2) state.cameraPitch = -1.2;
        if (state.cameraPitch > 1.4) state.cameraPitch = 1.4;

        /* Smooth zoom */
        state.cameraDistance += (state.cameraTargetDistance - state.cameraDistance) * 0.1;

        /* Target is slightly above player feet */
        var targetY = state.player.position.y + 3.2;
        var targetX = state.player.position.x;
        var targetZ = state.player.position.z;

        /* Spherical offset */
        var dist = state.cameraDistance;
        var offX = dist * Math.sin(state.cameraYaw) * Math.cos(state.cameraPitch);
        var offY = dist * Math.sin(state.cameraPitch);
        var offZ = dist * Math.cos(state.cameraYaw) * Math.cos(state.cameraPitch);

        var desiredX = targetX + offX;
        var desiredY = targetY + offY;
        var desiredZ = targetZ + offZ;

        /* Camera collision raycast */
        var origin = new THREE.Vector3(targetX, targetY, targetZ);
        var dir = new THREE.Vector3(desiredX - targetX, desiredY - targetY, desiredZ - targetZ);
        var maxDist = dir.length();
        dir.normalize();

        var raycaster = new THREE.Raycaster(origin, dir, 0.1, maxDist);
        var platMeshes = [];
        for (var i = 0; i < state.platforms.length; i++) {
            platMeshes.push(state.platforms[i]);
        }
        var hits = raycaster.intersectObjects(platMeshes, false);
        if (hits.length > 0) {
            var hitDist = hits[0].distance - 0.5;
            if (hitDist < maxDist && hitDist > 1) {
                var ratio = hitDist / maxDist;
                desiredX = targetX + (desiredX - targetX) * ratio;
                desiredY = targetY + (desiredY - targetY) * ratio;
                desiredZ = targetZ + (desiredZ - targetZ) * ratio;
            }
        }

        /* Smooth lerp */
        var cam = state.camera;
        cam.position.x += (desiredX - cam.position.x) * 0.3;
        cam.position.y += (desiredY - cam.position.y) * 0.3;
        cam.position.z += (desiredZ - cam.position.z) * 0.3;
        cam.lookAt(targetX, targetY, targetZ);
    }

    /* ========================================================
       SECTION 7 - NPC SYSTEM
       ======================================================== */

    var npcChatLines = [
        'Hey there!', 'Nice day for an adventure!', 'Watch your step!',
        'I love this place!', 'Have you tried jumping?', 'Whoa, be careful!',
        'This is so fun!', 'Let\'s gooo!', 'Anyone wanna race?',
        'I found a secret!', 'gg', 'brb', 'lol', 'noob', 'ez'
    ];

    function spawnNPC(scene, x, y, z, npcName) {
        var name = npcName || randomName();
        var colors = [0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x3498db];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var npc = createCharacter(name, color, true);
        npc.position.set(x, y, z);
        scene.add(npc);

        var tag = createNametag(name);
        npc.add(tag);

        npc.userData.npcTimer = Math.random() * 10;
        npc.userData.npcDir = Math.random() * Math.PI * 2;
        npc.userData.npcWalkTime = 0;
        npc.userData.npcIdleTime = 2 + Math.random() * 4;
        npc.userData.npcState = 'idle';
        npc.userData.bubble = null;
        npc.userData.bubbleTimer = 0;

        state.npcs.push(npc);
        return npc;
    }

    function updateNPCs(dt) {
        for (var i = 0; i < state.npcs.length; i++) {
            var npc = state.npcs[i];
            var ud = npc.userData;

            ud.npcTimer += dt;

            if (ud.npcState === 'idle') {
                resetCharacterPose(npc);
                ud.npcIdleTime -= dt;
                if (ud.npcIdleTime <= 0) {
                    ud.npcState = 'walk';
                    ud.npcDir = Math.random() * Math.PI * 2;
                    ud.npcWalkTime = 1.5 + Math.random() * 3;
                }
            } else if (ud.npcState === 'walk') {
                var spd = 3;
                npc.position.x += Math.sin(ud.npcDir) * spd * dt;
                npc.position.z += Math.cos(ud.npcDir) * spd * dt;
                npc.rotation.y = ud.npcDir;
                animateCharacterWalk(npc, ud.npcTimer, 1);
                ud.npcWalkTime -= dt;
                if (ud.npcWalkTime <= 0) {
                    ud.npcState = 'idle';
                    ud.npcIdleTime = 2 + Math.random() * 5;
                }
            }

            /* Random chat bubbles */
            if (ud.bubbleTimer > 0) {
                ud.bubbleTimer -= dt;
                if (ud.bubbleTimer <= 0 && ud.bubble) {
                    npc.remove(ud.bubble);
                    ud.bubble.material.map.dispose();
                    ud.bubble.material.dispose();
                    ud.bubble = null;
                }
            }
            if (!ud.bubble && Math.random() < 0.002) {
                var line = npcChatLines[Math.floor(Math.random() * npcChatLines.length)];
                ud.bubble = createBubbleChat(line);
                npc.add(ud.bubble);
                ud.bubbleTimer = 4;
                addChatMessage(ud.name, line);
            }
        }
    }

    /* ========================================================
       SECTION 8 - PLATFORM / BOX BUILDER HELPER
       ======================================================== */

    function addPlatform(scene, x, y, z, w, h, d, color, opts) {
        opts = opts || {};
        var geo = new THREE.BoxGeometry(w, h, d);
        var mat = new THREE.MeshStandardMaterial({
            color: color || 0x888888,
            roughness: 0.8,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.hw = w / 2;
        mesh.userData.hh = h / 2;
        mesh.userData.hd = d / 2;
        mesh.userData.isCheckpoint = !!opts.isCheckpoint;
        mesh.userData.isKill = !!opts.isKill;
        mesh.userData.tag = opts.tag || '';
        mesh.userData.onCheckpoint = opts.onCheckpoint || null;
        if (opts.isCheckpoint) {
            mat.emissive = new THREE.Color(0x00ff00);
            mat.emissiveIntensity = 0.15;
        }
        scene.add(mesh);
        state.platforms.push(mesh);
        return mesh;
    }

    /* ========================================================
       SECTION 9 - IN-GAME UI (Monochrome Roblox-style)
       ======================================================== */

    function createGameUI() {
        uiRoot = document.createElement('div');
        uiRoot.id = 'nb-ui';
        uiRoot.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:500;font-family:\"Segoe UI\",Roboto,Arial,Helvetica,sans-serif;';
        document.body.appendChild(uiRoot);

        /* ---- Top-left: menu button row ---- */
        var topLeftBtns = document.createElement('div');
        topLeftBtns.style.cssText = 'position:absolute;top:10px;left:10px;display:flex;gap:6px;pointer-events:auto;';
        uiRoot.appendChild(topLeftBtns);

        uiMenuBtn = document.createElement('button');
        uiMenuBtn.innerHTML = '&#9776;';
        uiMenuBtn.title = 'Settings (`)';
        uiMenuBtn.style.cssText = 'width:34px;height:34px;border:none;border-radius:6px;background:rgba(30,30,30,0.75);color:#ccc;font-size:16px;cursor:pointer;backdrop-filter:blur(4px);transition:background 0.15s;';
        uiMenuBtn.addEventListener('mouseenter', function () { uiMenuBtn.style.background = 'rgba(60,60,60,0.9)'; });
        uiMenuBtn.addEventListener('mouseleave', function () { uiMenuBtn.style.background = 'rgba(30,30,30,0.75)'; });
        uiMenuBtn.addEventListener('click', function () {
            if (settingsOpen) { toggleSettingsPanel(false); }
            else { toggleSettingsPanel(true); escMenuOpen = false; uiEscMenu.style.display = 'none'; }
        });
        topLeftBtns.appendChild(uiMenuBtn);

        uiChatToggle = document.createElement('button');
        uiChatToggle.innerHTML = '&#128172;';
        uiChatToggle.title = 'Toggle Chat';
        uiChatToggle.style.cssText = 'width:34px;height:34px;border:none;border-radius:6px;background:rgba(30,30,30,0.75);color:#ccc;font-size:14px;cursor:pointer;backdrop-filter:blur(4px);transition:background 0.15s;';
        uiChatToggle.addEventListener('mouseenter', function () { uiChatToggle.style.background = 'rgba(60,60,60,0.9)'; });
        uiChatToggle.addEventListener('mouseleave', function () { uiChatToggle.style.background = 'rgba(30,30,30,0.75)'; });
        uiChatToggle.addEventListener('click', function () {
            uiChatLog.style.display = uiChatLog.style.display === 'none' ? 'block' : 'none';
        });
        topLeftBtns.appendChild(uiChatToggle);

        /* ---- Chat panel (top-left, below buttons) ---- */
        uiChat = document.createElement('div');
        uiChat.style.cssText = 'position:absolute;top:52px;left:10px;width:300px;pointer-events:auto;';
        uiRoot.appendChild(uiChat);

        uiChatLog = document.createElement('div');
        uiChatLog.style.cssText = 'background:rgba(20,20,20,0.6);border-radius:8px;padding:8px 10px;max-height:180px;overflow-y:auto;margin-bottom:4px;backdrop-filter:blur(4px);scrollbar-width:thin;scrollbar-color:#444 transparent;';
        uiChat.appendChild(uiChatLog);

        uiChatInputWrap = document.createElement('div');
        uiChatInputWrap.style.cssText = 'display:none;background:rgba(20,20,20,0.7);border-radius:18px;padding:4px 14px;backdrop-filter:blur(4px);';
        uiChat.appendChild(uiChatInputWrap);

        uiChatInput = document.createElement('input');
        uiChatInput.type = 'text';
        uiChatInput.maxLength = 200;
        uiChatInput.placeholder = 'Press / to chat...';
        uiChatInput.style.cssText = 'width:100%;background:none;border:none;outline:none;color:#fff;font-size:13px;padding:5px 0;';
        uiChatInputWrap.appendChild(uiChatInput);

        /* ---- Player list (always visible, top-right) ---- */
        uiPlayerList = document.createElement('div');
        uiPlayerList.style.cssText = 'position:absolute;top:10px;right:10px;background:rgba(20,20,20,0.6);border-radius:8px;padding:10px 14px;min-width:160px;max-width:200px;max-height:260px;overflow-y:auto;color:#fff;pointer-events:none;backdrop-filter:blur(4px);';
        uiRoot.appendChild(uiPlayerList);

        /* ---- Health bar (top-center) ---- */
        var healthWrap = document.createElement('div');
        healthWrap.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);';
        uiRoot.appendChild(healthWrap);
        uiHealthBar = healthWrap;

        var healthOuter = document.createElement('div');
        healthOuter.style.cssText = 'width:200px;height:24px;background:rgba(20,20,20,0.6);border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.1);backdrop-filter:blur(4px);position:relative;';
        healthWrap.appendChild(healthOuter);

        uiHealthFill = document.createElement('div');
        uiHealthFill.style.cssText = 'width:100%;height:100%;background:linear-gradient(90deg,#27ae60,#2ecc71);border-radius:10px;transition:width 0.3s;';
        healthOuter.appendChild(uiHealthFill);

        uiHealthText = document.createElement('div');
        uiHealthText.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.6);letter-spacing:0.5px;';
        uiHealthText.textContent = '100 / 100';
        healthOuter.appendChild(uiHealthText);

        /* ---- Crosshair (center dot) ---- */
        uiCrosshair = document.createElement('div');
        uiCrosshair.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.5);border:1px solid rgba(0,0,0,0.3);pointer-events:none;display:none;';
        uiRoot.appendChild(uiCrosshair);

        /* ---- Shift Lock indicator (small icon below crosshair) ---- */
        uiShiftIndicator = document.createElement('div');
        uiShiftIndicator.style.cssText = 'position:absolute;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(20,20,20,0.7);color:#fff;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;letter-spacing:0.5px;display:none;backdrop-filter:blur(4px);';
        uiShiftIndicator.textContent = 'SHIFT LOCK';
        uiRoot.appendChild(uiShiftIndicator);

        /* ---- Bottom-center toolbar ---- */
        uiBottomBar = document.createElement('div');
        uiBottomBar.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;pointer-events:auto;';
        uiRoot.appendChild(uiBottomBar);

        var bbBtnStyle = 'height:40px;padding:0 16px;border:none;border-radius:8px;background:rgba(30,30,30,0.75);color:#ccc;font-size:12px;font-weight:600;cursor:pointer;backdrop-filter:blur(4px);display:flex;align-items:center;gap:6px;transition:background 0.15s;';

        var resetBtn = document.createElement('button');
        resetBtn.innerHTML = '&#8634; Reset';
        resetBtn.style.cssText = bbBtnStyle;
        resetBtn.addEventListener('mouseenter', function () { resetBtn.style.background = 'rgba(60,60,60,0.9)'; });
        resetBtn.addEventListener('mouseleave', function () { resetBtn.style.background = 'rgba(30,30,30,0.75)'; });
        resetBtn.addEventListener('click', function () { respawnPlayer(); });
        uiBottomBar.appendChild(resetBtn);

        var menuBtn2 = document.createElement('button');
        menuBtn2.innerHTML = '&#9776; Menu';
        menuBtn2.style.cssText = bbBtnStyle;
        menuBtn2.addEventListener('mouseenter', function () { menuBtn2.style.background = 'rgba(60,60,60,0.9)'; });
        menuBtn2.addEventListener('mouseleave', function () { menuBtn2.style.background = 'rgba(30,30,30,0.75)'; });
        menuBtn2.addEventListener('click', function () { toggleEscMenu(); });
        uiBottomBar.appendChild(menuBtn2);

        var leaveBtn2 = document.createElement('button');
        leaveBtn2.innerHTML = '&#10005; Leave';
        leaveBtn2.style.cssText = bbBtnStyle + 'color:#ff6b6b;';
        leaveBtn2.addEventListener('mouseenter', function () { leaveBtn2.style.background = 'rgba(80,30,30,0.9)'; });
        leaveBtn2.addEventListener('mouseleave', function () { leaveBtn2.style.background = 'rgba(30,30,30,0.75)'; });
        leaveBtn2.addEventListener('click', function () { NB.leaveGame(); });
        uiBottomBar.appendChild(leaveBtn2);

        /* ---- ESC Menu ---- */
        uiEscMenu = document.createElement('div');
        uiEscMenu.style.cssText = 'display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(18,18,18,0.95);border-radius:14px;padding:28px 36px;min-width:260px;text-align:center;pointer-events:auto;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);';
        uiRoot.appendChild(uiEscMenu);

        var menuTitle = document.createElement('div');
        menuTitle.textContent = 'NapsBlocks';
        menuTitle.style.cssText = 'color:#fff;font-size:20px;font-weight:700;margin-bottom:20px;letter-spacing:0.5px;';
        uiEscMenu.appendChild(menuTitle);

        var mBtnStyle = 'display:block;width:100%;padding:11px;margin:5px 0;border:none;border-radius:8px;background:rgba(255,255,255,0.07);color:#ddd;font-size:15px;font-weight:500;cursor:pointer;transition:background 0.15s;';

        var resumeBtn = document.createElement('button');
        resumeBtn.textContent = 'Resume';
        resumeBtn.style.cssText = mBtnStyle;
        resumeBtn.addEventListener('mouseenter', function () { resumeBtn.style.background = 'rgba(255,255,255,0.14)'; });
        resumeBtn.addEventListener('mouseleave', function () { resumeBtn.style.background = 'rgba(255,255,255,0.07)'; });
        resumeBtn.addEventListener('click', function () { toggleEscMenu(false); });
        uiEscMenu.appendChild(resumeBtn);

        var settingsBtn = document.createElement('button');
        settingsBtn.textContent = 'Settings';
        settingsBtn.style.cssText = mBtnStyle;
        settingsBtn.addEventListener('mouseenter', function () { settingsBtn.style.background = 'rgba(255,255,255,0.14)'; });
        settingsBtn.addEventListener('mouseleave', function () { settingsBtn.style.background = 'rgba(255,255,255,0.07)'; });
        settingsBtn.addEventListener('click', function () { toggleSettingsPanel(true); });
        uiEscMenu.appendChild(settingsBtn);

        var leaveBtn = document.createElement('button');
        leaveBtn.textContent = 'Leave Game';
        leaveBtn.style.cssText = mBtnStyle + 'color:#ff6b6b;margin-top:10px;';
        leaveBtn.addEventListener('mouseenter', function () { leaveBtn.style.background = 'rgba(255,80,80,0.15)'; });
        leaveBtn.addEventListener('mouseleave', function () { leaveBtn.style.background = 'rgba(255,255,255,0.07)'; });
        leaveBtn.addEventListener('click', function () { NB.leaveGame(); });
        uiEscMenu.appendChild(leaveBtn);

        /* ---- Settings Panel ---- */
        uiSettingsPanel = document.createElement('div');
        uiSettingsPanel.style.cssText = 'display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(18,18,18,0.95);border-radius:14px;padding:24px 32px;min-width:340px;color:#fff;pointer-events:auto;max-height:80vh;overflow-y:auto;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.08);';
        uiRoot.appendChild(uiSettingsPanel);
        buildSettingsPanel();

        /* ---- Death / Respawn Screen ---- */
        uiDeathScreen = document.createElement('div');
        uiDeathScreen.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(100,0,0,0.55);pointer-events:auto;backdrop-filter:blur(2px);';
        uiRoot.appendChild(uiDeathScreen);

        var deathInner = document.createElement('div');
        deathInner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;';
        uiDeathScreen.appendChild(deathInner);

        var deathText = document.createElement('div');
        deathText.textContent = 'You died!';
        deathText.style.cssText = 'color:#fff;font-size:40px;font-weight:800;margin-bottom:12px;text-shadow:0 2px 12px rgba(0,0,0,0.7);letter-spacing:1px;';
        deathInner.appendChild(deathText);

        var deathSub = document.createElement('div');
        deathSub.textContent = 'You fell into the void';
        deathSub.style.cssText = 'color:rgba(255,255,255,0.6);font-size:15px;margin-bottom:20px;';
        deathInner.appendChild(deathSub);

        var respawnBtn = document.createElement('button');
        respawnBtn.textContent = 'Respawn';
        respawnBtn.style.cssText = 'padding:12px 44px;border:none;border-radius:8px;background:rgba(46,204,113,0.8);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:background 0.15s;';
        respawnBtn.addEventListener('mouseenter', function () { respawnBtn.style.background = 'rgba(46,204,113,1)'; });
        respawnBtn.addEventListener('mouseleave', function () { respawnBtn.style.background = 'rgba(46,204,113,0.8)'; });
        respawnBtn.addEventListener('click', function () { respawnPlayer(); });
        deathInner.appendChild(respawnBtn);
    }

    function buildSettingsPanel() {
        uiSettingsPanel.innerHTML = '';

        var title = document.createElement('div');
        title.textContent = 'Settings';
        title.style.cssText = 'font-size:20px;font-weight:700;margin-bottom:18px;letter-spacing:0.5px;';
        uiSettingsPanel.appendChild(title);

        /* Section: Camera */
        addSectionLabel('Camera');

        addSlider('Sensitivity', 0.001, 0.015, state.settings.sensitivity, 0.001, function (v) {
            state.settings.sensitivity = v;
        });

        addSlider('FOV', 50, 110, state.settings.fov, 1, function (v) {
            state.settings.fov = v;
            if (state.camera) state.camera.fov = v;
            if (state.camera) state.camera.updateProjectionMatrix();
        });

        addToggle('Invert Y', state.settings.invertY, function (v) {
            state.settings.invertY = v;
        });

        addToggle('Shift Lock', state.settings.shiftLock, function (v) {
            state.settings.shiftLock = v;
        });

        /* Section: Graphics */
        addSectionLabel('Graphics');

        addToggle('Shadows', state.settings.shadows, function (v) {
            state.settings.shadows = v;
            if (state.renderer) state.renderer.shadowMap.enabled = v;
        });

        addSelect('Quality', ['low', 'medium', 'high'], state.settings.quality, function (v) {
            state.settings.quality = v;
        });

        /* Section: Controls */
        addSectionLabel('Controls');
        var helpText = document.createElement('div');
        helpText.style.cssText = 'font-size:11px;color:#888;line-height:1.6;margin-bottom:12px;';
        helpText.innerHTML = 'WASD - Move &nbsp;&bull;&nbsp; Space - Jump &nbsp;&bull;&nbsp; Right Click - Camera<br>' +
            'Shift - Shift Lock &nbsp;&bull;&nbsp; ` - Settings &nbsp;&bull;&nbsp; ESC - Menu<br>' +
            '/ or T - Chat &nbsp;&bull;&nbsp; Scroll - Zoom';
        uiSettingsPanel.appendChild(helpText);

        /* Close button */
        var back = document.createElement('button');
        back.textContent = 'Close';
        back.style.cssText = 'margin-top:8px;padding:9px 28px;border:none;border-radius:8px;background:rgba(255,255,255,0.08);color:#ccc;font-size:14px;font-weight:500;cursor:pointer;transition:background 0.15s;display:block;width:100%;';
        back.addEventListener('mouseenter', function () { back.style.background = 'rgba(255,255,255,0.15)'; });
        back.addEventListener('mouseleave', function () { back.style.background = 'rgba(255,255,255,0.08)'; });
        back.addEventListener('click', function () { toggleSettingsPanel(false); });
        uiSettingsPanel.appendChild(back);
    }

    function addSectionLabel(text) {
        var lbl = document.createElement('div');
        lbl.textContent = text;
        lbl.style.cssText = 'font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;margin-top:14px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.06);';
        uiSettingsPanel.appendChild(lbl);
    }

    function addSlider(label, min, max, value, step, onChange) {
        var row = document.createElement('div');
        row.style.cssText = 'margin-bottom:14px;';
        var top = document.createElement('div');
        top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';
        var lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:13px;color:#bbb;';
        top.appendChild(lbl);
        var valDisp = document.createElement('span');
        valDisp.textContent = value;
        valDisp.style.cssText = 'font-size:11px;color:#666;font-family:monospace;';
        top.appendChild(valDisp);
        row.appendChild(top);
        var inp = document.createElement('input');
        inp.type = 'range';
        inp.min = min;
        inp.max = max;
        inp.step = step;
        inp.value = value;
        inp.style.cssText = 'width:100%;accent-color:#4a9eff;height:4px;';
        inp.addEventListener('input', function () {
            var v = parseFloat(inp.value);
            valDisp.textContent = step < 0.01 ? v.toFixed(3) : (step < 1 ? v.toFixed(1) : v);
            onChange(v);
        });
        row.appendChild(inp);
        uiSettingsPanel.appendChild(row);
    }

    function addToggle(label, value, onChange) {
        var row = document.createElement('div');
        row.style.cssText = 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;padding:4px 0;';
        var lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:13px;color:#bbb;';
        row.appendChild(lbl);

        var toggle = document.createElement('div');
        toggle.style.cssText = 'width:38px;height:20px;border-radius:10px;cursor:pointer;position:relative;transition:background 0.2s;' +
            'background:' + (value ? '#4a9eff' : '#444') + ';';
        var knob = document.createElement('div');
        knob.style.cssText = 'width:16px;height:16px;border-radius:8px;background:#fff;position:absolute;top:2px;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.3);' +
            'left:' + (value ? '20px' : '2px') + ';';
        toggle.appendChild(knob);
        var current = value;
        toggle.addEventListener('click', function () {
            current = !current;
            knob.style.left = current ? '20px' : '2px';
            toggle.style.background = current ? '#4a9eff' : '#444';
            onChange(current);
        });
        row.appendChild(toggle);
        uiSettingsPanel.appendChild(row);
    }

    function addSelect(label, options, value, onChange) {
        var row = document.createElement('div');
        row.style.cssText = 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;padding:4px 0;';
        var lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.cssText = 'font-size:13px;color:#bbb;';
        row.appendChild(lbl);
        var sel = document.createElement('select');
        sel.style.cssText = 'background:#2a2a2a;color:#ccc;border:1px solid #444;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;outline:none;';
        options.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o;
            opt.textContent = o.charAt(0).toUpperCase() + o.slice(1);
            if (o === value) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', function () { onChange(sel.value); });
        row.appendChild(sel);
        uiSettingsPanel.appendChild(row);
    }

    /* ---- Chat helpers ---- */
    function addChatMessage(name, text) {
        state.chatMessages.push({ name: name, text: text, time: Date.now() });
        if (state.chatMessages.length > 50) state.chatMessages.shift();
        refreshChatLog();
    }

    function refreshChatLog() {
        if (!uiChatLog) return;
        uiChatLog.innerHTML = '';
        var msgs = state.chatMessages.slice(-20);
        msgs.forEach(function (m) {
            var div = document.createElement('div');
            div.style.cssText = 'margin:2px 0;font-size:12px;line-height:1.5;word-wrap:break-word;';
            var nameSpan = document.createElement('span');
            nameSpan.textContent = m.name;
            var isSystem = m.name === 'System';
            nameSpan.style.cssText = isSystem ? 'color:#f39c12;font-weight:600;' : 'color:#ddd;font-weight:600;';
            div.appendChild(nameSpan);
            var sep = document.createElement('span');
            sep.textContent = ': ';
            sep.style.cssText = 'color:#666;';
            div.appendChild(sep);
            var textSpan = document.createElement('span');
            textSpan.textContent = m.text;
            textSpan.style.cssText = isSystem ? 'color:#f39c12;opacity:0.8;' : 'color:#bbb;';
            div.appendChild(textSpan);
            uiChatLog.appendChild(div);
        });
        uiChatLog.scrollTop = uiChatLog.scrollHeight;
    }

    function openChat() {
        chatOpen = true;
        uiChatInputWrap.style.display = 'block';
        uiChatInput.focus();
    }

    function closeChat() {
        chatOpen = false;
        uiChatInputWrap.style.display = 'none';
        uiChatInput.value = '';
        uiChatInput.blur();
    }

    function sendChat() {
        var txt = uiChatInput.value.trim();
        if (txt) {
            addChatMessage(playerName, txt);
            showPlayerBubble(txt);
        }
        closeChat();
    }

    function showPlayerBubble(text) {
        if (!state.player) return;
        if (state.player.userData.bubble) {
            state.player.remove(state.player.userData.bubble);
            state.player.userData.bubble.material.map.dispose();
            state.player.userData.bubble.material.dispose();
            state.player.userData.bubble = null;
        }
        var bubble = createBubbleChat(text);
        state.player.add(bubble);
        state.player.userData.bubble = bubble;
        state.player.userData.bubbleTimer = 5;
    }

    /* ---- UI toggles ---- */
    function toggleEscMenu(force) {
        escMenuOpen = force !== undefined ? force : !escMenuOpen;
        uiEscMenu.style.display = escMenuOpen ? 'block' : 'none';
        if (escMenuOpen) {
            toggleSettingsPanel(false);
        }
    }

    function toggleSettingsPanel(show) {
        settingsOpen = show;
        uiSettingsPanel.style.display = show ? 'block' : 'none';
        uiEscMenu.style.display = show ? 'none' : (escMenuOpen ? 'block' : 'none');
    }

    function updatePlayerList() {
        if (!uiPlayerList) return;
        uiPlayerList.innerHTML = '';

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);';
        var titleSpan = document.createElement('span');
        titleSpan.textContent = 'Players';
        titleSpan.style.cssText = 'font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;';
        header.appendChild(titleSpan);
        var countSpan = document.createElement('span');
        countSpan.textContent = (1 + state.npcs.length) + '';
        countSpan.style.cssText = 'font-size:11px;color:#666;background:rgba(255,255,255,0.08);padding:2px 7px;border-radius:8px;';
        header.appendChild(countSpan);
        uiPlayerList.appendChild(header);

        /* Player (you) */
        var pDiv = document.createElement('div');
        pDiv.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;';
        var dot = document.createElement('div');
        dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#2ecc71;flex-shrink:0;';
        pDiv.appendChild(dot);
        var nameSpan = document.createElement('span');
        nameSpan.textContent = playerName;
        nameSpan.style.cssText = 'font-size:12px;color:#e0e0e0;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        pDiv.appendChild(nameSpan);
        uiPlayerList.appendChild(pDiv);

        /* NPCs */
        state.npcs.forEach(function (npc) {
            var d = document.createElement('div');
            d.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;';
            var ndot = document.createElement('div');
            ndot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#666;flex-shrink:0;';
            d.appendChild(ndot);
            var ns = document.createElement('span');
            ns.textContent = npc.userData.name;
            ns.style.cssText = 'font-size:12px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            d.appendChild(ns);
            uiPlayerList.appendChild(d);
        });
    }

    function updateHealthBar() {
        if (!uiHealthFill || !uiHealthText) return;
        var pct = Math.max(0, Math.min(100, (state.health / state.maxHealth) * 100));
        uiHealthFill.style.width = pct + '%';
        uiHealthText.textContent = Math.ceil(state.health) + ' / ' + state.maxHealth;
        if (pct > 50) {
            uiHealthFill.style.background = 'linear-gradient(90deg,#27ae60,#2ecc71)';
        } else if (pct > 25) {
            uiHealthFill.style.background = 'linear-gradient(90deg,#f39c12,#f1c40f)';
        } else {
            uiHealthFill.style.background = 'linear-gradient(90deg,#c0392b,#e74c3c)';
        }
    }

    function updateShiftIndicator() {
        if (!uiShiftIndicator) return;
        uiShiftIndicator.style.display = state.settings.shiftLock ? 'block' : 'none';
    }

    function updateCrosshair() {
        if (!uiCrosshair) return;
        uiCrosshair.style.display = state.settings.shiftLock ? 'block' : 'none';
    }

    function showDeathScreen() {
        state.isDead = true;
        state.health = 0;
        updateHealthBar();
        uiDeathScreen.style.display = 'block';
    }

    function respawnPlayer() {
        state.isDead = false;
        state.health = state.maxHealth;
        updateHealthBar();
        uiDeathScreen.style.display = 'none';
        state.player.position.set(state.spawnPoint.x, state.spawnPoint.y, state.spawnPoint.z);
        state.velocity.x = 0;
        state.velocity.y = 0;
        state.velocity.z = 0;
    }

    function destroyGameUI() {
        if (uiRoot && uiRoot.parentNode) uiRoot.parentNode.removeChild(uiRoot);
        uiRoot = null;
        uiChat = null;
        uiChatLog = null;
        uiChatInput = null;
        uiChatInputWrap = null;
        uiPlayerList = null;
        uiEscMenu = null;
        uiSettingsPanel = null;
        uiDeathScreen = null;
        uiHealthBar = null;
        uiHealthFill = null;
        uiHealthText = null;
        uiCrosshair = null;
        uiShiftIndicator = null;
        uiBottomBar = null;
        chatOpen = false;
        escMenuOpen = false;
        settingsOpen = false;
    }

    /* ========================================================
       SECTION 10 - INPUT HANDLING (Right-click orbit, no pointer lock)
       ======================================================== */

    function setupInput() {
        /* Keyboard */
        window._nbKeyDown = function (e) {
            if (!state.running) return;

            /* Chat input handling */
            if (chatOpen) {
                if (e.key === 'Enter') { sendChat(); e.preventDefault(); }
                else if (e.key === 'Escape') { closeChat(); e.preventDefault(); }
                return;
            }

            state.keys[e.code] = true;

            if (e.key === '/' || e.key === 't' || e.key === 'T') {
                if (!escMenuOpen && !state.isDead && !settingsOpen) {
                    e.preventDefault();
                    openChat();
                    return;
                }
            }

            /* ESC always opens/closes settings menu */
            if (e.key === 'Escape') {
                if (settingsOpen) {
                    toggleSettingsPanel(false);
                    escMenuOpen = false;
                    uiEscMenu.style.display = 'none';
                } else if (escMenuOpen) {
                    toggleEscMenu(false);
                } else {
                    toggleEscMenu(true);
                }
                e.preventDefault();
            }

            /* Backtick (`) opens/closes settings directly */
            if (e.code === 'Backquote') {
                if (settingsOpen) {
                    toggleSettingsPanel(false);
                } else {
                    toggleSettingsPanel(true);
                    escMenuOpen = false;
                    uiEscMenu.style.display = 'none';
                }
                e.preventDefault();
            }

            /* Shift key toggles shift lock */
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                state.settings.shiftLock = !state.settings.shiftLock;
                /* Rebuild settings panel to reflect change */
                if (settingsOpen) buildSettingsPanel();
            }

            if (e.code === 'Tab') {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', window._nbKeyDown);

        window._nbKeyUp = function (e) {
            if (!state.running) return;
            state.keys[e.code] = false;
        };
        window.addEventListener('keyup', window._nbKeyUp);

        /* Mouse move - only rotate camera when RIGHT MOUSE is held (Roblox-style) */
        window._nbMouseMove = function (e) {
            if (!state.running) return;
            if (chatOpen || escMenuOpen || state.isDead || settingsOpen) return;

            /* Only orbit when right mouse button is held down */
            if (!state.rightMouseDown) return;

            var sens = state.settings.sensitivity;
            var invertYMul = state.settings.invertY ? -1 : 1;

            state.cameraYaw -= e.movementX * sens;
            state.cameraPitch += e.movementY * sens * invertYMul;
        };
        document.addEventListener('mousemove', window._nbMouseMove);

        /* Right mouse down/up for camera orbit */
        window._nbMouseDown = function (e) {
            if (!state.running) return;
            if (e.button === 0) {
                state.leftMouseDown = true;
            }
            if (e.button === 2) {
                state.rightMouseDown = true;
                /* Request pointer lock for smooth camera rotation */
                if (state.renderer && state.renderer.domElement && !chatOpen && !escMenuOpen && !state.isDead && !settingsOpen) {
                    state.renderer.domElement.requestPointerLock();
                }
                e.preventDefault();
            }
        };
        document.addEventListener('mousedown', window._nbMouseDown);

        window._nbMouseUp = function (e) {
            if (!state.running) return;
            if (e.button === 0) {
                state.leftMouseDown = false;
            }
            if (e.button === 2) {
                state.rightMouseDown = false;
                /* Release pointer lock when right click released */
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            }
        };
        document.addEventListener('mouseup', window._nbMouseUp);

        /* Prevent right-click context menu on canvas */
        window._nbContextMenu = function (e) {
            if (state.running) e.preventDefault();
        };
        document.addEventListener('contextmenu', window._nbContextMenu);

        /* Scroll -> zoom */
        window._nbWheel = function (e) {
            if (!state.running) return;
            if (chatOpen || escMenuOpen || state.isDead || settingsOpen) return;
            state.cameraTargetDistance += e.deltaY * 0.01;
            if (state.cameraTargetDistance < 3) state.cameraTargetDistance = 3;
            if (state.cameraTargetDistance > 30) state.cameraTargetDistance = 30;
        };
        window.addEventListener('wheel', window._nbWheel, { passive: true });
    }

    function teardownInput() {
        if (window._nbKeyDown) window.removeEventListener('keydown', window._nbKeyDown);
        if (window._nbKeyUp) window.removeEventListener('keyup', window._nbKeyUp);
        if (window._nbMouseMove) document.removeEventListener('mousemove', window._nbMouseMove);
        if (window._nbMouseDown) document.removeEventListener('mousedown', window._nbMouseDown);
        if (window._nbMouseUp) document.removeEventListener('mouseup', window._nbMouseUp);
        if (window._nbContextMenu) document.removeEventListener('contextmenu', window._nbContextMenu);
        if (window._nbWheel) window.removeEventListener('wheel', window._nbWheel);
        if (window._nbResize) window.removeEventListener('resize', window._nbResize);
        if (document.pointerLockElement) document.exitPointerLock();
        state.keys = {};
        state.rightMouseDown = false;
    }

    /* ========================================================
       SECTION 11 - GAME LOOP
       ======================================================== */

    var animFrameId = null;
    var _playerListTimer = 0;

    function gameLoop() {
        if (!state.running) return;
        animFrameId = requestAnimationFrame(gameLoop);

        var dt = state.clock.getDelta();
        if (dt > 0.1) dt = 0.1;

        if (!state.isDead && !escMenuOpen && !settingsOpen) {
            updatePlayer(dt);
            checkCheckpoints();
            checkKillPlatforms();
        }

        updateNPCs(dt);
        updatePlayerBubble(dt);
        updateCamera();

        /* Update player list every 2 seconds */
        _playerListTimer += dt;
        if (_playerListTimer >= 2) {
            _playerListTimer = 0;
            updatePlayerList();
        }

        /* Update HUD elements */
        updateHealthBar();
        updateShiftIndicator();
        updateCrosshair();

        /* Call game-specific update */
        var gameDef = NB._games[state.currentGameId];
        if (gameDef && gameDef.update) gameDef.update(dt);

        state.renderer.render(state.scene, state.camera);
    }

    function updatePlayer(dt) {
        if (!state.player) return;

        /* Movement direction relative to camera yaw */
        var moveX = 0, moveZ = 0;
        if (state.keys['KeyW'] || state.keys['ArrowUp']) moveZ -= 1;
        if (state.keys['KeyS'] || state.keys['ArrowDown']) moveZ += 1;
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) moveX -= 1;
        if (state.keys['KeyD'] || state.keys['ArrowRight']) moveX += 1;

        var len = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (len > 0) {
            moveX /= len;
            moveZ /= len;
        }

        /* Rotate movement by camera yaw.
           Camera sits at +sin(yaw)*dist, +cos(yaw)*dist relative to player.
           So "forward" (W, moveZ=-1) should push toward -sin(yaw), -cos(yaw) direction.
           Standard rotation: worldX = moveX*cos - moveZ*sin, worldZ = moveX*sin + moveZ*cos
           BUT camera forward is (-sinY, -cosY), so we negate the moveZ terms. */
        var sinY = Math.sin(state.cameraYaw);
        var cosY = Math.cos(state.cameraYaw);
        var worldX = moveX * cosY + moveZ * sinY;
        var worldZ = -moveX * sinY + moveZ * cosY;

        state.velocity.x = worldX * MOVE_SPEED;
        state.velocity.z = worldZ * MOVE_SPEED;

        /* Gravity */
        state.velocity.y += GRAVITY * dt;
        /* Clamp downward velocity to prevent falling through thin platforms */
        if (state.velocity.y < -40) state.velocity.y = -40;

        /* Jump */
        if ((state.keys['Space']) && state.onGround) {
            state.velocity.y = JUMP_FORCE;
            state.onGround = false;
        }

        /* Scale velocity by dt for collision resolution */
        var stepVel = {
            x: state.velocity.x * dt,
            y: state.velocity.y * dt,
            z: state.velocity.z * dt
        };

        resolveCollisions(state.player.position, stepVel);

        /* Walking animation */
        var moving = len > 0 && state.onGround;
        if (moving) {
            state.animTime += dt;
            animateCharacterWalk(state.player, state.animTime, 1);

            /* Shift lock: character faces camera forward direction */
            if (state.settings.shiftLock) {
                state.player.rotation.y = state.cameraYaw;
            } else {
                state.player.rotation.y = Math.atan2(worldX, worldZ);
            }
        } else {
            resetCharacterPose(state.player);
            /* In shift lock, always face camera forward direction */
            if (state.settings.shiftLock) {
                state.player.rotation.y = state.cameraYaw;
            }
        }

        /* Fall death */
        if (state.player.position.y < FALL_DEATH_Y) {
            showDeathScreen();
        }
    }

    function checkKillPlatforms() {
        var pBox = playerAABB(state.player.position.x, state.player.position.y, state.player.position.z);
        for (var i = 0; i < state.platforms.length; i++) {
            var plat = state.platforms[i];
            if (plat.userData.isKill) {
                if (aabbOverlap(pBox, platformAABB(plat))) {
                    showDeathScreen();
                    return;
                }
            }
        }
    }

    function updatePlayerBubble(dt) {
        if (!state.player || !state.player.userData.bubble) return;
        state.player.userData.bubbleTimer -= dt;
        if (state.player.userData.bubbleTimer <= 0) {
            state.player.remove(state.player.userData.bubble);
            state.player.userData.bubble.material.map.dispose();
            state.player.userData.bubble.material.dispose();
            state.player.userData.bubble = null;
        }
    }

    /* ========================================================
       SECTION 12 - GAME LOADER
       ======================================================== */

    NB.startGame = function (id) {
        if (state.running) return;

        /* Reset state */
        state.platforms = [];
        state.npcs = [];
        state.chatMessages = [];
        state.velocity = { x: 0, y: 0, z: 0 };
        state.onGround = false;
        state.isDead = false;
        state.cameraYaw = 0;
        state.cameraPitch = 0.3;
        state.cameraDistance = 12;
        state.cameraTargetDistance = 12;
        state.spawnPoint = { x: 0, y: 5, z: 0 };
        state.animTime = 0;
        state.health = state.maxHealth;
        state.keys = {};
        state.rightMouseDown = false;
        state.currentGameId = id;

        /* Show game container */
        if (elHomepage) elHomepage.style.display = 'none';
        if (elGameDetail) elGameDetail.style.display = 'none';
        var avatarPage = document.getElementById('avatar-page');
        if (avatarPage) avatarPage.style.display = 'none';
        var catalogPage = document.getElementById('catalog-page');
        if (catalogPage) catalogPage.style.display = 'none';
        cleanupAvatarPreview();
        var navbar = document.querySelector('.navbar');
        var sidebar = document.querySelector('.sidebar');
        if (navbar) navbar.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (elGameContainer) {
            elGameContainer.style.display = 'block';
            elGameContainer.innerHTML = '';
        }

        /* Init engine */
        initEngine();

        /* Create player */
        var player = createCharacter(playerName, 0x4488ff, false);
        player.position.set(state.spawnPoint.x, state.spawnPoint.y, state.spawnPoint.z);
        state.scene.add(player);
        state.player = player;

        var nametag = createNametag(playerName);
        player.add(nametag);

        player.userData.bubble = null;
        player.userData.bubbleTimer = 0;

        /* Create in-game UI */
        createGameUI();
        updatePlayerList();

        /* Setup input */
        setupInput();

        state.running = true;

        /* Add a temporary ground so player doesn't fall while loading */
        addPlatform(state.scene, 0, -0.5, 0, 20, 1, 20, 0x555555);

        /* Start game loop immediately so the scene renders */
        addChatMessage('System', 'Loading game...');
        state.clock.getDelta();
        gameLoop();

        /* Load game */
        if (NB._games[id]) {
            initCurrentGame();
        } else {
            var script = document.createElement('script');
            script.src = 'games/' + id + '.js';
            script.onload = function () {
                initCurrentGame();
            };
            script.onerror = function () {
                addChatMessage('System', 'Failed to load game: ' + id);
                initCurrentGame();
            };
            document.head.appendChild(script);
        }
    };

    function initCurrentGame() {
        var gameDef = NB._games[state.currentGameId];
        if (gameDef && gameDef.init) {
            try {
                gameDef.init();
            } catch (e) {
                addChatMessage('System', 'Game init error: ' + e.message);
                console.error('Game init error:', e);
            }
        }

        addChatMessage('System', 'Welcome to the game!');
        addChatMessage('System', 'Right-click + drag to look around. Press ` for settings.');

        /* Spawn some NPCs so the world feels alive */
        spawnGameNPCs();
    }

    function spawnGameNPCs() {
        var count = 3 + Math.floor(Math.random() * 3); /* 3-5 NPCs */
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = 8 + Math.random() * 12;
            var nx = Math.cos(angle) * dist;
            var nz = Math.sin(angle) * dist;
            spawnNPC(state.scene, nx, 1, nz);
        }
    }

    NB.leaveGame = function () {
        state.running = false;
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        var gameDef = NB._games[state.currentGameId];
        if (gameDef && gameDef.cleanup) {
            gameDef.cleanup();
        }

        teardownInput();
        destroyGameUI();

        if (state.scene) {
            state.scene.traverse(function (obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(function (m) {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    } else {
                        if (obj.material.map) obj.material.map.dispose();
                        obj.material.dispose();
                    }
                }
            });
        }

        if (state.renderer) {
            state.renderer.dispose();
            state.renderer.forceContextLoss();
            if (state.renderer.domElement && state.renderer.domElement.parentNode) {
                state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
            }
        }

        state.scene = null;
        state.camera = null;
        state.renderer = null;
        state.player = null;
        state.platforms = [];
        state.npcs = [];
        state.chatMessages = [];
        state.currentGameId = null;

        showHomepage();
    };

    /* ========================================================
       SECTION 13 - EXPOSE API
       ======================================================== */

    NB.state = state;
    NB.playerName = playerName;

    Object.defineProperty(NB, 'scene', { get: function () { return state.scene; }, configurable: true });
    Object.defineProperty(NB, 'camera', { get: function () { return state.camera; }, configurable: true });
    Object.defineProperty(NB, 'renderer', { get: function () { return state.renderer; }, configurable: true });
    Object.defineProperty(NB, 'keys', { get: function () { return state.keys; }, configurable: true });
    Object.defineProperty(NB, 'cameraYaw', {
        get: function () { return state.cameraYaw; },
        set: function (v) { state.cameraYaw = v; },
        configurable: true
    });
    Object.defineProperty(NB, 'cameraPitch', {
        get: function () { return state.cameraPitch; },
        set: function (v) { state.cameraPitch = v; },
        configurable: true
    });
    Object.defineProperty(NB, 'playerGroup', {
        get: function () { return state.player; },
        configurable: true
    });
    Object.defineProperty(NB, 'playerPos', {
        get: function () { return state.player ? state.player.position : { x: 0, y: 0, z: 0 }; },
        configurable: true
    });

    NB.addPlatform = function (x, y, z, w, h, d, color, opts) {
        if (!state.scene) return;
        if (typeof opts === 'string') {
            var tag = opts;
            opts = { tag: tag };
            if (tag === 'kill') opts.isKill = true;
            if (tag === 'checkpoint') opts.isCheckpoint = true;
        }
        return addPlatform(state.scene, x, y, z, w, h, d, color, opts);
    };

    NB.makeMat = function (color) {
        return new THREE.MeshStandardMaterial({ color: color, roughness: 0.8, metalness: 0.1 });
    };

    NB.addDecoration = function (mesh) {
        if (state.scene) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            state.scene.add(mesh);
        }
    };

    var _gameUIContainer = null;

    NB.addGameUI = function (html) {
        NB.removeGameUI();
        _gameUIContainer = document.createElement('div');
        _gameUIContainer.id = 'nb-game-ui';
        _gameUIContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:510;';
        _gameUIContainer.innerHTML = html;
        document.body.appendChild(_gameUIContainer);
        return _gameUIContainer;
    };

    NB.removeGameUI = function () {
        if (_gameUIContainer && _gameUIContainer.parentNode) {
            _gameUIContainer.parentNode.removeChild(_gameUIContainer);
        }
        _gameUIContainer = null;
    };

    NB.spawnNPC = function (x, y, z, name) {
        if (state.scene) return spawnNPC(state.scene, x, y, z, name);
    };
    NB.addChatMessage = addChatMessage;
    NB.createCharacter = createCharacter;
    NB.createNametag = createNametag;
    NB.createBubbleChat = createBubbleChat;
    NB.randomName = randomName;

    /* Health API */
    NB.damage = function (amount) {
        state.health = Math.max(0, state.health - amount);
        if (state.health <= 0) showDeathScreen();
    };
    NB.heal = function (amount) {
        state.health = Math.min(state.maxHealth, state.health + amount);
    };
    NB.setMaxHealth = function (v) {
        state.maxHealth = v;
        if (state.health > v) state.health = v;
    };
    Object.defineProperty(NB, 'health', {
        get: function () { return state.health; },
        set: function (v) { state.health = Math.max(0, Math.min(state.maxHealth, v)); },
        configurable: true
    });

    /* Expose avatar API */
    NB.avatarState = avatarState;
    NB.saveAvatar = saveAvatar;
    NB.showAvatarPage = showAvatarPage;
    NB.showCatalogPage = showCatalogPage;

    /* ========================================================
       SECTION 14 - INIT ON DOM READY
       ======================================================== */

    function onReady() {
        NB.initHomepage();

        /* Sidebar navigation */
        var sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                var page = item.getAttribute('data-page');
                if (page === 'home') {
                    showHomepage();
                } else if (page === 'avatar') {
                    showAvatarPage();
                } else if (page === 'catalog') {
                    showCatalogPage();
                } else if (page === 'games') {
                    showHomepage();
                } else if (page === 'profile') {
                    showAvatarPage();
                } else if (page === 'settings') {
                    /* could open settings page */
                    showHomepage();
                }
            });
        });

        /* Navbar avatar click -> avatar page */
        var navAvatar = document.querySelector('.navbar-avatar');
        if (navAvatar) {
            navAvatar.addEventListener('click', function () {
                showAvatarPage();
            });
        }

        /* Avatar page back button */
        var avatarBack = document.getElementById('avatar-back-btn');
        if (avatarBack) {
            avatarBack.addEventListener('click', function () {
                cleanupAvatarPreview();
                showHomepage();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

})();
