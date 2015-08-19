CREATE OR REPLACE FUNCTION fn_remove_duplicate() RETURNS void AS $$
   BEGIN
	CREATE TEMP TABLE _tmp_dup
	(
	code character(12),
	stock_date timestamp without time zone,
	max_id integer
	) on COMMIT DROP;
	
	CREATE TEMP TABLE _tmp_remove
	(
	id integer
	) ON COMMIT DROP;
	
	INSERT INTO _tmp_dup
	SELECT code, stock_date, MAX(id)
	FROM stock_his
	GROUP BY code, stock_date;
	
	INSERT INTO _tmp_remove
	SELECT id FROM stock_his sh
	JOIN _tmp_dup td ON td.code=sh.code AND td.stock_date=sh.stock_date AND sh.id <> td.max_id;
	
	DELETE FROM stock_his as sh
	USING _tmp_remove tr
	WHERE sh.id=tr.id;
	
	DROP TABLE _tmp_dup;
	DROP TABLE _tmp_remove;
   	return;
   END;
$$LANGUAGE plpgsql;
