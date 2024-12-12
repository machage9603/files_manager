import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import dbClient from './db';

const FILE_TYPES = ['folder', 'file', 'image'];
const FILES_DIR = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesCollection {
  static async createFile(fileData) {
    const collection = dbClient.getCollection('files');
    const { name, type, data } = fileData;
    let { parentId } = fileData;
    parentId = parentId && ObjectId.isValid(parentId) ? new ObjectId(parentId) : 0;

    if (!name) throw new Error('Missing name');
    if (!FILE_TYPES.includes(type)) throw new Error('Missing type');

    if (type !== 'folder' && !data) throw new Error('Missing data');

    const parentDocument = await FilesCollection.getFile({ _id: parentId });
    if (parentId && !parentDocument) throw new Error('Parent not found');
    if (parentId && parentDocument.type !== 'folder') throw new Error('Parent is not a folder');

    const fileDocument = { ...fileData, parentId };
    if (type !== 'folder') {
      fileDocument.localPath = path.join(FILES_DIR, v4());
      delete fileDocument.data;
    }
    const fileId = (await collection.insertOne(fileDocument)).insertedId;
    fileDocument._id = fileId;
    if (type !== 'folder') fileDocument.data = data;
    return fileDocument;
  }

  static async getFile(query) {
    const collection = dbClient.getCollection('files');
    const file = await collection.findOne(query);
    return file;
  }

  static async updateFile(query, update) {
    const collection = dbClient.getCollection('files');
    const res = await collection.updateOne(query, update);
    return res;
  }

  static async storeFileData(path, data) {
    if (!fs.existsSync(FILES_DIR) || !fs.lstatSync(FILES_DIR).isDirectory()) {
      fs.mkdirSync(FILES_DIR, { recursive: true });
    }
    fs.writeFileSync(path, Buffer.from(data, 'base64'));
  }
}

export default FilesCollection;
