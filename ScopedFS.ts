import * as fs from "fs";
import * as path from "path";

export interface ScopedFS {
    resolveReadPath: (path: fs.PathLike | number | fs.promises.FileHandle) => fs.PathLike|number|fs.promises.FileHandle;

    resolveWritePath: (path: fs.PathLike | number | fs.promises.FileHandle) => fs.PathLike|number|fs.promises.FileHandle;
}

export namespace ScopedFS {
    export interface ScopedFSOptions {
        readScopes ?: string[];
        writeScopes ?: string[];

        aliases ?: Record<string, string>;
    }

    function isSubDir(scope: string, another: fs.PathLike) {        
        const relative = path.relative(scope, another.toString());
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    function checkScopes(scopes: Set<string>, another: fs.PathLike) {
        for (const scope of scopes) {
            if (isSubDir(scope, another)) {
                return;
            }
        }
        throw new Error("FS sandbox violation: " + another.toString());
    }

    function resolvePath(scopes: Set<string>, another: fs.PathLike | number | fs.promises.FileHandle, aliases ?: Record<string, string>) : fs.PathLike|number|fs.promises.FileHandle {
        if (another && typeof another !== "number" && (another as fs.promises.FileHandle).fd === undefined) {

            if (aliases) {
                const parts = another.toString().split(/[\\\/]/);
                const firstDir = parts.shift()!;
                const replacement = aliases[firstDir];
                if (replacement) {
                    parts.unshift(replacement);
                    another = parts.join(path.sep);
                }
            }

            checkScopes(scopes, another as fs.PathLike);

            return another;
        }

        return another;
    }

    export function create(options ?: ScopedFSOptions) : ScopedFS {
        const readScopes : Set<string> = new Set(options?.readScopes);
        const writeScopes : Set<string> = new Set(options?.writeScopes);
        writeScopes.forEach(scope => readScopes.add(scope));

        return {

            resolveReadPath: (path: fs.PathLike | number | fs.promises.FileHandle) : fs.PathLike|number|fs.promises.FileHandle => {
                return resolvePath(readScopes, path, options?.aliases);
            },

            resolveWritePath: (path: fs.PathLike | number | fs.promises.FileHandle) : fs.PathLike|number|fs.promises.FileHandle => {
                return resolvePath(writeScopes, path, options?.aliases);
            },

            rename : function(oldPath: fs.PathLike, newPath: fs.PathLike, callback: fs.NoParamCallback): void {
                oldPath = resolvePath(writeScopes, oldPath, options?.aliases) as fs.PathLike;
                newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                return fs.renameSync(oldPath, newPath);
            },

            renameSync : function(oldPath: fs.PathLike, newPath: fs.PathLike): void {
                oldPath = resolvePath(writeScopes, oldPath, options?.aliases) as fs.PathLike;
                newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                return fs.renameSync(oldPath, newPath);
            },

            truncate : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.truncate(path, restArgs[0], restArgs[1]);
            },

            truncateSync : function(path: fs.PathLike, len?: number | null): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.truncateSync(path, len);
            },

            ftruncate : function(fd: number, ...restArgs : any[]): void {
                return fs.ftruncate(fd, restArgs[0], restArgs[1]);
            },

            ftruncateSync : function(fd: number, len?: number | null): void {
                return fs.ftruncateSync(fd, len);
            },

            chown : function(path: fs.PathLike, uid: number, gid: number, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.chown(path, uid, gid, callback);
            },

            chownSync : function(path: fs.PathLike, uid: number, gid: number): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.chownSync(path, uid, gid);
            },

            fchown : function(fd: number, uid: number, gid: number, callback: fs.NoParamCallback): void {
                return fs.fchown(fd, uid, gid, callback);
            },

            fchownSync : function(fd: number, uid: number, gid: number): void {
                return fs.fchownSync(fd, uid, gid);
            },

            lchown : function(path: fs.PathLike, uid: number, gid: number, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lchown(path, uid, gid, callback);
            },

