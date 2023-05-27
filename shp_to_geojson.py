import geopandas as gpd

# shp 파일을 읽습니다.
shp_file = "district.shp"
data = gpd.read_file(shp_file)

# GeoJSON으로 변환하고 파일로 저장합니다.
geojson_file = "district.geojson"
data.to_file(geojson_file, driver="GeoJSON")
