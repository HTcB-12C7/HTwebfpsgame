import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

const initGame = async () => {
  // 创建画布
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);

  // 初始化引擎和场景
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  // 相机设置
  const camera = new ArcRotateCamera("camera", -Math.PI/2, Math.PI/2.5, 15, new Vector3(0, 3, 0), scene);
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;

  // 光照
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // 创建地面
  const ground = MeshBuilder.CreateGround("ground", { width: 40, height: 40 }, scene);
  ground.position.y = -0.5;

  // 玩家角色（蓝色）
  const player = MeshBuilder.CreateCapsule("player", { height: 1.8, radius: 0.4 }, scene);
  player.position = new Vector3(0, 1, 0);
  const playerMat = new StandardMaterial("playerMat", scene);
  playerMat.diffuseColor = new Color3(0, 0.5, 1); // 蓝色
  player.material = playerMat;

  // 网络连接（替换为你的Cloudflare Worker地址）
  const socket = new WebSocket("wss://your-worker.workers.dev");

  // 输入控制
  const inputMap = {};
  window.addEventListener("keydown", (e) => inputMap[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", (e) => inputMap[e.key.toLowerCase()] = false);

  // 其他玩家列表
  const otherPlayers = new Map();

  // 游戏循环
  engine.runRenderLoop(() => {
    const speed = 0.12;
    const moveVector = new Vector3();
    if (inputMap["w"]) moveVector.z += speed;
    if (inputMap["s"]) moveVector.z -= speed;
    if (inputMap["a"]) moveVector.x -= speed;
    if (inputMap["d"]) moveVector.x += speed;
    player.position.addInPlace(moveVector);

    // 发送位置数据
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "position",
        id: socket.id,
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      }));
    }
  });

  // 处理服务器消息
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case "connect":
        socket.id = msg.id;
        break;
      case "playerUpdate":
        msg.players.forEach(p => {
          if (p.id !== socket.id) {
            if (!otherPlayers.has(p.id)) {
              const mesh = MeshBuilder.CreateCapsule(`player_${p.id}`, 
                { height: 1.8, radius: 0.4 }, scene);
              const mat = new StandardMaterial(`mat_${p.id}`, scene);
              mat.diffuseColor = new Color3(1, 0, 0); // 红色代表其他玩家
              mesh.material = mat;
              otherPlayers.set(p.id, mesh);
            }
            otherPlayers.get(p.id).position.set(p.x, p.y, p.z);
          }
        });
        break;
    }
  };
};

initGame();
