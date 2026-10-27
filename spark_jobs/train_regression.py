"""
AgriScope - Regression Model Training Job
Trains 4 regression models on the feature dataset using Spark MLlib.
Usage: spark-submit train_regression.py <hdfs_features_path> <hdfs_models_base> <hdfs_results_base>
"""
import sys
import json
import time
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.regression import (
    LinearRegression,
    DecisionTreeRegressor,
    RandomForestRegressor,
    GBTRegressor,
)
from pyspark.ml.evaluation import RegressionEvaluator


RANDOM_SEED = 42

FEATURE_COLUMNS = [
    "start_year", "state_code", "district_code", "crop_code",
    "area", "log_area", "season_index", "crop_type_index",
    "state_crop_avg_yield", "crop_avg_yield",
]

TARGET_COLUMN = "yield"


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-RegressionTraining")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.driver.memory", "2g")
        .getOrCreate()
    )


def evaluate_model(predictions, target_col="yield"):
    """Calculate MAE, RMSE, R² from predictions DataFrame."""
    evaluator_mae = RegressionEvaluator(
        labelCol=target_col, predictionCol="prediction", metricName="mae"
    )
    evaluator_rmse = RegressionEvaluator(
        labelCol=target_col, predictionCol="prediction", metricName="rmse"
    )
    evaluator_r2 = RegressionEvaluator(
        labelCol=target_col, predictionCol="prediction", metricName="r2"
    )
    return {
        "mae": float(evaluator_mae.evaluate(predictions)),
        "rmse": float(evaluator_rmse.evaluate(predictions)),
        "r2": float(evaluator_r2.evaluate(predictions)),
    }


def train_and_evaluate(spark, train_df, test_df, model_class, model_name, model_params, 
                       features_col, target_col, model_output_path, predictions_output_path):
    """Train a single model, evaluate, and save."""
    print(f"\n[AgriScope] === Training {model_name} ===")
    start_time = time.time()

    # Build pipeline
    assembler = VectorAssembler(
        inputCols=features_col,
        outputCol="features_raw",
        handleInvalid="skip",
    )
    scaler = StandardScaler(
        inputCol="features_raw",
        outputCol="features",
        withStd=True,
        withMean=False,
    )

    model_instance = model_class(**model_params)
    model_instance.setFeaturesCol("features")
    model_instance.setLabelCol(target_col)

    pipeline = Pipeline(stages=[assembler, scaler, model_instance])

    # Train
    pipeline_model = pipeline.fit(train_df)
    train_duration = time.time() - start_time
    print(f"[AgriScope] Training time: {train_duration:.2f}s")

    # Predict on test set
    pred_start = time.time()
    predictions = pipeline_model.transform(test_df)
    pred_duration = time.time() - pred_start

    # Evaluate
    metrics = evaluate_model(predictions, target_col)
    metrics["training_duration_seconds"] = round(train_duration, 2)
    metrics["prediction_duration_seconds"] = round(pred_duration, 2)
    metrics["training_samples"] = train_df.count()
    metrics["test_samples"] = test_df.count()

    print(f"[AgriScope] {model_name} Results:")
    print(f"  MAE:  {metrics['mae']:.4f}")
    print(f"  RMSE: {metrics['rmse']:.4f}")
    print(f"  R²:   {metrics['r2']:.4f}")

    # Save model
    pipeline_model.write().overwrite().save(model_output_path)
    print(f"[AgriScope] Model saved to: {model_output_path}")

    # Save predictions (sample for analysis)
    pred_subset = predictions.select(
        target_col, "prediction",
        *[c for c in ["state_name", "district_name", "crop_name", "year"] if c in predictions.columns]
    )
    pred_subset.write.mode("overwrite").parquet(predictions_output_path)
    print(f"[AgriScope] Predictions saved to: {predictions_output_path}")

    return metrics


