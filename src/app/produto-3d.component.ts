import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-produto-3d',
  standalone: true,
  template: `
    <div class="canvas-container" #rendererContainer>
      <div class="badge-3d">Studio HD 3D</div>
    </div>
  `,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 180px;
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 60%, #020617 100%);
      box-shadow: inset 0 0 25px rgba(0,0,0,0.95);
    }
    .badge-3d {
      position: absolute;
      top: 6px;
      left: 6px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      pointer-events: none;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
  `]
})
export class Produto3dComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;

  @Input() largura: number = 40; 
  @Input() altura: number = 30;  
  @Input() profundidade: number = 30; 
  @Input() materialTipo: string = 'pp'; 
  @Input() corDesejada: string = ''; 
  @Input() textoLogotipo: string = ''; // <--- Propriedade adicionada para resolver o erro de vinculação

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private group!: THREE.Group;
  private animationFrameId: number = 0;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initThree();
    }, 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.group && (changes['largura'] || changes['altura'] || changes['profundidade'] || changes['materialTipo'] || changes['corDesejada'] || changes['textoLogotipo'])) {
      this.updateObjectGroup();
    }
  }

  private initThree() {
    const containerEl = this.container.nativeElement;
    const width = containerEl.clientWidth || 200;
    const height = containerEl.clientHeight || 180;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    this.camera.position.set(15, 11, 16);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    containerEl.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(10, 20, 15);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-15, 5, -10);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    rimLight.position.set(5, -10, 15);
    this.scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 25, 0);
    this.scene.add(topLight);

    this.createObjectGroup();
    this.animate();
  }

  private createObjectGroup() {
    this.group = new THREE.Group();
    const tipo = this.materialTipo.toLowerCase();

    const mainMat = this.getMainMaterial();
    const detailMat = this.getDetailMaterial();
    const accentMat = this.getAccentMaterial();
    const metalMat = this.getMetalAccentMaterial();

    if (tipo.includes('pp')) {
      const bodyGeo = new THREE.BoxGeometry(5.2, 3.2, 3.6);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
      bodyMesh.position.y = -0.2;

      const baseGeo = new THREE.BoxGeometry(5.3, 0.3, 3.7);
      const baseMesh = new THREE.Mesh(baseGeo, detailMat);
      baseMesh.position.y = -1.9;

      const lidGeo = new THREE.BoxGeometry(5.35, 0.7, 3.75);
      const lidMesh = new THREE.Mesh(lidGeo, detailMat);
      lidMesh.position.y = 1.5;

      const handleLeftGeo = new THREE.BoxGeometry(0.3, 0.8, 1.2);
      const handleLeft = new THREE.Mesh(handleLeftGeo, accentMat);
      handleLeft.position.set(-2.8, -0.2, 0);

      const handleRight = handleLeft.clone();
      handleRight.position.set(2.8, -0.2, 0);

      const edges = new THREE.EdgesGeometry(bodyGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfbbf24 }));

      this.group.add(bodyMesh, baseMesh, lidMesh, handleLeft, handleRight, line);

    } else if (tipo.includes('ps')) {
      const trayBaseGeo = new THREE.BoxGeometry(6.0, 0.7, 4.2);
      const trayBase = new THREE.Mesh(trayBaseGeo, mainMat);

      const frameGeo = new THREE.BoxGeometry(6.2, 1.2, 4.4);
      const edges = new THREE.EdgesGeometry(frameGeo);
      const wireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b }));

      const div1Geo = new THREE.BoxGeometry(0.08, 1.0, 4.0);
      const div1 = new THREE.Mesh(div1Geo, detailMat);
      div1.position.x = -1.2;

      const div2Geo = new THREE.BoxGeometry(5.8, 1.0, 0.08);
      const div2 = new THREE.Mesh(div2Geo, detailMat);
      div2.position.z = 0.8;

      this.group.add(trayBase, wireframe, div1, div2);

    } else if (tipo.includes('madeira')) {
      const panelGeo = new THREE.BoxGeometry(5.0, 5.0, 0.55);
      const panelMesh = new THREE.Mesh(panelGeo, mainMat);

      const groove1Geo = new THREE.BoxGeometry(4.2, 0.12, 0.6);
      const groove1 = new THREE.Mesh(groove1Geo, detailMat);
      groove1.position.y = 1.2;

      const groove2Geo = new THREE.BoxGeometry(4.2, 0.12, 0.6);
      const groove2 = new THREE.Mesh(groove2Geo, detailMat);
      groove2.position.y = -1.2;

      const logoPlateGeo = new THREE.BoxGeometry(1.2, 0.4, 0.65);
      const logoPlate = new THREE.Mesh(logoPlateGeo, metalMat);
      logoPlate.position.set(0, 0, 0);

      this.group.add(panelMesh, groove1, groove2, logoPlate);

    } else {
      const cabinetGeo = new THREE.BoxGeometry(4.2, 4.8, 3.2);
      const cabinetMesh = new THREE.Mesh(cabinetGeo, mainMat);

      const doorGeo = new THREE.BoxGeometry(3.9, 4.5, 0.18);
      const doorMesh = new THREE.Mesh(doorGeo, detailMat);
      doorMesh.position.z = 1.65;

      const handleGeo = new THREE.BoxGeometry(0.15, 0.9, 0.15);
      const handleMesh = new THREE.Mesh(handleGeo, metalMat);
      handleMesh.position.set(1.5, 0, 1.8);

      const hinge1Geo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
      const hinge1 = new THREE.Mesh(hinge1Geo, metalMat);
      hinge1.position.set(-1.98, 1.5, 1.65);

      const hinge2 = hinge1.clone();
      hinge2.position.set(-1.98, -1.5, 1.65);

      const edges = new THREE.EdgesGeometry(cabinetGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xfbbf24 }));

      this.group.add(cabinetMesh, doorMesh, handleMesh, hinge1, hinge2, line);
    }

    this.scene.add(this.group);
  }

  private updateObjectGroup() {
    if (!this.group || !this.scene) return;

    this.scene.remove(this.group);
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });

    this.createObjectGroup();
  }

  private resolveCorHex(): number {
    if (!this.corDesejada) {
      if (this.materialTipo.includes('pp')) return 0xf59e0b;
      if (this.materialTipo.includes('ps')) return 0xf8fafc;
      if (this.materialTipo.includes('madeira')) return 0x78350f;
      return 0x475569;
    }

    const c = this.corDesejada.toLowerCase();
    if (c.includes('preto')) return 0x111827;
    if (c.includes('branco')) return 0xf8fafc;
    if (c.includes('azul')) return 0x1d4ed8;
    if (c.includes('amarelo')) return 0xeab308;
    if (c.includes('vermelho')) return 0xdc2626;
    if (c.includes('verde')) return 0x16a34a;
    if (c.includes('cinza') || c.includes('galvanizado')) return 0x64748b;
    if (c.includes('inox') || c.includes('escovado')) return 0x94a3b8;
    if (c.includes('cobre')) return 0xb45309;
    if (c.includes('antracite')) return 0x334155;
    if (c.includes('madeira') || c.includes('mdf') || c.includes('carvalho') || c.includes('nogueira') || c.includes('castanho')) return 0x854d0e;
    
    return 0xf59e0b;
  }

  private getMainMaterial(): THREE.Material {
    const tipo = this.materialTipo.toLowerCase();
    const corHex = this.resolveCorHex();
    
    if (tipo.includes('pp') || tipo.includes('ps')) {
      return new THREE.MeshPhysicalMaterial({ 
        color: corHex, 
        roughness: 0.22, 
        metalness: 0.05,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9
      });
    } else if (tipo.includes('madeira')) {
      return new THREE.MeshStandardMaterial({ 
        color: corHex, 
        roughness: 0.55, 
        metalness: 0.02,
        bumpScale: 0.05
      });
    } else {
      return new THREE.MeshStandardMaterial({ 
        color: corHex, 
        roughness: 0.18, 
        metalness: 0.94,
        envMapIntensity: 1.5
      });
    }
  }

  private getDetailMaterial(): THREE.Material {
    return new THREE.MeshStandardMaterial({ 
      color: 0x090d16, 
      roughness: 0.3, 
      metalness: 0.7 
    });
  }

  private getAccentMaterial(): THREE.Material {
    return new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.25, 
      metalness: 0.6 
    });
  }

  private getMetalAccentMaterial(): THREE.Material {
    return new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      roughness: 0.15, 
      metalness: 0.95 
    });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (this.group) {
      this.group.rotation.y += 0.005;
      this.group.rotation.x = Math.sin(Date.now() * 0.0008) * 0.05;
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}