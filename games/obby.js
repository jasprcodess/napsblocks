NB.registerGame('obby', {

  _movingPlatforms: [],
  _spinners: [],

  init: function () {
    var movingPlatforms = this._movingPlatforms;
    var spinners = this._spinners;
    movingPlatforms.length = 0;
    spinners.length = 0;

    var scene = NB.scene;

    // ---------------------------------------------------------------
    // Helper: build a simple tree decoration at (x, y, z)
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
    // Helper: checkpoint flag at (x, y, z) with a color
    // ---------------------------------------------------------------
    function makeFlag(x, y, z, color) {
      var poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 6, 6);
      var poleMat = NB.makeMat(0xaaaaaa);
      var pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, y + 3, z);
      NB.addDecoration(pole);

      var flagGeo = new THREE.BoxGeometry(2, 1.2, 0.15);
      var flagMat = NB.makeMat(color);
      var flag = new THREE.Mesh(flagGeo, flagMat);
      flag.position.set(x + 1.2, y + 5.2, z);
      NB.addDecoration(flag);
    }

    // ---------------------------------------------------------------
    // Helper: checkpoint platform + flag
    // ---------------------------------------------------------------
    function checkpoint(x, y, z, color) {
      NB.addPlatform(x, y, z, 12, 1, 12, 0x888888, 'checkpoint');
      makeFlag(x + 5, y + 0.5, z, color);
    }

    // ---------------------------------------------------------------
    // Current build position tracker
    // ---------------------------------------------------------------
    var cx = 0;   // center X
    var cy = 0;   // current Y (top surface of last platform)
    var cz = 0;   // current Z (front edge of build)

    // =================================================================
    //  SPAWN AREA
    // =================================================================
    // Large green grass platform with stone border
    NB.addPlatform(0, -0.5, 0, 20, 1, 20, 0x2ecc71, 'spawn');

    // Stone border pieces (4 sides, slightly raised above ground to avoid Z-fighting)
    NB.addPlatform(0, -0.35, -10.5, 22, 1.5, 1, 0x7f8c8d);
    NB.addPlatform(0, -0.35, 10.5, 22, 1.5, 1, 0x7f8c8d);
    NB.addPlatform(-10.5, -0.35, 0, 1, 1.5, 20, 0x7f8c8d);
    NB.addPlatform(10.5, -0.35, 0, 1, 1.5, 20, 0x7f8c8d);

    // Spawn trees
    makeTree(-7, 0, -7);
    makeTree(7, 0, -7);
    makeTree(-7, 0, 7);
    makeTree(7, 0, 7);

    cy = 0;
    cz = -12; // start building from front edge of spawn

    // =================================================================
    //  STAGE 1 : "Easy Start" - Simple wide blue platforms
    // =================================================================
    var s1Color = 0x4488ff;
    var s1Widths = [8, 7, 6, 5.5, 5, 4.5];

    for (var i = 0; i < s1Widths.length; i++) {
      cz -= 6;
      var w = s1Widths[i];
      NB.addPlatform(0, cy, cz, w, 1, 4, s1Color);
    }

    // Stage 1 checkpoint
    cz -= 8;
    checkpoint(0, cy, cz, s1Color);

    // =================================================================
    //  STAGE 2 : "The Stairway" - Red/orange stairs going up
    // =================================================================
    var s2Colors = [0xe74c3c, 0xc0392b];
    var stairWidths = [6, 5.8, 5.5, 5.2, 5, 4.7, 4.4, 4, 3.6, 3.2];

    for (var i = 0; i < 10; i++) {
      cz -= 4;
      cy += 1.2;
      var sw = stairWidths[i];
      NB.addPlatform(0, cy, cz, sw, 1, 3, s2Colors[i % 2]);
    }

    // Stage 2 checkpoint
    cz -= 8;
    checkpoint(0, cy, cz, 0xe74c3c);

    // =================================================================
    //  STAGE 3 : "Kill Brick Alley" - Weave between kill bricks
    // =================================================================
    var s3Color = 0x4488ff;
    var killColor = 0xff0000;
    var s3StartZ = cz - 8;

    // Wide walkway
    NB.addPlatform(0, cy, s3StartZ - 22, 10, 1, 50, s3Color);

    // Kill brick patterns on the walkway
    // Pattern 1: left side block
    NB.addPlatform(-3, cy + 0.7, s3StartZ - 5, 3, 0.3, 3, killColor, 'kill');
    // Pattern 2: right side block
    NB.addPlatform(3, cy + 0.7, s3StartZ - 10, 3, 0.3, 3, killColor, 'kill');
    // Pattern 3: center block
    NB.addPlatform(0, cy + 0.7, s3StartZ - 15, 4, 0.3, 2, killColor, 'kill');
    // Pattern 4: two side blocks leaving center gap
    NB.addPlatform(-3.2, cy + 0.7, s3StartZ - 20, 2.5, 0.3, 2, killColor, 'kill');
    NB.addPlatform(3.2, cy + 0.7, s3StartZ - 20, 2.5, 0.3, 2, killColor, 'kill');
    // Pattern 5: center + one side
    NB.addPlatform(0, cy + 0.7, s3StartZ - 26, 3, 0.3, 2, killColor, 'kill');
    NB.addPlatform(-3.5, cy + 0.7, s3StartZ - 26, 2, 0.3, 2, killColor, 'kill');
    // Pattern 6: zigzag kills
    NB.addPlatform(2, cy + 0.7, s3StartZ - 31, 5, 0.3, 1.5, killColor, 'kill');
    NB.addPlatform(-2, cy + 0.7, s3StartZ - 34, 5, 0.3, 1.5, killColor, 'kill');
    // Pattern 7: almost full width, tiny gap right
    NB.addPlatform(-1.5, cy + 0.7, s3StartZ - 39, 6, 0.3, 2, killColor, 'kill');
    // Pattern 8: almost full width, tiny gap left
    NB.addPlatform(1.5, cy + 0.7, s3StartZ - 42, 6, 0.3, 2, killColor, 'kill');

    cz = s3StartZ - 50;

    // Stage 3 checkpoint
    cz -= 4;
    checkpoint(0, cy, cz, s3Color);

    // =================================================================
    //  STAGE 4 : "The Zigzag" - Platforms zigzagging left-right
    // =================================================================
    var s4Color = 0x2ecc71;

    for (var i = 0; i < 10; i++) {
      cz -= 6;
      cy += 0.4;
      var xOff = (i % 2 === 0) ? -5 : 5;
      NB.addPlatform(xOff, cy, cz, 3, 1, 3, s4Color);
    }

    // Stage 4 checkpoint
    cz -= 8;
    checkpoint(0, cy, cz, s4Color);

    // =================================================================
    //  STAGE 5 : "Lava Floor" - Stepping stones over kill floor
    // =================================================================
    var s5Color = 0xf39c12;
    var s5StartZ = cz - 8;
    var s5Length = 42;

    // Kill floor beneath
    NB.addPlatform(0, cy - 4, s5StartZ - s5Length / 2, 20, 1, s5Length, killColor, 'kill');

    // Entry ramp
    NB.addPlatform(0, cy, s5StartZ, 5, 1, 4, s5Color);

    // Stepping stones (8 small platforms)
    var stonePositions = [
      { x: -3, z: s5StartZ - 6,  dy: 0 },
      { x: 2,  z: s5StartZ - 11, dy: 0.5 },
      { x: -2, z: s5StartZ - 16, dy: 0 },
      { x: 3,  z: s5StartZ - 20, dy: 0.8 },
      { x: -1, z: s5StartZ - 25, dy: 0.3 },
      { x: 2,  z: s5StartZ - 29, dy: 0 },
      { x: -3, z: s5StartZ - 33, dy: 0.5 },
      { x: 0,  z: s5StartZ - 38, dy: 0.2 }
    ];

    for (var i = 0; i < stonePositions.length; i++) {
      var sp = stonePositions[i];
      NB.addPlatform(sp.x, cy + sp.dy, sp.z, 2, 1, 2, s5Color);
    }

    cz = s5StartZ - s5Length - 2;

    // Stage 5 checkpoint
    cz -= 4;
    checkpoint(0, cy, cz, s5Color);

    // =================================================================
    //  STAGE 6 : "The Tunnel" - Rainbow rings with kill sides
    // =================================================================
    var s6FloorColor = 0xf1c40f;
    var s6StartZ = cz - 6;
    var s6Length = 50;

    // Narrow yellow walkway through center
    NB.addPlatform(0, cy, s6StartZ - s6Length / 2, 2, 1, s6Length, s6FloorColor);

    // Kill bricks on sides
    NB.addPlatform(-4, cy, s6StartZ - s6Length / 2, 4, 0.3, s6Length, killColor, 'kill');
    NB.addPlatform(4, cy, s6StartZ - s6Length / 2, 4, 0.3, s6Length, killColor, 'kill');

    // Rainbow ring decorations along the tunnel
    var rainbowColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0088ff, 0x4400ff, 0x8800ff];
    for (var i = 0; i < 10; i++) {
      var rz = s6StartZ - 5 - i * (s6Length / 10);
      var ringColor = rainbowColors[i % rainbowColors.length];
      var torusGeo = new THREE.TorusGeometry(5, 0.35, 8, 20);
      var torusMat = NB.makeMat(ringColor);
      var torus = new THREE.Mesh(torusGeo, torusMat);
      torus.position.set(0, cy + 5, rz);
      torus.rotation.y = Math.PI / 2;
      NB.addDecoration(torus);
    }

    cz = s6StartZ - s6Length - 2;

    // Stage 6 checkpoint
    cz -= 4;
    checkpoint(0, cy, cz, s6FloorColor);

    // =================================================================
    //  STAGE 7 : "Moving Madness" - Bobbing platforms
    // =================================================================
    var s7Color = 0x5dade2;
    var bobConfigs = [
      { x: 0,  dz: -6,  speed: 1.5, amount: 2.0, offset: 0 },
      { x: -4, dz: -12, speed: 2.0, amount: 1.5, offset: 1.0 },
      { x: 3,  dz: -18, speed: 1.0, amount: 2.5, offset: 2.0 },
      { x: -2, dz: -24, speed: 2.5, amount: 1.0, offset: 0.5 },
      { x: 4,  dz: -29, speed: 1.8, amount: 2.0, offset: 3.0 },
      { x: -3, dz: -35, speed: 1.2, amount: 3.0, offset: 1.5 },
      { x: 1,  dz: -41, speed: 2.2, amount: 1.5, offset: 2.5 },
      { x: 0,  dz: -47, speed: 1.0, amount: 2.0, offset: 0.8 }
    ];

    for (var i = 0; i < bobConfigs.length; i++) {
      var bc = bobConfigs[i];
      var platZ = cz + bc.dz;
      var plat = NB.addPlatform(bc.x, cy, platZ, 3.5, 1, 3.5, s7Color);
      plat.userData.moving = true;
      plat.userData.baseY = cy;
      plat.userData.bobSpeed = bc.speed;
      plat.userData.bobAmount = bc.amount;
      plat.userData.bobOffset = bc.offset;
      movingPlatforms.push(plat);
    }

    cz = cz - 53;

    // Stage 7 checkpoint
    cz -= 4;
    checkpoint(0, cy, cz, s7Color);

    // =================================================================
    //  STAGE 8 : "Kill Brick Gauntlet" - Safe/kill alternating sections
    // =================================================================
    var s8SafeColor = 0x8e44ad;
    var s8StartZ = cz - 6;
    var sectionZ = s8StartZ;

    // 8 pairs of safe (2u) + kill (3u) sections
    for (var i = 0; i < 8; i++) {
      // Safe section (2 units long)
      NB.addPlatform(0, cy, sectionZ - 1, 4, 1, 2, s8SafeColor);
      sectionZ -= 2;
      // Kill section (3 units long)
      NB.addPlatform(0, cy + 0.7, sectionZ - 1.5, 4, 0.3, 3, killColor, 'kill');
      // Thin floor under kill so it looks connected
      NB.addPlatform(0, cy, sectionZ - 1.5, 4, 1, 3, 0x555555);
      sectionZ -= 3;
    }
    // Final safe landing
    NB.addPlatform(0, cy, sectionZ - 1, 4, 1, 2, s8SafeColor);
    sectionZ -= 2;

    cz = sectionZ;

    // Stage 8 checkpoint
    cz -= 6;
    checkpoint(0, cy, cz, s8SafeColor);

    // =================================================================
    //  STAGE 9 : "The Impossible Jumps" - Tiny precise platforms
    // =================================================================
    var s9Color = 0xe91e63;
    var s9Platforms = [
      { x: 0,    dz: -5,  dy: 0 },
      { x: 2.5,  dz: -10, dy: 0.5 },
      { x: -1,   dz: -15, dy: -0.3 },
      { x: -3.5, dz: -19, dy: 0.8 },
      { x: 0.5,  dz: -24, dy: 0 },
      { x: 3,    dz: -28, dy: 1.0 },
      { x: -2,   dz: -33, dy: 0.3 },
      { x: 1,    dz: -37, dy: -0.5 },
      { x: -3,   dz: -42, dy: 0.7 },
      { x: 2,    dz: -46, dy: 0 },
      { x: -1.5, dz: -51, dy: 1.2 },
      { x: 0,    dz: -56, dy: 0.5 }
    ];

    for (var i = 0; i < s9Platforms.length; i++) {
      var p = s9Platforms[i];
      NB.addPlatform(p.x, cy + p.dy, cz + p.dz, 1.5, 1, 1.5, s9Color);
    }

    cz = cz - 62;

    // Stage 9 checkpoint
    cz -= 4;
    checkpoint(0, cy, cz, s9Color);

    // =================================================================
    //  STAGE 10 : "Victory Tower" - Spiral staircase to golden platform
    // =================================================================
    var s10Color = 0xffd700;
    var spiralCenterX = 0;
    var spiralCenterZ = cz - 14;
    var spiralRadius = 7;
    var spiralBaseY = cy;

    // Central column decoration
    var colGeo = new THREE.CylinderGeometry(1.5, 1.5, 32, 12);
    var colMat = NB.makeMat(0x95a5a6);
    var column = new THREE.Mesh(colGeo, colMat);
    column.position.set(spiralCenterX, spiralBaseY + 16, spiralCenterZ);
    NB.addDecoration(column);

    // 16 spiral steps, each rotated 30 degrees
    for (var i = 0; i < 16; i++) {
      var angle = (i * 30) * (Math.PI / 180);
      var sx = spiralCenterX + Math.cos(angle) * spiralRadius;
      var sz = spiralCenterZ + Math.sin(angle) * spiralRadius;
      var sy = spiralBaseY + (i + 1) * 1.8;
      NB.addPlatform(sx, sy, sz, 3.5, 0.8, 3.5, s10Color);
    }

    // Victory platform at the top
    var victoryY = spiralBaseY + 17 * 1.8;
    NB.addPlatform(spiralCenterX, victoryY, spiralCenterZ, 10, 1, 10, s10Color, 'checkpoint');

    // Golden trophy decoration on victory platform
    // Trophy base
    var baseGeo = new THREE.CylinderGeometry(1.5, 2, 1, 12);
    var goldMat = NB.makeMat(0xffd700);
    var trophyBase = new THREE.Mesh(baseGeo, goldMat);
    trophyBase.position.set(spiralCenterX, victoryY + 1, spiralCenterZ);
    NB.addDecoration(trophyBase);

    // Trophy stem
    var stemGeo = new THREE.CylinderGeometry(0.4, 0.6, 2, 8);
    var stem = new THREE.Mesh(stemGeo, goldMat);
    stem.position.set(spiralCenterX, victoryY + 2.5, spiralCenterZ);
    NB.addDecoration(stem);

    // Trophy cup
    var cupGeo = new THREE.CylinderGeometry(1.8, 0.6, 2.5, 12);
    var cup = new THREE.Mesh(cupGeo, goldMat);
    cup.position.set(spiralCenterX, victoryY + 4.75, spiralCenterZ);
    NB.addDecoration(cup);

    // Trophy star on top (use an icosahedron for sparkle look)
    var starGeo = new THREE.IcosahedronGeometry(1, 0);
    var starMat = NB.makeMat(0xffee00);
    var star = new THREE.Mesh(starGeo, starMat);
    star.position.set(spiralCenterX, victoryY + 7, spiralCenterZ);
    NB.addDecoration(star);
    spinners.push(star);

    // Victory trees
    makeTree(spiralCenterX - 3.5, victoryY + 0.5, spiralCenterZ - 3.5, 3, 2);
    makeTree(spiralCenterX + 3.5, victoryY + 0.5, spiralCenterZ + 3.5, 3, 2);

    // "WIN" text pillars (decorative golden pillars on victory platform)
    for (var i = 0; i < 4; i++) {
      var pa = (i * 90) * (Math.PI / 180);
      var px = spiralCenterX + Math.cos(pa) * 4;
      var pz = spiralCenterZ + Math.sin(pa) * 4;
      var pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 5, 6);
      var pillar = new THREE.Mesh(pillarGeo, goldMat);
      pillar.position.set(px, victoryY + 3, pz);
      NB.addDecoration(pillar);

      // Small sphere on top of each pillar
      var orbGeo = new THREE.SphereGeometry(0.5, 8, 6);
      var orb = new THREE.Mesh(orbGeo, goldMat);
      orb.position.set(px, victoryY + 5.8, pz);
      NB.addDecoration(orb);
    }
  },

  update: function (dt) {
    var time = performance.now() / 1000;

    // Animate bobbing platforms (Stage 7)
    var platforms = this._movingPlatforms;
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (p.userData.moving) {
        p.position.y = p.userData.baseY +
          Math.sin(time * p.userData.bobSpeed + p.userData.bobOffset) * p.userData.bobAmount;
      }
    }

    // Rotate trophy star and any other spinners
    var spinners = this._spinners;
    for (var i = 0; i < spinners.length; i++) {
      spinners[i].rotation.y += dt * 1.5;
      spinners[i].rotation.x += dt * 0.5;
    }
  },

  cleanup: function () {
    // NB handles cleanup
  }

});
