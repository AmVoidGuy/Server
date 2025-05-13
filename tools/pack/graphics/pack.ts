import path from 'path';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';
import { printError } from '#/util/Logger.js';
import { loadOrder, listFiles } from '#/util/NameMap.js';
import { AnimPack, BasePack, ModelPack, shouldBuildFile, shouldBuildFileAny } from '#/util/PackFile.js';

export function packClientModel() {
    if (!shouldBuildFile('tools/pack/graphics/pack.ts', 'data/pack/client/models') && !shouldBuildFileAny('data/src/models', 'data/pack/client/models')) {
        return;
    }

    /* order:
    'base_label.dat',  'ob_point1.dat',
    'ob_point2.dat',   'ob_point3.dat',
    'ob_point4.dat',   'ob_point5.dat',
    'ob_head.dat',     'base_head.dat',
    'frame_head.dat',  'frame_tran1.dat',
    'frame_tran2.dat', 'ob_vertex1.dat',
    'ob_vertex2.dat',  'frame_del.dat',
    'base_type.dat',   'ob_face1.dat',
    'ob_face2.dat',    'ob_face3.dat',
    'ob_face4.dat',    'ob_face5.dat',
    'ob_axis.dat'
    */

    const modelOrder = loadOrder('data/src/pack/model.order');
    const animOrder = loadOrder('data/src/pack/anim.order');
    const baseOrder = loadOrder('data/src/pack/base.order');

    const files = listFiles('data/src/models');

    // ----

    const base_head = Packet.alloc(5);
    const base_type = Packet.alloc(5);
    const base_label = Packet.alloc(5);

    {
        base_head.p2(baseOrder.length);
        let highest = 0;
        for (let i = 0; i < baseOrder.length; i++) {
            const id = baseOrder[i];
            if (id > highest) {
                highest = id;
            }
        }
        base_head.p2(highest);

        for (let i = 0; i < baseOrder.length; i++) {
            const id = baseOrder[i];
            const name = BasePack.getById(id);

            const file = files.find(file => path.basename(file) === `${name}.base`);
            if (!file) {
                printError('missing base file ' + id + ' ' + name);
                continue;
            }

            const data = Packet.load(file);

            data.pos = data.data.length - 4;
            const typeLength = data.g2();
            const labelLength = data.g2();

            base_head.p2(id);
            base_head.p1(typeLength);

            data.pos = 0;

            const p_typeLength = new Uint8Array(typeLength);
            data.gdata(p_typeLength, 0, p_typeLength.length);
            base_type.pdata(p_typeLength, 0, p_typeLength.length);

            const p_labelLength = new Uint8Array(labelLength);
            data.gdata(p_labelLength, 0, p_labelLength.length);
            base_label.pdata(p_labelLength, 0, p_labelLength.length);
        }

        // base_head.save('dump/base_head.dat');
        // base_type.save('dump/base_type.dat');
        // base_label.save('dump/base_label.dat');
    }

    // ----

    const frame_head = Packet.alloc(5);
    const frame_tran1 = Packet.alloc(5);
    const frame_tran2 = Packet.alloc(5);
    const frame_del = Packet.alloc(5);

    {
        frame_head.p2(animOrder.length);
        let highest = 0;
        for (let i = 0; i < animOrder.length; i++) {
            const id = animOrder[i];
            if (id > highest) {
                highest = id;
            }
        }
        frame_head.p2(highest);

        for (let i = 0; i < animOrder.length; i++) {
            const id = animOrder[i];
            const name = AnimPack.getById(id);

            const file = files.find(file => path.basename(file) === `${name}.frame`);
            if (!file) {
                printError('missing frame file ' + id + ' ' + name);
                continue;
            }

            const data = Packet.load(file);

            data.pos = data.data.length - 8;
            const headLength = data.g2();
            const tran1Length = data.g2();
            const tran2Length = data.g2();
            const delLength = data.g2();

            data.pos = 0;

            const p_headLength = new Uint8Array(headLength);
            data.gdata(p_headLength, 0, p_headLength.length);

            const p_tran1Length = new Uint8Array(tran1Length);
            data.gdata(p_tran1Length, 0, p_tran1Length.length);

            const p_tran2Length = new Uint8Array(tran2Length);
            data.gdata(p_tran2Length, 0, p_tran2Length.length);

            const p_delLength = new Uint8Array(delLength);
            data.gdata(p_delLength, 0, p_delLength.length);

            frame_head.pdata(p_headLength, 0, p_headLength.length);
            frame_tran1.pdata(p_tran1Length, 0, p_tran1Length.length);
            frame_tran2.pdata(p_tran2Length, 0, p_tran2Length.length);
            frame_del.pdata(p_delLength, 0, p_delLength.length);
        }

        // frame_head.save('dump/frame_head.dat');
        // frame_tran1.save('dump/frame_tran1.dat');
        // frame_tran2.save('dump/frame_tran2.dat');
        // frame_del.save('dump/frame_del.dat');
    }

    // ----

    const ob_head = Packet.alloc(5);
    const ob_face1 = Packet.alloc(5);
    const ob_face2 = Packet.alloc(5);
    const ob_face3 = Packet.alloc(5);
    const ob_face4 = Packet.alloc(5);
    const ob_face5 = Packet.alloc(5);
    const ob_point1 = Packet.alloc(5);
    const ob_point2 = Packet.alloc(5);
    const ob_point3 = Packet.alloc(5);
    const ob_point4 = Packet.alloc(5);
    const ob_point5 = Packet.alloc(5);
    const ob_vertex1 = Packet.alloc(5);
    const ob_vertex2 = Packet.alloc(5);
    const ob_axis = Packet.alloc(5);

    {
        ob_head.p2(modelOrder.length);

        for (let i = 0; i < modelOrder.length; i++) {
            const id = modelOrder[i];
            const name = ModelPack.getById(id);

            const file = files.find(file => path.basename(file) === `${name}.ob2`);
            if (!file) {
                printError('missing ob2 file ' + id + ' ' + name);
                continue;
            }

            const data = Packet.load(file);

            data.pos = data.data.length - 1;
            const lastByte = data.g1(); 
            data.pos = data.data.length - 2;
            const secondLastByte = data.g1(); 
            data.pos = 0;
            if (lastByte === 255 && secondLastByte === 255) {
                packV1Model(file, id, ob_head, ob_face1, ob_face2, ob_face3, ob_face4,
                    ob_face5, ob_point1, ob_point2, ob_point3, ob_point4,
                    ob_point5, ob_vertex1, ob_vertex2, ob_axis);
            } else if (lastByte == 254 && secondLastByte == 255) {
                packV2Model(file, id, ob_head, ob_face1, ob_face2, ob_face3, ob_face4,
                    ob_face5, ob_point1, ob_point2, ob_point3, ob_point4,
                    ob_point5, ob_vertex1, ob_vertex2, ob_axis);
            } else if (lastByte == 253 && secondLastByte == 255) {
                packV3Model(file, id, ob_head, ob_face1, ob_face2, ob_face3, ob_face4,
                    ob_face5, ob_point1, ob_point2, ob_point3, ob_point4,
                    ob_point5, ob_vertex1, ob_vertex2, ob_axis);
            } else {
                packOldModel(data, id, ob_head, ob_face1, ob_face2, ob_face3, ob_face4,
                    ob_face5, ob_point1, ob_point2, ob_point3, ob_point4,
                    ob_point5, ob_vertex1, ob_vertex2, ob_axis);
            }
        }

        // ob_head.save('dump/ob_head.dat');
        // ob_face1.save('dump/ob_face1.dat');
        // ob_face2.save('dump/ob_face2.dat');
        // ob_face3.save('dump/ob_face3.dat');
        // ob_face4.save('dump/ob_face4.dat');
        // ob_face5.save('dump/ob_face5.dat');
        // ob_point1.save('dump/ob_point1.dat');
        // ob_point2.save('dump/ob_point2.dat');
        // ob_point3.save('dump/ob_point3.dat');
        // ob_point4.save('dump/ob_point4.dat');
        // ob_point5.save('dump/ob_point5.dat');
        // ob_vertex1.save('dump/ob_vertex1.dat');
        // ob_vertex2.save('dump/ob_vertex2.dat');
        // ob_axis.save('dump/ob_axis.dat');
    }

    // ----

    const jag = new Jagfile();

    jag.write('base_label.dat', base_label);
    jag.write('ob_point1.dat', ob_point1);
    jag.write('ob_point2.dat', ob_point2);
    jag.write('ob_point3.dat', ob_point3);
    jag.write('ob_point4.dat', ob_point4);
    jag.write('ob_point5.dat', ob_point5);
    jag.write('ob_head.dat', ob_head);
    jag.write('base_head.dat', base_head);
    jag.write('frame_head.dat', frame_head);
    jag.write('frame_tran1.dat', frame_tran1);
    jag.write('frame_tran2.dat', frame_tran2);
    jag.write('ob_vertex1.dat', ob_vertex1);
    jag.write('ob_vertex2.dat', ob_vertex2);
    jag.write('frame_del.dat', frame_del);
    jag.write('base_type.dat', base_type);
    jag.write('ob_face1.dat', ob_face1);
    jag.write('ob_face2.dat', ob_face2);
    jag.write('ob_face3.dat', ob_face3);
    jag.write('ob_face4.dat', ob_face4);
    jag.write('ob_face5.dat', ob_face5);
    jag.write('ob_axis.dat', ob_axis);

    jag.save('data/pack/client/models');

    base_label.release();
    ob_point1.release();
    ob_point2.release();
    ob_point3.release();
    ob_point4.release();
    ob_point5.release();
    ob_head.release();
    base_head.release();
    frame_head.release();
    frame_tran1.release();
    frame_tran2.release();
    ob_vertex1.release();
    ob_vertex2.release();
    frame_del.release();
    base_type.release();
    ob_face1.release();
    ob_face2.release();
    ob_face3.release();
    ob_face4.release();
    ob_face5.release();
    ob_axis.release();
}

