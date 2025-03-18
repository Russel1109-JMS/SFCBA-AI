from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import joblib
from flask_cors import CORS
import os
import tensorflow as tf
from tensorflow import keras

app = Flask(__name__)
CORS(app)

# Ensure necessary directories exist
os.makedirs("data", exist_ok=True)
os.makedirs("ml_models", exist_ok=True)

# Create sample sales data
sales_data = pd.DataFrame({
    "month": np.arange(1, 13),
    "sales": [100, 120, 130, 125, 150, 170, 160, 180, 190, 210, 220, 230]
})
sales_data.to_csv("data/sales_data.csv", index=False)

# Create sample customer data
demographics_data = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "age": [25, 34, 45, 23, 41],
    "annual_income": [40000, 50000, 60000, 30000, 70000],
    "spending_score": [30, 50, 70, 20, 80]
})
demographics_data.to_csv("data/customer_data.csv", index=False)

# Load and prepare sales data
data = pd.read_csv("data/sales_data.csv")
X = np.array(data["month"]).reshape(-1, 1)
y = np.array(data["sales"])

# Normalize data
X_normalized = X / 12
y_normalized = y / max(y)

# Deep Learning Model
deep_model = keras.Sequential([
    keras.layers.Dense(64, activation='relu', input_shape=(1,)),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(1)
])
deep_model.compile(optimizer='adam', loss='mean_squared_error')
deep_model.fit(X_normalized, y_normalized, epochs=500, verbose=0)
deep_model.save("ml_models/sales_forecast.h5")

# Load trained deep learning model
model = keras.models.load_model("ml_models/sales_forecast.h5", custom_objects={"mse": keras.losses.MeanSquaredError()})

# Customer Segmentation Model
demographics = pd.read_csv("data/customer_data.csv")
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(demographics.drop("customer_id", axis=1))
joblib.dump(kmeans, "ml_models/customer_segmentation.pkl")

@app.route("/predict_sales", methods=["POST"])
def predict_sales():
    request_data = request.json
    month = np.array(request_data["month"]).reshape(-1, 1) / 12  # Normalize input
    prediction = model.predict(month) * max(y)  # De-normalize output
    return jsonify({"predicted_sales": prediction.tolist()})

@app.route("/segment_customers", methods=["POST"])
def segment_customers():
    request_data = request.json
    customer_features = np.array(request_data["features"]).reshape(1, -1)
    segment = kmeans.predict(customer_features)
    return jsonify({"customer_segment": int(segment[0])})

if __name__ == "__main__":
    app.run(debug=True)