"""
AgriScope - Spark Data Ingestion Job
Reads the APY CSV dataset, validates schema, and writes to HDFS.
Usage: spark-submit ingest_data.py <local_csv_path> <hdfs_output_path>
"""
import sys
import json
import os
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType, IntegerType
)


# Expected APY schema
EXPECTED_COLUMNS = [
    "id", "year", "state_name", "state_code", "district_name",
    "district_code", "crop_name", "crop_code", "crop_type",
    "season", "area", "area_unit", "production", "production_unit",
    "yield", "yield_unit"
]


def create_spark_session():
    """Create a Spark session with HDFS support."""
    return (
        SparkSession.builder
        .appName("AgriScope-DataIngestion")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .getOrCreate()
    )


def validate_schema(df, expected_cols):
    """Validate that the DataFrame has expected columns."""
    actual_cols = [c.lower().strip() for c in df.columns]
    missing = [c for c in expected_cols if c not in actual_cols]
    extra = [c for c in actual_cols if c not in expected_cols]
    return {
        "valid": len(missing) == 0,
        "missing_columns": missing,
        "extra_columns": extra,
        "actual_columns": actual_cols,
        "expected_columns": expected_cols,
    }


def profile_dataset(df):
    """Generate a data profiling summary."""
    total_rows = df.count()
    total_cols = len(df.columns)

    # Missing value counts
    missing_counts = {}
    for col in df.columns:
        null_count = df.filter(F.col(col).isNull() | (F.trim(F.col(col).cast("string")) == "")).count()
        missing_counts[col] = null_count

    # Distinct values for categorical columns
    categorical_cols = ["year", "state_name", "district_name", "crop_name", "crop_type", "season"]
    distinct_counts = {}
    for col in categorical_cols:
        if col in df.columns:
            distinct_counts[col] = df.select(col).distinct().count()

    # Numeric summaries
    numeric_cols = ["area", "production", "yield"]
    numeric_summary = {}
    for col in numeric_cols:
        if col in df.columns:
            stats = df.select(
                F.count(col).alias("count"),
                F.min(F.col(col).cast("double")).alias("min"),
                F.max(F.col(col).cast("double")).alias("max"),
                F.mean(F.col(col).cast("double")).alias("mean"),
                F.stddev(F.col(col).cast("double")).alias("stddev"),
            ).first()
            numeric_summary[col] = {
                "count": stats["count"],
                "min": float(stats["min"]) if stats["min"] is not None else None,
                "max": float(stats["max"]) if stats["max"] is not None else None,
                "mean": float(stats["mean"]) if stats["mean"] is not None else None,
                "stddev": float(stats["stddev"]) if stats["stddev"] is not None else None,
            }

    # Duplicate check
    duplicate_count = total_rows - df.dropDuplicates().count()

    # Year range
    year_range = None
    if "year" in df.columns:
        yr = df.select(F.min("year").alias("min_year"), F.max("year").alias("max_year")).first()
        year_range = {"min": yr["min_year"], "max": yr["max_year"]}

    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "missing_counts": missing_counts,
        "distinct_counts": distinct_counts,
        "numeric_summary": numeric_summary,
        "duplicate_count": duplicate_count,
        "year_range": year_range,
        "columns": df.columns,
        "dtypes": {f.name: str(f.dataType) for f in df.schema.fields},
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: spark-submit ingest_data.py <local_csv_path> <hdfs_output_path>")
        print("  Optional: <profile_output_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    hdfs_output = sys.argv[2]
    profile_output = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"[AgriScope] Starting data ingestion")
    print(f"[AgriScope] Input: {input_path}")
    print(f"[AgriScope] HDFS Output: {hdfs_output}")

    spark = create_spark_session()

    try:
        # Read CSV
        print("[AgriScope] Reading CSV file...")
        df = spark.read.csv(
            input_path,
            header=True,
            inferSchema=True,
            multiLine=True,
        )
        print(f"[AgriScope] Read {df.count()} rows, {len(df.columns)} columns")

        # Normalize column names
        for col in df.columns:
            df = df.withColumnRenamed(col, col.strip().lower().replace(" ", "_"))

        # Validate schema
        print("[AgriScope] Validating schema...")
        validation = validate_schema(df, EXPECTED_COLUMNS)
        print(f"[AgriScope] Schema valid: {validation['valid']}")
        if not validation["valid"]:
            print(f"[AgriScope] Missing columns: {validation['missing_columns']}")
            print(f"[AgriScope] Actual columns: {validation['actual_columns']}")

        # Profile dataset
        print("[AgriScope] Profiling dataset...")
        profile = profile_dataset(df)
        print(f"[AgriScope] Total rows: {profile['total_rows']}")
        print(f"[AgriScope] Duplicates: {profile['duplicate_count']}")
        print(f"[AgriScope] Year range: {profile.get('year_range')}")

        # Write raw data to HDFS as Parquet
        print(f"[AgriScope] Writing to HDFS: {hdfs_output}")
        df.write.mode("overwrite").parquet(hdfs_output)
        print("[AgriScope] Parquet write complete")

        # Verify
        verify_df = spark.read.parquet(hdfs_output)
        verify_count = verify_df.count()
        print(f"[AgriScope] Verification read: {verify_count} rows")

        if verify_count != profile["total_rows"]:
            print(f"[AgriScope] WARNING: Row count mismatch! Source: {profile['total_rows']}, HDFS: {verify_count}")

        # Save profile report
        if profile_output:
            profile["schema_validation"] = validation
            profile_json = json.dumps(profile, indent=2, default=str)
            # Write profile as a single JSON file via Spark
            profile_rdd = spark.sparkContext.parallelize([profile_json])
            profile_rdd.coalesce(1).saveAsTextFile(profile_output)
            print(f"[AgriScope] Profile saved to: {profile_output}")

        # Print summary as JSON to stdout for the backend to parse
        result = {
            "status": "success",
            "input_path": input_path,
            "hdfs_output": hdfs_output,
            "total_rows": profile["total_rows"],
            "total_columns": profile["total_columns"],
            "duplicate_count": profile["duplicate_count"],
            "year_range": profile.get("year_range"),
            "schema_valid": validation["valid"],
            "missing_columns": validation.get("missing_columns", []),
        }
        print(f"[AgriScope-Result] {json.dumps(result)}")

    except Exception as e:
        error_result = {"status": "error", "error": str(e)}
        print(f"[AgriScope-Result] {json.dumps(error_result)}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
