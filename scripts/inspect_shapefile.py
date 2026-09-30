import geopandas as gpd


shapefile_path = r"data/BLOCK_2024/BLOCK__INDIA_2024.shp"

gdf = gpd.read_file(shapefile_path)

print("Shapefile loaded successfully!")

print("\n--- BASIC INFORMATION ---")

print("Number of records:", len(gdf))
print("Number of columns:", len(gdf.columns))

print("\n--- COLUMNS ---")

for column in gdf.columns:
    print(column)

print("\n--- CRS ---")

print(gdf.crs)

print("\n--- GEOMETRY TYPE ---")

print(gdf.geometry.geom_type.value_counts())

print("\n--- FIRST RECORD ---")

print(gdf.iloc[0])