            lchownSync : function(path: fs.PathLike, uid: number, gid: number): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lchownSync(path, uid, gid);
            },

            lutimes : function(path: fs.PathLike, atime: fs.TimeLike, mtime: fs.TimeLike, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lutimes(path, atime, mtime, callback);
            },

            lutimesSync : function(path: fs.PathLike, atime: fs.TimeLike, mtime: fs.TimeLike): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lutimesSync(path, atime, mtime);
            },

            chmod : function(path: fs.PathLike, mode: fs.Mode, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.chmod(path, mode, callback);
            },

            chmodSync : function(path: fs.PathLike, mode: fs.Mode): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.chmodSync(path, mode);
            },

            fchmod : function(fd: number, mode: fs.Mode, callback: fs.NoParamCallback): void {
                return fs.fchmod(fd, mode, callback);
            },

            fchmodSync : function(fd: number, mode: fs.Mode): void {
                return fs.fchmodSync(fd, mode);
            },

            lchmod : function(path: fs.PathLike, mode: fs.Mode, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lchmod(path, mode, callback);
            },

            lchmodSync : function(path: fs.PathLike, mode: fs.Mode): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.lchmodSync(path, mode);
            },

            stat : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.stat(path, restArgs[0], restArgs[1]);
            },

            fstat : function(...restArgs: any[]): void {
                return fs.fstat(restArgs[0], restArgs[1], restArgs[2]);
            },

            fstatSync : function(...restArgs: any[]): fs.Stats | fs.BigIntStats {
                return fs.fstatSync.apply(restArgs[0], restArgs[1]);
            },

            lstat : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.lstat(path, restArgs[0], restArgs[1]);
            },

            link : function(existingPath: fs.PathLike, newPath: fs.PathLike, callback: fs.NoParamCallback): void {
                existingPath = resolvePath(readScopes, existingPath, options?.aliases) as fs.PathLike;
                newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                return fs.link(existingPath, newPath, callback);
            },

            linkSync : function(existingPath: fs.PathLike, newPath: fs.PathLike): void {
                existingPath = resolvePath(readScopes, existingPath, options?.aliases) as fs.PathLike;
                newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                return fs.linkSync(existingPath, newPath);
            },

            symlink : function(target: fs.PathLike, path: fs.PathLike, ...restArgs: any[]): void {
                target = resolvePath(readScopes, target, options?.aliases) as fs.PathLike;
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.symlink(target, path, restArgs[0], restArgs[1]);
            },

            symlinkSync : function(target: fs.PathLike, path: fs.PathLike, type?: fs.symlink.Type | null): void {
                target = resolvePath(readScopes, target, options?.aliases) as fs.PathLike;
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.symlinkSync(target, path, type);
            },

            readlink : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readlink(path, restArgs[0], restArgs[1]);
            },

            readlinkSync : function(path: fs.PathLike, opts: any): string | Buffer {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readlinkSync(path, opts);
            },

            realpath : function(path: fs.PathLike, ...restArgs: any[]) : void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                restArgs[restArgs.length - 1] = resolvePath(readScopes, restArgs[restArgs.length - 1] as string, options?.aliases) as fs.PathLike;
                return fs.realpath(path, restArgs[0], restArgs[1]);
            },

            realpathSync : function(path: fs.PathLike, opts: any): string | Buffer {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.realpathSync(path, opts);
            },

            unlink : function(path: fs.PathLike, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.unlink(path, callback);
            },

            unlinkSync : function(path: fs.PathLike): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.unlinkSync(path);
            },

            rmdir : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.rmdir(path, restArgs[0], restArgs[1]);
            },

            rmdirSync : function(path: fs.PathLike, opts?: fs.RmDirOptions): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.rmdirSync(path, opts);
            },

            rm : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.rm(path, restArgs[0], restArgs[1]);
            },

            rmSync : function(path: fs.PathLike, opts?: fs.RmOptions): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.rmSync(path, opts);
            },

            mkdir : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.mkdir(path, restArgs[0], restArgs[1]);
            },

            mkdirSync : function(path: fs.PathLike, opts: any): string | undefined {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.mkdirSync(path, opts);
            },

            mkdtemp : function(prefix: string, ...restArgs: any[]): void {
                prefix = resolvePath(writeScopes, prefix, options?.aliases) as string;
                return fs.mkdtemp(prefix, restArgs[0], restArgs[1]);
            },

            mkdtempSync : function(prefix: string, opts: any): string | Buffer {
                prefix = resolvePath(writeScopes, prefix, options?.aliases) as string;
                return fs.mkdtempSync(prefix, opts);
            },

            readdir : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readdir(path, restArgs[0], restArgs[1]);
            },

            readdirSync : function(path: fs.PathLike, opts: any): string[] | Buffer[] | fs.Dirent[] {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readdirSync(path, opts);
            },

            close : function(fd: number, callback?: fs.NoParamCallback): void {
                return fs.close(fd, callback);
            },

            closeSync : function(fd: number): void {
                return fs.closeSync(fd);
            },

            open : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.open(path, restArgs[0], restArgs[1], restArgs[2]);
            },

            openSync : function(path: fs.PathLike, flags: fs.OpenMode, mode?: fs.Mode | null): number {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.openSync(path, flags, mode);
            },

            utimes : function(path: fs.PathLike, atime: fs.TimeLike, mtime: fs.TimeLike, callback: fs.NoParamCallback): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.utimes(path, atime, mtime, callback);
            },

            utimesSync : function(path: fs.PathLike, atime: fs.TimeLike, mtime: fs.TimeLike): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.utimesSync(path, atime, mtime);
            },

            futimes : function(fd: number, atime: fs.TimeLike, mtime: fs.TimeLike, callback: fs.NoParamCallback): void {
                return fs.futimes(fd, atime, mtime, callback);
            },

            futimesSync : function(fd: number, atime: fs.TimeLike, mtime: fs.TimeLike): void {
                return fs.futimesSync(fd, atime, mtime);
            },

            fsync : function(fd: number, callback: fs.NoParamCallback): void {
                return fs.fsync(fd, callback);
            },

            fsyncSync(fd: number): void {
                return fs.fsyncSync(fd);
            },

            write : function(...restArgs: any[]): void {
                return fs.write(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4], restArgs[5]);
            },

            writeSync : function(...restArgs: any[]): number {
                return fs.writeSync(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4]);
            },

            read : function(...restArgs: any[]): void {
                return fs.read(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4], restArgs[5]);
            },

            readSync : function(...restArgs: any[]): number {
                return fs.readSync(restArgs[0], restArgs[1], restArgs[2], restArgs[3], restArgs[4]);
            },

            readFile : function(path: fs.PathOrFileDescriptor, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readFile(path, restArgs[0], restArgs[1]);
            },

            readFileSync : function(path: fs.PathOrFileDescriptor, opts: any): string | Buffer {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.readFileSync(path, opts);
            },

            writeFile : function(path: fs.PathOrFileDescriptor, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.writeFile(path, restArgs[0], restArgs[1], restArgs[2]);
            },

            writeFileSync : function(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, opts?: fs.WriteFileOptions): void {
                file = resolvePath(writeScopes, file, options?.aliases) as fs.PathLike;
                return fs.writeFileSync(file, data, opts);
            },

            appendFile : function(path: fs.PathOrFileDescriptor, ...restArgs: any[]): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.appendFile(path, restArgs[0], restArgs[1], restArgs[2]);
            },

            appendFileSync : function(path: fs.PathOrFileDescriptor, data: string | Uint8Array, opts?: fs.WriteFileOptions): void {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.appendFileSync(path, data, opts);
            },

            watchFile : function(path: fs.PathLike, ...restArgs : any[]): fs.StatWatcher {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.watchFile(path, restArgs[0], restArgs[1]);
            },

            unwatchFile : function(path: fs.PathLike, listener?: (curr: fs.Stats, prev: fs.Stats) => void): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.unwatchFile(path, listener);
            },

            watch : function(filename: fs.PathLike, ...restArgs: any[]): fs.FSWatcher {
                filename = resolvePath(readScopes, filename, options?.aliases) as fs.PathLike;
                return fs.watch(filename, restArgs[0], restArgs[1]);
            },

            exists : function(path: fs.PathLike, callback: (exists: boolean) => void): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.exists(path, callback);
            },

            existsSync : function(path: fs.PathLike): boolean {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.existsSync(path);
            },

            access : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.access(path, restArgs[0], restArgs[1]);
            },

            accessSync : function(path: fs.PathLike, mode?: number): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.accessSync(path, mode);
            },

            createReadStream : function(path: fs.PathLike, opts?: any): fs.ReadStream {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.createReadStream(path, opts);
            },

            createWriteStream : function(path: fs.PathLike, opts: any): fs.WriteStream {
                path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                return fs.createWriteStream(path, opts);
            },

            fdatasync: function(fd: number, callback: fs.NoParamCallback): void {
                return fs.fdatasync(fd, callback);
            },

            fdatasyncSync : function(fd: number): void {
                return fs.fdatasyncSync(fd);
            },

            copyFile : function(src: fs.PathLike, dest: fs.PathLike, ...restArgs: any[]): void {
                src = resolvePath(readScopes, src, options?.aliases) as fs.PathLike;
                dest = resolvePath(writeScopes, dest, options?.aliases) as fs.PathLike;
                return fs.copyFile(src, dest, restArgs[0], restArgs[1]);
            },

            copyFileSync : function(src: fs.PathLike, dest: fs.PathLike, mode?: number): void {
                src = resolvePath(readScopes, src, options?.aliases) as fs.PathLike;
                dest = resolvePath(writeScopes, dest, options?.aliases) as fs.PathLike;
                return fs.copyFileSync(src, dest, mode);
            },

            writev : function(...restArgs: any[]): void {
                return fs.writev(restArgs[0], restArgs[1], restArgs[2], restArgs[3]);
            },

            writevSync : function(fd: number, buffers: ReadonlyArray<NodeJS.ArrayBufferView>, position?: number): number {
                return fs.writevSync(fd, buffers, position);
            },

            readv : function(...restArgs: any[]): void {
                return fs.readv(restArgs[0], restArgs[1], restArgs[2], restArgs[3]);
            },

            readvSync : function(fd: number, buffers: ReadonlyArray<NodeJS.ArrayBufferView>, position?: number): number {
                return fs.readvSync(fd, buffers, position);
            },

            opendirSync : function(path: fs.PathLike, opts?: fs.OpenDirOptions): fs.Dir {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.opendirSync(path, opts);
            },

            opendir : function(path: fs.PathLike, ...restArgs: any[]): void {
                path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                return fs.opendir(path, restArgs[0], restArgs[1]);
            },

            cp : function(source: string | URL, destination: string | URL, ...restArgs : any[]): void {
                source = resolvePath(readScopes, source, options?.aliases) as string | URL;
                destination = resolvePath(writeScopes, destination, options?.aliases) as string | URL;
                return fs.cp(source, destination, restArgs[0], restArgs[1]);
            },

            cpSync : function(source: string | URL, destination: string | URL, opts?: fs.CopySyncOptions): void {
                source = resolvePath(readScopes, source, options?.aliases) as string | URL;
                destination = resolvePath(writeScopes, destination, options?.aliases) as string | URL;
                return fs.cpSync(source, destination, opts);
            },

            promises: {

                access : function(path: fs.PathLike, mode?: number): Promise<void> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.access(path, mode);
                },

                copyFile : function(src: fs.PathLike, dest: fs.PathLike, mode?: number): Promise<void> {
                    src = resolvePath(readScopes, src, options?.aliases) as fs.PathLike;
                    dest = resolvePath(writeScopes, dest, options?.aliases) as fs.PathLike;
                    return fs.promises.copyFile(src, dest, mode);
                },

                open : function(path: fs.PathLike, flags?: string | number, mode?: fs.Mode): Promise<fs.promises.FileHandle> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.open(path, flags, mode);
                },

                rename : function(oldPath: fs.PathLike, newPath: fs.PathLike): Promise<void> {
                    oldPath = resolvePath(writeScopes, oldPath, options?.aliases) as fs.PathLike;
                    newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                    return fs.promises.rename(oldPath, newPath);
                },

                truncate : function(path: fs.PathLike, len?: number): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.truncate(path, len);
                },

                rmdir : function(path: fs.PathLike, opts?: fs.RmDirOptions): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.rmdir(path, opts);
                },

                rm : function(path: fs.PathLike, opts?: fs.RmOptions): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.rm(path, opts);
                },

                mkdir : function(path: fs.PathLike, opts: any): Promise<string | undefined | void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.mkdir(path, opts);
                },

                readdir : function(path: fs.PathLike, opts: any): Promise<string[] | Buffer[] | fs.Dirent[]> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.readdir(path, opts);
                },

                readlink : function(path: fs.PathLike, opts: any): Promise<string | Buffer> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.readlink(path, opts);
                },

                symlink : function(target: fs.PathLike, path: fs.PathLike, type?: string | null): Promise<void> {
                    target = resolvePath(readScopes, target, options?.aliases) as fs.PathLike;
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.symlink(target, path, type);
                },

                lstat : function(path: fs.PathLike, opts: any): Promise<fs.Stats | fs.BigIntStats> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.lstat(path, opts);
                },

                stat : function(path: fs.PathLike, opts: any): Promise<fs.Stats | fs.BigIntStats> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.stat(path, opts);
                },

                link : function(existingPath: fs.PathLike, newPath: fs.PathLike): Promise<void> {
                    existingPath = resolvePath(readScopes, existingPath, options?.aliases) as fs.PathLike;
                    newPath = resolvePath(writeScopes, newPath, options?.aliases) as fs.PathLike;
                    return fs.promises.link(existingPath, newPath);
                },

                unlink : function(path: fs.PathLike): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.unlink(path);
                },

                chmod : function(path: fs.PathLike, mode: fs.Mode): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.chmod(path, mode);
                },

                lchmod : function(path: fs.PathLike, mode: fs.Mode): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.lchmod(path, mode);
                },

                lchown : function(path: fs.PathLike, uid: number, gid: number): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.lchown(path, uid, gid);
                },

                lutimes : function(path: fs.PathLike, atime: string | number | Date, mtime: string | number | Date): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.lutimes(path, atime, mtime);
                },

                chown : function(path: fs.PathLike, uid: number, gid: number): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.chown(path, uid, gid);
                },

                utimes : function(path: fs.PathLike, atime: string | number | Date, mtime: string | number | Date): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.utimes(path, atime, mtime);
                },

                realpath : function(path: fs.PathLike, opts: any): Promise<string | Buffer> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.realpath(path, opts);
                },

                mkdtemp : function(prefix: string, opts: any): Promise<string | Buffer> {
                    prefix = resolvePath(writeScopes, prefix, options?.aliases) as string;
                    return fs.promises.mkdtemp(prefix, opts);
                },

                writeFile : function(
                    file: fs.PathLike | fs.promises.FileHandle,
                    data: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView>,
                    opts?:
                        | (fs.ObjectEncodingOptions & {
                            mode?: fs.Mode | undefined;
                            flag?: fs.OpenMode | undefined;
                        })
                        | BufferEncoding
                        | null
                ): Promise<void> {
                    file = resolvePath(writeScopes, file, options?.aliases) as fs.PathLike;
                    return fs.promises.writeFile(file, data, opts);
                },

                appendFile : function(path: fs.PathLike | fs.promises.FileHandle, data: string | Uint8Array, opts?: (fs.ObjectEncodingOptions & fs.promises.FlagAndOpenMode) | BufferEncoding | null): Promise<void> {
                    path = resolvePath(writeScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.appendFile(path, data, opts);
                },

                readFile : function(path: fs.PathLike | fs.promises.FileHandle, opts: any): Promise<string | Buffer> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.readFile(path, opts);
                },

                opendir : function(path: fs.PathLike, opts?: fs.OpenDirOptions): Promise<fs.Dir> {
                    path = resolvePath(readScopes, path, options?.aliases) as fs.PathLike;
                    return fs.promises.opendir(path, opts);
                },

                watch : function(filename: fs.PathLike, opts: any): unknown {
                    filename = resolvePath(readScopes, filename, options?.aliases) as fs.PathLike;
                    return fs.promises.watch(filename, opts);
                },

                cp : function(source: string | URL, destination: string | URL, opts?: fs.CopyOptions): Promise<void> {
                    source = resolvePath(readScopes, source, options?.aliases) as string | URL;
                    destination = resolvePath(writeScopes, destination, options?.aliases) as string | URL;
                    return fs.promises.cp(source, destination, opts);
                }
            }
        } as ScopedFS;
    }
}
