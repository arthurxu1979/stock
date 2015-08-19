CREATE OR REPLACE FUNCTION etl.fn_get_speed_bracket_groups
(
    _code character(12)
)
RETURNS TABLE
(
)
AS $$
BEGIN
    CREATE TEMP TABLE _tmp_stock
    (
    ) ON COMMIT DROP;
		
    DROP TABLE _tmp_stock;

END;
$$ LANGUAGE PLPGSQL;
