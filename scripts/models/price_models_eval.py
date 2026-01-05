"""
Property Price Model Evaluation Script
Fetches properties from database, gets predictions from 3 models,
and generates publication-quality charts saved as PNG files.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine
import requests
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set style for publication-quality plots
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 11

# ============================================================================
# CONFIGURATION
# ============================================================================

DB_URL = "postgresql://admin:admin@localhost:5432/home_radar_db"
CATEGORY = "FOR_SALE"  # Change to "FOR_SALE" for sales properties

MODEL_ENDPOINTS = {
    "XGBoost": "http://127.0.0.1:8000/predict",
    "Ridge": "http://127.0.0.1:8001/predict",
    "CatBoost": "http://127.0.0.1:8002/predict"
}

OUTPUT_DIR = f"./model_evaluation_{CATEGORY.lower()}_{datetime.now().strftime('%Y%m%d_%H%M')}"

# ============================================================================
# STEP 1: FETCH PROPERTIES FROM DATABASE
# ============================================================================

def fetch_properties_from_db(db_url, category):
    """Fetch all properties from database"""
    print(f"📊 Fetching {category} properties from database...")
    
    engine = create_engine(db_url)
    
    query = f"""
    SELECT id, title, latitude, longitude, category, square_meters, 
           floor, parking, wifi, balcony, elevator, heating, type, 
           number_of_rooms, price, year_built, bedrooms, bathrooms, 
           neighborhood
    FROM properties
    WHERE price IS NOT NULL AND price > 0
        AND category = '{category}'
        AND square_meters IS NOT NULL AND square_meters > 0
    """
    
    df = pd.read_sql(query, engine)
    print(f"✅ Loaded {len(df)} properties")
    print(f"   Price range: €{df['price'].min():.2f} - €{df['price'].max():.2f}")
    print(f"   Mean price: €{df['price'].mean():.2f}")
    
    return df

# ============================================================================
# STEP 2: GET PREDICTIONS FROM ALL MODELS
# ============================================================================

def get_predictions_for_property(prop, category):
    """Get predictions from all three models for a single property"""
    payload = {
        "square_meters": float(prop['square_meters']),
        "floor": int(prop['floor']) if pd.notna(prop['floor']) else 0,
        "parking": bool(prop['parking']) if pd.notna(prop['parking']) else False,
        "wifi": bool(prop['wifi']) if pd.notna(prop['wifi']) else False,
        "balcony": bool(prop['balcony']) if pd.notna(prop['balcony']) else False,
        "elevator": bool(prop['elevator']) if pd.notna(prop['elevator']) else False,
        "heating": str(prop['heating']) if pd.notna(prop['heating']) else "CENTRAL",
        "type": str(prop['type']) if pd.notna(prop['type']) else "FLAT",
        "neighborhood": str(prop['neighborhood']) if pd.notna(prop['neighborhood']) else "Unknown",
        "lat": float(prop['latitude']),
        "lng": float(prop['longitude']),
        "number_of_rooms": float(prop['number_of_rooms']) if pd.notna(prop['number_of_rooms']) else 2,
        "year_built": int(prop['year_built']) if pd.notna(prop['year_built']) else 2000,
        "bedrooms": int(prop['bedrooms']) if pd.notna(prop['bedrooms']) else 1,
        "bathrooms": int(prop['bathrooms']) if pd.notna(prop['bathrooms']) else 1
    }
    
    predictions = {}
    
    for model_name, endpoint in MODEL_ENDPOINTS.items():
        try:
            response = requests.post(
                f"{endpoint}?category={category}",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                predictions[model_name] = result.get('predicted_price')
            else:
                predictions[model_name] = None
                
        except Exception as e:
            print(f"⚠️  Error getting {model_name} prediction: {e}")
            predictions[model_name] = None
    
    return predictions

def get_all_predictions(df, category):
    """Get predictions for all properties"""
    print(f"\n🔮 Getting predictions from all models...")
    
    results = []
    total = len(df)
    
    for idx, (_, prop) in enumerate(df.iterrows(), 1):
        if idx % 50 == 0:
            print(f"   Progress: {idx}/{total} properties...")
        
        predictions = get_predictions_for_property(prop, category)
        
        results.append({
            'id': prop['id'],
            'title': prop['title'],
            'neighborhood': prop['neighborhood'],
            'square_meters': prop['square_meters'],
            'actual_price': prop['price'],
            'xgboost_pred': predictions.get('XGBoost'),
            'ridge_pred': predictions.get('Ridge'),
            'catboost_pred': predictions.get('CatBoost')
        })
    
    results_df = pd.DataFrame(results)
    
    # Remove rows where all predictions failed
    results_df = results_df.dropna(subset=['xgboost_pred', 'ridge_pred', 'catboost_pred'], how='all')
    
    print(f"✅ Got predictions for {len(results_df)} properties")
    
    return results_df

# ============================================================================
# STEP 3: CALCULATE METRICS
# ============================================================================

def calculate_metrics(df):
    """Calculate evaluation metrics for all models"""
    print(f"\n📈 Calculating metrics...")
    
    models = ['xgboost_pred', 'ridge_pred', 'catboost_pred']
    model_names = ['XGBoost', 'Ridge', 'CatBoost']
    
    metrics = []
    
    for model, name in zip(models, model_names):
        valid_data = df[df[model].notna()].copy()
        
        if len(valid_data) == 0:
            continue
        
        # MAE - Mean Absolute Error
        mae = np.mean(np.abs(valid_data['actual_price'] - valid_data[model]))
        
        # RMSE - Root Mean Squared Error
        rmse = np.sqrt(np.mean((valid_data['actual_price'] - valid_data[model]) ** 2))
        
        # MAPE - Mean Absolute Percentage Error
        mape = np.mean(np.abs((valid_data['actual_price'] - valid_data[model]) / valid_data['actual_price'])) * 100
        
        # R² - Coefficient of Determination
        ss_res = np.sum((valid_data['actual_price'] - valid_data[model]) ** 2)
        ss_tot = np.sum((valid_data['actual_price'] - valid_data['actual_price'].mean()) ** 2)
        r2 = 1 - (ss_res / ss_tot)
        
        # Median Absolute Error
        median_ae = np.median(np.abs(valid_data['actual_price'] - valid_data[model]))
        
        metrics.append({
            'Model': name,
            'MAE': mae,
            'RMSE': rmse,
            'MAPE': mape,
            'R²': r2,
            'Median AE': median_ae,
            'Samples': len(valid_data)
        })
        
        print(f"\n{name}:")
        print(f"  MAE:  €{mae:,.2f}")
        print(f"  RMSE: €{rmse:,.2f}")
        print(f"  MAPE: {mape:.2f}%")
        print(f"  R²:   {r2:.4f}")
    
    return pd.DataFrame(metrics)

# ============================================================================
# STEP 4: CREATE VISUALIZATIONS
# ============================================================================

def create_visualizations(df, metrics_df, output_dir, category):
    """Create all evaluation charts"""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n📊 Creating visualizations...")
    
    # Define colors for each model
    colors = {
        'XGBoost': '#8b5cf6',
        'Ridge': '#ec4899',
        'CatBoost': '#06b6d4'
    }
    
    # ========================================================================
    # CHART 1: Scatter Plot - Predictions vs Actual
    # ========================================================================
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle(f'Model Predictions vs Actual Price ({category})', fontsize=16, fontweight='bold')
    
    models = [('xgboost_pred', 'XGBoost'), ('ridge_pred', 'Ridge'), ('catboost_pred', 'CatBoost')]
    
    for idx, (ax, (model_col, model_name)) in enumerate(zip(axes, models)):
        valid_data = df[df[model_col].notna()]
        
        # Scatter plot
        ax.scatter(valid_data['actual_price'], valid_data[model_col], 
                  alpha=0.5, s=50, color=colors[model_name], edgecolors='black', linewidth=0.5)
        
        # Perfect prediction line (diagonal)
        min_val = min(valid_data['actual_price'].min(), valid_data[model_col].min())
        max_val = max(valid_data['actual_price'].max(), valid_data[model_col].max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
        
        # Labels and formatting
        ax.set_xlabel('Actual Price (€)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Predicted Price (€)', fontsize=12, fontweight='bold')
        ax.set_title(f'{model_name}', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Add R² to plot
        r2 = metrics_df[metrics_df['Model'] == model_name]['R²'].values[0]
        ax.text(0.05, 0.95, f'R² = {r2:.4f}', transform=ax.transAxes, 
               fontsize=12, verticalalignment='top',
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/1_scatter_predictions_vs_actual.png', bbox_inches='tight')
    print(f"  ✅ Saved: 1_scatter_predictions_vs_actual.png")
    plt.close()
    
    # ========================================================================
    # CHART 2: Bar Chart Comparison (First 30 properties)
    # ========================================================================
    
    fig, ax = plt.subplots(figsize=(16, 8))
    
    sample_df = df.head(30).copy()
    sample_df['index'] = range(1, len(sample_df) + 1)
    
    x = np.arange(len(sample_df))
    width = 0.2
    
    ax.bar(x - 1.5*width, sample_df['actual_price'], width, label='Actual', color='#10b981', alpha=0.8)
    ax.bar(x - 0.5*width, sample_df['xgboost_pred'], width, label='XGBoost', color=colors['XGBoost'], alpha=0.8)
    ax.bar(x + 0.5*width, sample_df['ridge_pred'], width, label='Ridge', color=colors['Ridge'], alpha=0.8)
    ax.bar(x + 1.5*width, sample_df['catboost_pred'], width, label='CatBoost', color=colors['CatBoost'], alpha=0.8)
    
    ax.set_xlabel('Property Index', fontsize=12, fontweight='bold')
    ax.set_ylabel('Price (€)', fontsize=12, fontweight='bold')
    ax.set_title(f'Model Comparison - First 30 Properties ({category})', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(sample_df['index'])
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/2_bar_comparison_sample.png', bbox_inches='tight')
    print(f"  ✅ Saved: 2_bar_comparison_sample.png")
    plt.close()
    
    # ========================================================================
    # CHART 3: Error Distribution (Histogram)
    # ========================================================================
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle(f'Prediction Error Distribution ({category})', fontsize=16, fontweight='bold')
    
    for idx, (ax, (model_col, model_name)) in enumerate(zip(axes, models)):
        valid_data = df[df[model_col].notna()].copy()
        errors = valid_data[model_col] - valid_data['actual_price']
        
        ax.hist(errors, bins=50, color=colors[model_name], alpha=0.7, edgecolor='black')
        ax.axvline(0, color='red', linestyle='--', linewidth=2, label='Zero Error')
        ax.axvline(errors.mean(), color='yellow', linestyle='--', linewidth=2, label=f'Mean Error: €{errors.mean():.2f}')
        
        ax.set_xlabel('Prediction Error (€)', fontsize=12, fontweight='bold')
        ax.set_ylabel('Frequency', fontsize=12, fontweight='bold')
        ax.set_title(f'{model_name}', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/3_error_distribution.png', bbox_inches='tight')
    print(f"  ✅ Saved: 3_error_distribution.png")
    plt.close()
    
    # ========================================================================
    # CHART 4: Metrics Comparison (Bar Chart)
    # ========================================================================
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f'Model Performance Metrics ({category})', fontsize=16, fontweight='bold')
    
    metrics_to_plot = ['MAE', 'RMSE', 'MAPE', 'R²']
    
    for idx, (ax, metric) in enumerate(zip(axes.flatten(), metrics_to_plot)):
        bars = ax.bar(metrics_df['Model'], metrics_df[metric], 
                     color=[colors[m] for m in metrics_df['Model']], alpha=0.8, edgecolor='black')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.2f}' if metric != 'R²' else f'{height:.4f}',
                   ha='center', va='bottom', fontweight='bold')
        
        ax.set_ylabel(metric, fontsize=12, fontweight='bold')
        ax.set_title(f'{metric} Comparison', fontsize=13, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='y')
        
        # For R², higher is better - invert if needed for visual clarity
        if metric == 'R²':
            ax.set_ylim([0, 1])
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/4_metrics_comparison.png', bbox_inches='tight')
    print(f"  ✅ Saved: 4_metrics_comparison.png")
    plt.close()
    
    # ========================================================================
    # CHART 5: Absolute Error by Price Range
    # ========================================================================
    
    fig, ax = plt.subplots(figsize=(14, 8))
    
    # Create price bins
    df_copy = df.copy()
    df_copy['price_bin'] = pd.cut(df_copy['actual_price'], bins=10)
    
    # Calculate mean absolute error per bin for each model
    error_by_bin = []
    for price_bin in df_copy['price_bin'].cat.categories:
        bin_data = df_copy[df_copy['price_bin'] == price_bin]
        if len(bin_data) > 0:
            error_by_bin.append({
                'price_range': str(price_bin),
                'XGBoost': np.mean(np.abs(bin_data['xgboost_pred'] - bin_data['actual_price'])),
                'Ridge': np.mean(np.abs(bin_data['ridge_pred'] - bin_data['actual_price'])),
                'CatBoost': np.mean(np.abs(bin_data['catboost_pred'] - bin_data['actual_price']))
            })
    
    error_df = pd.DataFrame(error_by_bin)
    
    x = np.arange(len(error_df))
    width = 0.25
    
    ax.plot(x, error_df['XGBoost'], marker='o', linewidth=2, markersize=8, 
           label='XGBoost', color=colors['XGBoost'])
    ax.plot(x, error_df['Ridge'], marker='s', linewidth=2, markersize=8, 
           label='Ridge', color=colors['Ridge'])
    ax.plot(x, error_df['CatBoost'], marker='^', linewidth=2, markersize=8, 
           label='CatBoost', color=colors['CatBoost'])
    
    ax.set_xlabel('Price Range', fontsize=12, fontweight='bold')
    ax.set_ylabel('Mean Absolute Error (€)', fontsize=12, fontweight='bold')
    ax.set_title(f'Model Performance Across Price Ranges ({category})', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels([f"€{int(float(r.split(',')[0][1:]))}-{int(float(r.split(',')[1][:-1]))}" 
                        for r in error_df['price_range']], rotation=45, ha='right')
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/5_error_by_price_range.png', bbox_inches='tight')
    print(f"  ✅ Saved: 5_error_by_price_range.png")
    plt.close()

# ============================================================================
# STEP 5: SAVE RESULTS
# ============================================================================

def save_results(df, metrics_df, output_dir):
    """Save results to CSV files"""
    print(f"\n💾 Saving results...")
    
    # Save predictions
    df.to_csv(f'{output_dir}/predictions_all_properties.csv', index=False)
    print(f"  ✅ Saved: predictions_all_properties.csv")
    
    # Save metrics
    metrics_df.to_csv(f'{output_dir}/metrics_summary.csv', index=False)
    print(f"  ✅ Saved: metrics_summary.csv")
    
    # Save summary report
    with open(f'{output_dir}/evaluation_report.txt', 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("PROPERTY PRICE MODEL EVALUATION REPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Category: {CATEGORY}\n")
        f.write(f"Total Properties: {len(df)}\n\n")
        
        f.write("METRICS SUMMARY:\n")
        f.write("-" * 80 + "\n")
        f.write(metrics_df.to_string(index=False))
        f.write("\n\n")
        
        f.write("WINNER (Lowest MAE): ")
        winner = metrics_df.loc[metrics_df['MAE'].idxmin(), 'Model']
        f.write(f"{winner}\n")
    
    print(f"  ✅ Saved: evaluation_report.txt")
    print(f"\n✅ All results saved to: {output_dir}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function"""
    print("=" * 80)
    print("PROPERTY PRICE MODEL EVALUATION")
    print("=" * 80)
    print(f"Category: {CATEGORY}")
    print(f"Models: {', '.join(MODEL_ENDPOINTS.keys())}")
    print("=" * 80)
    
    # Step 1: Fetch properties
    df = fetch_properties_from_db(DB_URL, CATEGORY)
    
    # Step 2: Get predictions
    results_df = get_all_predictions(df, CATEGORY)
    
    # Step 3: Calculate metrics
    metrics_df = calculate_metrics(results_df)
    
    # Step 4: Create visualizations
    create_visualizations(results_df, metrics_df, OUTPUT_DIR, CATEGORY)
    
    # Step 5: Save results
    save_results(results_df, metrics_df, OUTPUT_DIR)
    
    print("\n" + "=" * 80)
    print("✅ EVALUATION COMPLETE!")
    print("=" * 80)
    print(f"\n🏆 Best Model (by MAE): {metrics_df.loc[metrics_df['MAE'].idxmin(), 'Model']}")
    print(f"\nAll outputs saved to: {OUTPUT_DIR}")
    print("\nGenerated files:")
    print("  📊 1_scatter_predictions_vs_actual.png")
    print("  📊 2_bar_comparison_sample.png")
    print("  📊 3_error_distribution.png")
    print("  📊 4_metrics_comparison.png")
    print("  📊 5_error_by_price_range.png")
    print("  📄 predictions_all_properties.csv")
    print("  📄 metrics_summary.csv")
    print("  📄 evaluation_report.txt")

if __name__ == "__main__":
    main()