function packOldModel(data: Packet, id: number, ob_head: Packet, ob_face1: Packet, ob_face2: Packet, ob_face3: Packet, ob_face4: Packet, 
    ob_face5: Packet, ob_point1: Packet, ob_point2: Packet, ob_point3: Packet, ob_point4: Packet, 
    ob_point5: Packet, ob_vertex1: Packet, ob_vertex2: Packet, ob_axis: Packet) {
    data.pos = data.data.length - 18;
    const vertexCount = data.g2();
    const faceCount = data.g2();
    const texturedFaceCount = data.g1();

    const hasInfo = data.g1();
    const hasPriorities = data.g1();
    const hasAlpha = data.g1();
    const hasFaceLabels = data.g1();
    const hasVertexLabels = data.g1();

    const vertexXLength = data.g2();
    const vertexYLength = data.g2();
    const vertexZLength = data.g2();
    const faceVertexLength = data.g2();

    ob_head.p2(id);
    ob_head.p2(vertexCount);
    ob_head.p2(faceCount);
    ob_head.p1(texturedFaceCount);
    ob_head.p1(hasInfo);
    ob_head.p1(hasPriorities);
    ob_head.p1(hasAlpha);
    ob_head.p1(hasFaceLabels);
    ob_head.p1(hasVertexLabels);

    data.pos = 0;

    const p_vertexCount = new Uint8Array(vertexCount);
    data.gdata(p_vertexCount, 0, p_vertexCount.length);
    ob_point1.pdata(p_vertexCount, 0, p_vertexCount.length);

    const p_faceCount = new Uint8Array(faceCount);
    data.gdata(p_faceCount, 0, p_faceCount.length);
    ob_vertex2.pdata(p_faceCount, 0, p_faceCount.length);

    if (hasPriorities == 255) {
        const p_faceCount = new Uint8Array(faceCount);
        data.gdata(p_faceCount, 0, p_faceCount.length);
        ob_face3.pdata(p_faceCount, 0, p_faceCount.length);
    }

    if (hasFaceLabels == 1) {
        const p_faceCount = new Uint8Array(faceCount);
        data.gdata(p_faceCount, 0, p_faceCount.length);
        ob_face5.pdata(p_faceCount, 0, p_faceCount.length);
    }

    if (hasInfo == 1) {
        const p_faceCount = new Uint8Array(faceCount);
        data.gdata(p_faceCount, 0, p_faceCount.length);
        ob_face2.pdata(p_faceCount, 0, p_faceCount.length);
    }

    if (hasVertexLabels == 1) {
        const p_vertexCount = new Uint8Array(vertexCount);
        data.gdata(p_vertexCount, 0, p_vertexCount.length);
        ob_point5.pdata(p_vertexCount, 0, p_vertexCount.length);
    }

    if (hasAlpha == 1) {
        const p_faceCount = new Uint8Array(faceCount);
        data.gdata(p_faceCount, 0, p_faceCount.length);
        ob_face4.pdata(p_faceCount, 0, p_faceCount.length);
    }

    const p_faceVertexLength = new Uint8Array(faceVertexLength);
    data.gdata(p_faceVertexLength, 0, p_faceVertexLength.length);
    ob_vertex1.pdata(p_faceVertexLength, 0, p_faceVertexLength.length);

    const p_faceCount2 = new Uint8Array(faceCount * 2);
    data.gdata(p_faceCount2, 0, p_faceCount2.length);
    ob_face1.pdata(p_faceCount2, 0, p_faceCount2.length);

    const p_texturedFaceCount = new Uint8Array(texturedFaceCount * 6);
    data.gdata(p_texturedFaceCount, 0, p_texturedFaceCount.length);
    ob_axis.pdata(p_texturedFaceCount, 0, p_texturedFaceCount.length);

    const p_vertexXLength = new Uint8Array(vertexXLength);
    data.gdata(p_vertexXLength, 0, p_vertexXLength.length);
    ob_point2.pdata(p_vertexXLength, 0, p_vertexXLength.length);

    const p_vertexYLength = new Uint8Array(vertexYLength);
    data.gdata(p_vertexYLength, 0, p_vertexYLength.length);
    ob_point3.pdata(p_vertexYLength, 0, p_vertexYLength.length);

    const p_vertexZLength = new Uint8Array(vertexZLength);
    data.gdata(p_vertexZLength, 0, p_vertexZLength.length);
    ob_point4.pdata(p_vertexZLength, 0, p_vertexZLength.length);
}

