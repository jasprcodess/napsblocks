// Speed Racing - An arcade car racing game for NapsBlocks
// Drive around an oval track, beat your best lap time!

NB.registerGame('racing', {

  _carGroup: null,
  _wheels: [],
  _inCar: false,
  _carSpeed: 0,
  _carAngle: 0,
  _carX: 0,
  _carY: 0.6,
  _carZ: 0,
  _checkpoints: [],
  _checkpointsPassed: [],
  _lapCount: 0,
  _lapTimer: 0,
  _bestLap: -1,
  _timerRunning: false,
  _uiContainer: null,
  _eWasDown: false,
  _camX: 0,
  _camY: 10,
  _camZ: 15,

  init: function () {
    var self = this;
    var scene = NB.scene;

    // Reset state
    self._inCar = false;
    self._carSpeed = 0;
    self._carAngle = 0;
    self._carX = 0;
    self._carY = 0.6;
    self._carZ = 5;
    self._wheels = [];
    self._checkpointsPassed = [false, false, false, false];
    self._lapCount = 0;
    self._lapTimer = 0;
    self._bestLap = -1;
    self._timerRunning = false;
    self._eWasDown = false;

    // ---------------------------------------------------------------
    // Large flat ground - grass
    // ---------------------------------------------------------------
    NB.addPlatform(0, -0.5, 0, 200, 1, 200, 0x5dbd5d, 'ground');

    // ---------------------------------------------------------------
    // TRACK LAYOUT - Oval circuit
    // The track is an oval: two long straights and two curved ends.
    // Center of track at (0, 0, 0). Track dimensions roughly:
    //   Long straights along Z axis, curves at +Z and -Z ends
    //   Half-length along Z: 40, Half-width along X: 25
    // ---------------------------------------------------------------

    var trackColor = 0x444444;
    var trackH = 0.3;
    var trackW = 12;
    var curbColorA = 0xff0000;
    var curbColorB = 0xffffff;
    var curbW = 0.6;
    var curbH = 0.35;

    // Helper: add a road segment + curbs
    function addRoadSegment(x, z, w, d, angle) {
      var road = NB.addPlatform(x, 0.15, z, w, trackH, d, trackColor, 'road');
      if (angle) {
        road.rotation.y = angle;
      }
      return road;
    }

    // Helper: add curb pair on both sides of a segment
    function addCurbs(x, z, length, angle, offset) {
      offset = offset || (trackW / 2 + curbW / 2);
      // We'll place curbs as thin platforms
      for (var side = -1; side <= 1; side += 2) {
        var segments = Math.floor(length / 3);
        for (var i = 0; i < segments; i++) {
          var color = (i % 2 === 0) ? curbColorA : curbColorB;
          var localZ = -length / 2 + i * 3 + 1.5;
          var cx, cz;
          if (angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            cx = x + sin * localZ + cos * side * offset;
            cz = z + cos * localZ - sin * side * offset;
          } else {
            cx = x + side * offset;
            cz = z + localZ;
          }
          var curb = NB.addPlatform(cx, 0.18, cz, curbW, curbH, 2.8, color);
          if (angle) {
            curb.rotation.y = angle;
          }
        }
      }
    }

    // ---------------------------------------------------------------
    // Build the oval track from segments
    // ---------------------------------------------------------------

    // Track parameters
    var straightLen = 60;
    var curveRadius = 25;
    var curveSegments = 8;

    // RIGHT STRAIGHT (going -Z direction, at x = curveRadius)
    addRoadSegment(curveRadius, 0, trackW, straightLen, 0);
    addCurbs(curveRadius, 0, straightLen, 0);

    // LEFT STRAIGHT (going +Z direction, at x = -curveRadius)
    addRoadSegment(-curveRadius, 0, trackW, straightLen, 0);
    addCurbs(-curveRadius, 0, straightLen, 0);

    // TOP CURVE (at z = -straightLen/2, curving from right straight to left straight)
    var topCenterZ = -straightLen / 2;
    for (var i = 0; i < curveSegments; i++) {
      var a1 = (Math.PI / curveSegments) * i - Math.PI / 2;
      var a2 = (Math.PI / curveSegments) * (i + 1) - Math.PI / 2;
      var midA = (a1 + a2) / 2;
      var sx = Math.cos(midA) * curveRadius;
      var sz = topCenterZ + Math.sin(midA) * curveRadius;
      var segAngle = midA + Math.PI / 2;
      var segLen = (2 * Math.PI * curveRadius) / curveSegments;
      addRoadSegment(sx, sz, trackW, segLen + 1, segAngle);

      // Curbs on curve
      for (var side = -1; side <= 1; side += 2) {
        var curbRadius = curveRadius + side * (trackW / 2 + curbW / 2);
        var cbx = Math.cos(midA) * curbRadius;
        var cbz = topCenterZ + Math.sin(midA) * curbRadius;
        var curbColor = (i % 2 === 0) ? curbColorA : curbColorB;
        var curb = NB.addPlatform(cbx, 0.18, cbz, curbW, curbH, segLen * 0.9, curbColor);
        curb.rotation.y = segAngle;
      }
    }

    // BOTTOM CURVE (at z = +straightLen/2, curving from left straight to right straight)
    var botCenterZ = straightLen / 2;
    for (var i = 0; i < curveSegments; i++) {
      var a1 = (Math.PI / curveSegments) * i + Math.PI / 2;
      var a2 = (Math.PI / curveSegments) * (i + 1) + Math.PI / 2;
      var midA = (a1 + a2) / 2;
      var sx = Math.cos(midA) * curveRadius;
      var sz = botCenterZ + Math.sin(midA) * curveRadius;
      var segAngle = midA + Math.PI / 2;
      var segLen = (2 * Math.PI * curveRadius) / curveSegments;
      addRoadSegment(sx, sz, trackW, segLen + 1, segAngle);

      // Curbs on curve
      for (var side = -1; side <= 1; side += 2) {
        var curbRadius = curveRadius + side * (trackW / 2 + curbW / 2);
        var cbx = Math.cos(midA) * curbRadius;
        var cbz = botCenterZ + Math.sin(midA) * curbRadius;
        var curbColor = (i % 2 === 0) ? curbColorA : curbColorB;
        var curb = NB.addPlatform(cbx, 0.18, cbz, curbW, curbH, segLen * 0.9, curbColor);
        curb.rotation.y = segAngle;
      }
    }

    // ---------------------------------------------------------------
    // Start/Finish line
    // ---------------------------------------------------------------
    // White line across the right straight at z = 0
    NB.addPlatform(curveRadius, 0.32, 0, trackW, 0.05, 1.5, 0xffffff);

    // Checkered pattern on start line
    for (var ci = 0; ci < 6; ci++) {
      var checkColor = (ci % 2 === 0) ? 0x111111 : 0xffffff;
      NB.addPlatform(curveRadius - 5 + ci * 2, 0.34, 0, 1.8, 0.05, 1, checkColor);
    }

    // Start/finish banner - two poles + crossbar
    var poleGeo = new THREE.CylinderGeometry(0.25, 0.25, 8, 8);
    var poleMat = NB.makeMat(0xcccccc);
    var pole1 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(curveRadius - trackW / 2 - 1, 4, 0);
    NB.addDecoration(pole1);

    var pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole2.position.set(curveRadius + trackW / 2 + 1, 4, 0);
    NB.addDecoration(pole2);

    var bannerGeo = new THREE.BoxGeometry(trackW + 4, 1.5, 0.3);
    var bannerMat = NB.makeMat(0x222222);
    var banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(curveRadius, 7.5, 0);
    NB.addDecoration(banner);

    // Checkered flag pattern on banner
    for (var bx = 0; bx < 8; bx++) {
      for (var by = 0; by < 2; by++) {
        var bcolor = ((bx + by) % 2 === 0) ? 0xffffff : 0x111111;
        var bsq = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.7, 0.35),
          NB.makeMat(bcolor)
        );
        bsq.position.set(curveRadius - 3.5 + bx * 1, 7.15 + by * 0.7, 0);
        NB.addDecoration(bsq);
      }
    }

    // ---------------------------------------------------------------
    // Checkpoint zones (invisible triggers) at 4 points around track
    // ---------------------------------------------------------------
    // Checkpoint 0: Start/finish (right straight, z=0) - crossed when passing start
    // Checkpoint 1: Top curve center (x=0, z=-topCenterZ - curveRadius)
    // Checkpoint 2: Left straight midpoint (x=-curveRadius, z=0)
    // Checkpoint 3: Bottom curve center (x=0, z=botCenterZ + curveRadius)
    self._checkpoints = [
      { x: curveRadius, z: 5, radius: 10 },
      { x: 0, z: -straightLen / 2 - curveRadius, radius: 12 },
      { x: -curveRadius, z: 0, radius: 10 },
      { x: 0, z: straightLen / 2 + curveRadius, radius: 12 }
    ];

    // ---------------------------------------------------------------
    // CAR - built from Three.js boxes
    // ---------------------------------------------------------------
    var carGroup = new THREE.Group();

    // Body
    var bodyGeo = new THREE.BoxGeometry(2.5, 1, 5);
    var bodyMat = NB.makeMat(0x2196F3);
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    carGroup.add(body);

    // Roof/cabin
    var roofGeo = new THREE.BoxGeometry(2, 0.8, 2.5);
    var roofMat = NB.makeMat(0x1565C0);
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.7, -0.3);
    carGroup.add(roof);

    // Windows (front and back of cabin)
    var winMat = NB.makeMat(0x90CAF9);
    var frontWin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.1), winMat);
    frontWin.position.set(0, 1.7, 0.95);
    carGroup.add(frontWin);

    var backWin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.1), winMat);
    backWin.position.set(0, 1.7, -1.55);
    carGroup.add(backWin);

    // Headlights
    var lightMat = NB.makeMat(0xffff00);
    var hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), lightMat);
    hl1.position.set(-0.8, 0.7, 2.55);
    carGroup.add(hl1);

    var hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), lightMat);
    hl2.position.set(0.8, 0.7, 2.55);
    carGroup.add(hl2);

    // Tail lights
    var tailMat = NB.makeMat(0xff0000);
    var tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailMat);
    tl1.position.set(-0.8, 0.7, -2.55);
    carGroup.add(tl1);

    var tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailMat);
    tl2.position.set(0.8, 0.7, -2.55);
    carGroup.add(tl2);

    // Wheels
    var wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    var wheelMat = NB.makeMat(0x222222);
    var wheelPositions = [
      { x: -1.3, y: 0.4, z: 1.5 },
      { x: 1.3, y: 0.4, z: 1.5 },
      { x: -1.3, y: 0.4, z: -1.5 },
      { x: 1.3, y: 0.4, z: -1.5 }
    ];

    var wheels = [];
    for (var wi = 0; wi < wheelPositions.length; wi++) {
      var wp = wheelPositions[wi];
      var wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wp.x, wp.y, wp.z);
      wheel.rotation.z = Math.PI / 2;
      carGroup.add(wheel);
      wheels.push(wheel);
    }

    // Spoiler on the back
    var spoilerBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.6, 0.15),
      NB.makeMat(0x1565C0)
    );
    spoilerBase.position.set(-0.8, 1.6, -2.2);
    carGroup.add(spoilerBase);

    var spoilerBase2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.6, 0.15),
      NB.makeMat(0x1565C0)
    );
    spoilerBase2.position.set(0.8, 1.6, -2.2);
    carGroup.add(spoilerBase2);

    var spoilerWing = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 0.8),
      NB.makeMat(0x1565C0)
    );
    spoilerWing.position.set(0, 1.95, -2.2);
    carGroup.add(spoilerWing);

    // Place car at start line
    self._carX = curveRadius;
    self._carZ = 5;
    self._carAngle = 0;
    carGroup.position.set(self._carX, self._carY, self._carZ);

    scene.add(carGroup);
    self._carGroup = carGroup;
    self._wheels = wheels;

    // ---------------------------------------------------------------
    // DECORATIONS - Buildings around the outside
    // ---------------------------------------------------------------
    var buildingConfigs = [
      // Outside right straight
      { x: curveRadius + 15, z: -20, w: 6, h: 12, d: 6, color: 0x7f8c8d },
      { x: curveRadius + 18, z: -5, w: 8, h: 8, d: 5, color: 0x95a5a6 },
      { x: curveRadius + 14, z: 15, w: 5, h: 15, d: 5, color: 0x5d6d7e },
      { x: curveRadius + 20, z: 25, w: 7, h: 6, d: 8, color: 0xbdc3c7 },
      // Outside left straight
      { x: -curveRadius - 15, z: -15, w: 6, h: 10, d: 6, color: 0x839192 },
      { x: -curveRadius - 18, z: 5, w: 7, h: 14, d: 7, color: 0x616a6b },
      { x: -curveRadius - 14, z: 20, w: 5, h: 7, d: 5, color: 0xaab7b8 },
      // Inner area buildings
      { x: -5, z: -10, w: 4, h: 5, d: 4, color: 0x3498db },
      { x: 8, z: 10, w: 5, h: 7, d: 5, color: 0x2ecc71 },
      { x: -8, z: 15, w: 6, h: 4, d: 3, color: 0xe74c3c },
      { x: 5, z: -15, w: 3, h: 6, d: 3, color: 0x9b59b6 },
      // Far outside on curves
      { x: 5, z: -straightLen / 2 - curveRadius - 15, w: 8, h: 10, d: 6, color: 0x7f8c8d },
      { x: -8, z: straightLen / 2 + curveRadius + 15, w: 6, h: 12, d: 8, color: 0x5d6d7e }
    ];

    for (var bi = 0; bi < buildingConfigs.length; bi++) {
      var b = buildingConfigs[bi];
      var bldgGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      var bldgMat = NB.makeMat(b.color);
      var bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(b.x, b.h / 2, b.z);
      NB.addDecoration(bldg);

      // Add windows to buildings
      var winRows = Math.floor(b.h / 2.5);
      var winCols = Math.max(1, Math.floor(b.w / 2));
      var windowMat = NB.makeMat(0xf7dc6f);
      for (var wr = 0; wr < winRows; wr++) {
        for (var wc = 0; wc < winCols; wc++) {
          var winMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.05),
            windowMat
          );
          var wx = b.x - (b.w / 2) * 0.6 + (wc + 0.5) * (b.w * 0.6 / winCols);
          var wy = 2 + wr * 2.5;
          winMesh.position.set(wx, wy, b.z + b.d / 2 + 0.03);
          NB.addDecoration(winMesh);
        }
      }
    }

    // ---------------------------------------------------------------
    // Trees along the track
    // ---------------------------------------------------------------
    function makeTree(x, z) {
      var trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
      var trunkMat = NB.makeMat(0x8B4513);
      var trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 1.5, z);
      NB.addDecoration(trunk);

      var leafGeo = new THREE.SphereGeometry(1.8, 8, 6);
      var leafMat = NB.makeMat(0x27ae60);
      var leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.set(x, 4, z);
      NB.addDecoration(leaves);
    }

    // Trees along right straight outside
    for (var ti = 0; ti < 8; ti++) {
      makeTree(curveRadius + 9, -25 + ti * 7);
    }
    // Trees along left straight outside
    for (var ti = 0; ti < 8; ti++) {
      makeTree(-curveRadius - 9, -25 + ti * 7);
    }
    // Trees in the infield
    makeTree(0, 0);
    makeTree(-12, -8);
    makeTree(12, 8);
    makeTree(-10, 12);
    makeTree(10, -12);
    makeTree(0, 20);
    makeTree(0, -20);

    // ---------------------------------------------------------------
    // GAME UI
    // ---------------------------------------------------------------
    var uiContainer = NB.addGameUI(
      '<div id="racing-ui" style="pointer-events:none; user-select:none; font-family:Arial,sans-serif;">' +
        // Speed display
        '<div id="racing-speed" style="' +
          'position:fixed; bottom:40px; right:40px;' +
          'font-size:48px; font-weight:bold; color:#fff;' +
          'text-shadow: 0 0 12px rgba(33,150,243,0.6), 2px 2px 4px rgba(0,0,0,0.8);' +
        '">0 km/h</div>' +
        // Speed label
        '<div style="' +
          'position:fixed; bottom:24px; right:40px;' +
          'font-size:14px; color:rgba(255,255,255,0.5);' +
          'text-shadow: 1px 1px 2px rgba(0,0,0,0.8);' +
        '">SPEED</div>' +
        // Lap info (top right)
        '<div id="racing-lap" style="' +
          'position:fixed; top:50px; right:20px;' +
          'font-size:22px; font-weight:bold; color:#fff;' +
          'text-shadow: 1px 1px 4px rgba(0,0,0,0.8);' +
          'background:rgba(0,0,0,0.5); padding:10px 18px; border-radius:10px;' +
          'min-width:160px;' +
        '">Lap: 0</div>' +
        // Timer
        '<div id="racing-timer" style="' +
          'position:fixed; top:100px; right:20px;' +
          'font-size:28px; font-weight:bold; color:#f1c40f;' +
          'text-shadow: 0 0 8px rgba(241,196,15,0.4), 1px 1px 3px rgba(0,0,0,0.8);' +
          'background:rgba(0,0,0,0.5); padding:8px 18px; border-radius:10px;' +
          'min-width:160px;' +
        '">0.00s</div>' +
        // Best lap
        '<div id="racing-best" style="' +
          'position:fixed; top:155px; right:20px;' +
          'font-size:16px; color:#2ecc71;' +
          'text-shadow: 1px 1px 3px rgba(0,0,0,0.8);' +
          'background:rgba(0,0,0,0.5); padding:8px 18px; border-radius:10px;' +
          'min-width:160px;' +
        '">Best: --</div>' +
        // Enter/Exit prompt
        '<div id="racing-prompt" style="' +
          'position:fixed; bottom:120px; left:50%; transform:translateX(-50%);' +
          'font-size:22px; color:#fff; background:rgba(0,0,0,0.7);' +
          'padding:12px 28px; border-radius:10px;' +
          'text-shadow: 1px 1px 2px rgba(0,0,0,0.5);' +
          'border: 2px solid rgba(33,150,243,0.5);' +
          'display:none;' +
        '"></div>' +
        // Gear/direction indicator
        '<div id="racing-gear" style="' +
          'position:fixed; bottom:90px; right:40px;' +
          'font-size:18px; font-weight:bold; color:#2ecc71;' +
          'text-shadow: 1px 1px 3px rgba(0,0,0,0.8);' +
        '"></div>' +
        // Controls help (shown when entering car)
        '<div id="racing-controls" style="' +
          'position:fixed; bottom:40px; left:20px;' +
          'font-size:13px; color:rgba(255,255,255,0.6);' +
          'text-shadow: 1px 1px 2px rgba(0,0,0,0.8);' +
          'background:rgba(0,0,0,0.4); padding:8px 14px; border-radius:8px;' +
          'line-height:1.6; display:none;' +
        '">W - Accelerate<br>S - Brake / Reverse<br>A/D - Steer<br>E - Exit Car</div>' +
      '</div>'
    );
    self._uiContainer = uiContainer;

    // Cache UI elements
    self._speedEl = document.getElementById('racing-speed');
    self._lapEl = document.getElementById('racing-lap');
    self._timerEl = document.getElementById('racing-timer');
    self._bestEl = document.getElementById('racing-best');
    self._promptEl = document.getElementById('racing-prompt');
    self._gearEl = document.getElementById('racing-gear');
    self._controlsEl = document.getElementById('racing-controls');

    // ---------------------------------------------------------------
    // Closure-based update to capture all state
    // ---------------------------------------------------------------
    self.update = function (dt) {
      var keys = NB.keys || {};
      var playerPos = NB.playerPos;

      // Clamp dt to avoid huge jumps
      if (dt > 0.1) dt = 0.1;

      // ---- E key press detection (edge triggered) ----
      var eDown = !!keys['KeyE'];
      var ePressed = eDown && !self._eWasDown;
      self._eWasDown = eDown;

      if (!self._inCar) {
        // ---- ON FOOT - Check distance to car ----
        var dx = playerPos.x - self._carX;
        var dz = playerPos.z - self._carZ;
        var distToCar = Math.sqrt(dx * dx + dz * dz);

        if (distToCar < 5) {
          self._promptEl.style.display = 'block';
          self._promptEl.innerHTML = 'Press <b style="color:#2196F3">E</b> to enter car';

          if (ePressed) {
            // Enter car
            self._inCar = true;
            NB.playerGroup.visible = false;
            self._controlsEl.style.display = 'block';
            self._promptEl.style.display = 'none';
          }
        } else {
          self._promptEl.style.display = 'none';
        }

        // Don't update car physics when on foot
        self._speedEl.parentElement.querySelector('#racing-gear').textContent = '';
        return;
      }

      // ---- IN CAR ----

      // Show exit prompt
      self._promptEl.style.display = 'block';
      self._promptEl.innerHTML = 'Press <b style="color:#f39c12">E</b> to exit car';

      // Exit car
      if (ePressed) {
        self._inCar = false;
        NB.playerGroup.visible = true;
        self._controlsEl.style.display = 'none';

        // Place player next to car
        NB.playerPos.x = self._carX + Math.cos(self._carAngle) * 4;
        NB.playerPos.z = self._carZ - Math.sin(self._carAngle) * 4;
        NB.playerPos.y = 1;

        self._promptEl.style.display = 'none';
        return;
      }

      // ---- Car Physics ----
      var accel = 25;
      var brakeForce = 35;
      var maxSpeed = 45;
      var maxReverse = -12;
      var dragFactor = 0.98;
      var steerRate = 2.5; /* radians per second base rate */

      // Acceleration / Braking
      if (keys['KeyW']) {
        self._carSpeed += accel * dt;
        if (self._carSpeed > maxSpeed) self._carSpeed = maxSpeed;
      } else if (keys['KeyS']) {
        self._carSpeed -= brakeForce * dt;
        if (self._carSpeed < maxReverse) self._carSpeed = maxReverse;
      } else {
        // Drag
        self._carSpeed *= dragFactor;
        // Stop completely if very slow
        if (Math.abs(self._carSpeed) < 0.1) self._carSpeed = 0;
      }

      // Steering - faster at low speeds, still effective at high speeds
      if (Math.abs(self._carSpeed) > 0.5) {
        // Steer rate decreases slightly at very high speed for stability
        var speedFactor = Math.min(1.0, 15 / Math.max(Math.abs(self._carSpeed), 1));
        var effectiveSteer = steerRate * speedFactor * dt;
        var steerDir = self._carSpeed > 0 ? 1 : -1; /* reverse steering when going backward */
        if (keys['KeyA']) {
          self._carAngle += effectiveSteer * steerDir;
        }
        if (keys['KeyD']) {
          self._carAngle -= effectiveSteer * steerDir;
        }
      }

      // Update car position
      self._carX += Math.sin(self._carAngle) * self._carSpeed * dt;
      self._carZ += Math.cos(self._carAngle) * self._carSpeed * dt;

      // Keep car on ground
      self._carGroup.position.set(self._carX, self._carY, self._carZ);
      self._carGroup.rotation.y = self._carAngle;

      // Spin wheels based on speed
      var wheelSpin = self._carSpeed * dt * 2;
      for (var wi = 0; wi < self._wheels.length; wi++) {
        self._wheels[wi].rotation.x += wheelSpin;
      }

      // ---- Camera follow ----
      var targetCamX = self._carX - Math.sin(self._carAngle) * 15;
      var targetCamZ = self._carZ - Math.cos(self._carAngle) * 15;
      var targetCamY = self._carY + 8;

      // Smooth lerp
      var lerpSpeed = 3.0 * dt;
      self._camX += (targetCamX - self._camX) * lerpSpeed;
      self._camY += (targetCamY - self._camY) * lerpSpeed;
      self._camZ += (targetCamZ - self._camZ) * lerpSpeed;

      NB.camera.position.set(self._camX, self._camY, self._camZ);
      NB.camera.lookAt(self._carX, self._carY + 1, self._carZ);

      // Also move player position to car so the engine doesn't reset anything
      NB.playerPos.x = self._carX;
      NB.playerPos.y = self._carY;
      NB.playerPos.z = self._carZ;

      // ---- Checkpoint / Lap system ----
      for (var ci = 0; ci < self._checkpoints.length; ci++) {
        var cp = self._checkpoints[ci];
        var cpDx = self._carX - cp.x;
        var cpDz = self._carZ - cp.z;
        var cpDist = Math.sqrt(cpDx * cpDx + cpDz * cpDz);

        if (cpDist < cp.radius) {
          if (ci === 0) {
            // Start/finish line
            // Check if all other checkpoints have been passed
            var allPassed = true;
            for (var cpi = 1; cpi < self._checkpointsPassed.length; cpi++) {
              if (!self._checkpointsPassed[cpi]) {
                allPassed = false;
                break;
              }
            }

            if (allPassed && self._timerRunning) {
              // Lap complete!
              self._lapCount++;
              var lapTime = self._lapTimer;

              if (self._bestLap < 0 || lapTime < self._bestLap) {
                self._bestLap = lapTime;
                self._bestEl.textContent = 'Best: ' + lapTime.toFixed(2) + 's';
                self._bestEl.style.color = '#f1c40f';
              }

              // Reset for next lap
              self._lapTimer = 0;
              for (var ri = 0; ri < self._checkpointsPassed.length; ri++) {
                self._checkpointsPassed[ri] = false;
              }
              self._checkpointsPassed[0] = true;
            } else if (!self._timerRunning) {
              // Start the timer on first crossing
              self._timerRunning = true;
              self._lapTimer = 0;
              for (var ri = 0; ri < self._checkpointsPassed.length; ri++) {
                self._checkpointsPassed[ri] = false;
              }
            }

            self._checkpointsPassed[0] = true;
          } else {
            // Other checkpoints - just mark as passed
            if (!self._checkpointsPassed[ci]) {
              self._checkpointsPassed[ci] = true;
            }
          }
        }
      }

      // Update lap timer
      if (self._timerRunning) {
        self._lapTimer += dt;
      }

      // ---- Update UI ----
      var kmh = Math.abs(Math.round(self._carSpeed * 3.6));
      self._speedEl.textContent = kmh + ' km/h';

      // Color speed based on value
      if (kmh > 100) {
        self._speedEl.style.color = '#e74c3c';
        self._speedEl.style.textShadow = '0 0 16px rgba(231,76,60,0.7), 2px 2px 4px rgba(0,0,0,0.8)';
      } else if (kmh > 60) {
        self._speedEl.style.color = '#f39c12';
        self._speedEl.style.textShadow = '0 0 12px rgba(243,156,18,0.6), 2px 2px 4px rgba(0,0,0,0.8)';
      } else {
        self._speedEl.style.color = '#fff';
        self._speedEl.style.textShadow = '0 0 12px rgba(33,150,243,0.6), 2px 2px 4px rgba(0,0,0,0.8)';
      }

      self._lapEl.textContent = 'Lap: ' + self._lapCount;
      self._timerEl.textContent = self._lapTimer.toFixed(2) + 's';

      // Gear indicator
      if (self._carSpeed > 0.5) {
        self._gearEl.textContent = 'D';
        self._gearEl.style.color = '#2ecc71';
      } else if (self._carSpeed < -0.5) {
        self._gearEl.textContent = 'R';
        self._gearEl.style.color = '#e74c3c';
      } else {
        self._gearEl.textContent = 'N';
        self._gearEl.style.color = '#f39c12';
      }
    };
  },

  update: function (dt) {
    // Stub - replaced by closure in init()
  },

  cleanup: function () {
    // Show player again
    if (NB.playerGroup) {
      NB.playerGroup.visible = true;
    }

    // Remove car from scene
    if (this._carGroup) {
      NB.scene.remove(this._carGroup);
      this._carGroup = null;
    }

    // Remove game UI
    NB.removeGameUI();

    // Reset state
    this._inCar = false;
    this._carSpeed = 0;
    this._wheels = [];
  }

});