def main():
    if len(sys.argv) < 4:
        print("Usage: spark-submit train_regression.py <hdfs_features_path> <hdfs_models_base> <hdfs_results_base>")
        sys.exit(1)

    features_path = sys.argv[1]
    models_base = sys.argv[2]
    results_base = sys.argv[3]

    print("[AgriScope] Starting regression model training")
    spark = create_spark_session()

    try:
        df = spark.read.parquet(features_path)
        total_count = df.count()
        print(f"[AgriScope] Loaded {total_count} feature rows")

        # Filter to valid features only
        for col in FEATURE_COLUMNS:
            if col in df.columns:
                df = df.filter(F.col(col).isNotNull())
        df = df.filter(F.col(TARGET_COLUMN).isNotNull() & (F.col(TARGET_COLUMN) > 0))

        filtered_count = df.count()
        print(f"[AgriScope] After filtering: {filtered_count} rows")

        # Train/test split (80/20, fixed seed)
        train_df, test_df = df.randomSplit([0.8, 0.2], seed=RANDOM_SEED)
        print(f"[AgriScope] Train: {train_df.count()}, Test: {test_df.count()}")

        # Cache for repeated use
        train_df.cache()
        test_df.cache()

        # Define models
        models = [
            {
                "name": "Linear Regression",
                "class": LinearRegression,
                "params": {"maxIter": 50, "regParam": 0.1, "elasticNetParam": 0.5},
                "dir_name": "linear_regression",
            },
            {
                "name": "Decision Tree",
                "class": DecisionTreeRegressor,
                "params": {"maxDepth": 8, "seed": RANDOM_SEED},
                "dir_name": "decision_tree",
            },
            {
                "name": "Random Forest",
                "class": RandomForestRegressor,
                "params": {"numTrees": 25, "maxDepth": 8, "seed": RANDOM_SEED},
                "dir_name": "random_forest",
            },
            {
                "name": "Gradient-Boosted Trees",
                "class": GBTRegressor,
                "params": {"maxIter": 20, "maxDepth": 6, "seed": RANDOM_SEED, "stepSize": 0.1},
                "dir_name": "gradient_boosted_trees",
            },
        ]

        all_results = {}

        for model_def in models:
            model_path = f"{models_base}/{model_def['dir_name']}"
            pred_path = f"{results_base}/predictions/{model_def['dir_name']}"

            try:
                metrics = train_and_evaluate(
                    spark=spark,
                    train_df=train_df,
                    test_df=test_df,
                    model_class=model_def["class"],
                    model_name=model_def["name"],
                    model_params=model_def["params"],
                    features_col=FEATURE_COLUMNS,
                    target_col=TARGET_COLUMN,
                    model_output_path=model_path,
                    predictions_output_path=pred_path,
                )
                all_results[model_def["name"]] = {
                    "status": "success",
                    "metrics": metrics,
                    "model_path": model_path,
                    "predictions_path": pred_path,
                    "algorithm": model_def["dir_name"],
                    "hyperparameters": model_def["params"],
                    "feature_columns": FEATURE_COLUMNS,
                    "target_column": TARGET_COLUMN,
                    "random_seed": RANDOM_SEED,
                    "split": "80/20 random",
                }
            except Exception as e:
                print(f"[AgriScope] ERROR training {model_def['name']}: {e}")
                all_results[model_def["name"]] = {
                    "status": "error",
                    "error": str(e),
                    "algorithm": model_def["dir_name"],
                }

        # Save evaluation summary
        eval_path = f"{results_base}/evaluations/regression_summary"
        eval_json = json.dumps(all_results, indent=2, default=str)
        eval_rdd = spark.sparkContext.parallelize([eval_json])
        eval_rdd.coalesce(1).saveAsTextFile(eval_path)
        print(f"\n[AgriScope] Evaluation summary saved to: {eval_path}")

        # Print comparison
        print("\n[AgriScope] === MODEL COMPARISON ===")
        print(f"{'Model':<30} {'MAE':>10} {'RMSE':>10} {'R²':>10}")
        print("-" * 62)
        for name, result in all_results.items():
            if result["status"] == "success":
                m = result["metrics"]
                print(f"{name:<30} {m['mae']:>10.4f} {m['rmse']:>10.4f} {m['r2']:>10.4f}")

        final_result = {
            "status": "success",
            "models": all_results,
            "training_samples": train_df.count(),
            "test_samples": test_df.count(),
            "feature_columns": FEATURE_COLUMNS,
            "target_column": TARGET_COLUMN,
            "split_strategy": "80/20 random split, seed=42",
        }
        print(f"\n[AgriScope-Result] {json.dumps(final_result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
