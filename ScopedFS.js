"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopedFS = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var ScopedFS;
(function (ScopedFS) {
    function isSubDir(scope, another) {
        const relative = path.relative(scope, another.toString());
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }
    function checkScopes(scopes, another) {
        for (const scope of scopes) {
            if (isSubDir(scope, another)) {
                return;
            }
        }
        throw new Error("FS sandbox violation");
    }
    function resolvePath(scopes, another, aliases) {
        if (another && typeof another !== "number" && another.fd === undefined) {
            if (aliases) {
                const parts = another.toString().split(/[\\\/]/);
                const firstDir = parts.shift();
                const replacement = aliases[firstDir];
                if (replacement) {
                    parts.unshift(replacement);
                    another = parts.join(path.sep);
                }
            }
            checkScopes(scopes, another);
            return another;
        }
        return another;
    }
    function create(options) {
        const readScopes = new Set(options?.readScopes);
        const writeScopes = new Set(options?.writeScopes);
        writeScopes.forEach(scope => readScopes.add(scope));
        return {
            resolveReadPath: (path) => {
                return resolvePath(readScopes, path, options?.aliases);
            },
            resolveWritePath: (path) => {
                return resolvePath(writeScopes, path, options?.aliases);
            },
            rename: function (oldPath, newPath, callback) {
                oldPath = resolvePath(writeScopes, oldPath, options?.aliases);
                newPath = resolvePath(writeScopes, newPath, options?.aliases);
                return fs.renameSync(oldPath, newPath);
            },
            renameSync: function (oldPath, newPath) {
                oldPath = resolvePath(writeScopes, oldPath, options?.aliases);
                newPath = resolvePath(writeScopes, newPath, options?.aliases);
                return fs.renameSync(oldPath, newPath);
            },
            truncate: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.truncate(path, restArgs[0], restArgs[1]);
            },
            truncateSync: function (path, len) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.truncateSync(path, len);
            },
            ftruncate: function (fd, ...restArgs) {
                return fs.ftruncate(fd, restArgs[0], restArgs[1]);
            },
            ftruncateSync: function (fd, len) {
                return fs.ftruncateSync(fd, len);
            },
            chown: function (path, uid, gid, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.chown(path, uid, gid, callback);
            },
            chownSync: function (path, uid, gid) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.chownSync(path, uid, gid);
            },
            fchown: function (fd, uid, gid, callback) {
                return fs.fchown(fd, uid, gid, callback);
            },
            fchownSync: function (fd, uid, gid) {
                return fs.fchownSync(fd, uid, gid);
            },
            lchown: function (path, uid, gid, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lchown(path, uid, gid, callback);
            },
            lchownSync: function (path, uid, gid) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lchownSync(path, uid, gid);
            },
            lutimes: function (path, atime, mtime, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lutimes(path, atime, mtime, callback);
            },
            lutimesSync: function (path, atime, mtime) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lutimesSync(path, atime, mtime);
            },
            chmod: function (path, mode, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.chmod(path, mode, callback);
            },
            chmodSync: function (path, mode) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.chmodSync(path, mode);
            },
            fchmod: function (fd, mode, callback) {
                return fs.fchmod(fd, mode, callback);
            },
            fchmodSync: function (fd, mode) {
                return fs.fchmodSync(fd, mode);
            },
            lchmod: function (path, mode, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lchmod(path, mode, callback);
            },
            lchmodSync: function (path, mode) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.lchmodSync(path, mode);
            },
            stat: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.stat(path, restArgs[0], restArgs[1]);
            },
            fstat: function (...restArgs) {
                return fs.fstat(restArgs[0], restArgs[1], restArgs[2]);
            },
            fstatSync: function (...restArgs) {
                return fs.fstatSync.apply(restArgs[0], restArgs[1]);
            },
            lstat: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.lstat(path, restArgs[0], restArgs[1]);
            },
            link: function (existingPath, newPath, callback) {
                existingPath = resolvePath(readScopes, existingPath, options?.aliases);
                newPath = resolvePath(writeScopes, newPath, options?.aliases);
                return fs.link(existingPath, newPath, callback);
            },
            linkSync: function (existingPath, newPath) {
                existingPath = resolvePath(readScopes, existingPath, options?.aliases);
                newPath = resolvePath(writeScopes, newPath, options?.aliases);
                return fs.linkSync(existingPath, newPath);
            },
            symlink: function (target, path, ...restArgs) {
                target = resolvePath(readScopes, target, options?.aliases);
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.symlink(target, path, restArgs[0], restArgs[1]);
            },
            symlinkSync: function (target, path, type) {
                target = resolvePath(readScopes, target, options?.aliases);
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.symlinkSync(target, path, type);
            },
            readlink: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readlink(path, restArgs[0], restArgs[1]);
            },
            readlinkSync: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readlinkSync(path, opts);
            },
            realpath: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                restArgs[restArgs.length - 1] = resolvePath(readScopes, restArgs[restArgs.length - 1], options?.aliases);
                return fs.realpath(path, restArgs[0], restArgs[1]);
            },
            realpathSync: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.realpathSync(path, opts);
            },
            unlink: function (path, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.unlink(path, callback);
            },
            unlinkSync: function (path) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.unlinkSync(path);
            },
            rmdir: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.rmdir(path, restArgs[0], restArgs[1]);
            },
            rmdirSync: function (path, opts) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.rmdirSync(path, opts);
            },
            rm: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.rm(path, restArgs[0], restArgs[1]);
            },
            rmSync: function (path, opts) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.rmSync(path, opts);
            },
            mkdir: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.mkdir(path, restArgs[0], restArgs[1]);
            },
            mkdirSync: function (path, opts) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.mkdirSync(path, opts);
            },
            mkdtemp: function (prefix, ...restArgs) {
                prefix = resolvePath(writeScopes, prefix, options?.aliases);
                return fs.mkdtemp(prefix, restArgs[0], restArgs[1]);
            },
            mkdtempSync: function (prefix, opts) {
                prefix = resolvePath(writeScopes, prefix, options?.aliases);
                return fs.mkdtempSync(prefix, opts);
            },
            readdir: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readdir(path, restArgs[0], restArgs[1]);
            },
            readdirSync: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readdirSync(path, opts);
            },
            close: function (fd, callback) {
                return fs.close(fd, callback);
            },
            closeSync: function (fd) {
                return fs.closeSync(fd);
            },
            open: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.open(path, restArgs[0], restArgs[1], restArgs[2]);
            },
            openSync: function (path, flags, mode) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.openSync(path, flags, mode);
            },
            utimes: function (path, atime, mtime, callback) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.utimes(path, atime, mtime, callback);
            },
            utimesSync: function (path, atime, mtime) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.utimesSync(path, atime, mtime);
            },
            futimes: function (fd, atime, mtime, callback) {
                return fs.futimes(fd, atime, mtime, callback);
            },
            futimesSync: function (fd, atime, mtime) {
                return fs.futimesSync(fd, atime, mtime);
            },
            fsync: function (fd, callback) {
                return fs.fsync(fd, callback);
            },
            fsyncSync(fd) {
                return fs.fsyncSync(fd);
            },
            write: function (...restArgs) {
                return fs.write(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4], restArgs[5]);
            },
            writeSync: function (...restArgs) {
                return fs.writeSync(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4]);
            },
            read: function (...restArgs) {
                return fs.read(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4], restArgs[5]);
            },
            readSync: function (...restArgs) {
                return fs.readSync(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4]);
            },
            readFile: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readFile(path, restArgs[0], restArgs[1]);
            },
            readFileSync: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.readFileSync(path, opts);
            },
            writeFile: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.writeFile(path, restArgs[0], restArgs[1], restArgs[2]);
            },
            writeFileSync: function (file, data, opts) {
                file = resolvePath(writeScopes, file, options?.aliases);
                return fs.writeFileSync(file, data, opts);
            },
            appendFile: function (path, ...restArgs) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.appendFile(path, restArgs[0], restArgs[1], restArgs[2]);
            },
            appendFileSync: function (path, data, opts) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.appendFileSync(path, data, opts);
            },
            watchFile: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.watchFile(path, restArgs[0], restArgs[1]);
            },
            unwatchFile: function (path, listener) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.unwatchFile(path, listener);
            },
            watch: function (filename, ...restArgs) {
                filename = resolvePath(readScopes, filename, options?.aliases);
                return fs.watch(filename, restArgs[0], restArgs[1]);
            },
            exists: function (path, callback) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.exists(path, callback);
            },
            existsSync: function (path) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.existsSync(path);
            },
            access: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.access(path, restArgs[0], restArgs[1]);
            },
            accessSync: function (path, mode) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.accessSync(path, mode);
            },
            createReadStream: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.createReadStream(path, opts);
            },
            createWriteStream: function (path, opts) {
                path = resolvePath(writeScopes, path, options?.aliases);
                return fs.createWriteStream(path, opts);
            },
            fdatasync: function (fd, callback) {
                return fs.fdatasync(fd, callback);
            },
            fdatasyncSync: function (fd) {
                return fs.fdatasyncSync(fd);
            },
            copyFile: function (src, dest, ...restArgs) {
                src = resolvePath(readScopes, src, options?.aliases);
                dest = resolvePath(writeScopes, dest, options?.aliases);
                return fs.copyFile(src, dest, restArgs[0], restArgs[1]);
            },
            copyFileSync: function (src, dest, mode) {
                src = resolvePath(readScopes, src, options?.aliases);
                dest = resolvePath(writeScopes, dest, options?.aliases);
                return fs.copyFileSync(src, dest, mode);
            },
            writev: function (...restArgs) {
                return fs.writev(restArgs[0], restArgs[1], restArgs[2], restArgs[3]);
            },
            writevSync: function (fd, buffers, position) {
                return fs.writevSync(fd, buffers, position);
            },
            readv: function (...restArgs) {
                return fs.readv(restArgs[0], restArgs[1], restArgs[2], restArgs[3]);
            },
            readvSync: function (fd, buffers, position) {
                return fs.readvSync(fd, buffers, position);
            },
            opendirSync: function (path, opts) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.opendirSync(path, opts);
            },
            opendir: function (path, ...restArgs) {
                path = resolvePath(readScopes, path, options?.aliases);
                return fs.opendir(path, restArgs[0], restArgs[1]);
            },
            cp: function (source, destination, ...restArgs) {
                source = resolvePath(readScopes, source, options?.aliases);
                destination = resolvePath(writeScopes, destination, options?.aliases);
                return fs.cp(source, destination, restArgs[0], restArgs[1]);
            },
            cpSync: function (source, destination, opts) {
                source = resolvePath(readScopes, source, options?.aliases);
                destination = resolvePath(writeScopes, destination, options?.aliases);
                return fs.cpSync(source, destination, opts);
            },
            promises: {
                access: function (path, mode) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.access(path, mode);
                },
                copyFile: function (src, dest, mode) {
                    src = resolvePath(readScopes, src, options?.aliases);
                    dest = resolvePath(writeScopes, dest, options?.aliases);
                    return fs.promises.copyFile(src, dest, mode);
                },
                open: function (path, flags, mode) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.open(path, flags, mode);
                },
                rename: function (oldPath, newPath) {
                    oldPath = resolvePath(writeScopes, oldPath, options?.aliases);
                    newPath = resolvePath(writeScopes, newPath, options?.aliases);
                    return fs.promises.rename(oldPath, newPath);
                },
                truncate: function (path, len) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.truncate(path, len);
                },
                rmdir: function (path, opts) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.rmdir(path, opts);
                },
                rm: function (path, opts) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.rm(path, opts);
                },
                mkdir: function (path, opts) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.mkdir(path, opts);
                },
                readdir: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.readdir(path, opts);
                },
                readlink: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.readlink(path, opts);
                },
                symlink: function (target, path, type) {
                    target = resolvePath(readScopes, target, options?.aliases);
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.symlink(target, path, type);
                },
                lstat: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.lstat(path, opts);
                },
                stat: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.stat(path, opts);
                },
                link: function (existingPath, newPath) {
                    existingPath = resolvePath(readScopes, existingPath, options?.aliases);
                    newPath = resolvePath(writeScopes, newPath, options?.aliases);
                    return fs.promises.link(existingPath, newPath);
                },
                unlink: function (path) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.unlink(path);
                },
                chmod: function (path, mode) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.chmod(path, mode);
                },
                lchmod: function (path, mode) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.lchmod(path, mode);
                },
                lchown: function (path, uid, gid) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.lchown(path, uid, gid);
                },
                lutimes: function (path, atime, mtime) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.lutimes(path, atime, mtime);
                },
                chown: function (path, uid, gid) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.chown(path, uid, gid);
                },
                utimes: function (path, atime, mtime) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.utimes(path, atime, mtime);
                },
                realpath: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.realpath(path, opts);
                },
                mkdtemp: function (prefix, opts) {
                    prefix = resolvePath(writeScopes, prefix, options?.aliases);
                    return fs.promises.mkdtemp(prefix, opts);
                },
                writeFile: function (file, data, opts) {
                    file = resolvePath(writeScopes, file, options?.aliases);
                    return fs.promises.writeFile(file, data, opts);
                },
                appendFile: function (path, data, opts) {
                    path = resolvePath(writeScopes, path, options?.aliases);
                    return fs.promises.appendFile(path, data, opts);
                },
                readFile: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.readFile(path, opts);
                },
                opendir: function (path, opts) {
                    path = resolvePath(readScopes, path, options?.aliases);
                    return fs.promises.opendir(path, opts);
                },
                watch: function (filename, opts) {
                    filename = resolvePath(readScopes, filename, options?.aliases);
                    return fs.promises.watch(filename, opts);
                },
                cp: function (source, destination, opts) {
                    source = resolvePath(readScopes, source, options?.aliases);
                    destination = resolvePath(writeScopes, destination, options?.aliases);
                    return fs.promises.cp(source, destination, opts);
                }
            }
        };
    }
    ScopedFS.create = create;
})(ScopedFS = exports.ScopedFS || (exports.ScopedFS = {}));
