import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { dropShadowBlobs } from '../pages/drive/BusViewer';

function sheet(name: string, width: number, length: number, y: number, transparent: boolean) {
  const geometry = new PlaneGeometry(width, length).rotateX(-Math.PI / 2).translate(0, y, 0);
  return new Mesh(geometry, new MeshStandardMaterial({ name, transparent }));
}

function bus() {
  const root = new Group();
  root.add(
    new Mesh(new BoxGeometry(2.55, 3.4, 10.8).translate(0, 2, 0), new MeshStandardMaterial()),
  );
  return root;
}

describe('bus preview shadows', () => {
  it('drops a shadow sheet that is not named as one', () => {
    const root = bus();
    root.add(sheet('re_sh.tga', 2.78, 10.8, 0.12, true));
    dropShadowBlobs(root);
    expect(root.children).toHaveLength(1);
  });

  it('keeps flat parts that are opaque, high or narrow', () => {
    const root = bus();
    root.add(sheet('floor.tga', 2.4, 10, 0.4, false));
    root.add(sheet('roof.tga', 2.4, 10, 3.7, true));
    root.add(sheet('step.tga', 1, 0.4, 0.12, true));
    dropShadowBlobs(root);
    expect(root.children).toHaveLength(4);
  });
});
