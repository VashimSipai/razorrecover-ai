import json
import random
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

# First and last names for realistic Indian customer profiles
FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Amit", "Deepak", "Divya", "Gaurav", "Ishaan",
    "Kavita", "Manish", "Neha", "Pooja", "Pranav", "Priya", "Rahul", "Rohan",
    "Rohit", "Sneha", "Suresh", "Tanvi", "Varun", "Vikas", "Vikram", "Yash"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Reddy", "Gupta",
    "Singh", "Kumar", "Chopra", "Deshmukh", "Joshi", "Bose", "Kulkarni", "Mishra"
]

DOMAINS = ["gmail.com", "yahoo.co.in", "outlook.com", "enterprise.in", "startup.co"]

def load_taxonomy() -> Dict[str, Any]:
    tax_path = os.path.join(os.path.dirname(__file__), "failure_taxonomy.json")
    with open(tax_path, "r") as f:
        return json.load(f)

def generate_indian_timestamp(base_date: datetime) -> datetime:
    """
    Generates realistic Indian payment timestamps with higher probabilities during:
    1. Peak evening UPI shopping hours (19:00 - 22:00)
    2. Bank maintenance downtime (01:30 - 03:30)
    """
    day_offset = random.randint(0, 30)
    target_day = base_date - timedelta(days=day_offset)
    
    rand_val = random.random()
    if rand_val < 0.45:
        # Evening peak UPI hours (7 PM - 10 PM IST)
        hour = random.randint(19, 22)
    elif rand_val < 0.65:
        # Afternoon business hours (12 PM - 4 PM IST)
        hour = random.randint(12, 16)
    elif rand_val < 0.80:
        # Bank maintenance window (1 AM - 3 AM IST)
        hour = random.randint(1, 3)
    else:
        hour = random.randint(0, 23)
        
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return target_day.replace(hour=hour, minute=minute, second=second, microsecond=0)

def generate_synthetic_transactions(count: int = 2500, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates count realistic failed transactions with Indian payment characteristics.
    """
    random.seed(seed)
    taxonomy = load_taxonomy()
    categories = taxonomy["categories"]
    
    # Realistic Indian payment method distributions
    # 65% UPI, 20% Card, 10% Mandate/Subscriptions, 5% Netbanking
    methods = ["upi", "card", "mandate", "netbanking"]
    method_weights = [0.65, 0.20, 0.10, 0.05]
    
    # Category weights across all failed attempts
    category_keys = ["TRANSIENT", "SOFT_DECLINE", "AUTHENTICATION_FAILURE", "HARD_DECLINE", "MANDATE_FAILURE"]
    category_weights = [0.35, 0.30, 0.20, 0.08, 0.07]
    
    base_date = datetime(2026, 8, 28, 12, 0, 0)
    transactions = []
    
    for i in range(1, count + 1):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{random.randint(10, 99)}@{random.choice(DOMAINS)}"
        phone = f"+91{random.choice(['98', '99', '97', '96', '91', '88'])}{random.randint(10000000, 99999999)}"
        
        # Pick category
        chosen_cat_key = random.choices(category_keys, weights=category_weights, k=1)[0]
        cat_data = categories[chosen_cat_key]
        chosen_code_obj = random.choice(cat_data["codes"])
        
        # Determine payment method
        if chosen_cat_key == "MANDATE_FAILURE":
            method = "mandate"
        else:
            method = random.choices(methods[:3], weights=[0.65, 0.25, 0.10], k=1)[0]
            
        # Amount distribution (in paise)
        # 70% micro-medium (₹100 - ₹5,000)
        # 25% large (₹5,000 - ₹45,000)
        # 5% high-value enterprise (₹50,000 - ₹1,50,000) -> Triggers HITL
        amt_bracket = random.random()
        if amt_bracket < 0.70:
            amount_inr = random.randint(199, 4999)
        elif amt_bracket < 0.95:
            amount_inr = random.randint(5000, 45000)
        else:
            amount_inr = random.randint(50000, 150000)  # High value HITL candidate
        amount_paise = amount_inr * 100
        
        failure_time = generate_indian_timestamp(base_date)
        
        # Base probability with contextual adjustments
        base_prob = chosen_code_obj["recovery_probability"]
        
        # Adjust for salary day (1st - 5th or 28th - 31st of month)
        if failure_time.day in [1, 2, 3, 4, 5, 28, 29, 30, 31] and chosen_cat_key == "SOFT_DECLINE":
            base_prob = min(0.95, base_prob + 0.15)
            
        # Adjust for high amount friction
        if amount_inr > 50000:
            base_prob = max(0.05, base_prob - 0.10)
            
        base_prob = round(base_prob, 3)
        
        # Synthetic ground-truth recovery outcome (for benchmarking evaluation)
        # Does this transaction recover when optimal strategy is applied?
        recovered_ground_truth = random.random() < base_prob
        
        txn = {
            "id": f"txn_{i:05d}",
            "razorpay_payment_id": f"pay_syn_{i:06d}",
            "customer_name": name,
            "customer_email": email,
            "customer_phone": phone,
            "amount_paise": amount_paise,
            "currency": "INR",
            "payment_method": method,
            "status": "failed",
            "error_code": chosen_code_obj["code"],
            "error_source": chosen_code_obj["source"],
            "error_reason": chosen_code_obj["reason"],
            "failure_category": chosen_cat_key.lower(),
            "recovery_probability": base_prob,
            "optimal_strategy": cat_data["optimal_strategy"],
            "ground_truth_recovered": recovered_ground_truth,
            "original_failure_at": failure_time.isoformat(),
            "created_at": failure_time.isoformat()
        }
        transactions.append(txn)
        
    return transactions

if __name__ == "__main__":
    data = generate_synthetic_transactions(10)
    print(f"Generated {len(data)} sample transactions.")
    print(json.dumps(data[0], indent=2))