function packV1Model(file: string, id: number, ob_head: Packet, ob_face1: Packet, ob_face2: Packet, ob_face3: Packet, ob_face4: Packet, 
    ob_face5: Packet, ob_point1: Packet, ob_point2: Packet, ob_point3: Packet, ob_point4: Packet, 
    ob_point5: Packet, ob_vertex1: Packet, ob_vertex2: Packet, ob_axis: Packet) {
    const data = Packet.load(file);
    let version = 1;
    const buf1 = Packet.load(file);
    const buf2 = Packet.load(file);
    const buf3 = Packet.load(file);
    const buf4 = Packet.load(file);
    const buf5 = Packet.load(file);
    const buf6 = Packet.load(file);
    const buf7 = Packet.load(file);

    buf1.pos = data.length - 23;
    const vertexCount = buf1.g2();
    const faceCount = buf1.g2();
    const texFaceCount = buf1.g1();
    const flags = buf1.g1();

    const hasFaceRenderTypes = (flags & 0x1) === 1;
    //const hasParticles = (flags & 0x2) === 2;
    //const hasBillboards = (flags & 0x4) === 4;
    const hasVersion = (flags & 0x8) === 8;

    if (hasVersion) {
        buf1.pos -= 7;
        version = buf1.g1();
        buf1.pos += 6;
    }

    const modelPriority = buf1.g1();
    const hasFaceAlpha = buf1.g1();
    const hasFaceSkins = buf1.g1();
    const hasFaceTextures = buf1.g1();
    const hasVertexSkins = buf1.g1();
    const modelVerticesX = buf1.g2();
    const modelVerticesY = buf1.g2();
    const modelVerticesZ = buf1.g2();
    const faceIndices = buf1.g2();
    const textureIndices = buf1.g2();

    let simpleTextureFaceCount = 0;
    let complexTextureFaceCount = 0;
    let cubeTextureFaceCount = 0;
    let textureRenderTypes;

    if (texFaceCount > 0) {
        textureRenderTypes = new Int8Array(texFaceCount);
        buf1.pos = 0;

        for (let i = 0; i < texFaceCount; i++) {
            const type = (textureRenderTypes[i] = buf1.g1b());
            if (type === 0) {
                simpleTextureFaceCount++;
            }

            if (type >= 1 && type <= 3) {
                complexTextureFaceCount++;
            }

            if (type === 2) {
                cubeTextureFaceCount++;
            }
        }
    }

    let pos = texFaceCount + vertexCount;
    const vertexFlagspos = pos;
    if (hasFaceRenderTypes) {
        pos += faceCount;
    }

    const faceCompressTypepos = pos;
    pos += faceCount;
    const facePrioritiespos = pos;
    if (modelPriority === 255) {
        pos += faceCount;
    }

    const faceSkinspos = pos;
    if (hasFaceSkins === 1) {
        pos += faceCount;
    }

    const vertexSkinspos = pos;
    if (hasVertexSkins === 1) {
        pos += vertexCount;
    }

    const faceAlphaspos = pos;
    if (hasFaceAlpha === 1) {
        pos += faceCount;
    }

    const faceIndicespos = pos;
    pos += faceIndices;
    const faceMaterialspos = pos;
    if (hasFaceTextures === 1) {
        pos += faceCount * 2;
    }

    const faceTextureIndicespos = pos;
    pos += textureIndices;
    const faceColorspos = pos;
    pos += faceCount * 2;
    const xVertexpos = pos;
    pos += modelVerticesX;
    const yVertexpos = pos;
    pos += modelVerticesY;
    const zVertexpos = pos;
    pos += modelVerticesZ;
    const simpleTexturespos = pos;
    pos += simpleTextureFaceCount * 6;
    const complexTexturespos = pos;
    pos += complexTextureFaceCount * 6;
    let textureBytes = 6;
    if (version === 14) {
        textureBytes = 7;
    } else if (version >= 15) {
        textureBytes = 9;
    }
    const texturesScalespos = pos;
    pos += complexTextureFaceCount * textureBytes;
    const texturesRotationpos = pos;
    pos += complexTextureFaceCount;
    const texturesDirectionpos = pos;
    pos += complexTextureFaceCount;
    const texturesTranslationpos = pos;
    pos += complexTextureFaceCount + cubeTextureFaceCount * 2;
    //const particleEffectspos = pos;
    const verticesCount = vertexCount;
    const textureFaceCount = texFaceCount;
    const verticesX = new Int32Array(vertexCount);
    const verticesY = new Int32Array(vertexCount);
    const verticesZ = new Int32Array(vertexCount);
    const indices1 = new Int32Array(faceCount);
    const indices2 = new Int32Array(faceCount);
    const indices3 = new Int32Array(faceCount);
    const vertexSkins = new Int32Array(verticesCount);
    let faceRenderTypes;
    let faceRenderPriorities;
    //let priority;
    let faceAlphas;
    let faceSkins;
    let faceTextures;
    let textureCoords;
    const textureMappingP = new Int16Array(texFaceCount);
    const textureMappingM = new Int16Array(texFaceCount);
    const textureMappingN = new Int16Array(texFaceCount);
    let textureScaleX;
    let textureScaleY;
    let textureScaleZ;
    let textureRotation;
    let textureDirection;
    let textureSpeed;
    let textureTransU;
    let textureTransV;

    if (hasFaceRenderTypes) {
        faceRenderTypes = new Int8Array(faceCount);
    }

    if (modelPriority === 255) {
        faceRenderPriorities = new Int8Array(faceCount);
    } else {
        //priority = modelPriority;
    }

    if (hasFaceAlpha === 1) {
        faceAlphas = new Int8Array(faceCount);
    }

    if (hasFaceSkins === 1) {
        faceSkins = new Int32Array(faceCount);
    }

    if (hasFaceTextures === 1) {
        faceTextures = new Int16Array(faceCount);
    }

    if (hasFaceTextures === 1 && texFaceCount > 0) {
        textureCoords = new Int8Array(faceCount);
    }

    const faceColors = new Uint16Array(faceCount);
    if (texFaceCount > 0) {
        if (complexTextureFaceCount > 0) {
            textureScaleX = new Int32Array(complexTextureFaceCount);
            textureScaleY = new Int32Array(complexTextureFaceCount);
            textureScaleZ = new Int32Array(complexTextureFaceCount);
            textureRotation = new Int8Array(complexTextureFaceCount);
            textureDirection = new Int8Array(complexTextureFaceCount);
            textureSpeed = new Int32Array(complexTextureFaceCount);
        }
        if (cubeTextureFaceCount > 0) {
            textureTransU = new Int32Array(cubeTextureFaceCount);
            textureTransV = new Int32Array(cubeTextureFaceCount);
        }
    }

    buf1.pos = texFaceCount;
    buf2.pos = xVertexpos;
    buf3.pos = yVertexpos;
    buf4.pos = zVertexpos;
    buf5.pos = vertexSkinspos;
    let lastVertX = 0;
    let lastVertY = 0;
    let lastVertZ = 0;

    for (let i = 0; i < vertexCount; i++) {
        const flag = buf1.g1();
        let deltaVertX = 0;
        if ((flag & 1) !== 0) {
            deltaVertX = buf2.gsmarts();
        }

        let deltaVertY = 0;
        if ((flag & 2) !== 0) {
            deltaVertY = buf3.gsmarts();
        }

        let deltaVertZ = 0;
        if ((flag & 4) !== 0) {
            deltaVertZ = buf4.gsmarts();
        }

        verticesX[i] = lastVertX + deltaVertX;
        verticesY[i] = lastVertY + deltaVertY;
        verticesZ[i] = lastVertZ + deltaVertZ;
        lastVertX = verticesX[i];
        lastVertY = verticesY[i];
        lastVertZ = verticesZ[i];
        if (hasVertexSkins === 1 && vertexSkins) {
            vertexSkins[i] = buf5.g1();
        }
    }

    buf1.pos = faceColorspos;
    buf2.pos = vertexFlagspos;
    buf3.pos = facePrioritiespos;
    buf4.pos = faceAlphaspos;
    buf5.pos = faceSkinspos;
    buf6.pos = faceMaterialspos;
    buf7.pos = faceTextureIndicespos;

    for (let i = 0; i < faceCount; i++) {
        faceColors[i] = buf1.g2();
        if (hasFaceRenderTypes && faceRenderTypes) {
            faceRenderTypes[i] = buf2.g1b();
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            faceRenderPriorities[i] = buf3.g1b();
        }

        if (hasFaceAlpha === 1 && faceAlphas) {
            faceAlphas[i] = buf4.g1b();
        }

        if (hasFaceSkins === 1 && faceSkins) {
            faceSkins[i] = buf5.g1();
        }

        if (hasFaceTextures === 1 && faceTextures) {
            faceTextures[i] = buf6.g2() - 1;
        }

        if (textureCoords) {
            if (faceTextures && faceTextures[i] !== -1) {
                textureCoords[i] = buf7.g1() - 1;
            } else {
                textureCoords[i] = -1;
            }
        }
    }

    buf1.pos = faceIndicespos;
    buf2.pos = faceCompressTypepos;
    let index1 = 0;
    let index2 = 0;
    let index3 = 0;
    let var54 = 0;

    let usedVertexCount = -1;
    for (let i = 0; i < faceCount; i++) {
        const type = buf2.g1();
        if (type === 1) {
            index1 = buf1.gsmarts() + var54;
            index2 = buf1.gsmarts() + index1;
            index3 = buf1.gsmarts() + index2;
            var54 = index3;
            indices1[i] = index1;
            indices2[i] = index2;
            indices3[i] = index3;
            if (index1 > usedVertexCount) {
                usedVertexCount = index1;
            }
            if (index2 > usedVertexCount) {
                usedVertexCount = index2;
            }
            if (index3 > usedVertexCount) {
                usedVertexCount = index3;
            }
        }

        if (type === 2) {
            index2 = index3;
            index3 = buf1.gsmarts() + var54;
            var54 = index3;
            indices1[i] = index1;
            indices2[i] = index2;
            indices3[i] = index3;
            if (index3 > usedVertexCount) {
                usedVertexCount = index3;
            }
        }

        if (type === 3) {
            index1 = index3;
            index3 = buf1.gsmarts() + var54;
            var54 = index3;
            indices1[i] = index1;
            indices2[i] = index2;
            indices3[i] = index3;
            if (index3 > usedVertexCount) {
                usedVertexCount = index3;
            }
        }

        if (type === 4) {
            const var57 = index1;
            index1 = index2;
            index2 = var57;
            index3 = buf1.gsmarts() + var54;
            var54 = index3;
            indices1[i] = index1;
            indices2[i] = var57;
            indices3[i] = index3;
            if (index3 > usedVertexCount) {
                usedVertexCount = index3;
            }
        }
    }
    usedVertexCount++;

    buf1.pos = simpleTexturespos;
    buf2.pos = complexTexturespos;
    buf3.pos = texturesScalespos;
    buf4.pos = texturesRotationpos;
    buf5.pos = texturesDirectionpos;
    buf6.pos = texturesTranslationpos;
    if(textureScaleX && textureScaleY && textureRenderTypes && textureScaleZ && textureRotation && textureDirection && textureSpeed && textureTransU && textureTransV)
        decodeTextureMapping(buf1, buf2, buf3, buf4, buf5, buf6, textureFaceCount, textureRenderTypes, textureMappingP, textureMappingM, textureMappingN, version, textureScaleX, textureScaleY, textureScaleZ, textureRotation, textureDirection, textureSpeed, textureTransU, textureTransV);

    buf1.pos = pos;

    if (version >= 13 && textureScaleX && textureScaleY && textureRenderTypes && textureScaleZ) {
        scaleDown(2, verticesCount, verticesX, verticesY, verticesZ, textureFaceCount, textureScaleX, textureScaleY, textureRenderTypes, textureScaleZ);
    }

    // const var55 = buf1.g1();
    // if (var55 !== 0) {
    //     // new ModelData0();
    //     buf1.g2();
    //     buf1.g2();
    //     buf1.g2();
    //     buf1.readInt();
    // }

    ob_head.p2(id);
    ob_head.p2(vertexCount);
    ob_head.p2(faceCount); 
    ob_head.p1(textureFaceCount);
    ob_head.p1(hasFaceRenderTypes ? 1: 0);
    ob_head.p1(modelPriority);
    ob_head.p1(hasFaceAlpha ? 1 : 0);
    ob_head.p1(hasVertexSkins ? 1 : 0);
    ob_head.p1(hasFaceSkins ? 1 : 0);
    let dx = 0;
    let dy = 0;
    let dz = 0;
    
    for (let i = 0; i < vertexCount; i++) {
        let flag = 0;

        const deltaX = verticesX[i] - dx;
        const deltaY = verticesY[i] - dy;
        const deltaZ = verticesZ[i] - dz;

        if (deltaX !== 0) flag |= 1;
        if (deltaY !== 0) flag |= 2;
        if (deltaZ !== 0) flag |= 4;

        ob_point1.p1(flag);

        if ((flag & 1) !== 0) {
            ob_point2.psmarts(deltaX); 
        }
        
        if ((flag & 2) !== 0) {
            ob_point3.psmarts(deltaY);
        }
        
        if ((flag & 4) !== 0) {
            ob_point4.psmarts(deltaZ);
        }
        
        dx = verticesX[i];
        dy = verticesY[i];
        dz = verticesZ[i];
        
        if (vertexSkins) {
            ob_point5.p1(vertexSkins[i]);
        }
    }
    
    let lastIndex = 0; 
    let texturedFaceCounter = 0;
    
    for (let i = 0; i < faceCount; i++) {
        if (hasFaceTextures === 1 && faceTextures && faceTextures[i] !== -1) {
            ob_face1.p2(faceTextures[i] - 1);
        } else {
            ob_face1.p2(faceColors[i]);
        }

        let currentFaceInfo = 0;

        let baseShadingType = 0;
        if (hasFaceRenderTypes && faceRenderTypes) {
            baseShadingType = faceRenderTypes[i] & 1;
        }

        if (hasFaceTextures === 1 && faceTextures && faceTextures[i] !== -1) {
            let texturedType = (baseShadingType === 1) ? 3 : 2;

            let texCoordIndex = 0;
            if (textureCoords && texturedFaceCounter < textureCoords.length) {
                texCoordIndex = textureCoords[texturedFaceCounter];
                texturedFaceCounter++;
            } else {
                texturedType = baseShadingType;
            }
            currentFaceInfo = (texCoordIndex << 2) | texturedType;

        } else {
            currentFaceInfo = baseShadingType;
        }
        if (hasFaceRenderTypes) {
            ob_face2.p1(currentFaceInfo);
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            ob_face3.p1(faceRenderPriorities[i]);
        }
        
        if (hasFaceAlpha === 1 && faceAlphas) {
            ob_face4.p1(faceAlphas[i]);
        }
        
        if (hasFaceSkins === 1 && faceSkins) {
            ob_face5.p1(faceSkins[i]);
        }

        ob_vertex2.p1(1);

        const currentA = indices1[i];
        const currentB = indices2[i];
        const currentC = indices3[i];

        const delta1 = currentA - lastIndex;
        const delta2 = currentB - currentA; 
        const delta3 = currentC - currentB;  

        ob_vertex1.psmarts(delta1);
        ob_vertex1.psmarts(delta2);
        ob_vertex1.psmarts(delta3);

        lastIndex = currentC;
    }

    for (let i = 0; i < textureFaceCount; i++) {
        ob_axis.p2(textureMappingP[i]);
        ob_axis.p2(textureMappingM[i]);
        ob_axis.p2(textureMappingN[i]);
    }
}

