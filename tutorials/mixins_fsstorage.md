[[toc]]

# fsStorage mixin

## Introduction
`fsStorege` mixin implements a CRUID operation for entity, whose data is stored in the file system
(in opposite to `mStorage` mixin what stores data into DB).

**WARNING**
Mixin designed for storing rather "configurations" when "data" and expect what data files are subject of version control system. 
Limitations:
  - transactions are **NOT** supported
  - concurrent access to data files based on "last win" strategy and should be avoided

Mixin expects data to be located:
 - in a single location specified by `dataPath` property;
 - in the models sub-folders when `modelBased: true`. In this case `dataPath` is joined with each model public folder
   location, and data will be loaded from each model what contains such a folder.
   Entities with modelBased fsStorage MUST contain a "model" attribute;

Each entity with fsStorage MUST contain a natural unique key attribute ("code" by default).
The row ID is calculated as `crc32(naturalKeyValue)`.

Mixin persist data as:
 - if `filePerRow` is true then `dataPath` expected to be a folder and each row stored as s separate `naturalKeyValue.ubrow` file;
 - if `filePerRow` is `false` then all rows is persisted in one file (or models file if modelBased true) specified by `dataPath`;

Entity attributes of type "Document" should use a "mdb" BLOB store. Content of BLOBS stored in the same folder as row

```json
{
  "dataPath": "reports",
  "modelBased": true,
  "filePerRow": true,
  "naturalKey": "code"
}
```
