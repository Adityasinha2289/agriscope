#!/bin/bash
# AgriScope - Environment Verification Script
# Checks Java, Hadoop, HDFS, Spark, Python, and Node.js

echo "=========================================================="
echo "      AgriScope — Big Data Environment Verification       "
echo "=========================================================="

# 1. Java Check
echo -n "[1/6] Checking Java... "
if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVA_VER=$("$JAVA_HOME/bin/java" -version 2>&1 | head -n 1)
    echo "OK ($JAVA_VER)"
else
    echo "FAIL (JAVA_HOME not set or java binary not executable)"
fi

# 2. Hadoop Check
echo -n "[2/6] Checking Hadoop Home... "
if [ -d "/opt/homebrew/opt/hadoop" ]; then
    echo "OK (/opt/homebrew/opt/hadoop)"
else
    echo "WARN (Default homebrew path not found, checking PATH)"
fi

# 3. HDFS Check
echo -n "[3/6] Checking HDFS connectivity... "
if hdfs dfs -ls / > /dev/null 2>&1; then
    echo "OK (Namenode reachable at hdfs://localhost:9000)"
else
    echo "FAIL (HDFS not responding or namenode is down)"
fi

# 4. PySpark / Spark Check
echo -n "[4/6] Checking spark-submit... "
if which spark-submit > /dev/null 2>&1; then
    SPARK_BIN=$(which spark-submit)
    echo "OK ($SPARK_BIN)"
else
    echo "FAIL (spark-submit not in PATH)"
fi

# 5. Python Virtual Environment
echo -n "[5/6] Checking Python & Virtualenv... "
if [ -f "venv/bin/python" ]; then
    PY_VER=$(venv/bin/python --version)
    echo "OK ($PY_VER in venv)"
else
    echo "FAIL (venv not found at ./venv)"
fi

# 6. Node.js & npm
echo -n "[6/6] Checking Node.js & npm... "
if which node > /dev/null 2>&1 && which npm > /dev/null 2>&1; then
    NODE_VER=$(node -v)
    NPM_VER=$(npm -v)
    echo "OK (Node $NODE_VER, npm $NPM_VER)"
else
    echo "FAIL (Node.js or npm missing)"
fi

echo "=========================================================="
echo "Environment check complete."
