[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

# node-scoped-fs
Scoped file system for nodejs core FS.
Module to create file systems, bound to one or few directories on host system with read/write permissions.
Covers all knows FS methods (at the moment) and .promises versions too.

### Example of usage:

```typescript
import { ScopedFS } from "node-scoped-fs";

const aliases : Record<string, string> = {
    "." : gameDefDir
};
const scopedFS = ScopedFS.create({
    readScopes: ["/usr/canReadFromHere", "/tmp/canReadFromHere"], // additionally, includes all writeScopes in "read" scope.
    writeScopes: ["/tmp/canWriteHereOnly"],
    aliases: {
        "." : "/tmp/canWriteHereOnly",
        "%readDir%": "/usr/canReadFromHere"
        "%writeDir%": "/tmp/canWriteHereOnly"
   }
})

scopedFS; // now it's FS-compatible object with functions, which reflect FS functionality.
// but is scoped to read/write directories

// Additionally, it has next two methods for external usage:
scopedFS.resolveReadPath("%readDir%/file.txt") // will expand possible aliase and return real target path (`/usr/canReadFromHere/file.txt`) or fail, if target path is not in read scopes.
scopedFS.resolveWritePath("%writeDir%/file.txt") // the same as `resolveReadPath`, but works against write scopes.

scopedFS[.promises].readFile("/usr/canReadFromHere/file.txt") // ok, if file exists
scopedFS[.promises].readFile("/tmp/canReadFromHere/file.txt") // ok, if file exists
scopedFS[.promises].readFile("/tmp/canWriteHereOnly/file.txt") // ok, if file exists
scopedFS[.promises].readFile("%readDir%/file.txt") // ok, if file exists
scopedFS[.promises].readFile("%writeDir%/file.txt") // ok, if file exists
scopedFS[.promises].readFile("./file.txt") // ok, if file exists (alias="." )
scopedFS[.promises].readFile("/tmp/anotherDir/file.txt") // exception, outside of read scope

scopedFS[.promises].writeFile("/tmp/canWriteHereOnly/file.txt", "...") // ok
scopedFS[.promises].writeFile("%writeDir%/file.txt", "...") // ok
scopedFS[.promises].writeFile("%readDir%/file.txt", "...") // exception
scopedFS[.promises].writeFile("/usr/canReadFromHere/file.txt", "...") // exception
scopedFS[.promises].writeFile("/tmp/anotherDir/file.txt", "...") // exception
```

**Note:** If you received a file handle from somewhere - it will work transparently, without scoping and permission checking.

**Note 2:** If you have set "." in aliases - then instead of failure it will map required path to your "." alian and try scopes again.

**Note 3:** Known limitation: you cannot have read-scoped dir as children of write-scoped and expect write reject there. Permissions evaluated from top dir, If higher directories providers access to write - then all subdirectories will have wirte access.

**Note 4:** Doesn`t work on territory of Nazy Ruzzian Federation.