import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  DoubleSide,
  MeshBasicMaterial,
  Clock,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import image from "../../img/wave.jpg";

export default class webGL {
  // コンストラクタ
  constructor(containerSelector) {
    // canvasタグが配置されるコンテナを取得
    this.container = document.querySelector(containerSelector);

    this.renderParam = {
      clearColor: 0xcccccc,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.cameraParam = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 100,
      fovRad: null,
      dist: null,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 1,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.loader = null;
    this.texture = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.uniforms = null;
    this.clock = new Clock();
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    this._setContorols();
    this._setTexture();
    this._createMesh();
  }

  _setScene() {
    this.scene = new Scene();
  }

  _setRender() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      transparent: true,
    });
    this.renderer.setClearColor(new Color(this.renderParam.clearColor));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);

    this.container.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    // ウィンドウとwebGLの座標を一致させるため、描画がウィンドウぴったりになるようカメラを調整
    this.camera = new PerspectiveCamera(this.cameraParam.fov, this.cameraParam.aspect, this.cameraParam.near, this.cameraParam.far);
    // this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    // this.cameraParam.dist = this.renderParam.height / 2 / Math.tan(this.cameraParam.fovRad);
    this.camera.position.z = this.cameraParam.z;
  }

  _setContorols() {
    this.contorols = new OrbitControls(this.camera, this.renderer.domElement);
  }

  _setTexture() {
    this.texture = new TextureLoader().load(image);
  }

  _createMesh() {
    this.geometry = new PlaneGeometry(0.4, 0.6, 16, 16);
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 },
        uNoiseFreq: { value: 3.5 },
        uNoiseAmp: { value: 0.15 },
      },
      vertexShader,
      fragmentShader,
      // wireframe: true,
      side: DoubleSide,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  // 毎フレーム呼び出す
  update() {
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    requestAnimationFrame(this.update.bind(this));
    this._render();
  }

  onResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(windowWidth, windowHeight);
    this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    this.cameraParam.dist = windowHeight / 2 / Math.tan(this.cameraParam.fovRad);
    this.camera.position.z = this.cameraParam.dist;
    this._render();
  }
}