function packV2Model(file: string, id: number, ob_head: Packet, ob_face1: Packet, ob_face2: Packet, ob_face3: Packet, ob_face4: Packet, 
    ob_face5: Packet, ob_point1: Packet, ob_point2: Packet, ob_point3: Packet, ob_point4: Packet, 
    ob_point5: Packet, ob_vertex1: Packet, ob_vertex2: Packet, ob_axis: Packet) {
    const data = Packet.load(file);
    //let version = 2;
    let var2 = false;
    let var3 = false;
    const buf1 = Packet.load(file);
    const buf2 = Packet.load(file);
    const buf3 = Packet.load(file);
    const buf4 = Packet.load(file);
    const buf5 = Packet.load(file);
    buf1.pos = data.length - 23;
    const vertexCount = buf1.g2();
    const faceCount = buf1.g2();
    const texTriangleCount = buf1.g1();
    const hasFaceRenderTypes = buf1.g1();
    const modelPriority = buf1.g1();
    const hasFaceAlpha = buf1.g1();
    const hasFaceSkins = buf1.g1();
    const hasVertexSkins = buf1.g1();
    const hasMayaGroups = buf1.g1();
    const var18 = buf1.g2();
    const var19 = buf1.g2();
    buf1.g2(); // var20
    const var21 = buf1.g2();
    const var22 = buf1.g2();
    const var23 = 0;
    let var47 = var23 + vertexCount;
    const var25 = var47;
    var47 += faceCount;
    const var26 = var47;
    if (modelPriority === 255) {
        var47 += faceCount;
    }

    const var27 = var47;
    if (hasFaceSkins === 1) {
        var47 += faceCount;
    }

    const var28 = var47;
    if (hasFaceRenderTypes === 1) {
        var47 += faceCount;
    }

    const var29 = var47;
    var47 += var22;
    const var30 = var47;
    if (hasFaceAlpha === 1) {
        var47 += faceCount;
    }

    const var31 = var47;
    var47 += var21;
    const var32 = var47;
    var47 += faceCount * 2;
    const var33 = var47;
    var47 += texTriangleCount * 6;
    const var34 = var47;
    var47 += var18;
    const var35 = var47;
    var47 += var19;
    // const var10000 = var47 + var20;
    const verticesCount = vertexCount;
    const textureFaceCount = texTriangleCount;
    const verticesX = new Int32Array(vertexCount);
    const verticesY = new Int32Array(vertexCount);
    const verticesZ = new Int32Array(vertexCount);
    const indices1 = new Int32Array(faceCount);
    const indices2 = new Int32Array(faceCount);
    const indices3 = new Int32Array(faceCount);
    const vertexSkins = new Int32Array(verticesCount);
    let faceRenderTypes;
    let faceRenderPriorities;
    //let priority;
    let faceAlphas;
    let faceSkins;
    let faceTextures;
    let textureCoords;
    let textureMappingP;
    let textureMappingM;
    let textureMappingN;
    // let textureScaleX;
    // let textureScaleY;
    // let textureScaleZ;
    // let textureRotation;
    // let textureDirection;
    // let textureSpeed;
    // let textureTransU;
    // let textureTransV;
    let textureRenderTypes;
    let animMayaGroups;
    let animMayaScales;

    if (texTriangleCount > 0) {
        textureRenderTypes = new Int8Array(texTriangleCount);
        textureMappingP = new Int16Array(texTriangleCount);
        textureMappingM = new Int16Array(texTriangleCount);
        textureMappingN = new Int16Array(texTriangleCount);
    }

    if (hasFaceRenderTypes === 1) {
        faceRenderTypes = new Int8Array(faceCount);
        textureCoords = new Int8Array(faceCount);
        faceTextures = new Int16Array(faceCount);
    }

    if (modelPriority === 255) {
        faceRenderPriorities = new Int8Array(faceCount);
    } else {
        //priority = modelPriority;
    }

    if (hasFaceAlpha === 1) {
        faceAlphas = new Int8Array(faceCount);
    }

    if (hasFaceSkins === 1) {
        faceSkins = new Int32Array(faceCount);
    }

    if (hasMayaGroups === 1) {
        animMayaGroups = new Array(vertexCount);
        animMayaScales = new Array(vertexCount);
    }

    const faceColors = new Uint16Array(faceCount);
    buf1.pos = var23;
    buf2.pos = var34;
    buf3.pos = var35;
    buf4.pos = var47;
    buf5.pos = var29;
    let lastVertX = 0;
    let lastVertY = 0;
    let lastVertZ = 0;

    for (let i = 0; i < vertexCount; i++) {
        const flag = buf1.g1();
        let deltaVertX = 0;
        if ((flag & 1) !== 0) {
            deltaVertX = buf2.gsmarts();
        }

        let deltaVertY = 0;
        if ((flag & 2) !== 0) {
            deltaVertY = buf3.gsmarts();
        }

        let deltaVertZ = 0;
        if ((flag & 4) !== 0) {
            deltaVertZ = buf4.gsmarts();
        }

        verticesX[i] = lastVertX + deltaVertX;
        verticesY[i] = lastVertY + deltaVertY;
        verticesZ[i] = lastVertZ + deltaVertZ;
        lastVertX = verticesX[i];
        lastVertY = verticesY[i];
        lastVertZ = verticesZ[i];
        if (hasVertexSkins === 1 && vertexSkins) {
            vertexSkins[i] = buf5.g1();
        }
    }

    if (hasMayaGroups === 1) {
        for (let i = 0; i < vertexCount; i++) {
            const var41 = buf5.g1();
            if(animMayaGroups && animMayaScales) {
                animMayaGroups[i] = new Int32Array(var41);
                animMayaScales[i] = new Int32Array(var41);
            }

            for (let j = 0; j < var41; j++) {
                if(animMayaGroups && animMayaScales) {
                    animMayaGroups[i][j] = buf5.g1();
                    animMayaScales[i][j] = buf5.g1();
                }
            }
        }
    }

    buf1.pos = var32;
    buf2.pos = var28;
    buf3.pos = var26;
    buf4.pos = var30;
    buf5.pos = var27;

    for (let i = 0; i < faceCount; i++) {
        faceColors[i] = buf1.g2();
        if (hasFaceRenderTypes === 1 && faceRenderTypes && textureCoords && faceTextures) {
            const var41 = buf2.g1();
            if ((var41 & 1) === 1) {
                faceRenderTypes[i] = 1;
                var2 = true;
            } else {
                faceRenderTypes[i] = 0;
            }

            if ((var41 & 2) === 2) {
                textureCoords[i] = var41 >> 2;
                faceTextures[i] = faceColors[i];
                faceColors[i] = 127;
                if (faceTextures[i] !== -1) {
                    var3 = true;
                }
            } else {
                textureCoords[i] = -1;
                faceTextures[i] = -1;
            }
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            faceRenderPriorities[i] = buf3.g1b();
        }

        if (hasFaceAlpha === 1 && faceAlphas) {
            faceAlphas[i] = buf4.g1b();
        }

        if (hasFaceSkins === 1 && faceSkins) {
            faceSkins[i] = buf5.g1();
        }
    }

    buf1.pos = var31;
    buf2.pos = var25;
    let var40 = 0;
    let var41 = 0;
    let var42 = 0;
    let var43 = 0;

    for (let i = 0; i < faceCount; i++) {
        const var45 = buf2.g1();
        if (var45 === 1) {
            var40 = buf1.gsmarts() + var43;
            var41 = buf1.gsmarts() + var40;
            var42 = buf1.gsmarts() + var41;
            var43 = var42;
            indices1[i] = var40;
            indices2[i] = var41;
            indices3[i] = var42;
        }

        if (var45 === 2) {
            var41 = var42;
            var42 = buf1.gsmarts() + var43;
            var43 = var42;
            indices1[i] = var40;
            indices2[i] = var41;
            indices3[i] = var42;
        }

        if (var45 === 3) {
            var40 = var42;
            var42 = buf1.gsmarts() + var43;
            var43 = var42;
            indices1[i] = var40;
            indices2[i] = var41;
            indices3[i] = var42;
        }

        if (var45 === 4) {
            const var46 = var40;
            var40 = var41;
            var41 = var46;
            var42 = buf1.gsmarts() + var43;
            var43 = var42;
            indices1[i] = var40;
            indices2[i] = var46;
            indices3[i] = var42;
        }
    }

    buf1.pos = var33;

    for (let i = 0; i < texTriangleCount; i++) {
        if(textureRenderTypes && textureMappingP && textureMappingM && textureMappingN) {
            textureRenderTypes[i] = 0;
            textureMappingP[i] = buf1.g2();
            textureMappingM[i] = buf1.g2();
            textureMappingN[i] = buf1.g2();
        }
    }

    if (textureCoords) {
        let var48 = false;

        for (let i = 0; i < faceCount; i++) {
            const coord = textureCoords[i] & 255;
            if (coord !== 255) {
                if(textureMappingP && textureMappingM && textureMappingN) {
                    if (
                        indices1[i] === (textureMappingP[coord] & 0xffff) &&
                        indices2[i] === (textureMappingM[coord] & 0xffff) &&
                        indices3[i] === (textureMappingN[coord] & 0xffff)
                    ) {
                        textureCoords[i] = -1;
                    } else {
                        var48 = true;
                    }
                }
            }
        }

        if (!var48) {
            textureCoords = undefined;
        }
    }

    if (!var3) {
        faceTextures = undefined;
    }

    if (!var2) {
        faceRenderTypes = undefined;
    }

    ob_head.p2(id);
    ob_head.p2(vertexCount);
    ob_head.p2(faceCount); 
    ob_head.p1(textureFaceCount);
    ob_head.p1(hasFaceRenderTypes ? 1: 0);
    ob_head.p1(modelPriority);
    ob_head.p1(hasFaceAlpha ? 1 : 0);
    ob_head.p1(hasVertexSkins ? 1 : 0);
    ob_head.p1(hasFaceSkins ? 1 : 0);
    let dx = 0;
    let dy = 0;
    let dz = 0;
    
    for (let i = 0; i < vertexCount; i++) {
        let flag = 0;

        const deltaX = verticesX[i] - dx;
        const deltaY = verticesY[i] - dy;
        const deltaZ = verticesZ[i] - dz;

        if (deltaX !== 0) flag |= 1;
        if (deltaY !== 0) flag |= 2;
        if (deltaZ !== 0) flag |= 4;

        ob_point1.p1(flag);

        if ((flag & 1) !== 0) {
            ob_point2.psmarts(deltaX); 
        }
        
        if ((flag & 2) !== 0) {
            ob_point3.psmarts(deltaY);
        }
        
        if ((flag & 4) !== 0) {
            ob_point4.psmarts(deltaZ);
        }
        
        dx = verticesX[i];
        dy = verticesY[i];
        dz = verticesZ[i];
        
        if (vertexSkins) {
            ob_point5.p1(vertexSkins[i]);
        }
    }
    
    let lastIndex = 0;

    for (let i = 0; i < faceCount; i++) {
        if (hasFaceRenderTypes === 1 && faceRenderTypes && textureCoords && faceTextures && 
            textureCoords[i] !== -1 && faceTextures[i] !== -1) {
            ob_face1.p2(faceTextures[i]);
        } else {
            ob_face1.p2(faceColors[i]);
        }

        if (hasFaceRenderTypes === 1 && faceRenderTypes) {
            let currentFaceInfo = 0;
            
            if (textureCoords && faceTextures && textureCoords[i] !== -1 && faceTextures[i] !== -1) {
                const baseShadingType = faceRenderTypes[i] & 1;
                const texCoordIndex = textureCoords[i];

                currentFaceInfo = (baseShadingType | 0x02 | (texCoordIndex << 2));
            } else {
                currentFaceInfo = faceRenderTypes[i] & 1;
            }
            
            ob_face2.p1(currentFaceInfo);
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            ob_face3.p1(faceRenderPriorities[i]);
        }
        
        if (hasFaceAlpha === 1 && faceAlphas) {
            ob_face4.p1(faceAlphas[i]);
        }
        
        if (hasFaceSkins === 1 && faceSkins) {
            ob_face5.p1(faceSkins[i]);
        }

        ob_vertex2.p1(1);

        const currentA = indices1[i];
        const currentB = indices2[i];
        const currentC = indices3[i];

        const delta1 = currentA - lastIndex;
        const delta2 = currentB - currentA; 
        const delta3 = currentC - currentB;  

        ob_vertex1.psmarts(delta1);
        ob_vertex1.psmarts(delta2);
        ob_vertex1.psmarts(delta3);

        lastIndex = currentC;
    }

    for (let i = 0; i < textureFaceCount; i++) {
        if(textureMappingP && textureMappingM && textureMappingN) {
            ob_axis.p2(textureMappingP[i]);
            ob_axis.p2(textureMappingM[i]);
            ob_axis.p2(textureMappingN[i]);
        }
    }
}

