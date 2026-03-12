import { describe, it, expect } from 'vitest';
import { Document } from '@gltf-transform/core';
import { checkAnimations } from '../../src/rules/animation-check.js';

function createDocumentWithAnimations(
  animCount: number,
  options?: { morphTargets?: boolean },
): Document {
  const doc = new Document();

  for (let i = 0; i < animCount; i++) {
    const animation = doc.createAnimation(`anim_${i}`);
    const node = doc.createNode(`node_${i}`);
    const sampler = doc.createAnimationSampler();

    const inputAccessor = doc.createAccessor().setType('SCALAR').setArray(new Float32Array([0, 1]));
    const outputAccessor = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array([0, 0, 0, 1, 1, 1]));

    sampler.setInput(inputAccessor).setOutput(outputAccessor);

    const channel = doc.createAnimationChannel();
    channel
      .setTargetNode(node)
      .setTargetPath(options?.morphTargets ? 'weights' : 'translation')
      .setSampler(sampler);

    animation.addSampler(sampler).addChannel(channel);
  }

  return doc;
}

describe('checkAnimations', () => {
  it('should return no warnings for documents without animations', () => {
    const doc = new Document();
    const warnings = checkAnimations(doc, 'test.glb');
    expect(warnings).toHaveLength(0);
  });

  it('should warn about animated documents', () => {
    const doc = createDocumentWithAnimations(2);
    const warnings = checkAnimations(doc, 'test.glb');

    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0].rule).toBe('animation-check');
    expect(warnings[0].severity).toBe('warn');
    expect(warnings[0].message).toContain('2 animation(s)');
    expect(warnings[0].message).toContain('test.glb');
  });

  it('should warn about morph target animations', () => {
    const doc = createDocumentWithAnimations(1, { morphTargets: true });
    const warnings = checkAnimations(doc, 'model.glb');

    expect(warnings.length).toBe(2);
    expect(warnings[1].message).toContain('morph target');
  });

  it('should include file name in warning messages', () => {
    const doc = createDocumentWithAnimations(1);
    const warnings = checkAnimations(doc, 'tree.glb');

    expect(warnings[0].message).toContain('tree.glb');
  });
});
