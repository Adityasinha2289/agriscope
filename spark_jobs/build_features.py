"""
AgriScope - Feature Engineering Job
Builds feature set for ML models from cleaned data.
Usage: spark-submit build_features.py <hdfs_cleaned_path> <hdfs_features_path>
"""
import sys
import json
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.sql.types import DoubleType, IntegerType


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-FeatureEngineering")
        .config("spark.sql.adaptive.enabled", "true")
        .getOrCreate()
    )


def build_features(df):
    """
    Build features for ML models from the cleaned APY data.
    
    Target: yield (Tonnes/Hectare)
    
    Features engineered:
    - start_year (numeric year)
    - state_code (numeric)
    - district_code (numeric) 
    - crop_code (numeric)
    - area (hectares)
    - season_index (encoded)
    - crop_type_index (encoded)
    - log_area (log transform of area)
    - state_avg_yield (historical state average yield for that crop)
    - crop_avg_yield (historical crop average yield)
    
    NOTE: production is NOT used as a feature because yield = production / area.
    Using production would constitute target leakage.
    """
    feature_log = {"steps": []}

    # Filter to valid records only
    df = df.filter(
        F.col("yield_valid") &
        F.col("area_valid") &
        F.col("yield").isNotNull() &
        F.col("area").isNotNull() &
        (F.col("area") > 0) &
        (F.col("yield") > 0)
    )
    feature_log["valid_records"] = df.count()
    feature_log["steps"].append(f"Filtered to {df.count()} valid records")

    # Encode season
    season_mapping = {
        "Kharif": 1, "Rabi": 2, "Summer": 3, "Whole Year": 4,
        "Autumn": 5, "Winter": 6
    }
    season_expr = F.lit(0)
    for season, idx in season_mapping.items():
        season_expr = F.when(
            F.lower(F.col("season")).contains(season.lower()), idx
        ).otherwise(season_expr)
    df = df.withColumn("season_index", season_expr)
    feature_log["steps"].append("Encoded season as numeric index")

    # Encode crop_type
    crop_type_mapping = {
        "Cereals": 1, "Pulses": 2, "Oilseeds": 3, "Fiber Crops": 4,
        "Spices": 5, "Fruits": 6, "Vegetables": 7, "Plantation Crops": 8,
        "Sugar Crops": 9, "Others": 10, "Flowers": 11, "Drugs & Narcotics": 12,
    }
    ct_expr = F.lit(0)
    for ct, idx in crop_type_mapping.items():
        ct_expr = F.when(
            F.lower(F.col("crop_type")).contains(ct.lower()), idx
        ).otherwise(ct_expr)
    df = df.withColumn("crop_type_index", ct_expr)
    feature_log["steps"].append("Encoded crop_type as numeric index")

    # Log transform of area
    df = df.withColumn("log_area", F.log1p(F.col("area")))
    feature_log["steps"].append("Computed log_area = log1p(area)")

    # Historical state-crop average yield (using a window)
    state_crop_window = Window.partitionBy("state_code", "crop_code")
    df = df.withColumn("state_crop_avg_yield", F.avg("yield").over(state_crop_window))
    feature_log["steps"].append("Computed state-crop average yield")

    # Historical crop average yield
    crop_window = Window.partitionBy("crop_code")
    df = df.withColumn("crop_avg_yield", F.avg("yield").over(crop_window))
    feature_log["steps"].append("Computed crop average yield")

    # Select final feature columns
    feature_cols = [
        "start_year", "state_code", "district_code", "crop_code",
        "area", "log_area", "season_index", "crop_type_index",
        "state_crop_avg_yield", "crop_avg_yield",
        "yield",  # target
        # Keep identifiers for analysis
        "state_name", "district_name", "crop_name", "crop_type", "season",
        "year", "production",
    ]

    existing_cols = [c for c in feature_cols if c in df.columns]
    df = df.select(*existing_cols)

    # Drop any remaining nulls in feature columns
    ml_feature_cols = [
        "start_year", "state_code", "district_code", "crop_code",
        "area", "log_area", "season_index", "crop_type_index", "yield"
    ]
    before = df.count()
    df = df.dropna(subset=[c for c in ml_feature_cols if c in df.columns])
    after = df.count()
    feature_log["steps"].append(f"Dropped {before - after} rows with null features")
    feature_log["final_count"] = after

    return df, feature_log


def main():
    if len(sys.argv) < 3:
        print("Usage: spark-submit build_features.py <hdfs_cleaned_path> <hdfs_features_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    print(f"[AgriScope] Starting feature engineering")
    spark = create_spark_session()

    try:
        df = spark.read.parquet(input_path)
        print(f"[AgriScope] Loaded {df.count()} cleaned rows")

        features_df, feature_log = build_features(df)
        print(f"[AgriScope] Feature set: {feature_log['final_count']} rows")

        features_df.write.mode("overwrite").parquet(output_path)
        print(f"[AgriScope] Features written to: {output_path}")

        # Verify
        verify_count = spark.read.parquet(output_path).count()
        print(f"[AgriScope] Verification: {verify_count} rows")

        result = {
            "status": "success",
            "input_path": input_path,
            "output_path": output_path,
            "feature_log": feature_log,
        }
        print(f"[AgriScope-Result] {json.dumps(result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
