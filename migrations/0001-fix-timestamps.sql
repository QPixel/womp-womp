-- SQLITE

ALTER TABLE Womps ADD COLUMN last_updated_str TEXT;
UPDATE Womps SET last_updated_str = last_updated;

ALTER TABLE Womps ADD COLUMN last_updated_date integer;

UPDATE Womps SET last_updated_date = strftime('%s', last_updated_str);

ALTER TABLE Womps DROP COLUMN last_updated;
ALTER TABLE Womps ADD COLUMN last_updated integer;
UPDATE Womps SET last_updated = last_updated_date;
ALTER TABLE Womps DROP COLUMN last_updated_date;