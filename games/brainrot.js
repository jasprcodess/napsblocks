NB.registerGame('brainrot', {

  // ---- State ----
  _guards: [],
  _items: [],
  _cash: 0,
  _carrying: null,
  _itemsStolen: 0,
  _caught: false,
  _caughtTimer: 0,
  _promptText: '',
  _uiContainer: null,
  _spawnPos: { x: 0, y: 1, z: 20 },
  _eDown: false,

  init: function () {
    var self = this;
    var scene = NB.scene;

    // Reset state
    this._guards = [];
    this._items = [];
    this._cash = 0;
    this._carrying = null;
    this._itemsStolen = 0;
    this._caught = false;
    this._caughtTimer = 0;
    this._promptText = '';
    this._eDown = false;

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
    // Helper: fence post
    // ---------------------------------------------------------------
    function makeFencePost(x, y, z) {
      var postGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 6);
      var postMat = NB.makeMat(0x8B4513);
      var post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, y + 1, z);
      NB.addDecoration(post);
    }

    // ---------------------------------------------------------------
    // Helper: fence segment (posts + rail)
    // ---------------------------------------------------------------
    function makeFenceSegment(x1, z1, x2, z2, y) {
      var dx = x2 - x1;
      var dz = z2 - z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      var mx = (x1 + x2) / 2;
      var mz = (z1 + z2) / 2;
      var angle = Math.atan2(dx, dz);

      // Rail
      var railGeo = new THREE.BoxGeometry(0.15, 0.15, len);
      var railMat = NB.makeMat(0xA0522D);
      var rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(mx, y + 1.5, mz);
      rail.rotation.y = angle;
      NB.addDecoration(rail);

      var rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set(mx, y + 0.8, mz);
      rail2.rotation.y = angle;
      NB.addDecoration(rail2);

      // Posts along the length
      var numPosts = Math.max(2, Math.floor(len / 3));
      for (var i = 0; i <= numPosts; i++) {
        var t = i / numPosts;
        var px = x1 + dx * t;
        var pz = z1 + dz * t;
        makeFencePost(px, y, pz);
      }
    }

    // ===============================================================
    //  GROUND
    // ===============================================================
    // Big grass ground
    NB.addPlatform(0, -0.5, 0, 100, 1, 100, 0x2ecc71);

    // ===============================================================
    //  SPAWN AREA (outside the vault, positive Z side)
    // ===============================================================
    // Spawn pad
    NB.addPlatform(0, 0.01, 20, 10, 0.1, 10, 0x3498db);

    // Spawn area trees
    makeTree(-8, 0, 24);
    makeTree(8, 0, 24);
    makeTree(-5, 0, 16);
    makeTree(5, 0, 16);

    // ===============================================================
    //  THE VAULT BUILDING (centered at origin)
    // ===============================================================
    var wallColor = 0x444444;
    var wallH = 8;
    var wallThick = 1.5;
    var vaultSize = 30; // 30x30 interior
    var halfVault = vaultSize / 2;

    // Floor of vault
    NB.addPlatform(0, -0.25, 0, vaultSize + wallThick * 2, 0.5, vaultSize + wallThick * 2, 0x333333);

    // Back wall (negative Z)
    NB.addPlatform(0, wallH / 2, -(halfVault + wallThick / 2), vaultSize + wallThick * 2, wallH, wallThick, wallColor);

    // Left wall (negative X)
    NB.addPlatform(-(halfVault + wallThick / 2), wallH / 2, 0, wallThick, wallH, vaultSize, wallColor);

    // Right wall (positive X)
    NB.addPlatform(halfVault + wallThick / 2, wallH / 2, 0, wallThick, wallH, vaultSize, wallColor);

    // Front wall with doorway gap (positive Z side)
    // Two wall segments leaving a 4-unit gap in the center
    var frontWallSegmentWidth = (vaultSize + wallThick * 2 - 4) / 2;
    // Left segment of front wall
    NB.addPlatform(
      -(frontWallSegmentWidth / 2 + 2),
      wallH / 2,
      halfVault + wallThick / 2,
      frontWallSegmentWidth,
      wallH,
      wallThick,
      wallColor
    );
    // Right segment of front wall
    NB.addPlatform(
      (frontWallSegmentWidth / 2 + 2),
      wallH / 2,
      halfVault + wallThick / 2,
      frontWallSegmentWidth,
      wallH,
      wallThick,
      wallColor
    );

    // Door frame top (lintel above the 4-unit gap)
    NB.addPlatform(0, wallH - 0.5, halfVault + wallThick / 2, 4, 1, wallThick, 0x555555);

    // ===============================================================
    //  BRAINROT ITEMS (on pedestals inside the vault)
    // ===============================================================
    var itemDefs = [
      { name: 'Skibidi Toilet', color: 0x9b59b6, value: 100,  x: -10, z: -8  },
      { name: 'Sigma Face',     color: 0xe74c3c, value: 250,  x: 10,  z: -8  },
      { name: 'Ohio Crystal',   color: 0x3498db, value: 500,  x: 0,   z: 0   },
      { name: 'Rizz Crown',     color: 0xffd700, value: 1000, x: -10, z: 8   },
      { name: 'Gyatt Diamond',  color: 0xe91e8a, value: 2500, x: 10,  z: 8   }
    ];

    for (var i = 0; i < itemDefs.length; i++) {
      var def = itemDefs[i];

      // Pedestal
      var pedestalGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
      var pedestalMat = NB.makeMat(0x888888);
      var pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.set(def.x, 1, def.z);
      NB.addDecoration(pedestal);

      // Item (colored box on top of pedestal)
      var itemGeo = new THREE.BoxGeometry(1, 1, 1);
      var itemMat = NB.makeMat(def.color);
      var itemMesh = new THREE.Mesh(itemGeo, itemMat);
      itemMesh.position.set(def.x, 2.5, def.z);
      NB.addDecoration(itemMesh);

      // Small glow ring under item (decorative)
      var ringGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 16);
      var ringMat = NB.makeMat(def.color);
      var ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(def.x, 2.05, def.z);
      ring.rotation.x = Math.PI / 2;
      NB.addDecoration(ring);

      // Item label (floating text placeholder - small colored sphere above)
      var labelGeo = new THREE.SphereGeometry(0.2, 6, 6);
      var labelMat = NB.makeMat(def.color);
      var label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(def.x, 3.5, def.z);
      NB.addDecoration(label);

      self._items.push({
        name: def.name,
        value: def.value,
        x: def.x,
        z: def.z,
        mesh: itemMesh,
        ring: ring,
        label: label,
        stolen: false,
        respawnTimer: 0
      });
    }

    // ===============================================================
    //  SELL ZONE (yellow pad, outside building, far from entrance)
    // ===============================================================
    NB.addPlatform(0, 0.05, 35, 6, 0.1, 6, 0xf1c40f);

    // Sell zone sign (tall post with a box on top)
    var signPostGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 6);
    var signPostMat = NB.makeMat(0x8B4513);
    var signPost = new THREE.Mesh(signPostGeo, signPostMat);
    signPost.position.set(0, 2, 38.5);
    NB.addDecoration(signPost);

    var signGeo = new THREE.BoxGeometry(4, 1.5, 0.2);
    var signMat = NB.makeMat(0xf1c40f);
    var sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4.5, 38.5);
    NB.addDecoration(sign);

    // ===============================================================
    //  GUARDS (red cylinder+box combos patrolling inside vault)
    // ===============================================================
    var guardPaths = [
      { ax: -12, az: -5,  bx: 12,  bz: -5,  speed: 3.5 },
      { ax: -8,  az: 5,   bx: 8,   bz: 5,   speed: 4.0 },
      { ax: 0,   az: -12, bx: 0,   bz: 12,  speed: 3.0 }
    ];

    for (var g = 0; g < guardPaths.length; g++) {
      var gp = guardPaths[g];

      // Guard body group
      var guardGroup = new THREE.Group();

      // Body (cylinder)
      var bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 8);
      var bodyMat = NB.makeMat(0xcc0000);
      var body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.25;
      guardGroup.add(body);

      // Head (sphere)
      var headGeo = new THREE.SphereGeometry(0.5, 8, 6);
      var headMat = NB.makeMat(0xff3333);
      var head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 2.8;
      guardGroup.add(head);

      // Hat (cone)
      var hatGeo = new THREE.ConeGeometry(0.4, 0.6, 8);
      var hatMat = NB.makeMat(0x222222);
      var hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.y = 3.5;
      guardGroup.add(hat);

      // Vision indicator (small box in front)
      var visorGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3);
      var visorMat = NB.makeMat(0xffff00);
      var visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 2.8, 0.55);
      guardGroup.add(visor);

      guardGroup.position.set(gp.ax, 0, gp.az);
      NB.addDecoration(guardGroup);

      self._guards.push({
        mesh: guardGroup,
        ax: gp.ax,
        az: gp.az,
        bx: gp.bx,
        bz: gp.bz,
        speed: gp.speed,
        t: 0,
        direction: 1
      });
    }

    // ===============================================================
    //  DECORATIONS: Fence around perimeter, extra trees
    // ===============================================================
    // Perimeter fence (around the whole play area)
    var fenceY = 0;
    var fenceHalf = 42;

    // Front fence (with gap at center for access)
    makeFenceSegment(-fenceHalf, fenceHalf, -5, fenceHalf, fenceY);
    makeFenceSegment(5, fenceHalf, fenceHalf, fenceHalf, fenceY);
    // Back fence
    makeFenceSegment(-fenceHalf, -fenceHalf, fenceHalf, -fenceHalf, fenceY);
    // Left fence
    makeFenceSegment(-fenceHalf, -fenceHalf, -fenceHalf, fenceHalf, fenceY);
    // Right fence
    makeFenceSegment(fenceHalf, -fenceHalf, fenceHalf, fenceHalf, fenceY);

    // Perimeter trees
    makeTree(-20, 0, -20, 5, 3);
    makeTree(20, 0, -20, 5, 3);
    makeTree(-20, 0, 20, 4, 2.5);
    makeTree(20, 0, 20, 4, 2.5);
    makeTree(-30, 0, 0, 6, 3.5);
    makeTree(30, 0, 0, 6, 3.5);
    makeTree(-25, 0, 30, 5, 3);
    makeTree(25, 0, 30, 5, 3);
    makeTree(0, 0, -25, 4, 2.5);
    makeTree(-15, 0, 35, 3, 2);
    makeTree(15, 0, 35, 3, 2);

    // Decorative lamp posts near the vault entrance
    for (var side = -1; side <= 1; side += 2) {
      var lampGeo = new THREE.CylinderGeometry(0.15, 0.2, 5, 6);
      var lampMat = NB.makeMat(0x555555);
      var lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(side * 3.5, 2.5, halfVault + 2);
      NB.addDecoration(lamp);

      var bulbGeo = new THREE.SphereGeometry(0.4, 8, 6);
      var bulbMat = NB.makeMat(0xffee88);
      var bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(side * 3.5, 5.2, halfVault + 2);
      NB.addDecoration(bulb);
    }

    // ===============================================================
    //  GAME UI
    // ===============================================================
    var uiHTML = '<div id="brainrot-ui" style="' +
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;font-family:Inter,sans-serif;">' +

      // Top bar
      '<div style="position:absolute;top:50px;left:50%;transform:translateX(-50%);' +
      'display:flex;gap:20px;align-items:center;">' +

        // Cash display
        '<div id="br-cash" style="background:rgba(0,0,0,0.7);color:#ffd700;' +
        'padding:8px 18px;border-radius:8px;font-size:18px;font-weight:700;' +
        'border:1px solid rgba(255,215,0,0.3);text-shadow:0 0 10px rgba(255,215,0,0.3);">' +
        '\uD83D\uDCB0 Cash: $0</div>' +

        // Items stolen count
        '<div id="br-stolen" style="background:rgba(0,0,0,0.7);color:#e0e0e0;' +
        'padding:8px 18px;border-radius:8px;font-size:14px;font-weight:600;' +
        'border:1px solid rgba(255,255,255,0.15);">' +
        'Items Stolen: 0</div>' +

      '</div>' +

      // Carrying indicator
      '<div id="br-carrying" style="position:absolute;top:105px;left:50%;' +
      'transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#e0e0e0;' +
      'padding:8px 18px;border-radius:8px;font-size:14px;font-weight:600;' +
      'border:1px solid rgba(255,255,255,0.15);">' +
      '\uD83E\uDDE0 Carrying: Nothing</div>' +

      // Center prompt
      '<div id="br-prompt" style="position:absolute;bottom:120px;left:50%;' +
      'transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;' +
      'padding:10px 24px;border-radius:10px;font-size:16px;font-weight:700;' +
      'border:1px solid rgba(255,255,255,0.2);display:none;' +
      'text-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>' +

      // Caught flash
      '<div id="br-caught" style="position:absolute;top:50%;left:50%;' +
      'transform:translate(-50%,-50%);color:#ff4444;font-size:48px;font-weight:900;' +
      'text-shadow:0 0 20px rgba(255,0,0,0.7),0 0 40px rgba(255,0,0,0.4);' +
      'display:none;letter-spacing:2px;pointer-events:none;">' +
      '\u26A0\uFE0F CAUGHT!</div>' +

      // Mini instructions
      '<div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);' +
      'background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.5);padding:6px 14px;' +
      'border-radius:6px;font-size:11px;">Sneak into the vault, steal brainrots, ' +
      'sell at the yellow pad. Avoid the guards!</div>' +

    '</div>';

    this._uiContainer = NB.addGameUI(uiHTML);

    // Teleport player to spawn
    if (NB.playerGroup) {
      NB.playerGroup.position.set(this._spawnPos.x, this._spawnPos.y, this._spawnPos.z);
    }
  },

  update: function (dt) {
    var self = this;
    var time = performance.now() / 1000;

    // ---------------------------------------------------------------
    // Guard patrol movement
    // ---------------------------------------------------------------
    for (var g = 0; g < self._guards.length; g++) {
      var guard = self._guards[g];

      // Move t along the path
      var pathDx = guard.bx - guard.ax;
      var pathDz = guard.bz - guard.az;
      var pathLen = Math.sqrt(pathDx * pathDx + pathDz * pathDz);
      if (pathLen < 0.1) pathLen = 1;

      var tStep = (guard.speed * dt) / pathLen;
      guard.t += tStep * guard.direction;

      if (guard.t >= 1) {
        guard.t = 1;
        guard.direction = -1;
      } else if (guard.t <= 0) {
        guard.t = 0;
        guard.direction = 1;
      }

      var gx = guard.ax + pathDx * guard.t;
      var gz = guard.az + pathDz * guard.t;
      guard.mesh.position.set(gx, 0, gz);

      // Face movement direction
      var faceAngle = Math.atan2(pathDx * guard.direction, pathDz * guard.direction);
      guard.mesh.rotation.y = faceAngle;
    }

    // ---------------------------------------------------------------
    // Get player position
    // ---------------------------------------------------------------
    var px, py, pz;
    if (NB.playerPos) {
      px = NB.playerPos.x;
      py = NB.playerPos.y;
      pz = NB.playerPos.z;
    } else if (NB.playerGroup) {
      px = NB.playerGroup.position.x;
      py = NB.playerGroup.position.y;
      pz = NB.playerGroup.position.z;
    } else {
      return;
    }

    // ---------------------------------------------------------------
    // Caught timer (invincibility after being caught)
    // ---------------------------------------------------------------
    if (self._caughtTimer > 0) {
      self._caughtTimer -= dt;
      if (self._caughtTimer <= 0) {
        self._caught = false;
        self._caughtTimer = 0;
        var caughtEl = document.getElementById('br-caught');
        if (caughtEl) caughtEl.style.display = 'none';
      }
    }

    // ---------------------------------------------------------------
    // Guard detection (check proximity to player)
    // ---------------------------------------------------------------
    if (!self._caught) {
      for (var g = 0; g < self._guards.length; g++) {
        var gMesh = self._guards[g].mesh;
        var gdx = gMesh.position.x - px;
        var gdz = gMesh.position.z - pz;
        var gDist = Math.sqrt(gdx * gdx + gdz * gdz);

        if (gDist < 5) {
          // CAUGHT!
          self._caught = true;
          self._caughtTimer = 2.0; // 2 seconds of caught state

          // Lose carried item
          if (self._carrying) {
            // Restore the item
            for (var ri = 0; ri < self._items.length; ri++) {
              if (self._items[ri].name === self._carrying.name && self._items[ri].stolen) {
                self._items[ri].stolen = false;
                self._items[ri].mesh.visible = true;
                self._items[ri].ring.visible = true;
                self._items[ri].label.visible = true;
                break;
              }
            }
            self._carrying = null;
          }

          // Teleport to spawn
          if (NB.playerGroup) {
            NB.playerGroup.position.set(self._spawnPos.x, self._spawnPos.y, self._spawnPos.z);
          }

          // Show caught flash
          var caughtEl = document.getElementById('br-caught');
          if (caughtEl) caughtEl.style.display = 'block';

          break;
        }
      }
    }

    // ---------------------------------------------------------------
    // Item respawn timers
    // ---------------------------------------------------------------
    for (var i = 0; i < self._items.length; i++) {
      var item = self._items[i];
      if (item.stolen && item.respawnTimer > 0) {
        item.respawnTimer -= dt;
        if (item.respawnTimer <= 0) {
          item.stolen = false;
          item.mesh.visible = true;
          item.ring.visible = true;
          item.label.visible = true;
          item.respawnTimer = 0;
        }
      }
    }

    // ---------------------------------------------------------------
    // Item rotation animation (bob and spin the items)
    // ---------------------------------------------------------------
    for (var i = 0; i < self._items.length; i++) {
      var item = self._items[i];
      if (!item.stolen) {
        item.mesh.rotation.y = time * 1.5 + i;
        item.mesh.position.y = 2.5 + Math.sin(time * 2 + i) * 0.15;
        item.label.position.y = 3.5 + Math.sin(time * 3 + i) * 0.1;
      }
    }

    // ---------------------------------------------------------------
    // E key detection (press once, not hold)
    // ---------------------------------------------------------------
    var ePressed = false;
    if (NB.keys && NB.keys['KeyE']) {
      if (!self._eDown) {
        ePressed = true;
        self._eDown = true;
      }
    } else {
      self._eDown = false;
    }

    // ---------------------------------------------------------------
    // Check proximity to items (steal)
    // ---------------------------------------------------------------
    var nearItem = null;
    if (!self._carrying && !self._caught) {
      for (var i = 0; i < self._items.length; i++) {
        var item = self._items[i];
        if (item.stolen) continue;

        var idx = item.x - px;
        var idz = item.z - pz;
        var iDist = Math.sqrt(idx * idx + idz * idz);

        if (iDist < 3) {
          nearItem = item;
          break;
        }
      }
    }

    // ---------------------------------------------------------------
    // Check proximity to sell zone
    // ---------------------------------------------------------------
    var nearSell = false;
    if (self._carrying) {
      var sdx = 0 - px;
      var sdz = 35 - pz;
      var sDist = Math.sqrt(sdx * sdx + sdz * sdz);
      if (sDist < 4.5) {
        nearSell = true;
      }
    }

    // ---------------------------------------------------------------
    // Handle E presses
    // ---------------------------------------------------------------
    if (ePressed) {
      if (nearItem && !self._carrying) {
        // Steal the item!
        nearItem.stolen = true;
        nearItem.mesh.visible = false;
        nearItem.ring.visible = false;
        nearItem.label.visible = false;
        nearItem.respawnTimer = 15;
        self._carrying = { name: nearItem.name, value: nearItem.value };
        self._itemsStolen++;
      } else if (nearSell && self._carrying) {
        // Sell the item!
        self._cash += self._carrying.value;
        self._carrying = null;
      }
    }

    // ---------------------------------------------------------------
    // Update prompt text
    // ---------------------------------------------------------------
    self._promptText = '';
    if (nearItem && !self._carrying) {
      self._promptText = 'Press E to steal ' + nearItem.name + '! ($' + nearItem.value + ')';
    } else if (nearSell && self._carrying) {
      self._promptText = 'Press E to sell ' + self._carrying.name + ' for $' + self._carrying.value + '!';
    }

    // ---------------------------------------------------------------
    // Update UI
    // ---------------------------------------------------------------
    var cashEl = document.getElementById('br-cash');
    if (cashEl) {
      cashEl.textContent = '\uD83D\uDCB0 Cash: $' + self._cash;
    }

    var stolenEl = document.getElementById('br-stolen');
    if (stolenEl) {
      stolenEl.textContent = 'Items Stolen: ' + self._itemsStolen;
    }

    var carryEl = document.getElementById('br-carrying');
    if (carryEl) {
      if (self._carrying) {
        carryEl.textContent = '\uD83E\uDDE0 Carrying: ' + self._carrying.name + ' ($' + self._carrying.value + ')';
        carryEl.style.borderColor = 'rgba(255,215,0,0.5)';
        carryEl.style.color = '#ffd700';
      } else {
        carryEl.textContent = '\uD83E\uDDE0 Carrying: Nothing';
        carryEl.style.borderColor = 'rgba(255,255,255,0.15)';
        carryEl.style.color = '#e0e0e0';
      }
    }

    var promptEl = document.getElementById('br-prompt');
    if (promptEl) {
      if (self._promptText) {
        promptEl.style.display = 'block';
        promptEl.textContent = self._promptText;
      } else {
        promptEl.style.display = 'none';
      }
    }
  },

  cleanup: function () {
    this._guards = [];
    this._items = [];
    this._cash = 0;
    this._carrying = null;
    this._itemsStolen = 0;
    this._caught = false;
    this._caughtTimer = 0;
    this._uiContainer = null;
    NB.removeGameUI();
  }

});
