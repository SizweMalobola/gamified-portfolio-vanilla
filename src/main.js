import { SCALEFACTOR } from "./constants";
import { k } from "./kaboom_context";
import { displayDialogue } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#5ba675"));

k.scene("main", async () => {
  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }), // object hitbox
    k.body(), // makes our game object a tangible physics object that can me collided with
    k.anchor("center"), // indicates where the object will be drawn from, default is top left
    k.pos(), // position of the object
    k.scale(SCALEFACTOR),
    {
      // custom properties that will be accessible by the game object
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player", // object tag ~ its like an ID for the game object
  ]);

  // creating game objects
  // k.make is for making the game obje cts
  const map = k.add([k.sprite("map"), k.pos(0), k.scale(SCALEFACTOR)]);

  //fetch map data
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

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
            // Todo: add dialogue
            displayDialogue("TODO",() => {player.isInDialogue = false})
          });
        }
      }
      continue
    }
    if (layer.name === "spawnpoints"){
      for (const entity of layer.objects){
        if(entity.name === "player"){
          player.pos = k.vec2(((map.pos.x + entity.x) * SCALEFACTOR),((map.pos.y + entity.y) * SCALEFACTOR))
          k.add(player);
          continue
        }
      }
    }
  }

  k.onUpdate(() => {
    k.camPos(player.pos.x ,player.pos.y + 100);
  })
  // looping through layers and adding them as objects
});

k.go("main");
