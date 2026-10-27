"""
AgriScope - Yield Prediction Job
Uses a trained model to predict yield for given inputs.
Usage: spark-submit predict_yield.py <model_path> <input_json_or_csv> <output_path>
"""
import sys
import json
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, DoubleType, IntegerType, StringType
from pyspark.ml import PipelineModel


FEATURE_COLUMNS = [
    "start_year", "state_code", "district_code", "crop_code",
    "area", "log_area", "season_index", "crop_type_index",
    "state_crop_avg_yield", "crop_avg_yield",
]


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-YieldPrediction")
        .config("spark.sql.adaptive.enabled", "true")
        .getOrCreate()
    )


def predict_single(spark, model, input_data: dict) -> dict:
    """Make a single prediction from a dictionary of inputs."""
    # Create a DataFrame from input
    schema = StructType([
        StructField("start_year", IntegerType(), True),
        StructField("state_code", IntegerType(), True),
        StructField("district_code", IntegerType(), True),
        StructField("crop_code", DoubleType(), True),
        StructField("area", DoubleType(), True),
        StructField("log_area", DoubleType(), True),
        StructField("season_index", IntegerType(), True),
        StructField("crop_type_index", IntegerType(), True),
        StructField("state_crop_avg_yield", DoubleType(), True),
        StructField("crop_avg_yield", DoubleType(), True),
    ])

    # Fill log_area if not provided
    if "log_area" not in input_data and "area" in input_data:
        import math
        input_data["log_area"] = math.log1p(input_data["area"])

    row_data = []
    for field in schema.fields:
        val = input_data.get(field.name)
        if val is not None:
            if isinstance(field.dataType, IntegerType):
                val = int(val)
            elif isinstance(field.dataType, DoubleType):
                val = float(val)
        row_data.append(val)

    input_df = spark.createDataFrame([row_data], schema)

    # Predict
    predictions = model.transform(input_df)
    pred_row = predictions.select("prediction").first()

    if pred_row:
        return {
            "predicted_yield": float(pred_row["prediction"]),
            "unit": "Tonnes/Hectare",
            "input": input_data,
        }
    return {"error": "No prediction generated"}


def predict_batch(spark, model, input_path: str, output_path: str) -> dict:
    """Batch prediction from a CSV file."""
    input_df = spark.read.csv(input_path, header=True, inferSchema=True)

    # Normalize column names
    for col in input_df.columns:
        input_df = input_df.withColumnRenamed(col, col.strip().lower().replace(" ", "_"))

    # Add log_area if missing
    if "log_area" not in input_df.columns and "area" in input_df.columns:
        input_df = input_df.withColumn("log_area", F.log1p(F.col("area")))

    predictions = model.transform(input_df)
    predictions.write.mode("overwrite").parquet(output_path)

    count = predictions.count()
    avg_pred = predictions.select(F.avg("prediction")).first()[0]

    return {
        "status": "success",
        "records_predicted": count,
        "average_predicted_yield": float(avg_pred) if avg_pred else None,
        "output_path": output_path,
    }


def main():
    if len(sys.argv) < 4:
        print("Usage: spark-submit predict_yield.py <model_path> <input_json_or_csv> <output_path>")
        sys.exit(1)

    model_path = sys.argv[1]
    input_source = sys.argv[2]
    output_path = sys.argv[3]

    print(f"[AgriScope] Starting yield prediction")
    spark = create_spark_session()

    try:
        # Load model
        print(f"[AgriScope] Loading model from: {model_path}")
        model = PipelineModel.load(model_path)

        if input_source.endswith(".json"):
            # Single prediction from JSON file
            with open(input_source) as f:
                input_data = json.load(f)
            result = predict_single(spark, model, input_data)
        elif input_source.endswith(".csv"):
            # Batch prediction
            result = predict_batch(spark, model, input_source, output_path)
        else:
            # Try as inline JSON
            input_data = json.loads(input_source)
            result = predict_single(spark, model, input_data)

        result["model_path"] = model_path
        print(f"[AgriScope-Result] {json.dumps(result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
