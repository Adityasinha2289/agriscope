# NEXGram Machine Learning Models & Evaluation

> **Lead Architect & Developer:** **Aditya Sinha**  
> **Course:** B.Tech CSET-371 Big Data Analytics & Business Intelligence

## 1. Mathematical Formulations & Objective Functions

### 1.1 Supervised Yield Regression
The target variable is continuous crop yield $y \in \mathbb{R}^+$ measured in **Tonnes per Hectare**.

Given feature vector $\mathbf{x} = [x_1, x_2, \dots, x_d]^T$:
- $x_1$: `start_year` (Normalized numerical timeline)
- $x_2$: `state_code` (Categorical state index)
- $x_3$: `district_code` (Categorical district index)
- $x_4$: `crop_code` (Categorical crop identifier)
- $x_5$: `area` (Cultivated land area in Hectares)
- $x_6$: `log_area` ($\ln(1 + \text{Area})$ variance stabilizer)
- $x_7$: `season_index` (Encoded agricultural season)
- $x_8$: `crop_type_index` (Taxonomic category index)
- $x_9$: `state_crop_avg_yield` (Historical regional baseline)
- $x_{10}$: `crop_avg_yield` (Nationwide crop baseline)

---

## 2. Model Leaderboard & Evaluation Metrics

Evaluated on an identical holdout test set (20% random split, seed=42, **$N_{\text{test}} = 88,574$ records**):

| Rank | Model Algorithm | $R^2$ Score | RMSE (Tonnes/Ha) | MAE (Tonnes/Ha) | Training Duration | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| **1** | **Gradient-Boosted Trees (GBT)** | **0.8550** | **5.3413** | **1.1332** | 11.96s | **Champion** |
| 2 | Random Forest Regressor | 0.8532 | 5.3743 | 1.1769 | 3.46s | Evaluated |
| 3 | Decision Tree Regressor | 0.8508 | 5.4169 | 1.1505 | 1.73s | Evaluated |
| 4 | Linear Regression (ElasticNet) | 0.7720 | 6.6974 | 1.2779 | 3.14s | Baseline |

---

## 3. Algorithm Deep-Dive

### 3.1 Gradient-Boosted Trees (Champion - $R^2 = 0.8550$)
- **Technique**: Additive tree ensemble with gradient descent in functional space.
- **Hyperparameters**: `maxIter = 20`, `maxDepth = 6`, `stepSize = 0.1`, `seed = 42`.
- **Why it Won**: Captures subtle interaction effects between specific crop baselines and state efficiency multipliers without overfitting the heavy tail of crop yields.

### 3.2 Random Forest Regressor ($R^2 = 0.8532$)
- **Technique**: Bootstrap aggregating (bagging) of 25 randomized trees.
- **Hyperparameters**: `numTrees = 25`, `maxDepth = 8`, `seed = 42`.
- **Trade-off**: Fast training (3.46s) with strong variance reduction.

### 3.3 Decision Tree Regressor ($R^2 = 0.8508$)
- **Technique**: Single greedy CART tree with variance reduction splitting.
- **Hyperparameters**: `maxDepth = 8`, `seed = 42`.
- **Trade-off**: Extremely fast (1.73s), highly interpretable, but slightly prone to step-wise boundary artifacts.

### 3.4 Linear Regression with ElasticNet ($R^2 = 0.7720$)
- **Loss Function**:
  $$\mathcal{L}(\mathbf{w}) = \frac{1}{2N} \sum_{i=1}^N (y_i - \mathbf{w}^T \mathbf{x}_i)^2 + \lambda \left( \alpha \|\mathbf{w}\|_1 + \frac{1 - \alpha}{2} \|\mathbf{w}\|_2^2 \right)$$
- **Hyperparameters**: `regParam = 0.1`, `elasticNetParam = 0.5`, `maxIter = 50`.
- **Baseline Role**: Proves that non-linear models yield an 8.3 percentage-point gain in explained variance ($R^2$: 0.772 -> 0.855).

---

## 4. Unsupervised K-Means Clustering ($k=5$)
- **Objective**: Identify natural agricultural typologies without manual annotations.
- **Features Used**: `area`, `log_area`, `yield`, `season_index`, `crop_type_index`.
- **Silhouette Score**: **0.4749** (indicating strong cluster cohesion and separation).

### Discovered Agronomic Clusters:
- **Cluster 0 (70,704 records)**: *High Yield, Medium Area* — Intensive Cash Crops (Rice, Onion, Potato, Sweet Potato).
- **Cluster 1 (265,257 records)**: *Low Yield, Medium Area* — Rainfed Pulses & Millets (Maize, Moong, Urad, Groundnut).
- **Cluster 2 (9,695 records)**: *High Yield, Large Area* — Commercial Sugar & Fruit Plantations (Sugarcane, Banana, Tapioca).
- **Cluster 3 (31,165 records)**: *Medium Yield, Large Area* — Extensive Grain Basins (Wheat, Rice, Jowar, Gram).
- **Cluster 4 (66,257 records)**: *Medium Yield, Medium Area* — High-Value Horticulture & Spices (Chillies, Turmeric, Garlic, Ginger).
