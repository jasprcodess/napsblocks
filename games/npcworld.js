// NPC World - A chill game with tons of NPCs walking around
// Just hang out, explore, and watch the NPCs do their thing!

NB.registerGame('npcworld', {

  _extraNPCs: [],

  init: function () {
    var self = this;
    var scene = NB.scene;
    self._extraNPCs = [];

    // ---------------------------------------------------------------
    // Large flat ground - green grass
    // ---------------------------------------------------------------
    NB.addPlatform(0, -0.5, 0, 120, 1, 120, 0x5dbd5d, 'ground');

    // ---------------------------------------------------------------
    // Paths (stone walkways crossing the town)
    // ---------------------------------------------------------------
    var pathColor = 0x999999;
    // Main cross paths
    NB.addPlatform(0, 0.02, 0, 4, 0.04, 100, pathColor, 'path');
    NB.addPlatform(0, 0.02, 0, 100, 0.04, 4, pathColor, 'path');
    // Diagonal paths
    for (var dp = -40; dp <= 40; dp += 4) {
      NB.addPlatform(dp, 0.02, dp, 4, 0.04, 4, pathColor, 'path');
      NB.addPlatform(-dp, 0.02, dp, 4, 0.04, 4, pathColor, 'path');
    }

    // ---------------------------------------------------------------
    // Buildings around the edges (different colors, sizes)
    // ---------------------------------------------------------------
    var buildings = [
      { x: -35, z: -35, w: 8, h: 12, d: 8, color: 0x7f8c8d },
      { x: -20, z: -40, w: 6, h: 8, d: 6, color: 0x95a5a6 },
      { x: -45, z: -20, w: 10, h: 15, d: 8, color: 0x5d6d7e },
      { x: 35, z: -35, w: 7, h: 10, d: 7, color: 0x839192 },
      { x: 45, z: -15, w: 9, h: 14, d: 8, color: 0x616a6b },
      { x: -40, z: 30, w: 8, h: 9, d: 6, color: 0xaab7b8 },
      { x: -25, z: 40, w: 6, h: 11, d: 6, color: 0x3498db },
      { x: 30, z: 35, w: 10, h: 8, d: 8, color: 0x2ecc71 },
      { x: 40, z: 20, w: 7, h: 13, d: 7, color: 0xe74c3c },
      { x: 15, z: -40, w: 5, h: 7, d: 5, color: 0x9b59b6 },
      { x: -10, z: -35, w: 6, h: 6, d: 6, color: 0xe67e22 },
      { x: 0, z: 45, w: 8, h: 10, d: 6, color: 0x1abc9c },
      { x: -45, z: 5, w: 7, h: 8, d: 7, color: 0xf39c12 },
      { x: 45, z: 40, w: 6, h: 12, d: 6, color: 0x34495e }
    ];

    for (var bi = 0; bi < buildings.length; bi++) {
      var b = buildings[bi];
      var bldgGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      var bldgMat = NB.makeMat(b.color);
      var bldg = new THREE.Mesh(bldgGeo, bldgMat);
      bldg.position.set(b.x, b.h / 2, b.z);
      NB.addDecoration(bldg);

      // Windows
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
    // Park area with benches and fountain
    // ---------------------------------------------------------------
    // Central fountain base
    var fountainBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3.5, 1, 16),
      NB.makeMat(0x95a5a6)
    );
    fountainBase.position.set(0, 0.5, 0);
    NB.addDecoration(fountainBase);

    // Fountain pillar
    var fountainPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 3, 8),
      NB.makeMat(0xbdc3c7)
    );
    fountainPillar.position.set(0, 2.5, 0);
    NB.addDecoration(fountainPillar);

    // Fountain top
    var fountainTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 0.5, 0.5, 12),
      NB.makeMat(0xbdc3c7)
    );
    fountainTop.position.set(0, 4, 0);
    NB.addDecoration(fountainTop);

    // Water (blue transparent)
    var waterGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.3, 16);
    var waterMat = new THREE.MeshBasicMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.6
    });
    var water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.85, 0);
    NB.addDecoration(water);

    // Benches around fountain
    var benchPositions = [
      { x: 6, z: 0, ry: Math.PI / 2 },
      { x: -6, z: 0, ry: -Math.PI / 2 },
      { x: 0, z: 6, ry: 0 },
      { x: 0, z: -6, ry: Math.PI }
    ];

    for (var bci = 0; bci < benchPositions.length; bci++) {
      var bp = benchPositions[bci];
      // Seat
      var seat = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.15, 0.6),
        NB.makeMat(0x8B4513)
      );
      seat.position.set(bp.x, 0.6, bp.z);
      seat.rotation.y = bp.ry;
      NB.addDecoration(seat);
      // Legs
      for (var li = -1; li <= 1; li += 2) {
        var leg = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.5),
          NB.makeMat(0x5d4037)
        );
        leg.position.set(
          bp.x + Math.cos(bp.ry) * li * 0.8,
          0.3,
          bp.z + Math.sin(bp.ry) * li * 0.8
        );
        NB.addDecoration(leg);
      }
    }

    // ---------------------------------------------------------------
    // Trees scattered around
    // ---------------------------------------------------------------
    var treePositions = [
      [10, 10], [-10, 10], [10, -10], [-10, -10],
      [20, 5], [-20, 5], [5, 20], [-5, -20],
      [25, 25], [-25, 25], [25, -25], [-25, -25],
      [35, 10], [-35, 10], [10, 35], [-10, -35],
      [40, -5], [-40, -5], [5, -40], [-5, 40],
      [15, -15], [-15, 15], [30, -20], [-30, 20],
      [0, 25], [0, -25], [25, 0], [-25, 0]
    ];

    for (var ti = 0; ti < treePositions.length; ti++) {
      var tx = treePositions[ti][0];
      var tz = treePositions[ti][1];
      // Trunk
      var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 2.5, 6),
        NB.makeMat(0x8B4513)
      );
      trunk.position.set(tx, 1.25, tz);
      NB.addDecoration(trunk);
      // Leaves
      var leafColor = [0x27ae60, 0x2ecc71, 0x229954, 0x1abc9c][Math.floor(Math.random() * 4)];
      var leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.5 + Math.random() * 0.5, 8, 6),
        NB.makeMat(leafColor)
      );
      leaves.position.set(tx, 3.5 + Math.random() * 0.5, tz);
      NB.addDecoration(leaves);
    }

    // ---------------------------------------------------------------
    // Lamp posts along paths
    // ---------------------------------------------------------------
    var lampPositions = [
      [10, 2], [-10, 2], [2, 10], [2, -10],
      [20, 2], [-20, 2], [2, 20], [2, -20],
      [30, 2], [-30, 2], [2, 30], [2, -30]
    ];

    for (var lpi = 0; lpi < lampPositions.length; lpi++) {
      var lx = lampPositions[lpi][0];
      var lz = lampPositions[lpi][1];
      // Pole
      var pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 4, 6),
        NB.makeMat(0x333333)
      );
      pole.position.set(lx, 2, lz);
      NB.addDecoration(pole);
      // Light
      var lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xf9e154 })
      );
      lamp.position.set(lx, 4.2, lz);
      NB.addDecoration(lamp);
    }

    // ---------------------------------------------------------------
    // Spawn TONS of NPCs (20-30)
    // ---------------------------------------------------------------
    var npcCount = 20 + Math.floor(Math.random() * 11); // 20-30
    for (var ni = 0; ni < npcCount; ni++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = 5 + Math.random() * 45;
      var nx = Math.cos(angle) * dist;
      var nz = Math.sin(angle) * dist;
      NB.spawnNPC(nx, 1, nz);
    }

    // ---------------------------------------------------------------
    // Game UI - simple overlay
    // ---------------------------------------------------------------
    NB.addGameUI(
      '<div style="position:fixed;top:16px;left:50%;transform:translateX(-50%);' +
        'font-size:24px;font-weight:bold;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.6);' +
        'pointer-events:none;font-family:Arial,sans-serif;">NPC World</div>' +
      '<div style="position:fixed;top:50px;left:50%;transform:translateX(-50%);' +
        'font-size:14px;color:rgba(255,255,255,0.7);text-shadow:0 1px 4px rgba(0,0,0,0.6);' +
        'pointer-events:none;font-family:Arial,sans-serif;">Walk around and hang out with NPCs!</div>'
    );

    NB.addChatMessage('System', 'Welcome to NPC World! Just chill and explore.');
  },

  update: function (dt) {
    // Nothing special needed - engine handles NPC updates
  },

  cleanup: function () {
    NB.removeGameUI();
  }

});
