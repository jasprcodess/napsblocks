NB.registerGame('simulator', {

  init: function () {
    // ---------------------------------------------------------------
    // State variables (kept in closure)
    // ---------------------------------------------------------------
    var clicks = 0;
    var totalClicksEver = 0;
    var coins = 0;
    var clickPower = 1;
    var gateOpen = false;

    // Upgrade definitions
    var upgrades = [
      { name: 'Power Gloves',  cost: 50,    power: 5,    color: 0x3498db, bought: false },
      { name: 'Super Gloves',  cost: 200,   power: 25,   color: 0x2ecc71, bought: false },
      { name: 'Mega Hands',    cost: 1000,  power: 100,  color: 0xe67e22, bought: false },
      { name: 'Ultra Hands',   cost: 5000,  power: 500,  color: 0x9b59b6, bought: false },
      { name: 'God Hands',     cost: 25000, power: 2500, color: 0xe74c3c, bought: false }
    ];

    // Zone meshes for collision detection
    var clickZoneMesh = null;
    var sellZoneMesh = null;
    var buyZoneMeshes = [];
    var premiumClickZoneMesh = null;
    var gateMesh = null;

    // Decoration references for animation
    var pulsingPads = [];
    var floatingNumbers = [];
    var spinners = [];

    var scene = NB.scene;

    // Track E key state for debouncing
    var eWasPressed = false;
    var clickCooldown = 0;

    // ---------------------------------------------------------------
    // Helper: build a simple tree decoration
    // ---------------------------------------------------------------
    function makeTree(x, y, z, trunkH, leafR) {
      trunkH = trunkH || 4;
      leafR = leafR || 2.5;

      var trunkGeo = new THREE.CylinderGeometry(0.5, 0.6, trunkH, 8);
      var trunkMat = NB.makeMat(0x8B4513);
      var trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, y + trunkH / 2, z);
      NB.addDecoration(trunk);

      var leafGeo = new THREE.SphereGeometry(leafR, 10, 8);
      var leafMat = NB.makeMat(0x27ae60);
      var leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.set(x, y + trunkH + leafR * 0.6, z);
      NB.addDecoration(leaves);
    }

    // ---------------------------------------------------------------
    // Helper: build a rock decoration
    // ---------------------------------------------------------------
    function makeRock(x, y, z, scale) {
      scale = scale || 1;
      var rockGeo = new THREE.DodecahedronGeometry(scale, 0);
      var rockMat = NB.makeMat(0x7f8c8d);
      var rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y + scale * 0.5, z);
      rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, 0);
      NB.addDecoration(rock);
    }

    // ---------------------------------------------------------------
    // Helper: build a fence segment
    // ---------------------------------------------------------------
    function makeFence(x1, z1, x2, z2, y) {
      var dx = x2 - x1;
      var dz = z2 - z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      var angle = Math.atan2(dx, dz);

      // Posts
      var postGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 6);
      var postMat = NB.makeMat(0x8B4513);
      var numPosts = Math.max(2, Math.floor(len / 4) + 1);
      for (var i = 0; i < numPosts; i++) {
        var t = i / (numPosts - 1);
        var px = x1 + dx * t;
        var pz = z1 + dz * t;
        var post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, y + 1.25, pz);
        NB.addDecoration(post);
      }

      // Rail
      var railGeo = new THREE.BoxGeometry(0.15, 0.15, len);
      var railMat = NB.makeMat(0xa0522d);
      var rail1 = new THREE.Mesh(railGeo, railMat);
      rail1.position.set((x1 + x2) / 2, y + 1.8, (z1 + z2) / 2);
      rail1.rotation.y = angle;
      NB.addDecoration(rail1);

      var rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set((x1 + x2) / 2, y + 0.9, (z1 + z2) / 2);
      rail2.rotation.y = angle;
      NB.addDecoration(rail2);
    }

    // ---------------------------------------------------------------
    // Helper: glowing pad (platform + emissive top layer)
    // ---------------------------------------------------------------
    function makeGlowPad(x, y, z, w, d, color) {
      var platform = NB.addPlatform(x, y, z, w, 0.5, d, color);

      // Glowing top layer
      var glowGeo = new THREE.BoxGeometry(w - 0.2, 0.15, d - 0.2);
      var glowMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85
      });
      var glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(x, y + 0.35, z);
      NB.addDecoration(glow);

      pulsingPads.push(glow);
      return platform;
    }

    // ---------------------------------------------------------------
    // Helper: label sign above a zone
    // ---------------------------------------------------------------
    function makeSign(x, y, z, text, color) {
      // Post
      var postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 6);
      var postMat = NB.makeMat(0x888888);
      var post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, y + 1.5, z);
      NB.addDecoration(post);

      // Sign board
      var boardGeo = new THREE.BoxGeometry(3, 1.2, 0.2);
      var boardMat = NB.makeMat(color);
      var board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(x, y + 3.5, z);
      NB.addDecoration(board);
    }

    // =================================================================
    //  BUILD THE MAP
    // =================================================================

    // --- Main Ground ---
    NB.addPlatform(0, -0.5, 0, 80, 1, 80, 0x2ecc71, 'ground');

    // --- Border edges (raised above ground to avoid Z-fighting) ---
    NB.addPlatform(0, 0.5, -40.5, 82, 2, 1, 0x7f8c8d);
    NB.addPlatform(0, 0.5, 40.5, 82, 2, 1, 0x7f8c8d);
    NB.addPlatform(-40.5, 0.5, 0, 1, 2, 80, 0x7f8c8d);
    NB.addPlatform(40.5, 0.5, 0, 1, 2, 80, 0x7f8c8d);

    // --- Click Zone (Starting Area) ---
    // Orange glowing pad at roughly (0, 0, 10)
    clickZoneMesh = makeGlowPad(0, 0.25, 10, 4, 4, 0xff8c00);
    makeSign(0, 0.5, 7, 'CLICK ZONE', 0xff8c00);

    // --- Sell Zone ---
    // Yellow pad at (-12, 0, 10)
    sellZoneMesh = makeGlowPad(-12, 0.25, 10, 4, 4, 0xf1c40f);
    makeSign(-12, 0.5, 7, 'SELL', 0xf1c40f);

    // --- Shop Area ---
    // Row of colored pads along x = 12..28
    var shopStartX = 10;
    var shopZ = 10;

    for (var i = 0; i < upgrades.length; i++) {
      var upg = upgrades[i];
      var bx = shopStartX + i * 6;
      var pad = makeGlowPad(bx, 0.25, shopZ, 3.5, 3.5, upg.color);
      buyZoneMeshes.push({ mesh: pad, index: i, x: bx, z: shopZ });
      makeSign(bx, 0.5, shopZ - 2.5, upg.name, upg.color);
    }

    // --- Fencing around starting area ---
    makeFence(-38, -38, 38, -38, 0);   // south
    makeFence(-38, 25, -20, 25, 0);    // partial west fence in front of gate
    makeFence(20, 25, 38, 25, 0);      // partial east fence in front of gate

    // --- Gate (blocks access to premium area) ---
    // Tall red wall across z = 25, between x = -10 and x = 10
    var gateGeo = new THREE.BoxGeometry(20, 8, 1);
    var gateMat = NB.makeMat(0xcc0000);
    gateMesh = new THREE.Mesh(gateGeo, gateMat);
    gateMesh.position.set(0, 4, 25);
    NB.addDecoration(gateMesh);

    // Gate collision blocker (invisible platform acting as wall)
    var gateBlocker = NB.addPlatform(0, 3, 25, 20, 8, 1, 0xcc0000, 'gate');

    // Gate pillars
    var pillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 8);
    var pillarMat = NB.makeMat(0x880000);
    var pillarL = new THREE.Mesh(pillarGeo, pillarMat);
    pillarL.position.set(-10.5, 5, 25);
    NB.addDecoration(pillarL);
    var pillarR = new THREE.Mesh(pillarGeo, pillarMat);
    pillarR.position.set(10.5, 5, 25);
    NB.addDecoration(pillarR);

    // Gate requirement sign
    makeSign(0, 8.5, 24, '10K CLICKS', 0xcc0000);

    // --- Premium Area (behind gate, z > 25) ---
    // Purple ground patch
    NB.addPlatform(0, -0.4, 33, 30, 0.8, 14, 0x8e44ad);

    // Premium click zone - larger, gives 5x
    premiumClickZoneMesh = makeGlowPad(0, 0.25, 33, 6, 6, 0xaa00ff);
    makeSign(0, 0.5, 29, 'PREMIUM 5X', 0xaa00ff);

    // --- Decorative Trees ---
    makeTree(-25, 0, -25);
    makeTree(-30, 0, -15);
    makeTree(-20, 0, -30);
    makeTree(25, 0, -25);
    makeTree(30, 0, -15);
    makeTree(20, 0, -30);
    makeTree(-25, 0, 5);
    makeTree(25, 0, 5);
    makeTree(-35, 0, -5);
    makeTree(35, 0, -5);
    makeTree(-15, 0, -35);
    makeTree(15, 0, -35);

    // Premium area trees
    makeTree(-12, 0, 33);
    makeTree(12, 0, 33);
    makeTree(-8, 0, 38);
    makeTree(8, 0, 38);

    // --- Decorative Rocks ---
    makeRock(-18, 0, 15, 1.2);
    makeRock(18, 0, 15, 0.9);
    makeRock(-30, 0, 0, 1.5);
    makeRock(30, 0, 0, 1.0);
    makeRock(-8, 0, -20, 0.8);
    makeRock(8, 0, -20, 1.1);
    makeRock(-22, 0, -10, 1.3);
    makeRock(22, 0, -10, 0.7);

    // --- Floating coin decorations in shop area ---
    for (var i = 0; i < upgrades.length; i++) {
      var cx = shopStartX + i * 6;
      var coinGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 16);
      var coinMat = NB.makeMat(0xffd700);
      var coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(cx, 3.5, shopZ);
      coin.rotation.x = Math.PI / 2;
      NB.addDecoration(coin);
      spinners.push(coin);
    }

    // =================================================================
    //  GAME UI
    // =================================================================
    var uiContainer = NB.addGameUI(
      '<div id="sim-ui" style="pointer-events:none;width:100%;height:100%;position:relative;font-family:Inter,Arial,sans-serif;">' +
        // Top stats bar
        '<div id="sim-topbar" style="position:absolute;top:48px;left:50%;transform:translateX(-50%);' +
          'display:flex;gap:24px;background:rgba(0,0,0,0.7);padding:10px 28px;border-radius:12px;' +
          'font-size:16px;font-weight:700;color:#fff;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.1);">' +
          '<span id="sim-clicks" style="color:#ff8c00;">&#128170; Clicks: 0</span>' +
          '<span style="color:rgba(255,255,255,0.2);">|</span>' +
          '<span id="sim-coins" style="color:#ffd700;">&#129689; Coins: 0</span>' +
          '<span style="color:rgba(255,255,255,0.2);">|</span>' +
          '<span id="sim-power" style="color:#3498db;">&#9889; Power: x1</span>' +
        '</div>' +
        // Bottom prompt
        '<div id="sim-prompt" style="position:absolute;bottom:80px;left:50%;transform:translateX(-50%);' +
          'background:rgba(0,0,0,0.75);padding:12px 32px;border-radius:10px;' +
          'font-size:18px;font-weight:600;color:#fff;display:none;backdrop-filter:blur(6px);' +
          'border:1px solid rgba(255,255,255,0.15);text-align:center;"></div>' +
        // Floating click number
        '<div id="sim-float" style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);' +
          'font-size:48px;font-weight:900;color:#ff8c00;opacity:0;pointer-events:none;' +
          'text-shadow:0 2px 8px rgba(0,0,0,0.6);transition:none;"></div>' +
        // Gate break notification
        '<div id="sim-gate-msg" style="position:absolute;top:30%;left:50%;transform:translateX(-50%);' +
          'font-size:32px;font-weight:900;color:#ff4444;opacity:0;pointer-events:none;' +
          'text-shadow:0 2px 12px rgba(0,0,0,0.8);"></div>' +
      '</div>'
    );

    // UI element references
    var elClicks = document.getElementById('sim-clicks');
    var elCoins = document.getElementById('sim-coins');
    var elPower = document.getElementById('sim-power');
    var elPrompt = document.getElementById('sim-prompt');
    var elFloat = document.getElementById('sim-float');
    var elGateMsg = document.getElementById('sim-gate-msg');

    // Floating number animation state
    var floatTimer = 0;
    var floatActive = false;

    // Gate break message animation
    var gateMsgTimer = 0;
    var gateMsgActive = false;

    // =================================================================
    //  HELPER: Zone detection
    // =================================================================
    function playerInZone(zx, zz, halfW, halfD) {
      var px = NB.playerPos.x;
      var pz = NB.playerPos.z;
      return (px > zx - halfW && px < zx + halfW &&
              pz > zz - halfD && pz < zz + halfD);
    }

    // =================================================================
    //  HELPER: Show floating number
    // =================================================================
    function showFloat(text, color) {
      elFloat.textContent = text;
      elFloat.style.color = color || '#ff8c00';
      elFloat.style.opacity = '1';
      elFloat.style.top = '40%';
      floatTimer = 0;
      floatActive = true;
    }

    // =================================================================
    //  HELPER: Show gate break message
    // =================================================================
    function showGateMsg(text) {
      elGateMsg.textContent = text;
      elGateMsg.style.opacity = '1';
      gateMsgTimer = 0;
      gateMsgActive = true;
    }

    // =================================================================
    //  UPDATE UI display
    // =================================================================
    function updateUI() {
      elClicks.innerHTML = '&#128170; Clicks: ' + formatNumber(clicks);
      elCoins.innerHTML = '&#129689; Coins: ' + formatNumber(coins);
      elPower.innerHTML = '&#9889; Power: x' + formatNumber(clickPower);
    }

    function formatNumber(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return n.toString();
    }

    // =================================================================
    //  Store references on `this` for update/cleanup access
    // =================================================================
    this._state = {
      clicks: function () { return clicks; },
      coins: function () { return coins; },
      clickPower: function () { return clickPower; },
      totalClicksEver: function () { return totalClicksEver; },
      gateOpen: function () { return gateOpen; },

      setClicks: function (v) { clicks = v; },
      setCoins: function (v) { coins = v; },
      setClickPower: function (v) { clickPower = v; },
      setTotalClicksEver: function (v) { totalClicksEver = v; },
      setGateOpen: function (v) { gateOpen = v; },

      upgrades: upgrades,
      clickZoneMesh: clickZoneMesh,
      sellZoneMesh: sellZoneMesh,
      buyZoneMeshes: buyZoneMeshes,
      premiumClickZoneMesh: premiumClickZoneMesh,
      gateMesh: gateMesh,
      gateBlocker: gateBlocker,
      pulsingPads: pulsingPads,
      spinners: spinners,

      eWasPressed: false,
      clickCooldown: 0,

      floatTimer: 0,
      floatActive: false,
      gateMsgTimer: 0,
      gateMsgActive: false,

      elClicks: elClicks,
      elCoins: elCoins,
      elPower: elPower,
      elPrompt: elPrompt,
      elFloat: elFloat,
      elGateMsg: elGateMsg,

      playerInZone: playerInZone,
      showFloat: showFloat,
      showGateMsg: showGateMsg,
      updateUI: updateUI,
      formatNumber: formatNumber,

      shopStartX: shopStartX,
      shopZ: shopZ
    };

    updateUI();
  },

  // =================================================================
  //  UPDATE
  // =================================================================
  update: function (dt) {
    var s = this._state;
    if (!s) return;

    var time = performance.now() / 1000;

    // --- Animate pulsing pads ---
    for (var i = 0; i < s.pulsingPads.length; i++) {
      var pad = s.pulsingPads[i];
      var pulse = 1.0 + Math.sin(time * 3 + i * 0.5) * 0.08;
      pad.scale.set(pulse, 1, pulse);
      if (pad.material && pad.material.emissiveIntensity !== undefined) {
        pad.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + i) * 0.3;
      }
    }

    // --- Animate spinning coins ---
    for (var i = 0; i < s.spinners.length; i++) {
      s.spinners[i].rotation.z += dt * 2;
      s.spinners[i].position.y = 3.5 + Math.sin(time * 2 + i * 0.7) * 0.3;
    }

    // --- Animate floating click number ---
    if (s.floatActive) {
      s.floatTimer += dt;
      var pct = s.floatTimer / 1.0; // 1 second lifetime
      var topVal = 40 - pct * 15;
      s.elFloat.style.top = topVal + '%';
      s.elFloat.style.opacity = String(Math.max(0, 1 - pct));
      if (pct >= 1) {
        s.floatActive = false;
        s.elFloat.style.opacity = '0';
      }
    }

    // --- Animate gate break message ---
    if (s.gateMsgActive) {
      s.gateMsgTimer += dt;
      var gPct = s.gateMsgTimer / 2.5;
      s.elGateMsg.style.opacity = String(Math.max(0, 1 - gPct));
      if (gPct >= 1) {
        s.gateMsgActive = false;
        s.elGateMsg.style.opacity = '0';
      }
    }

    // --- Cooldown ---
    if (s.clickCooldown > 0) {
      s.clickCooldown -= dt;
    }

    // --- Detect which zone the player is in ---
    var onClickZone = s.playerInZone(0, 10, 2.5, 2.5);
    var onSellZone = s.playerInZone(-12, 10, 2.5, 2.5);
    var onPremiumZone = !s.gateOpen() ? false : s.playerInZone(0, 33, 3.5, 3.5);

    var onBuyZone = -1;
    for (var i = 0; i < s.buyZoneMeshes.length; i++) {
      var bz = s.buyZoneMeshes[i];
      if (s.playerInZone(bz.x, bz.z, 2.2, 2.2)) {
        onBuyZone = i;
        break;
      }
    }

    // --- Update prompt ---
    var prompt = s.elPrompt;
    if (onClickZone || onPremiumZone) {
      var mult = onPremiumZone ? 5 : 1;
      prompt.style.display = 'block';
      prompt.innerHTML = 'Press <span style="color:#ff8c00;font-size:22px;">E</span> or <span style="color:#ff8c00;font-size:22px;">Left Click</span> to Click! <span style="color:#aaa;font-size:14px;">(+' + s.formatNumber(s.clickPower() * mult) + ')</span>';
    } else if (onSellZone) {
      prompt.style.display = 'block';
      if (s.clicks() > 0) {
        prompt.innerHTML = 'Press <span style="color:#f1c40f;font-size:22px;">E</span> to Sell! <span style="color:#aaa;font-size:14px;">(' + s.formatNumber(s.clicks()) + ' clicks &rarr; ' + s.formatNumber(s.clicks()) + ' coins)</span>';
      } else {
        prompt.innerHTML = '<span style="color:#888;">No clicks to sell</span>';
      }
    } else if (onBuyZone >= 0) {
      var upg = s.upgrades[onBuyZone];
      prompt.style.display = 'block';
      if (upg.bought) {
        prompt.innerHTML = '<span style="color:#2ecc71;">&#10004; ' + upg.name + ' - OWNED</span>';
      } else if (s.coins() >= upg.cost) {
        prompt.innerHTML = 'Press <span style="color:#3498db;font-size:22px;">E</span> to Buy <span style="color:' + '#' + upg.color.toString(16).padStart(6, '0') + ';">' + upg.name + '</span> - <span style="color:#ffd700;">' + s.formatNumber(upg.cost) + ' coins</span>';
      } else {
        prompt.innerHTML = '<span style="color:#e74c3c;">' + upg.name + ' - ' + s.formatNumber(upg.cost) + ' coins</span> <span style="color:#888;">(need ' + s.formatNumber(upg.cost - s.coins()) + ' more)</span>';
      }
    } else {
      prompt.style.display = 'none';
    }

    // --- Handle E key press (with debounce) ---
    var ePressed = NB.keys && NB.keys['KeyE'];
    var eJustPressed = ePressed && !s.eWasPressed;
    s.eWasPressed = !!ePressed;

    // Allow rapid clicking on click zones (with small cooldown)
    var clickAction = eJustPressed || (ePressed && s.clickCooldown <= 0 && (onClickZone || onPremiumZone));

    if (clickAction && s.clickCooldown <= 0) {
      // --- Click Zone ---
      if (onClickZone) {
        var gain = s.clickPower();
        s.setClicks(s.clicks() + gain);
        s.setTotalClicksEver(s.totalClicksEver() + gain);
        s.showFloat('+' + s.formatNumber(gain), '#ff8c00');
        s.clickCooldown = 0.12;

        // Check gate break condition
        if (!s.gateOpen() && s.totalClicksEver() >= 10000) {
          s.setGateOpen(true);
          // Remove gate visuals
          if (s.gateMesh && s.gateMesh.parent) {
            s.gateMesh.parent.remove(s.gateMesh);
          }
          // Remove gate blocker collision
          if (s.gateBlocker && s.gateBlocker.parent) {
            s.gateBlocker.parent.remove(s.gateBlocker);
          }
          s.showGateMsg('GATE DESTROYED!');
        }

        s.updateUI();
      }
      // --- Premium Click Zone ---
      else if (onPremiumZone) {
        var gain = s.clickPower() * 5;
        s.setClicks(s.clicks() + gain);
        s.setTotalClicksEver(s.totalClicksEver() + gain);
        s.showFloat('+' + s.formatNumber(gain), '#aa00ff');
        s.clickCooldown = 0.12;
        s.updateUI();
      }
      // --- Sell Zone ---
      else if (onSellZone && eJustPressed) {
        if (s.clicks() > 0) {
          var sellAmount = s.clicks();
          s.setCoins(s.coins() + sellAmount);
          s.setClicks(0);
          s.showFloat('+' + s.formatNumber(sellAmount) + ' coins!', '#ffd700');
          s.updateUI();
        }
      }
      // --- Buy Zone ---
      else if (onBuyZone >= 0 && eJustPressed) {
        var upg = s.upgrades[onBuyZone];
        if (!upg.bought && s.coins() >= upg.cost) {
          s.setCoins(s.coins() - upg.cost);
          upg.bought = true;
          s.setClickPower(upg.power);
          s.showFloat(upg.name + '!', '#2ecc71');
          s.updateUI();
        }
      }
    }

    // --- Also handle mouse left-click for the click zones ---
    if (NB.state && NB.state.leftMouseDown && s.clickCooldown <= 0) {
      if (onClickZone) {
        var gain = s.clickPower();
        s.setClicks(s.clicks() + gain);
        s.setTotalClicksEver(s.totalClicksEver() + gain);
        s.showFloat('+' + s.formatNumber(gain), '#ff8c00');
        s.clickCooldown = 0.12;

        if (!s.gateOpen() && s.totalClicksEver() >= 10000) {
          s.setGateOpen(true);
          if (s.gateMesh && s.gateMesh.parent) {
            s.gateMesh.parent.remove(s.gateMesh);
          }
          if (s.gateBlocker && s.gateBlocker.parent) {
            s.gateBlocker.parent.remove(s.gateBlocker);
          }
          s.showGateMsg('GATE DESTROYED!');
        }

        s.updateUI();
      } else if (onPremiumZone) {
        var gain = s.clickPower() * 5;
        s.setClicks(s.clicks() + gain);
        s.setTotalClicksEver(s.totalClicksEver() + gain);
        s.showFloat('+' + s.formatNumber(gain), '#aa00ff');
        s.clickCooldown = 0.12;
        s.updateUI();
      }
    }

    // --- Animate gate (if still present, make it pulse red) ---
    if (!s.gateOpen() && s.gateMesh) {
      var gateGlow = 0.6 + Math.sin(time * 2) * 0.3;
      if (s.gateMesh.material && s.gateMesh.material.color) {
        var r = 0.5 + gateGlow * 0.3;
        s.gateMesh.material.color.setRGB(r, 0, 0);
      }
    }
  },

  // =================================================================
  //  CLEANUP
  // =================================================================
  cleanup: function () {
    NB.removeGameUI();
    this._state = null;
  }

});
