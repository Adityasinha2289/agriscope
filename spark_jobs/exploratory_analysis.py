"""
AgriScope - Exploratory Analytics Spark Job
Generates pre-computed aggregates for the dashboard.
Usage: spark-submit exploratory_analysis.py <hdfs_cleaned_path> <hdfs_analytics_base>
"""
import sys
import json
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-ExploratoryAnalysis")
        .config("spark.sql.adaptive.enabled", "true")
        .getOrCreate()
    )


def compute_yield_trends(df):
    """Yield trends by year."""
    return (
        df.filter(F.col("yield").isNotNull() & (F.col("yield") > 0))
        .groupBy("start_year")
        .agg(
            F.avg("yield").alias("avg_yield"),
            F.min("yield").alias("min_yield"),
            F.max("yield").alias("max_yield"),
            F.stddev("yield").alias("stddev_yield"),
            F.sum("area").alias("total_area"),
            F.sum("production").alias("total_production"),
            F.count("*").alias("record_count"),
            F.countDistinct("crop_name").alias("distinct_crops"),
            F.countDistinct("district_name").alias("distinct_districts"),
        )
        .orderBy("start_year")
    )


def compute_crop_rankings(df):
    """Top crops by average yield and total production."""
    return (
        df.filter(F.col("yield").isNotNull() & (F.col("yield") > 0))
        .groupBy("crop_name", "crop_type")
        .agg(
            F.avg("yield").alias("avg_yield"),
            F.sum("production").alias("total_production"),
            F.sum("area").alias("total_area"),
            F.count("*").alias("record_count"),
            F.countDistinct("state_name").alias("states_count"),
            F.countDistinct("district_name").alias("districts_count"),
            F.min("start_year").alias("first_year"),
            F.max("start_year").alias("last_year"),
        )
        .orderBy(F.desc("total_production"))
    )


def compute_state_rankings(df):
    """State-wise production rankings."""
    return (
        df.filter(F.col("yield").isNotNull() & (F.col("yield") > 0))
        .groupBy("state_name")
        .agg(
            F.avg("yield").alias("avg_yield"),
            F.sum("production").alias("total_production"),
            F.sum("area").alias("total_area"),
            F.count("*").alias("record_count"),
            F.countDistinct("crop_name").alias("distinct_crops"),
            F.countDistinct("district_name").alias("distinct_districts"),
        )
        .orderBy(F.desc("total_production"))
    )


def compute_season_distribution(df):
    """Distribution by season."""
    return (
        df.filter(F.col("season").isNotNull())
        .groupBy("season")
        .agg(
            F.count("*").alias("record_count"),
            F.avg("yield").alias("avg_yield"),
            F.sum("production").alias("total_production"),
            F.sum("area").alias("total_area"),
            F.countDistinct("crop_name").alias("distinct_crops"),
        )
        .orderBy(F.desc("record_count"))
    )


def compute_district_rankings(df):
    """Top districts by production."""
    return (
        df.filter(F.col("yield").isNotNull() & (F.col("yield") > 0))
        .groupBy("state_name", "district_name")
        .agg(
            F.avg("yield").alias("avg_yield"),
            F.sum("production").alias("total_production"),
            F.sum("area").alias("total_area"),
            F.count("*").alias("record_count"),
            F.countDistinct("crop_name").alias("distinct_crops"),
        )
        .orderBy(F.desc("total_production"))
    )