function packV3Model(file: string, id: number, ob_head: Packet, ob_face1: Packet, ob_face2: Packet, ob_face3: Packet, ob_face4: Packet, 
    ob_face5: Packet, ob_point1: Packet, ob_point2: Packet, ob_point3: Packet, ob_point4: Packet, 
    ob_point5: Packet, ob_vertex1: Packet, ob_vertex2: Packet, ob_axis: Packet) {
    const data = Packet.load(file);
    //let version = 3;
    const buf1 = Packet.load(file);
    const buf2 = Packet.load(file);
    const buf3 = Packet.load(file);
    const buf4 = Packet.load(file);
    const buf5 = Packet.load(file);
    const buf6 = Packet.load(file);
    const buf7 = Packet.load(file);
    buf1.pos = data.length - 26;
    const vertexCount = buf1.g2();
    const faceCount = buf1.g2();
    const texTriangleCount = buf1.g1();
    const hasFaceRenderTypes = buf1.g1();
    const modelPriority = buf1.g1();
    const hasFaceAlpha = buf1.g1();
    const hasFaceSkins = buf1.g1();
    const hasFaceTextures = buf1.g1();
    const hasVertexSkins = buf1.g1();
    const hasMayaGroups = buf1.g1();
    const var19 = buf1.g2();
    const var20 = buf1.g2();
    const var21 = buf1.g2();
    const var22 = buf1.g2();
    const var23 = buf1.g2();
    const var24 = buf1.g2();
    let simpleTextureFaceCount = 0;
    let complexTextureFaceCount = 0;
    let cubeTextureFaceCount = 0;
    let textureRenderTypes;
    if (texTriangleCount > 0) {
        textureRenderTypes = new Int8Array(texTriangleCount);
        buf1.pos = 0;

        for (let i = 0; i < texTriangleCount; i++) {
            const type = (textureRenderTypes[i] = buf1.g1b());
            if (type === 0) {
                simpleTextureFaceCount++;
            }

            if (type >= 1 && type <= 3) {
                complexTextureFaceCount++;
            }

            if (type === 2) {
                cubeTextureFaceCount++;
            }
        }
    }

    let var28 = texTriangleCount + vertexCount;
    const var30 = var28;
    if (hasFaceRenderTypes === 1) {
        var28 += faceCount;
    }

    const var31 = var28;
    var28 += faceCount;
    const var32 = var28;
    if (modelPriority === 255) {
        var28 += faceCount;
    }

    const var33 = var28;
    if (hasFaceSkins === 1) {
        var28 += faceCount;
    }

    const var34 = var28;
    var28 += var24;
    const var35 = var28;
    if (hasFaceAlpha === 1) {
        var28 += faceCount;
    }

    const var36 = var28;
    var28 += var22;
    const var37 = var28;
    if (hasFaceTextures === 1) {
        var28 += faceCount * 2;
    }

    const var38 = var28;
    var28 += var23;
    const var39 = var28;
    var28 += faceCount * 2;
    const var40 = var28;
    var28 += var19;
    const var41 = var28;
    var28 += var20;
    const var42 = var28;
    var28 += var21;
    const var43 = var28;
    var28 += simpleTextureFaceCount * 6;
    const var44 = var28;
    var28 += complexTextureFaceCount * 6;
    const var45 = var28;
    var28 += complexTextureFaceCount * 6;
    const var46 = var28;
    var28 += complexTextureFaceCount * 2;
    const var47 = var28;
    var28 += complexTextureFaceCount;
    const var48 = var28;
    var28 += complexTextureFaceCount * 2 + cubeTextureFaceCount * 2;
    const verticesCount = vertexCount;
    const textureFaceCount = texTriangleCount;
    const verticesX = new Int32Array(vertexCount);
    const verticesY = new Int32Array(vertexCount);
    const verticesZ = new Int32Array(vertexCount);
    const indices1 = new Int32Array(faceCount);
    const indices2 = new Int32Array(faceCount);
    const indices3 = new Int32Array(faceCount);
    const vertexSkins = new Int32Array(verticesCount);
    let faceRenderTypes;
    let faceRenderPriorities;
    // let priority;
    let faceAlphas;
    let faceSkins;
    let faceTextures;
    let textureCoords;
    let textureMappingP;
    let textureMappingM;
    let textureMappingN;
    // let textureScaleX;
    // let textureScaleY;
    // let textureScaleZ;
    // let textureRotation;
    // let textureDirection;
    // let textureSpeed;
    // let textureTransU;
    // let textureTransV;
    let animMayaGroups;
    let animMayaScales;

    if (hasFaceRenderTypes === 1) {
        faceRenderTypes = new Int8Array(faceCount);
    }

    if (modelPriority === 255) {
        faceRenderPriorities = new Int8Array(faceCount);
    } else {
        //priority = modelPriority;
    }

    if (hasFaceAlpha === 1) {
        faceAlphas = new Int8Array(faceCount);
    }

    if (hasFaceSkins === 1) {
        faceSkins = new Int32Array(faceCount);
    }

    if (hasFaceTextures === 1) {
        faceTextures = new Int16Array(faceCount);
    }

    if (hasFaceTextures === 1 && texTriangleCount > 0) {
        textureCoords = new Int8Array(faceCount);
    }

    if (hasMayaGroups === 1) {
        animMayaGroups = new Array(vertexCount);
        animMayaScales = new Array(vertexCount);
    }

    const faceColors = new Uint16Array(faceCount);
    if (texTriangleCount > 0) {
        textureMappingP = new Int16Array(texTriangleCount);
        textureMappingM = new Int16Array(texTriangleCount);
        textureMappingN = new Int16Array(texTriangleCount);
        if (complexTextureFaceCount > 0) {
            // textureScaleX = new Int32Array(complexTextureFaceCount);
            // textureScaleY = new Int32Array(complexTextureFaceCount);
            // textureScaleZ = new Int32Array(complexTextureFaceCount);
            // textureRotation = new Int8Array(complexTextureFaceCount);
            // textureDirection = new Int8Array(complexTextureFaceCount);
            // textureSpeed = new Int32Array(complexTextureFaceCount);
        }
        if (cubeTextureFaceCount > 0) {
            // textureTransU = new Int32Array(cubeTextureFaceCount);
            // textureTransV = new Int32Array(cubeTextureFaceCount);
        }
    }

    buf1.pos = texTriangleCount;
    buf2.pos = var40;
    buf3.pos = var41;
    buf4.pos = var42;
    buf5.pos = var34;
    let lastVertX = 0;
    let lastVertY = 0;
    let lastVertZ = 0;

    for (let i = 0; i < vertexCount; i++) {
        const flag = buf1.g1();
        let deltaVertX = 0;
        if ((flag & 1) !== 0) {
            deltaVertX = buf2.gsmarts();
        }

        let deltaVertY = 0;
        if ((flag & 2) !== 0) {
            deltaVertY = buf3.gsmarts();
        }

        let deltaVertZ = 0;
        if ((flag & 4) !== 0) {
            deltaVertZ = buf4.gsmarts();
        }

        verticesX[i] = lastVertX + deltaVertX;
        verticesY[i] = lastVertY + deltaVertY;
        verticesZ[i] = lastVertZ + deltaVertZ;
        lastVertX = verticesX[i];
        lastVertY = verticesY[i];
        lastVertZ = verticesZ[i];
        if (hasVertexSkins === 1 && vertexSkins) {
            vertexSkins[i] = buf5.g1();
        }
    }

    if (hasMayaGroups === 1 && animMayaGroups && animMayaScales) {
        for (let i = 0; i < vertexCount; i++) {
            const var54 = buf5.g1();
            animMayaGroups[i] = new Int32Array(var54);
            animMayaScales[i] = new Int32Array(var54);

            for (let j = 0; j < var54; j++) {
                animMayaGroups[i][j] = buf5.g1();
                animMayaScales[i][j] = buf5.g1();
            }
        }
    }

    buf1.pos = var39;
    buf2.pos = var30;
    buf3.pos = var32;
    buf4.pos = var35;
    buf5.pos = var33;
    buf6.pos = var37;
    buf7.pos = var38;

    for (let i = 0; i < faceCount; i++) {
        faceColors[i] = buf1.g2();
        if (hasFaceRenderTypes === 1 && faceRenderTypes) {
            faceRenderTypes[i] = buf2.g1b();
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            faceRenderPriorities[i] = buf3.g1b();
        }

        if (hasFaceAlpha === 1 && faceAlphas) {
            faceAlphas[i] = buf4.g1b();
        }

        if (hasFaceSkins === 1 && faceSkins) {
            faceSkins[i] = buf5.g1();
        }

        if (hasFaceTextures === 1 && faceTextures) {
            faceTextures[i] = buf6.g2() - 1;
        }

        if (textureCoords && faceTextures && faceTextures[i] !== -1) {
            textureCoords[i] = buf7.g1() - 1;
        }
    }

    buf1.pos = var36;
    buf2.pos = var31;
    let var53 = 0;
    let var54 = 0;
    let var55 = 0;
    let var56 = 0;

    for (let i = 0; i < faceCount; i++) {
        const type = buf2.g1();
        if (type === 1) {
            var53 = buf1.gsmarts() + var56;
            var54 = buf1.gsmarts() + var53;
            var55 = buf1.gsmarts() + var54;
            var56 = var55;
            indices1[i] = var53;
            indices2[i] = var54;
            indices3[i] = var55;
        }

        if (type === 2) {
            var54 = var55;
            var55 = buf1.gsmarts() + var56;
            var56 = var55;
            indices1[i] = var53;
            indices2[i] = var54;
            indices3[i] = var55;
        }

        if (type === 3) {
            var53 = var55;
            var55 = buf1.gsmarts() + var56;
            var56 = var55;
            indices1[i] = var53;
            indices2[i] = var54;
            indices3[i] = var55;
        }

        if (type === 4) {
            const var59 = var53;
            var53 = var54;
            var54 = var59;
            var55 = buf1.gsmarts() + var56;
            var56 = var55;
            indices1[i] = var53;
            indices2[i] = var59;
            indices3[i] = var55;
        }
    }

    buf1.pos = var43;
    buf2.pos = var44;
    buf3.pos = var45;
    buf4.pos = var46;
    buf5.pos = var47;
    buf6.pos = var48;

    for (let i = 0; i < texTriangleCount; i++) {
        if(textureRenderTypes && textureMappingP && textureMappingM && textureMappingN) {
            const type = textureRenderTypes[i] & 255;
            if (type === 0) {
                textureMappingP[i] = buf1.g2();
                textureMappingM[i] = buf1.g2();
                textureMappingN[i] = buf1.g2();
            }
        }
    }

    buf1.pos = var28;
    const var57 = buf1.g1();
    if (var57 !== 0) {
        // new ModelData0();
        buf1.g2();
        buf1.g2();
        buf1.g2();
        buf1.g4();
    }

    ob_head.p2(id);
    ob_head.p2(vertexCount);
    ob_head.p2(faceCount); 
    ob_head.p1(textureFaceCount);
    ob_head.p1(hasFaceRenderTypes ? 1: 0);
    ob_head.p1(modelPriority);
    ob_head.p1(hasFaceAlpha ? 1 : 0);
    ob_head.p1(hasVertexSkins ? 1 : 0);
    ob_head.p1(hasFaceSkins ? 1 : 0);
    let dx = 0;
    let dy = 0;
    let dz = 0;
    
    for (let i = 0; i < vertexCount; i++) {
        let flag = 0;

        const deltaX = verticesX[i] - dx;
        const deltaY = verticesY[i] - dy;
        const deltaZ = verticesZ[i] - dz;

        if (deltaX !== 0) flag |= 1;
        if (deltaY !== 0) flag |= 2;
        if (deltaZ !== 0) flag |= 4;

        ob_point1.p1(flag);

        if ((flag & 1) !== 0) {
            ob_point2.psmarts(deltaX); 
        }
        
        if ((flag & 2) !== 0) {
            ob_point3.psmarts(deltaY);
        }
        
        if ((flag & 4) !== 0) {
            ob_point4.psmarts(deltaZ);
        }
        
        dx = verticesX[i];
        dy = verticesY[i];
        dz = verticesZ[i];
        
        if (vertexSkins) {
            ob_point5.p1(vertexSkins[i]);
        }
    }
    
    let lastIndex = 0; 
    let texturedFaceCounter = 0;
    for (let i = 0; i < faceCount; i++) {
        if (hasFaceTextures === 1 && faceTextures && faceTextures[i] !== -1) {
            ob_face1.p2(faceTextures[i] - 1);
        } else {
            ob_face1.p2(faceColors[i]);
        }

        let currentFaceInfo = 0;

        let baseShadingType = 0;
        if (hasFaceRenderTypes === 1 && faceRenderTypes) {
            baseShadingType = faceRenderTypes[i] & 1;
        }

        if (hasFaceTextures === 1 && faceTextures && faceTextures[i] !== -1) {
            let texturedType = (baseShadingType === 1) ? 3 : 2;

            let texCoordIndex = 0;
            if (textureCoords && texturedFaceCounter < textureCoords.length) {
                texCoordIndex = textureCoords[texturedFaceCounter];
                texturedFaceCounter++;
            } else {
                texturedType = baseShadingType;
            }
            currentFaceInfo = (texCoordIndex << 2) | texturedType;

        } else {
            currentFaceInfo = baseShadingType;
        }
        if (hasFaceRenderTypes) {
            ob_face2.p1(currentFaceInfo);
        }

        if (modelPriority === 255 && faceRenderPriorities) {
            ob_face3.p1(faceRenderPriorities[i]);
        }
        
        if (hasFaceAlpha === 1 && faceAlphas) {
            ob_face4.p1(faceAlphas[i]);
        }
        
        if (hasFaceSkins === 1 && faceSkins) {
            ob_face5.p1(faceSkins[i]);
        }

        ob_vertex2.p1(1);

        const currentA = indices1[i];
        const currentB = indices2[i];
        const currentC = indices3[i];

        const delta1 = currentA - lastIndex;
        const delta2 = currentB - currentA; 
        const delta3 = currentC - currentB;  

        ob_vertex1.psmarts(delta1);
        ob_vertex1.psmarts(delta2);
        ob_vertex1.psmarts(delta3);

        lastIndex = currentC;
    }
    for (let i = 0; i < textureFaceCount; i++) {
        if(textureMappingP && textureMappingM && textureMappingN) {
            ob_axis.p2(textureMappingP[i]);
            ob_axis.p2(textureMappingM[i]);
            ob_axis.p2(textureMappingN[i]);
        }
    }
}

