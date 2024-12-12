import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue } from "./utils";

k.loadSprite("spritesheet", "/assets/spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 0.1 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 0.1 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 0.1 },
  },
});

k.loadSprite("map", "/assets/map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("/assets/map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              "You can't go this way!",
              () => (player.isInDialogue = false)
            );
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

//   k.keyDown("up", () => {
//     player.direction = "up";
//     player.move(4, -player.speed);
//     player.play("walk-up");
//   });

//     k.keyDown("down", () => {
//         player.direction = "down";
//         player.move(4, player.speed);
//         player.play("walk-down");
//     });

//     k.keyDown("left", () => {
//         player.direction = "left";
//         player.move(-player.speed, 4);
//         player.play("walk-side");
//     });

//     k.keyDown("right", () => {
//         player.direction = "right";
//         player.move(player.speed, 4);
//         player.play("walk-side");
//     });

//     k.keyRelease(() => {
//         player.stop();
//         player.play(`idle-${player.direction}`);
//     });

    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const target = k.mousePos();
        const dir = target.sub(player.pos).unit();
        player.move(dir.scale(player.speed));
        player.play(`walk-${dir.y > 0 ? "down" : dir.y < 0 ? "up" : "side"}`);

    });

});

k.go("main");
