-- AlterTable: convert referenceFile (single) to referenceFiles (array)
ALTER TABLE institutions DROP COLUMN IF EXISTS reference_file;
ALTER TABLE institutions ADD COLUMN reference_files TEXT[] DEFAULT '{}';
