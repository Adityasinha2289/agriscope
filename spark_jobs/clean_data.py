"""
AgriScope - Spark Data Cleaning Job
Cleans and normalizes the raw APY dataset.
Usage: spark-submit clean_data.py <hdfs_input_parquet> <hdfs_output_path>
"""
import sys
import json
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, IntegerType


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-DataCleaning")
        .config("spark.sql.adaptive.enabled", "true")
        .getOrCreate()
    )


def clean_dataset(df):
    """
    Clean the APY dataset:
    1. Standardize column types
    2. Handle missing values
    3. Remove duplicates
    4. Normalize text fields
    5. Validate numeric ranges
    6. Parse year fields
    """
    original_count = df.count()
    cleaning_log = {"original_count": original_count, "steps": []}

    # Step 1: Cast numeric columns
    df = df.withColumn("area", F.col("area").cast(DoubleType()))
    df = df.withColumn("production", F.col("production").cast(DoubleType()))
    df = df.withColumn("yield", F.col("yield").cast(DoubleType()))
    df = df.withColumn("state_code", F.col("state_code").cast(IntegerType()))
    df = df.withColumn("district_code", F.col("district_code").cast(IntegerType()))
    cleaning_log["steps"].append("Cast numeric columns to proper types")

    # Step 2: Normalize text fields
    text_cols = ["state_name", "district_name", "crop_name", "crop_type", "season"]
    for col_name in text_cols:
        if col_name in df.columns:
            df = df.withColumn(col_name, F.trim(F.initcap(F.lower(F.col(col_name)))))
    cleaning_log["steps"].append("Normalized text fields (trim + title case)")

    # Step 3: Parse year into start_year
    # Year format is like "1997-1998" or "1997-98"
    if "year" in df.columns:
        df = df.withColumn(
            "start_year",
            F.when(
                F.col("year").rlike(r"^\d{4}"),
                F.substring(F.col("year"), 1, 4).cast(IntegerType())
            ).otherwise(None)
        )
        cleaning_log["steps"].append("Extracted start_year from year string")

    # Step 4: Remove rows with null critical fields
    critical_cols = ["state_name", "district_name", "crop_name"]
    before_null = df.count()
    df = df.dropna(subset=critical_cols)
    null_dropped = before_null - df.count()
    cleaning_log["steps"].append(f"Dropped {null_dropped} rows with null critical fields")
    cleaning_log["null_dropped"] = null_dropped

    # Step 5: Remove exact duplicates (excluding id column)
    dedup_cols = [c for c in df.columns if c not in ["id"]]
    before_dedup = df.count()
    df = df.dropDuplicates(dedup_cols)
    dedup_dropped = before_dedup - df.count()
    cleaning_log["steps"].append(f"Removed {dedup_dropped} duplicate rows")
    cleaning_log["duplicates_dropped"] = dedup_dropped

    # Step 6: Flag invalid numeric values (don't remove — make explicit)
    df = df.withColumn(
        "area_valid",
        F.when(F.col("area").isNotNull() & (F.col("area") >= 0), True).otherwise(False)
    )
    df = df.withColumn(
        "production_valid",
        F.when(F.col("production").isNotNull() & (F.col("production") >= 0), True).otherwise(False)
    )
    df = df.withColumn(
        "yield_valid",
        F.when(
            F.col("yield").isNotNull() & (F.col("yield") >= 0) & (F.col("yield") < 1000),
            True
        ).otherwise(False)
    )

    invalid_area = df.filter(~F.col("area_valid")).count()
    invalid_prod = df.filter(~F.col("production_valid")).count()
    invalid_yield = df.filter(~F.col("yield_valid")).count()

    cleaning_log["steps"].append(f"Flagged {invalid_area} invalid area, {invalid_prod} invalid production, {invalid_yield} invalid yield records")
    cleaning_log["invalid_area"] = invalid_area
    cleaning_log["invalid_production"] = invalid_prod
    cleaning_log["invalid_yield"] = invalid_yield

    # Step 7: Normalize area_unit and production_unit
    if "area_unit" in df.columns:
        df = df.withColumn("area_unit", F.trim(F.lower(F.col("area_unit"))))
    if "production_unit" in df.columns:
        df = df.withColumn("production_unit", F.trim(F.lower(F.col("production_unit"))))
    if "yield_unit" in df.columns:
        df = df.withColumn("yield_unit", F.trim(F.lower(F.col("yield_unit"))))
    cleaning_log["steps"].append("Normalized unit columns")

    cleaning_log["final_count"] = df.count()
    cleaning_log["rows_removed"] = original_count - df.count()

    return df, cleaning_log


def main():
    if len(sys.argv) < 3:
        print("Usage: spark-submit clean_data.py <hdfs_input_parquet> <hdfs_output_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    print(f"[AgriScope] Starting data cleaning")
    print(f"[AgriScope] Input: {input_path}")
    print(f"[AgriScope] Output: {output_path}")

    spark = create_spark_session()

    try:
        df = spark.read.parquet(input_path)
        print(f"[AgriScope] Loaded {df.count()} rows")

        cleaned_df, cleaning_log = clean_dataset(df)

        print(f"[AgriScope] Cleaned dataset: {cleaning_log['final_count']} rows")
        print(f"[AgriScope] Rows removed: {cleaning_log['rows_removed']}")

        # Write cleaned data
        cleaned_df.write.mode("overwrite").parquet(output_path)
        print(f"[AgriScope] Written to: {output_path}")

        # Verify
        verify_df = spark.read.parquet(output_path)
        verify_count = verify_df.count()
        print(f"[AgriScope] Verification: {verify_count} rows")

        result = {
            "status": "success",
            "input_path": input_path,
            "output_path": output_path,
            "cleaning_log": cleaning_log,
        }
        print(f"[AgriScope-Result] {json.dumps(result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
