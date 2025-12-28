-- Ver estado actual de algunos brands
SELECT 
  id,
  name,
  "detailsFetched",
  "detailsFetchedAt",
  CASE 
    WHEN "detailsFetched" = true THEN '✅ Cached (no API call)'
    ELSE '⏳ Not cached (will call API)'
  END as status
FROM brands
ORDER BY "detailsFetchedAt" DESC NULLS LAST
LIMIT 10;

-- Estadísticas generales
SELECT 
  COUNT(*) as total_brands,
  COUNT(*) FILTER (WHERE "detailsFetched" = true) as cached_brands,
  COUNT(*) FILTER (WHERE "detailsFetched" = false) as not_cached_brands,
  ROUND(
    (COUNT(*) FILTER (WHERE "detailsFetched" = true)::float / COUNT(*)) * 100,
    2
  ) as cache_percentage
FROM brands;
