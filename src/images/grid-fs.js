import { promisify } from 'util';
import concat from 'concat-stream';
import Grid from 'gridfs-stream';
import mongoose from 'mongoose';

import createLogger from '../logger';

const logger = createLogger('grid-fs');

function getGridFS() {
  return Grid(mongoose.connection.db, mongoose.mongo);
}

function read(options) {
  return new Promise((resolve, reject) => {
    const gfs = getGridFS();
    const readstream = gfs.createReadStream(options);
    readstream.pipe(concat(resolve));
    readstream.on('error', reject);
  });
}

function write(req, options) {
  return new Promise((resolve, reject) => {
    const gfs = getGridFS();
    const writestream = gfs.createWriteStream(options);
    req.pipe(writestream);
    writestream.on('close', resolve);
    writestream.on('error', reject);
  });
}

export async function find(options) {
  return new Promise((resolve, reject) => {
    const gfs = getGridFS();
    return gfs
      .collection()
      .find(options)
      .toArray((error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
  });
}

export async function findById(_id) {
  logger.debug(`reading file "${_id}"`);
  const file = await read({ _id });
  logger.debug(`file "${_id}" read`);
  return file;
}

export async function exists(_id) {
  logger.debug(`checking if file "${_id}" exists`);
  const gfs = getGridFS();
  const found = await promisify(gfs.exist.bind(gfs))({ _id });
  logger.debug(found ? `file "${_id}" exists` : `file "${_id}" does not exists`);
  return found;
}

export async function create(req) {
  logger.debug('creating file');
  const file = await write(req);
  logger.debug(`file "${file._id}" created`); // eslint-disable-line no-underscore-dangle
  return file;
}

export async function update(req, _id) {
  logger.debug(`updating file "${_id}"`);
  const file = await write(req, { _id });
  logger.debug(`file "${_id}" updated`);
  return file;
}

export async function remove(_id) {
  logger.debug(`removing file "${_id}"`);
  const gfs = getGridFS();
  await promisify(gfs.remove.bind(gfs))({ _id });
  logger.debug(`file "${_id}" removed`);
}
