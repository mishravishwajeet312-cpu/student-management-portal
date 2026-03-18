SET FOREIGN_KEY_CHECKS=0;
SET @tables = (
    SELECT GROUP_CONCAT(CONCAT('`', table_name, '`'))
    FROM information_schema.tables
    WHERE table_schema = 'quiz_app'
);
SET @stmt = IFNULL(CONCAT('DROP TABLE IF EXISTS ', @tables), 'SELECT 1');
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;
SET FOREIGN_KEY_CHECKS=1;
