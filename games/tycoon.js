// Tycoon Empire - A factory tycoon game for NapsBlocks
// Step on the collector pad to bank income, buy factories to earn more!

NB.registerGame('tycoon', {
  init: function () {
    // ---- Local state ----
    var cash = 0;
    var baseIncome = 1; // starting $/sec
    var bonusIncome = 0;
    var accumulated = 0; // income waiting to be collected
    var buyPromptVisible = false;
    var activeBuyIndex = -1;
    var justBought = false; // flag to prevent double-buy on single press

    var factories = [
      { name: 'Small Factory',  cost: 50,    income: 2,   color: 0x2ecc71, bought: false, x: -10, z: -12, size: 1.0  },
      { name: 'Medium Factory', cost: 200,   income: 5,   color: 0x3498db, bought: false, x:  -5, z: -18, size: 1.3  },
      { name: 'Large Factory',  cost: 500,   income: 15,  color: 0x9b59b6, bought: false, x:   5, z: -18, size: 1.6  },
      { name: 'Mega Factory',   cost: 2000,  income: 50,  color: 0xe74c3c, bought: false, x:  10, z: -12, size: 2.0  },
      { name: 'Golden Factory', cost: 10000, income: 200, color: 0xf1c40f, bought: false, x:   0, z: -22, size: 2.4  }
    ];

    var factoryMeshes = []; // holds spawned building groups
    var buyPadMeshes = [];  // references to buy-pad platforms so we can remove them
    var smokeParticles = []; // decorative chimney smoke

    // ---- Ground ----
    NB.addPlatform(0, -0.5, 0, 60, 1, 60, 0x5dbd5d, 'spawn');

    // ---- Invisible boundary walls (prevent walking off edge) ----
    NB.addPlatform(0, 2, -30.5, 62, 5, 1, 0x5dbd5d);
    NB.addPlatform(0, 2, 30.5, 62, 5, 1, 0x5dbd5d);
    NB.addPlatform(-30.5, 2, 0, 1, 5, 60, 0x5dbd5d);
    NB.addPlatform(30.5, 2, 0, 1, 5, 60, 0x5dbd5d);

    // ---- Fenced perimeter (decorative) ----
    var fenceColor = 0x8B4513;
    var postSpacing = 6;
    for (var fi = -30; fi <= 30; fi += postSpacing) {
      // posts along X edges
      addFencePost(fi, 0.75, -30);
      addFencePost(fi, 0.75, 30);
      // posts along Z edges
      if (fi > -30 && fi < 30) {
        addFencePost(-30, 0.75, fi);
        addFencePost(30, 0.75, fi);
      }
    }

    // horizontal rails
    addFenceRail(0, 1.0, -30, 60, 0.15, 0.15);
    addFenceRail(0, 1.0, 30, 60, 0.15, 0.15);
    addFenceRail(-30, 1.0, 0, 0.15, 0.15, 60);
    addFenceRail(30, 1.0, 0, 0.15, 0.15, 60);

    function addFencePost(x, y, z) {
      var geo = new THREE.BoxGeometry(0.3, 1.5, 0.3);
      var mat = NB.makeMat(fenceColor);
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      NB.addDecoration(mesh);
    }

    function addFenceRail(x, y, z, w, h, d) {
      var geo = new THREE.BoxGeometry(w, h, d);
      var mat = NB.makeMat(fenceColor);
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      NB.addDecoration(mesh);
    }

    // ---- Stone paths ----
    var pathColor = 0x95a5a6;

    // Path from center collector outward to each buy pad
    for (var pi = 0; pi < factories.length; pi++) {
      var fx = factories[pi].x;
      var fz = factories[pi].z;
      var steps = 6;
      for (var s = 1; s <= steps; s++) {
        var t = s / steps;
        var px = fx * t;
        var pz = fz * t;
        NB.addPlatform(px, 0.15, pz, 1.2, 0.1, 1.2, pathColor, 'path');
      }
    }

    // ---- Collector pad (center, yellow, slightly raised) ----
    NB.addPlatform(0, 0.2, 0, 4, 0.2, 4, 0xf1c40f, 'collector');

    // Glow ring around collector
    var glowRing = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.8, 32),
      new THREE.MeshBasicMaterial({ color: 0xf9e154, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.set(0, 0.22, 0);
    NB.addDecoration(glowRing);

    // Pulsing glow plane on collector
    var glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.set(0, 0.25, 0);
    NB.addDecoration(glowPlane);

    // Small upward arrow on collector as a hint
    var arrowGeo = new THREE.ConeGeometry(0.3, 0.8, 4);
    var arrowMat = NB.makeMat(0xf39c12);
    var arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.set(0, 1.5, 0);
    NB.addDecoration(arrow);

    // ---- Buy pads ----
    for (var bi = 0; bi < factories.length; bi++) {
      var f = factories[bi];
      var padSize = 3 + f.size * 0.5;
      NB.addPlatform(f.x, 0.2, f.z, padSize, 0.15, padSize, f.color, 'buy_' + bi);

      // Label post next to pad
      var signPost = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 2, 0.15),
        NB.makeMat(0x7f8c8d)
      );
      signPost.position.set(f.x + padSize / 2 + 0.5, 1, f.z);
      NB.addDecoration(signPost);

      var signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.8, 0.1),
        NB.makeMat(0x2c3e50)
      );
      signBoard.position.set(f.x + padSize / 2 + 0.5, 2, f.z);
      NB.addDecoration(signBoard);
    }

    // ---- Decorative trees around edges ----
    var treePositions = [
      [-25, 8], [-20, 25], [25, 20], [22, -22], [-18, -25],
      [15, 25], [-25, -15], [28, 5], [-28, -5], [10, 26]
    ];
    for (var ti = 0; ti < treePositions.length; ti++) {
      addTree(treePositions[ti][0], treePositions[ti][1]);
    }

    function addTree(x, z) {
      var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 2, 6),
        NB.makeMat(0x8B4513)
      );
      trunk.position.set(x, 1, z);
      NB.addDecoration(trunk);

      var leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 8, 6),
        NB.makeMat(0x27ae60)
      );
      leaves.position.set(x, 2.8, z);
      NB.addDecoration(leaves);
    }

    // ---- Game UI ----
    var uiContainer = NB.addGameUI(
      '<div id="tycoon-ui" style="pointer-events:none; user-select:none;">' +
        // Cash display
        '<div id="tycoon-cash" style="' +
          'position:fixed; top:18px; left:50%; transform:translateX(-50%);' +
          'font-size:42px; font-weight:bold; color:#2ecc71;' +
          'text-shadow: 0 0 12px rgba(46,204,113,0.5), 2px 2px 4px rgba(0,0,0,0.7);' +
          'font-family: Arial, sans-serif; letter-spacing:1px;' +
        '">$0</div>' +
        // Income display
        '<div id="tycoon-income" style="' +
          'position:fixed; top:68px; left:50%; transform:translateX(-50%);' +
          'font-size:20px; color:#f1c40f;' +
          'text-shadow: 0 0 8px rgba(241,196,15,0.4), 1px 1px 3px rgba(0,0,0,0.7);' +
          'font-family: Arial, sans-serif;' +
        '">$1/s</div>' +
        // Collect prompt
        '<div id="tycoon-collect" style="' +
          'position:fixed; top:100px; left:50%; transform:translateX(-50%);' +
          'font-size:16px; color:#f9e154;' +
          'text-shadow: 1px 1px 3px rgba(0,0,0,0.7);' +
          'font-family: Arial, sans-serif; display:none;' +
        '">Step on the yellow pad to collect!</div>' +
        // Buy prompt
        '<div id="tycoon-buy-prompt" style="' +
          'position:fixed; bottom:80px; left:50%; transform:translateX(-50%);' +
          'font-size:24px; color:#fff; background:rgba(0,0,0,0.7);' +
          'padding:12px 28px; border-radius:10px;' +
          'text-shadow: 1px 1px 2px rgba(0,0,0,0.5);' +
          'font-family: Arial, sans-serif; display:none;' +
          'border: 2px solid rgba(255,255,255,0.2);' +
        '"></div>' +
        // Cash earned popup
        '<div id="tycoon-popup" style="' +
          'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);' +
          'font-size:36px; font-weight:bold; color:#2ecc71;' +
          'text-shadow: 0 0 20px rgba(46,204,113,0.8), 2px 2px 4px rgba(0,0,0,0.7);' +
          'font-family: Arial, sans-serif; display:none; pointer-events:none;' +
          'transition: opacity 0.5s, transform 0.5s;' +
        '"></div>' +
        // Bought popup
        '<div id="tycoon-bought" style="' +
          'position:fixed; top:40%; left:50%; transform:translate(-50%,-50%);' +
          'font-size:30px; font-weight:bold; color:#f1c40f;' +
          'text-shadow: 0 0 16px rgba(241,196,15,0.7), 2px 2px 4px rgba(0,0,0,0.7);' +
          'font-family: Arial, sans-serif; display:none; pointer-events:none;' +
        '"></div>' +
      '</div>'
    );

    var cashEl = document.getElementById('tycoon-cash');
    var incomeEl = document.getElementById('tycoon-income');
    var collectEl = document.getElementById('tycoon-collect');
    var buyPromptEl = document.getElementById('tycoon-buy-prompt');
    var popupEl = document.getElementById('tycoon-popup');
    var boughtEl = document.getElementById('tycoon-bought');

    // Popup timers
    var popupTimer = 0;
    var boughtTimer = 0;

    // ---- Helper: check if player is on a pad ----
    function playerOnPad(px, pz, padSize) {
      var half = padSize / 2;
      var pos = NB.playerPos;
      return pos.x >= px - half && pos.x <= px + half &&
             pos.z >= pz - half && pos.z <= pz + half &&
             pos.y < 2.5;
    }

    // ---- Helper: format cash ----
    function formatCash(amount) {
      if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
      } else if (amount >= 10000) {
        return '$' + (amount / 1000).toFixed(1) + 'K';
      }
      return '$' + Math.floor(amount);
    }

    // ---- Helper: spawn factory building ----
    function spawnFactory(index) {
      var f = factories[index];
      var s = f.size;
      var group = new THREE.Group();
      group.position.set(f.x, 0, f.z);

      // Main building body
      var bodyW = 2 * s;
      var bodyH = 2.5 * s;
      var bodyD = 2 * s;
      var body = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW, bodyH, bodyD),
        NB.makeMat(f.color)
      );
      body.position.y = bodyH / 2;
      group.add(body);

      // Roof (darker shade)
      var roofColor = shadeColor(f.color, -0.3);
      var roof = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW + 0.4, 0.3, bodyD + 0.4),
        NB.makeMat(roofColor)
      );
      roof.position.y = bodyH + 0.15;
      group.add(roof);

      // Chimney
      var chimW = 0.5 * s;
      var chimH = 1.5 * s;
      var chimney = new THREE.Mesh(
        new THREE.BoxGeometry(chimW, chimH, chimW),
        NB.makeMat(0x7f8c8d)
      );
      chimney.position.set(bodyW * 0.25, bodyH + chimH / 2 + 0.15, -bodyD * 0.2);
      group.add(chimney);

      // Chimney cap
      var cap = new THREE.Mesh(
        new THREE.BoxGeometry(chimW + 0.2, 0.15, chimW + 0.2),
        NB.makeMat(0x5d6d7e)
      );
      cap.position.set(bodyW * 0.25, bodyH + chimH + 0.22, -bodyD * 0.2);
      group.add(cap);

      // Door
      var door = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * s, 1.2 * s, 0.05),
        NB.makeMat(0x5d4037)
      );
      door.position.set(0, 0.6 * s, bodyD / 2 + 0.03);
      group.add(door);

      // Windows (two small ones on front)
      var winMat = NB.makeMat(0x85c1e9);
      var winSize = 0.35 * s;
      var win1 = new THREE.Mesh(
        new THREE.BoxGeometry(winSize, winSize, 0.05),
        winMat
      );
      win1.position.set(-bodyW * 0.25, bodyH * 0.65, bodyD / 2 + 0.03);
      group.add(win1);

      var win2 = new THREE.Mesh(
        new THREE.BoxGeometry(winSize, winSize, 0.05),
        winMat
      );
      win2.position.set(bodyW * 0.25, bodyH * 0.65, bodyD / 2 + 0.03);
      group.add(win2);

      NB.addDecoration(group);
      factoryMeshes[index] = group;

      // Add smoke particles reference
      smokeParticles.push({
        x: f.x + bodyW * 0.25,
        baseY: bodyH + chimH + 0.5,
        z: f.z - bodyD * 0.2,
        particles: [],
        timer: 0
      });
    }

    // Helper: darken/lighten a hex color
    function shadeColor(color, percent) {
      var r = (color >> 16) & 0xFF;
      var g = (color >> 8) & 0xFF;
      var b = color & 0xFF;
      r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent))));
      g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent))));
      b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent))));
      return (r << 16) | (g << 8) | b;
    }

    // ---- Smoke particle system ----
    function spawnSmokeParticle(smoke) {
      var geo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 6, 4);
      var mat = new THREE.MeshBasicMaterial({
        color: 0xbdc3c7,
        transparent: true,
        opacity: 0.6
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        smoke.x + (Math.random() - 0.5) * 0.2,
        smoke.baseY,
        smoke.z + (Math.random() - 0.5) * 0.2
      );
      NB.addDecoration(mesh);
      smoke.particles.push({
        mesh: mesh,
        life: 0,
        maxLife: 1.5 + Math.random() * 1.0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.8 + Math.random() * 0.4,
        vz: (Math.random() - 0.5) * 0.3
      });
    }

    // ---- Glow animation state ----
    var glowTime = 0;
    var arrowBob = 0;

    // ---- Collect animation state ----
    var collectFlash = 0;

    // ---- Store reference for cleanup ----
    this._state = {
      factories: factories,
      factoryMeshes: factoryMeshes,
      smokeParticles: smokeParticles
    };

    // ================================================================
    // UPDATE
    // ================================================================
    this.update = function (dt) {
      var totalIncome = baseIncome + bonusIncome;

      // Accumulate income over time
      accumulated += totalIncome * dt;

      // Animate glow
      glowTime += dt;
      glowPlane.material.opacity = 0.15 + 0.1 * Math.sin(glowTime * 3);
      glowRing.material.opacity = 0.3 + 0.15 * Math.sin(glowTime * 2.5 + 1);

      // Bob the arrow
      arrowBob += dt;
      arrow.position.y = 1.5 + 0.3 * Math.sin(arrowBob * 2);
      arrow.rotation.y += dt * 1.5;

      // ---- Check collector pad ----
      var onCollector = playerOnPad(0, 0, 4);

      if (onCollector && accumulated >= 0.5) {
        var collected = Math.floor(accumulated);
        if (collected > 0) {
          cash += collected;
          accumulated -= collected;

          // Flash effect
          collectFlash = 0.3;

          // Show popup
          popupEl.textContent = '+$' + collected;
          popupEl.style.display = 'block';
          popupEl.style.opacity = '1';
          popupTimer = 1.0;
        }
      }

      // Show collect hint when there is accumulated income and player is not on pad
      if (accumulated >= 5 && !onCollector) {
        collectEl.style.display = 'block';
        collectEl.textContent = 'Collect $' + Math.floor(accumulated) + ' on the yellow pad!';
      } else {
        collectEl.style.display = 'none';
      }

      // Collect flash on pad
      if (collectFlash > 0) {
        collectFlash -= dt;
        glowPlane.material.opacity = 0.6;
      }

      // ---- Popup timer ----
      if (popupTimer > 0) {
        popupTimer -= dt;
        if (popupTimer <= 0.5) {
          popupEl.style.opacity = String(Math.max(0, popupTimer / 0.5));
        }
        if (popupTimer <= 0) {
          popupEl.style.display = 'none';
        }
      }

      // ---- Bought popup timer ----
      if (boughtTimer > 0) {
        boughtTimer -= dt;
        if (boughtTimer <= 0.5) {
          boughtEl.style.opacity = String(Math.max(0, boughtTimer / 0.5));
        }
        if (boughtTimer <= 0) {
          boughtEl.style.display = 'none';
        }
      }

      // ---- Check buy pads ----
      buyPromptVisible = false;
      activeBuyIndex = -1;

      for (var i = 0; i < factories.length; i++) {
        if (factories[i].bought) continue;

        var f = factories[i];
        var padSize = 3 + f.size * 0.5;

        if (playerOnPad(f.x, f.z, padSize)) {
          activeBuyIndex = i;
          buyPromptVisible = true;

          var canAfford = cash >= f.cost;
          if (canAfford) {
            buyPromptEl.innerHTML = 'Press <b style="color:#f1c40f">E</b> to buy <b>' +
              f.name + '</b> - <span style="color:#2ecc71">' + formatCash(f.cost) + '</span>';
            buyPromptEl.style.borderColor = 'rgba(46,204,113,0.6)';
          } else {
            buyPromptEl.innerHTML = '<span style="color:#e74c3c">' + f.name + '</span> - ' +
              formatCash(f.cost) + ' <span style="color:#e74c3c">(need ' +
              formatCash(f.cost - cash) + ' more)</span>';
            buyPromptEl.style.borderColor = 'rgba(231,76,60,0.6)';
          }
          break;
        }
      }

      // Show/hide buy prompt
      buyPromptEl.style.display = buyPromptVisible ? 'block' : 'none';

      // ---- Handle purchase (E key) ----
      if (activeBuyIndex >= 0 && NB.keys && NB.keys['KeyE']) {
        if (!justBought) {
          var bf = factories[activeBuyIndex];
          if (cash >= bf.cost) {
            // Purchase!
            cash -= bf.cost;
            bf.bought = true;
            bonusIncome += bf.income;
            justBought = true;

            // Remove buy pad by hiding it (move it far away underground)
            // We find the platform by tag
            var padTag = 'buy_' + activeBuyIndex;
            var platforms = NB.scene.children;
            for (var p = 0; p < platforms.length; p++) {
              if (platforms[p].userData && platforms[p].userData.tag === padTag) {
                platforms[p].position.y = -100;
                platforms[p].visible = false;
                break;
              }
            }

            // Spawn factory building
            spawnFactory(activeBuyIndex);

            // Show bought popup
            boughtEl.textContent = bf.name + ' purchased!';
            boughtEl.style.display = 'block';
            boughtEl.style.opacity = '1';
            boughtTimer = 2.0;

            // Hide buy prompt immediately
            buyPromptEl.style.display = 'none';
          }
        }
      } else {
        justBought = false;
      }

      // Prevent holding E from spamming
      if (justBought && !(NB.keys && NB.keys['KeyE'])) {
        justBought = false;
      }

      // ---- Animate smoke ----
      for (var si = 0; si < smokeParticles.length; si++) {
        var smoke = smokeParticles[si];
        smoke.timer += dt;

        // Spawn new particle every ~0.3s
        if (smoke.timer >= 0.3) {
          smoke.timer = 0;
          if (smoke.particles.length < 8) {
            spawnSmokeParticle(smoke);
          }
        }

        // Update existing particles
        for (var sp = smoke.particles.length - 1; sp >= 0; sp--) {
          var part = smoke.particles[sp];
          part.life += dt;

          if (part.life >= part.maxLife) {
            // Remove particle
            NB.scene.remove(part.mesh);
            if (part.mesh.geometry) part.mesh.geometry.dispose();
            if (part.mesh.material) part.mesh.material.dispose();
            smoke.particles.splice(sp, 1);
            continue;
          }

          var lifeRatio = part.life / part.maxLife;

          // Move upward and drift
          part.mesh.position.x += part.vx * dt;
          part.mesh.position.y += part.vy * dt;
          part.mesh.position.z += part.vz * dt;

          // Scale up as it rises
          var scale = 1 + lifeRatio * 1.5;
          part.mesh.scale.set(scale, scale, scale);

          // Fade out
          part.mesh.material.opacity = 0.6 * (1 - lifeRatio);
        }
      }

      // ---- Update UI ----
      cashEl.textContent = formatCash(cash);
      incomeEl.textContent = formatCash(totalIncome) + '/s';

      // Pulse cash text color intensity based on amount
      if (cash >= 10000) {
        cashEl.style.color = '#f1c40f';
        cashEl.style.textShadow = '0 0 20px rgba(241,196,15,0.7), 2px 2px 4px rgba(0,0,0,0.7)';
      } else if (cash >= 2000) {
        cashEl.style.color = '#3498db';
        cashEl.style.textShadow = '0 0 14px rgba(52,152,219,0.5), 2px 2px 4px rgba(0,0,0,0.7)';
      } else {
        cashEl.style.color = '#2ecc71';
        cashEl.style.textShadow = '0 0 12px rgba(46,204,113,0.5), 2px 2px 4px rgba(0,0,0,0.7)';
      }
    };
  },

  update: function (dt) {
    // On first call, init() has already replaced this.update with
    // the closure-based version, so this stub only runs if init
    // somehow didn't set it. The framework calls this.update(dt)
    // each frame, which after init() points to the closure function.
  },

  cleanup: function () {
    NB.removeGameUI();

    // Clean up smoke particles
    if (this._state && this._state.smokeParticles) {
      var smokes = this._state.smokeParticles;
      for (var si = 0; si < smokes.length; si++) {
        var smoke = smokes[si];
        for (var sp = 0; sp < smoke.particles.length; sp++) {
          var part = smoke.particles[sp];
          NB.scene.remove(part.mesh);
          if (part.mesh.geometry) part.mesh.geometry.dispose();
          if (part.mesh.material) part.mesh.material.dispose();
        }
      }
    }
  }
});