def compute_overview_kpis(df):
    """Overall KPI metrics for dashboard."""
    valid_df = df.filter(F.col("yield").isNotNull() & (F.col("yield") > 0))

    kpis = valid_df.select(
        F.count("*").alias("total_records"),
        F.countDistinct("crop_name").alias("distinct_crops"),
        F.countDistinct("district_name").alias("distinct_districts"),
        F.countDistinct("state_name").alias("distinct_states"),
        F.min("start_year").alias("first_year"),
        F.max("start_year").alias("last_year"),
        F.sum("production").alias("total_production"),
        F.sum("area").alias("total_area"),
        F.avg("yield").alias("simple_avg_yield"),
    ).first()

    # Area-weighted average yield
    weighted = valid_df.filter(F.col("area") > 0).select(
        (F.sum(F.col("yield") * F.col("area")) / F.sum("area")).alias("weighted_avg_yield")
    ).first()

    return {
        "total_records": int(kpis["total_records"]),
        "distinct_crops": int(kpis["distinct_crops"]),
        "distinct_districts": int(kpis["distinct_districts"]),
        "distinct_states": int(kpis["distinct_states"]),
        "year_coverage": f"{kpis['first_year']}-{kpis['last_year']}",
        "total_production_tonnes": float(kpis["total_production"]) if kpis["total_production"] else 0,
        "total_area_hectares": float(kpis["total_area"]) if kpis["total_area"] else 0,
        "simple_avg_yield_tonnes_per_hectare": round(float(kpis["simple_avg_yield"]), 4) if kpis["simple_avg_yield"] else 0,
        "weighted_avg_yield_tonnes_per_hectare": round(float(weighted["weighted_avg_yield"]), 4) if weighted["weighted_avg_yield"] else 0,
        "avg_yield_note": "simple_avg_yield is unweighted arithmetic mean across all records. weighted_avg_yield weights by cultivated area.",
    }


def compute_crop_type_distribution(df):
    """Crop type distribution."""
    return (
        df.filter(F.col("crop_type").isNotNull())
        .groupBy("crop_type")
        .agg(
            F.count("*").alias("record_count"),
            F.countDistinct("crop_name").alias("distinct_crops"),
            F.avg("yield").alias("avg_yield"),
            F.sum("production").alias("total_production"),
        )
        .orderBy(F.desc("record_count"))
    )


def main():
    if len(sys.argv) < 3:
        print("Usage: spark-submit exploratory_analysis.py <hdfs_cleaned_path> <hdfs_analytics_base>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_base = sys.argv[2]

    print("[AgriScope] Starting exploratory analysis")
    spark = create_spark_session()

    try:
        df = spark.read.parquet(input_path)
        total = df.count()
        print(f"[AgriScope] Loaded {total} rows")

        # Compute and save each analytic
        analytics = {
            "yield_trends": (compute_yield_trends, "yield_trends"),
            "crop_rankings": (compute_crop_rankings, "crop_rankings"),
            "state_rankings": (compute_state_rankings, "state_rankings"),
            "season_distribution": (compute_season_distribution, "season_distribution"),
            "district_rankings": (compute_district_rankings, "district_rankings"),
            "crop_type_distribution": (compute_crop_type_distribution, "crop_type_distribution"),
        }

        result_summary = {}

        for name, (compute_fn, dir_name) in analytics.items():
            print(f"[AgriScope] Computing {name}...")
            result_df = compute_fn(df)
            output_path = f"{output_base}/{dir_name}"
            result_df.write.mode("overwrite").parquet(output_path)
            count = result_df.count()
            result_summary[name] = {"rows": count, "path": output_path}
            print(f"[AgriScope] {name}: {count} rows -> {output_path}")

        # Compute KPIs (small data, collected)
        print("[AgriScope] Computing KPIs...")
        kpis = compute_overview_kpis(df)
        kpi_json = json.dumps(kpis, indent=2, default=str)
        kpi_rdd = spark.sparkContext.parallelize([kpi_json])
        kpi_path = f"{output_base}/kpis"
        kpi_rdd.coalesce(1).saveAsTextFile(kpi_path)
        result_summary["kpis"] = kpis
        print(f"[AgriScope] KPIs saved to: {kpi_path}")

        result = {
            "status": "success",
            "analytics": result_summary,
            "input_path": input_path,
            "output_base": output_base,
        }
        print(f"\n[AgriScope-Result] {json.dumps(result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
