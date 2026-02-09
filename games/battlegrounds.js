NB.registerGame('battlegrounds', {

  _enemies: [],
  _projectiles: [],
  _state: null,
  _uiContainer: null,
  _shootCooldown: 0,
  _invulnTimer: 0,
  _waveMessageTimer: 0,
  _gameOver: false,
  _clickHandler: null,
  _keyHandler: null,

  init: function () {
    var self = this;
    var scene = NB.scene;

    // ---------------------------------------------------------------
    // Reset arrays
    // ---------------------------------------------------------------
    this._enemies = [];
    this._projectiles = [];
    this._shootCooldown = 0;
    this._invulnTimer = 0;
    this._waveMessageTimer = 0;
    this._gameOver = false;

    // ---------------------------------------------------------------
    // Game state
    // ---------------------------------------------------------------
    this._state = {
      health: 100,
      points: 0,
      kills: 0,
      wave: 1,
      enemiesAlive: 0,
      enemiesSpawned: 0,
      enemiesPerWave: 3,
      waveActive: false,
      baseEnemySpeed: 4
    };

    // ---------------------------------------------------------------
    // Arena atmosphere - darker, moodier
    // ---------------------------------------------------------------
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 60, 200);

    // ---------------------------------------------------------------
    // ARENA GROUND
    // ---------------------------------------------------------------
    NB.addPlatform(0, -0.5, 0, 80, 1, 80, 0x666666, 'arena');

    // ---------------------------------------------------------------
    // PERIMETER WALLS
    // ---------------------------------------------------------------
    var wallH = 8;
    var wallColor = 0x555555;
    // North wall
    NB.addPlatform(0, wallH / 2 - 0.5, -41, 84, wallH, 2, wallColor);
    // South wall
    NB.addPlatform(0, wallH / 2 - 0.5, 41, 84, wallH, 2, wallColor);
    // East wall
    NB.addPlatform(41, wallH / 2 - 0.5, 0, 2, wallH, 84, wallColor);
    // West wall
    NB.addPlatform(-41, wallH / 2 - 0.5, 0, 2, wallH, 84, wallColor);

    // Wall top trim (slightly lighter)
    NB.addPlatform(0, wallH - 0.5, -41, 84, 0.5, 2.4, 0x777777);
    NB.addPlatform(0, wallH - 0.5, 41, 84, 0.5, 2.4, 0x777777);
    NB.addPlatform(41, wallH - 0.5, 0, 2.4, 0.5, 84, 0x777777);
    NB.addPlatform(-41, wallH - 0.5, 0, 2.4, 0.5, 84, 0x777777);

    // ---------------------------------------------------------------
    // CENTRAL RAISED PLATFORM
    // ---------------------------------------------------------------
    NB.addPlatform(0, 1, 0, 10, 2, 10, 0x888888);
    // Ramp to central platform (south side)
    var rampGeo = new THREE.BoxGeometry(4, 0.4, 6);
    var rampMat = NB.makeMat(0x777777);
    var ramp1 = new THREE.Mesh(rampGeo, rampMat);
    ramp1.position.set(0, 0.5, 7.5);
    ramp1.rotation.x = Math.atan2(2, 6);
    NB.addDecoration(ramp1);
    // Ramp north side
    var ramp2 = new THREE.Mesh(rampGeo, rampMat);
    ramp2.position.set(0, 0.5, -7.5);
    ramp2.rotation.x = -Math.atan2(2, 6);
    NB.addDecoration(ramp2);

    // ---------------------------------------------------------------
    // LARGE CRATE BARRIERS (8 total) - brown/tan
    // ---------------------------------------------------------------
    var cratePositions = [
      { x: -20, z: -20, color: 0x8B6914 },
      { x: 20, z: -20, color: 0x9B7928 },
      { x: -20, z: 20, color: 0x9B7928 },
      { x: 20, z: 20, color: 0x8B6914 },
      { x: -12, z: 5, color: 0xA08030 },
      { x: 12, z: -5, color: 0xA08030 },
      { x: 5, z: -25, color: 0x8B6914 },
      { x: -5, z: 25, color: 0x9B7928 }
    ];

    for (var i = 0; i < cratePositions.length; i++) {
      var cp = cratePositions[i];
      NB.addPlatform(cp.x, 1.5, cp.z, 4, 3, 4, cp.color);
    }

    // ---------------------------------------------------------------
    // TALL PILLARS (4 total) - concrete gray
    // ---------------------------------------------------------------
    var pillarPositions = [
      { x: -30, z: 0 },
      { x: 30, z: 0 },
      { x: 0, z: -30 },
      { x: 0, z: 30 }
    ];

    for (var i = 0; i < pillarPositions.length; i++) {
      var pp = pillarPositions[i];
      NB.addPlatform(pp.x, 3, pp.z, 2, 6, 2, 0x777777);
    }

    // ---------------------------------------------------------------
    // RAISED PLATFORMS WITH RAMPS (2 total)
    // ---------------------------------------------------------------
    // East raised platform
    NB.addPlatform(25, 1.5, -15, 8, 2, 8, 0x707070);
    // Ramp for east platform
    var rampGeo2 = new THREE.BoxGeometry(3, 0.4, 5);
    var rampMat2 = NB.makeMat(0x606060);
    var rampE = new THREE.Mesh(rampGeo2, rampMat2);
    rampE.position.set(25, 0.5, -10.5);
    rampE.rotation.x = -Math.atan2(2, 5);
    NB.addDecoration(rampE);

    // West raised platform
    NB.addPlatform(-25, 1.5, 15, 8, 2, 8, 0x707070);
    // Ramp for west platform
    var rampW = new THREE.Mesh(rampGeo2, rampMat2);
    rampW.position.set(-25, 0.5, 10.5);
    rampW.rotation.x = Math.atan2(2, 5);
    NB.addDecoration(rampW);

    // ---------------------------------------------------------------
    // LOW WALLS (for crouching behind)
    // ---------------------------------------------------------------
    NB.addPlatform(-15, 1, -12, 6, 2, 1, 0x888888);
    NB.addPlatform(15, 1, 12, 6, 2, 1, 0x888888);
    NB.addPlatform(8, 1, -18, 1, 2, 6, 0x888888);
    NB.addPlatform(-8, 1, 18, 1, 2, 6, 0x888888);

    // ---------------------------------------------------------------
    // Extra decoration: floor markings (thin dark lines on arena)
    // ---------------------------------------------------------------
    var lineColor = 0x555555;
    for (var i = -3; i <= 3; i++) {
      if (i === 0) continue;
      var lineGeo = new THREE.BoxGeometry(80, 0.02, 0.15);
      var lineMat = NB.makeMat(lineColor);
      var lineH = new THREE.Mesh(lineGeo, lineMat);
      lineH.position.set(0, 0.01, i * 10);
      NB.addDecoration(lineH);
      var lineV = new THREE.Mesh(lineGeo, lineMat);
      lineV.rotation.y = Math.PI / 2;
      lineV.position.set(i * 10, 0.01, 0);
      NB.addDecoration(lineV);
    }

    // ---------------------------------------------------------------
    // GAME UI
    // ---------------------------------------------------------------
    this._uiContainer = NB.addGameUI(
      // Crosshair (center)
      '<div id="shooter-crosshair" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;">' +
        '<div style="position:absolute;width:20px;height:2px;background:rgba(255,255,255,0.85);left:50%;top:50%;transform:translate(-50%,-50%);"></div>' +
        '<div style="position:absolute;width:2px;height:20px;background:rgba(255,255,255,0.85);left:50%;top:50%;transform:translate(-50%,-50%);"></div>' +
      '</div>' +
      // Wave indicator (top center)
      '<div id="shooter-wave" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:22px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.7);pointer-events:none;">Wave 1</div>' +
      // Health bar (top left)
      '<div id="shooter-health-container" style="position:absolute;top:12px;left:16px;pointer-events:none;">' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:3px;font-weight:600;">HEALTH</div>' +
        '<div style="width:180px;height:14px;background:rgba(0,0,0,0.6);border-radius:7px;overflow:hidden;border:1px solid rgba(255,255,255,0.15);">' +
          '<div id="shooter-health-bar" style="width:100%;height:100%;background:linear-gradient(90deg,#e74c3c,#ff6b6b);border-radius:7px;transition:width 0.3s;"></div>' +
        '</div>' +
        '<div id="shooter-health-text" style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">100 / 100</div>' +
      '</div>' +
      // Points / Kills (top right)
      '<div id="shooter-stats" style="position:absolute;top:12px;right:16px;font-size:14px;font-weight:600;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,0.6);text-align:right;pointer-events:none;">' +
        '<div id="shooter-points">Points: 0</div>' +
        '<div id="shooter-kills" style="font-size:12px;color:rgba(255,255,255,0.7);">Kills: 0</div>' +
      '</div>' +
      // Wave complete message
      '<div id="shooter-wave-msg" style="position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);font-size:32px;font-weight:700;color:#ffd700;text-shadow:0 3px 12px rgba(0,0,0,0.8);pointer-events:none;display:none;">Wave Complete!</div>' +
      // Game over overlay
      '<div id="shooter-gameover" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);display:none;align-items:center;justify-content:center;flex-direction:column;pointer-events:none;">' +
        '<div style="font-size:48px;font-weight:700;color:#e74c3c;text-shadow:0 4px 16px rgba(0,0,0,0.8);margin-bottom:12px;">GAME OVER</div>' +
        '<div id="shooter-final-stats" style="font-size:18px;color:#fff;margin-bottom:20px;"></div>' +
        '<div style="font-size:16px;color:rgba(255,255,255,0.6);">Press R to restart</div>' +
      '</div>'
    );

    // ---------------------------------------------------------------
    // Start first wave
    // ---------------------------------------------------------------
    this._startWave();

    // ---------------------------------------------------------------
    // Shoot on click
    // ---------------------------------------------------------------
    this._clickHandler = function (e) {
      if (self._gameOver) return;
      // Only shoot on left click (button 0), not right click (button 2)
      if (e.button === 0) {
        self._shoot();
      }
    };
    document.addEventListener('mousedown', this._clickHandler);

    // ---------------------------------------------------------------
    // Restart on R
    // ---------------------------------------------------------------
    this._keyHandler = function (e) {
      if (e.code === 'KeyR' && self._gameOver) {
        self._restart();
      }
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  // =================================================================
  // Start a wave
  // =================================================================
  _startWave: function () {
    var state = this._state;
    if (!state) return;
    state.enemiesPerWave = 1 + state.wave * 2; // wave 1=3, wave 2=5, wave 3=7...
    state.enemiesSpawned = 0;
    state.enemiesAlive = 0;
    state.waveActive = true;

    // Spawn initial batch
    var initialSpawn = Math.min(state.enemiesPerWave, 3 + state.wave);
    for (var i = 0; i < initialSpawn; i++) {
      this._spawnEnemy();
    }

    // Update wave UI
    var waveEl = document.getElementById('shooter-wave');
    if (waveEl) waveEl.textContent = 'Wave ' + state.wave;
  },

  // =================================================================
  // Spawn an enemy at a random arena edge
  // =================================================================
  _spawnEnemy: function () {
    var state = this._state;
    if (!state) return;
    if (state.enemiesSpawned >= state.enemiesPerWave) return;

    var scene = NB.scene;

    // Pick random edge
    var side = Math.floor(Math.random() * 4);
    var x, z;
    switch (side) {
      case 0: x = -38 + Math.random() * 76; z = -38; break; // north
      case 1: x = -38 + Math.random() * 76; z = 38; break;  // south
      case 2: x = -38; z = -38 + Math.random() * 76; break;  // west
      case 3: x = 38; z = -38 + Math.random() * 76; break;   // east
    }

    // Enemy group
    var group = new THREE.Group();
    group.position.set(x, 0, z);

    // Body (red box 1.5 x 2.5 x 1)
    var bodyGeo = new THREE.BoxGeometry(1.5, 2.5, 1);
    var bodyMat = NB.makeMat(0xcc2222);
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.25;
    group.add(body);

    // Head (1 x 1 x 1 on top)
    var headGeo = new THREE.BoxGeometry(1, 1, 1);
    var headMat = NB.makeMat(0xdd3333);
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3;
    group.add(head);

    // Eyes (small dark squares)
    var eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    var eyeMat = NB.makeMat(0x111111);
    var eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.25, 3.1, 0.51);
    group.add(eyeL);
    var eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.25, 3.1, 0.51);
    group.add(eyeR);

    scene.add(group);

    // Speed increases slightly each wave
    var speed = state.baseEnemySpeed + (state.wave - 1) * 0.5 + Math.random() * 2;

    var enemy = {
      group: group,
      body: body,
      head: head,
      hp: 3,
      speed: speed,
      flashTimer: 0,
      originalBodyColor: 0xcc2222,
      originalHeadColor: 0xdd3333
    };

    this._enemies.push(enemy);
    state.enemiesSpawned++;
    state.enemiesAlive++;
  },

  // =================================================================
  // Shoot projectile
  // =================================================================
  _shoot: function () {
    if (this._shootCooldown > 0) return;

    var scene = NB.scene;
    this._shootCooldown = 0.3;

    // Calculate forward direction from camera yaw
    var yaw = NB.cameraYaw || 0;
    var dirX = -Math.sin(yaw);
    var dirZ = -Math.cos(yaw);

    // Spawn position: slightly in front of player at chest height
    var px = NB.playerPos.x + dirX * 1.5;
    var py = NB.playerPos.y + 2.0;
    var pz = NB.playerPos.z + dirZ * 1.5;

    // Projectile mesh
    var projGeo = new THREE.SphereGeometry(0.2, 8, 6);
    var projMat = NB.makeMat(0xffdd00);
    var projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.set(px, py, pz);
    scene.add(projMesh);

    // Velocity
    var speed = 50;
    var vel = new THREE.Vector3(dirX * speed, 0, dirZ * speed);

    this._projectiles.push({
      mesh: projMesh,
      velocity: vel,
      age: 0
    });
  },

  // =================================================================
  // Restart game
  // =================================================================
  _restart: function () {
    var state = this._state;
    if (!state) return;
    var scene = NB.scene;

    // Remove all enemies
    for (var i = 0; i < this._enemies.length; i++) {
      scene.remove(this._enemies[i].group);
    }
    this._enemies.length = 0;

    // Remove all projectiles
    for (var i = 0; i < this._projectiles.length; i++) {
      scene.remove(this._projectiles[i].mesh);
    }
    this._projectiles.length = 0;

    // Reset state
    state.health = 100;
    state.points = 0;
    state.kills = 0;
    state.wave = 1;
    state.enemiesAlive = 0;
    state.enemiesSpawned = 0;
    state.baseEnemySpeed = 4;

    this._shootCooldown = 0;
    this._invulnTimer = 0;
    this._waveMessageTimer = 0;
    this._gameOver = false;

    // Reset UI
    this._updateUI();
    var goEl = document.getElementById('shooter-gameover');
    if (goEl) goEl.style.display = 'none';
    var wmEl = document.getElementById('shooter-wave-msg');
    if (wmEl) wmEl.style.display = 'none';

    // Move player back to center
    if (NB.playerGroup) {
      NB.playerGroup.position.set(0, 3, 0);
    }

    // Start wave
    this._startWave();
  },

  // =================================================================
  // Update UI elements
  // =================================================================
  _updateUI: function () {
    var state = this._state;
    if (!state) return;

    var healthBar = document.getElementById('shooter-health-bar');
    if (healthBar) {
      var pct = Math.max(0, state.health);
      healthBar.style.width = pct + '%';
    }

    var healthText = document.getElementById('shooter-health-text');
    if (healthText) healthText.textContent = Math.max(0, state.health) + ' / 100';

    var pointsEl = document.getElementById('shooter-points');
    if (pointsEl) pointsEl.textContent = 'Points: ' + state.points;

    var killsEl = document.getElementById('shooter-kills');
    if (killsEl) killsEl.textContent = 'Kills: ' + state.kills;
  },

  // =================================================================
  // UPDATE (called each frame)
  // =================================================================
  update: function (dt) {
    if (this._gameOver) return;
    if (!this._state) return;

    var state = this._state;
    var scene = NB.scene;
    var playerPos = NB.playerPos;

    // Clamp dt to prevent physics explosions on tab-out
    if (dt > 0.1) dt = 0.1;

    // Reduce cooldowns
    if (this._shootCooldown > 0) this._shootCooldown -= dt;
    if (this._invulnTimer > 0) this._invulnTimer -= dt;

    // Wave complete message timer
    if (this._waveMessageTimer > 0) {
      this._waveMessageTimer -= dt;
      if (this._waveMessageTimer <= 0) {
        var wmEl = document.getElementById('shooter-wave-msg');
        if (wmEl) wmEl.style.display = 'none';
      }
    }

    // ---------------------------------------------------------------
    // Update enemies
    // ---------------------------------------------------------------
    for (var i = this._enemies.length - 1; i >= 0; i--) {
      var enemy = this._enemies[i];

      // Flash timer (hit feedback)
      if (enemy.flashTimer > 0) {
        enemy.flashTimer -= dt;
        if (enemy.flashTimer <= 0) {
          // Restore original colors
          enemy.body.material = NB.makeMat(enemy.originalBodyColor);
          enemy.head.material = NB.makeMat(enemy.originalHeadColor);
        }
      }

      // Move toward player
      var ex = enemy.group.position.x;
      var ez = enemy.group.position.z;
      var dx = playerPos.x - ex;
      var dz = playerPos.z - ez;
      var dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.5) {
        var nx = dx / dist;
        var nz = dz / dist;
        enemy.group.position.x += nx * enemy.speed * dt;
        enemy.group.position.z += nz * enemy.speed * dt;

        // Face the player
        enemy.group.rotation.y = Math.atan2(nx, nz);
      }

      // Melee damage if close
      if (dist < 2 && this._invulnTimer <= 0) {
        state.health -= 10;
        this._invulnTimer = 1.0;
        this._updateUI();

        // Check death
        if (state.health <= 0) {
          this._gameOver = true;
          var goEl = document.getElementById('shooter-gameover');
          if (goEl) {
            goEl.style.display = 'flex';
            var statsEl = document.getElementById('shooter-final-stats');
            if (statsEl) {
              statsEl.textContent = 'Wave ' + state.wave + '  |  Kills: ' + state.kills + '  |  Points: ' + state.points;
            }
          }
          return;
        }
      }
    }

    // ---------------------------------------------------------------
    // Update projectiles
    // ---------------------------------------------------------------
    for (var i = this._projectiles.length - 1; i >= 0; i--) {
      var proj = this._projectiles[i];
      proj.age += dt;

      // Remove if expired
      if (proj.age > 2) {
        scene.remove(proj.mesh);
        this._projectiles.splice(i, 1);
        continue;
      }

      // Move
      proj.mesh.position.x += proj.velocity.x * dt;
      proj.mesh.position.y += proj.velocity.y * dt;
      proj.mesh.position.z += proj.velocity.z * dt;

      // Check collision with enemies
      var hit = false;
      for (var j = this._enemies.length - 1; j >= 0; j--) {
        var enemy = this._enemies[j];
        var epx = enemy.group.position.x;
        var epy = enemy.group.position.y + 1.5; // center of body
        var epz = enemy.group.position.z;
        var ppx = proj.mesh.position.x;
        var ppy = proj.mesh.position.y;
        var ppz = proj.mesh.position.z;

        var ddx = ppx - epx;
        var ddy = ppy - epy;
        var ddz = ppz - epz;
        var hitDist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);

        if (hitDist < 1.5) {
          // Hit!
          hit = true;
          enemy.hp -= 1;

          // Flash white
          enemy.body.material = NB.makeMat(0xffffff);
          enemy.head.material = NB.makeMat(0xffffff);
          enemy.flashTimer = 0.12;

          if (enemy.hp <= 0) {
            // Kill enemy
            scene.remove(enemy.group);
            this._enemies.splice(j, 1);
            state.enemiesAlive--;
            state.kills++;
            state.points += 100;

            // Chance to spawn replacement if wave not done
            if (state.enemiesSpawned < state.enemiesPerWave) {
              this._spawnEnemy();
            }
          }

          this._updateUI();
          break;
        }
      }

      if (hit) {
        scene.remove(proj.mesh);
        this._projectiles.splice(i, 1);
      }
    }

    // ---------------------------------------------------------------
    // Check wave completion
    // ---------------------------------------------------------------
    if (state.waveActive && state.enemiesAlive <= 0 && state.enemiesSpawned >= state.enemiesPerWave) {
      state.waveActive = false;
      state.wave++;
      state.points += 500; // wave clear bonus

      // Show wave complete message
      var wmEl = document.getElementById('shooter-wave-msg');
      if (wmEl) {
        wmEl.style.display = 'block';
        wmEl.textContent = 'Wave ' + (state.wave - 1) + ' Complete!';
      }
      this._waveMessageTimer = 2.0;

      this._updateUI();

      // Start next wave after a brief delay
      var self = this;
      this._waveTimeout = setTimeout(function () {
        if (!self._gameOver && self._state) {
          self._startWave();
        }
      }, 2000);
    }
  },

  // =================================================================
  // CLEANUP
  // =================================================================
  cleanup: function () {
    var scene = NB.scene;

    // Cancel any pending wave timeout
    if (this._waveTimeout) {
      clearTimeout(this._waveTimeout);
      this._waveTimeout = null;
    }

    // Remove enemies
    if (scene) {
      for (var i = 0; i < this._enemies.length; i++) {
        scene.remove(this._enemies[i].group);
      }
    }
    this._enemies.length = 0;

    // Remove projectiles
    if (scene) {
      for (var i = 0; i < this._projectiles.length; i++) {
        scene.remove(this._projectiles[i].mesh);
      }
    }
    this._projectiles.length = 0;

    // Remove event listeners
    if (this._clickHandler) {
      document.removeEventListener('mousedown', this._clickHandler);
      this._clickHandler = null;
    }
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }

    // Reset state
    this._state = null;
    this._gameOver = true;

    // Remove game UI
    NB.removeGameUI();
  }

});
