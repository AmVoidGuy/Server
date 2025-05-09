import fs from 'fs';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';
import { shouldBuildFile, shouldBuildFileAny } from '#/util/PackFile.js';
import { convertImage } from '#/util/PixPack.js';

export async function packClientTexture() {
    if (!shouldBuildFileAny('data/src/textures', 'data/pack/client/textures') && !shouldBuildFile('tools/pack/sprite/textures.ts', 'data/pack/client/textures')) {
        return;
    }

    const order = [
        '0.dat',
        '1.dat',
        '2.dat',
        '3.dat',
        '4.dat',
        '5.dat',
        '6.dat',
        '7.dat',
        '8.dat',
        '9.dat',
        'index.dat',
        '10.dat',
        '11.dat',
        '12.dat',
        '13.dat',
        '14.dat',
        '15.dat',
        '16.dat',
        '17.dat',
        '18.dat',
        '19.dat',
        '20.dat',
        '21.dat',
        '22.dat',
        '23.dat',
        '24.dat',
        '25.dat',
        '26.dat',
        '27.dat',
        '28.dat',
        '29.dat',
        '30.dat',
        '31.dat',
        '32.dat',
        '33.dat',
        '34.dat',
        '35.dat',
        '36.dat',
        '37.dat',
        '38.dat',
        '39.dat',
        '40.dat',
        '41.dat',
        '42.dat',
        '43.dat',
        '44.dat',
        '45.dat',
        '46.dat',
        '47.dat',
        '48.dat',
        '49.dat',
        '50.dat',
        '51.dat',
        '52.dat',
        '53.dat',
        '55.dat',
        '56.dat',
        '57.dat',
        '58.dat',
        '59.dat',
        '60.dat',
        '61.dat',
        '62.dat',
        '63.dat',
        '64.dat',
        '65.dat',
        '66.dat',
        '67.dat',
        '68.dat',
        '69.dat',
        '70.dat',
        '71.dat',
        '72.dat',
        '73.dat',
        '74.dat',
        '75.dat',
        '76.dat',
        '77.dat',
        '78.dat',
        '79.dat',
        '80.dat',
        '81.dat',
        '82.dat',
        '83.dat',
        '84.dat',
        '85.dat',
        '86.dat',
        '87.dat',
        '88.dat',
        '89.dat',
        '90.dat',
        '91.dat',
        '92.dat',
        '93.dat',
        '94.dat',
        '95.dat',
        '96.dat',
        '97.dat',
        '98.dat',
        '99.dat',
        '100.dat',
        '101.dat',
        '102.dat',
        '103.dat',
        '104.dat',
        '105.dat',
        '106.dat',
        '107.dat',
        '108.dat',
        '109.dat',
        '110.dat',
        '111.dat',
        '112.dat',
        '113.dat',
        '114.dat',
        '115.dat',
        '116.dat',
        '117.dat',
        '118.dat',
        '119.dat',
        '120.dat',
        '121.dat',
        '122.dat',
        '123.dat',
        '124.dat',
        '125.dat',
        '126.dat',
        '127.dat'
    ];

    const files: Record<string, Packet> = {};

    // ----

    const pack = fs
        .readFileSync('data/src/pack/texture.pack', 'ascii')
        .replace(/\r/g, '')
        .split('\n')
        .filter(x => x.length)
        .map(x => {
            const parts = x.split('=');
            return { id: parseInt(parts[0]), name: parts[1] };
        });

    const index = Packet.alloc(2);

    for (let i = 0; i < pack.length; i++) {
        const data = await convertImage(index, 'data/src/textures', pack[i].name);

        // TODO (jkm) check for presence , rather than using `!`
        files[`${pack[i].id}.dat`] = data!;
    }

    files['index.dat'] = index;

    // ----

    const jag = new Jagfile();

    for (let i = 0; i < order.length; i++) {
        const name = order[i];
        const data = files[name];
        // data.save(`dump/textures/${name}`, data.length);
        jag.write(name, data);
    }

    jag.save('data/pack/client/textures');

    for (const packet of Object.values(files)) {
        packet.release();
    }
}