function decodeTextureMapping(
    simpleBuffer: Packet,
    complexBuffer: Packet,
    scaleBuffer: Packet,
    rotationBuffer: Packet,
    directionBuffer: Packet,
    translationBuffer: Packet,
    textureFaceCount: number,
    textureRenderTypes: Int8Array,
    textureMappingP: Int16Array, textureMappingM: Int16Array, textureMappingN: Int16Array, version: number, textureScaleX: Int32Array, textureScaleY: Int32Array, textureScaleZ: Int32Array, textureRotation: Int8Array, textureDirection: Int8Array, textureSpeed: Int32Array, textureTransU: Int32Array, textureTransV: Int32Array
): void {
    for (let i = 0; i < textureFaceCount; i++) {
        const type = textureRenderTypes[i] & 0xff;
        if (type === 0) {
            textureMappingP[i] = simpleBuffer.g2();
            textureMappingM[i] = simpleBuffer.g2();
            textureMappingN[i] = simpleBuffer.g2();
        }
        if (type === 1) {
            textureMappingP[i] = complexBuffer.g2();
            textureMappingM[i] = complexBuffer.g2();
            textureMappingN[i] = complexBuffer.g2();
            if (version < 15) {
                textureScaleX[i] = scaleBuffer.g2();
                if (version >= 14) {
                    textureScaleY[i] = scaleBuffer.g3();
                } else {
                    textureScaleY[i] = scaleBuffer.g2();
                }
                textureScaleZ[i] = scaleBuffer.g2();
            } else {
                textureScaleX[i] = scaleBuffer.g3();
                textureScaleY[i] = scaleBuffer.g3();
                textureScaleZ[i] = scaleBuffer.g3();
            }
            textureRotation[i] = rotationBuffer.g1b();
            textureDirection[i] = directionBuffer.g1b();
            textureSpeed[i] = translationBuffer.g1b();
        }
        if (type === 2) {
            textureMappingP[i] = complexBuffer.g2();
            textureMappingM[i] = complexBuffer.g2();
            textureMappingN[i] = complexBuffer.g2();
            if (version < 15) {
                textureScaleX[i] = scaleBuffer.g2();
                if (version >= 14) {
                    textureScaleY[i] = scaleBuffer.g3();
                } else {
                    textureScaleY[i] = scaleBuffer.g2();
                }
                textureScaleZ[i] = scaleBuffer.g2();
            } else {
                textureScaleX[i] = scaleBuffer.g3();
                textureScaleY[i] = scaleBuffer.g3();
                textureScaleZ[i] = scaleBuffer.g3();
            }
            textureRotation[i] = rotationBuffer.g1b();
            textureDirection[i] = directionBuffer.g1b();
            textureSpeed[i] = translationBuffer.g1b();
            textureTransU[i] = translationBuffer.g1b();
            textureTransV[i] = translationBuffer.g1b();
        }
        if (type === 3) {
            // same as 1, TODO: combine
            textureMappingP[i] = complexBuffer.g2();
            textureMappingM[i] = complexBuffer.g2();
            textureMappingN[i] = complexBuffer.g2();
            if (version < 15) {
                textureScaleX[i] = scaleBuffer.g2();
                if (version >= 14) {
                    textureScaleY[i] = scaleBuffer.g3();
                } else {
                    textureScaleY[i] = scaleBuffer.g2();
                }
                textureScaleZ[i] = scaleBuffer.g2();
            } else {
                textureScaleX[i] = scaleBuffer.g3();
                textureScaleY[i] = scaleBuffer.g3();
                textureScaleZ[i] = scaleBuffer.g3();
            }
            textureRotation[i] = rotationBuffer.g1b();
            textureDirection[i] = directionBuffer.g1b();
            textureSpeed[i] = translationBuffer.g1b();
        }
    }
}

function scaleDown(n: number, verticesCount: number, verticesX: Int32Array, verticesY: Int32Array, verticesZ: Int32Array, textureFaceCount: number, textureScaleX: Int32Array, textureScaleY: Int32Array, textureRenderTypes: Int8Array, textureScaleZ: Int32Array): void {
    for (let i = 0; i < verticesCount; i++) {
        verticesX[i] >>= n;
        verticesY[i] >>= n;
        verticesZ[i] >>= n;
    }
    if (textureFaceCount > 0 && textureScaleX) {
        for (let i = 0; i < textureFaceCount; i++) {
            textureScaleX[i] >>= n;
            textureScaleY[i] >>= n;
            if (textureRenderTypes[i] !== 1) {
                textureScaleZ[i] >>= n;
            }
        }
    }
}
