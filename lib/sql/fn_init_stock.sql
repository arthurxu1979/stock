CREATE OR REPLACE FUNCTION fn_init_stock()
RETURNS void AS $$
BEGIN
DELETE FROM stock_name;

INSERT INTO stock_name (code)
SELECT DISTINCT code FROM stock_his;

END;
$$LANGUAGE SQL
