# NEXGram Dataset Provenance & Schema

> **Lead Architect & Developer:** **Aditya Sinha**  
> **Course:** B.Tech CSET-371 Big Data Analytics & Business Intelligence

## Primary Dataset
- **Name**: Crop-Wise Area, Production and Yield (APY) India
- **Coverage**: 1997–2022 across 34 Indian States & Territories and 737 Districts
- **Source**: [Kaggle - Crop Yield in Indian States Dataset](https://www.kaggle.com/datasets/thedevastator/crop-yield-in-indian-states-dataset)
- **Format**: CSV / Snappy Parquet
- **Rows**: 455,359 records
- **Columns**: 16 attributes (State, District, Crop, Season, Year, Area, Production, Yield, Crop_Type, etc.)
- **File Size**: 56.2 MB
- **Integrity SHA-256**: `4cf3b3b3cbce2361623ff5059bb29c5fa54ea5836a68fbe157dbe31a295844fe`

## Local Setup
Due to GitHub repository size recommendations, the full 56.2 MB file `crop-wise-area-production-yield.csv` should be placed directly inside this `data/` folder.
A small sample file `sample_apy.csv` is provided for quick unit tests.

To upload the dataset to Hadoop HDFS:
```bash
hdfs dfs -mkdir -p /agriscope/raw/apy/
hdfs dfs -put -f data/crop-wise-area-production-yield.csv /agriscope/raw/apy/
```
