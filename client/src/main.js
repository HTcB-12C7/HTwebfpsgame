import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera, MeshBuilder } from "@babylonjs/core";

// 初始化游戏
const initGame = () => {
  // 创建画布
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  // 初始化3D引擎
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  // 设置相机（第一人称视角）
  const camera = new ArcRotateCamera("camera", -Math.PI/2, Math.PI/2, 10, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 2;  // 限制相机距离

  // 添加光源
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // 创建地面
  const ground = MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
  ground.position.y = -0.5;

  // 创建玩家角色（蓝色胶囊体）
  const player = MeshBuilder.CreateCapsule("player", {height: 1.8, radius: 0.4}, scene);
  player.position.y = 1;

  // 游戏循环
  engine.runRenderLoop(() => {
    scene.render();
  });

  // 窗口大小适配
  window.addEventListener("resize", () => engine.resize());
};

// 启动游戏
initGame();
