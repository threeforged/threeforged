declare module 'obj-file-parser' {
  interface ObjVertex {
    x: number;
    y: number;
    z: number;
  }

  interface ObjFaceVertex {
    vertexIndex: number;
    textureCoordsIndex: number;
    vertexNormalIndex: number;
  }

  interface ObjFace {
    material: string;
    group: string;
    smoothingGroup: number;
    vertices: ObjFaceVertex[];
  }

  interface ObjModel {
    name: string;
    vertices: ObjVertex[];
    textureCoords: { u: number; v: number; w: number }[];
    vertexNormals: ObjVertex[];
    faces: ObjFace[];
  }

  interface ObjParseResult {
    models: ObjModel[];
    materialLibraries: string[];
  }

  export default class ObjFileParser {
    constructor(content: string);
    parse(): ObjParseResult;
  }
}
