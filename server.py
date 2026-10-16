import os
import re
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file

from database import (
    get_db, init_db, seed_db, generate_order_id,
    is_admin_password_set, set_admin_password, verify_admin_password,
    add_admin_order_notification, get_admin_notifications, mark_admin_notifications_read
)
from rag_engine import ask_ruchulu_ai

# Initialize DB
init_db()
seed_db()

BASE_DIR = Path(__file__).parent
FRONTEND_DIST = BASE_DIR / 'frontend' / 'dist'

app = Flask(__name__, static_folder=str(FRONTEND_DIST), static_url_path='')

# CORS Header helper
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Serve product static images
@app.route('/images/<path:filename>')
def serve_images(filename):
    static_images = BASE_DIR / 'static' / 'images'
    file_path = static_images / filename
    if file_path.exists():
        return send_from_directory(static_images, filename)
    fallback = static_images / 'default_food.jpg'
    if fallback.exists():
        return send_from_directory(static_images, 'default_food.jpg')
    return jsonify({"error": "Image not found"}), 404

# Serve built SPA frontend index.html
@app.route('/')
def index():
    if (FRONTEND_DIST / 'index.html').exists():
        return send_file(FRONTEND_DIST / 'index.html')
    return jsonify({"message": "Mana Inti Ruchulu API Server Running."})

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"error": "API route not found"}), 404
    if (FRONTEND_DIST / 'index.html').exists():
        return send_file(FRONTEND_DIST / 'index.html')
    return jsonify({"error": "Not found"}), 404

def validate_indian_pincode(pin: str) -> bool:
    return bool(re.match(r'^[1-9][0-9]{5}$', str(pin).strip()))

def check_admin_auth():
    pwd = request.headers.get('Authorization')
    if not pwd:
        pwd = request.args.get('password') or (request.json.get('password') if request.is_json else None) or request.form.get('password')
    if pwd and pwd.startswith('Bearer '):
        pwd = pwd[7:]
    
    if not is_admin_password_set():
        return False
    return verify_admin_password(pwd or '')

# --- API ROUTES ---

@app.route('/api/products', methods=['GET'])
def get_products():
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    is_veg = request.args.get('is_veg', '').strip()
    sort = request.args.get('sort', '').strip()

    conn = get_db()
    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)"
        s = f"%{search.lower()}%"
        params.extend([s, s, s])

    if category and category != "All":
        query += " AND category = ?"
        params.append(category)

    if is_veg != "":
        query += " AND is_veg = ?"
        params.append(int(is_veg))

    if sort == "price_low_high":
        query += " ORDER BY price_one ASC"
    elif sort == "price_high_low":
        query += " ORDER BY price_one DESC"
    elif sort == "name_a_z":
        query += " ORDER BY name ASC"
    elif sort == "name_z_a":
        query += " ORDER BY name DESC"
    else:
        query += " ORDER BY id ASC"

    rows = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/products/<int:prod_id>', methods=['GET'])
def get_single_product(prod_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM products WHERE id = ?", (prod_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(dict(row))

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json or {}
    name = data.get('name')
    category = data.get('category')
    price_half = data.get('price_half', 0)
    price_one = data.get('price_one', 0)
    is_veg = data.get('is_veg', 1)
    description = data.get('description', '')
    image_url = data.get('image_url', '/images/mango_pickle.jpg')
    available = data.get('available', 1)

    if not name or not category or not price_one:
        return jsonify({"error": "Missing required product fields"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO products (name, category, is_veg, price_half, price_one, description, image_url, available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, category, is_veg, price_half, price_one, description, image_url, available))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({"message": "Product created successfully", "id": new_id}), 201

@app.route('/api/products/<int:prod_id>', methods=['PUT'])
def update_product(prod_id):
    data = request.json or {}
    conn = get_db()
    cursor = conn.cursor()
    existing = cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    fields = []
    params = []
    for k in ['name', 'category', 'is_veg', 'price_half', 'price_one', 'description', 'image_url', 'available']:
        if k in data:
            fields.append(f"{k} = ?")
            params.append(data[k])

    if fields:
        params.append(prod_id)
        cursor.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()

    # Fetch updated product to return
    updated = cursor.execute("SELECT * FROM products WHERE id = ?", (prod_id,)).fetchone()
    conn.close()
    return jsonify({"message": "Product updated successfully", "product": dict(updated) if updated else None})

@app.route('/api/products/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (prod_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted successfully"})

# Customer Address Lookup (Auto-fill on repeat order)
@app.route('/api/customers/lookup', methods=['GET'])
def lookup_customer():
    mobile = request.args.get('mobile', '').strip()
    if not mobile or len(mobile) < 10:
        return jsonify({"found": False, "message": "Valid 10-digit mobile number required"}), 400

    conn = get_db()
    order = conn.execute(
        "SELECT customer_name, mobile, email, house_flat, street_area, city, district, state, pincode, full_address "
        "FROM orders WHERE mobile LIKE ? ORDER BY id DESC LIMIT 1",
        (f"%{mobile}%",)
    ).fetchone()
    conn.close()

    if not order:
        return jsonify({"found": False})

    return jsonify({"found": True, "customer": dict(order)})

@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json or {}
    cust_name = data.get('customer_name', '').strip()
    mobile = data.get('mobile', '').strip()
    email = data.get('email', '').strip()
    house_flat = data.get('house_flat', '').strip()
    street_area = data.get('street_area', '').strip()
    city = data.get('city', '').strip()
    district = data.get('district', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    notes = data.get('notes', '').strip()
    payment_method = data.get('payment_method', 'PhonePe (UPI)').strip()
    items = data.get('items', [])

    if not cust_name or not mobile or not pincode or not house_flat or not street_area or not city or not district or not state:
        return jsonify({"error": "Please fill in all required customer name and delivery address fields."}), 400

    if not validate_indian_pincode(pincode):
        return jsonify({"error": "Invalid Indian PIN code format. PIN code must be a 6-digit number (e.g., 533220)."}), 400

    if len(mobile) < 10:
        return jsonify({"error": "Please enter a valid 10-digit mobile number."}), 400

    if not items:
        return jsonify({"error": "Your cart is empty."}), 400

    subtotal = sum(float(item.get('unit_price', 0)) * int(item.get('quantity', 1)) for item in items)
    total = subtotal
    order_id = generate_order_id()
    created_at = datetime.now().isoformat()
    full_address = f"{house_flat}, {street_area}, {city}, {district}, {state} - {pincode}"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO orders (
            order_id, customer_name, mobile, email, house_flat, street_area, city, district, state, pincode, full_address, notes, subtotal, total, payment_method, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed', ?)
    ''', (
        order_id, cust_name, mobile, email, house_flat, street_area,
        city, district, state, pincode, full_address, notes,
        subtotal, total, payment_method, created_at
    ))

    db_order_id = cursor.lastrowid

    for item in items:
        unit_price = float(item.get('unit_price', 0))
        qty = int(item.get('quantity', 1))
        item_total = unit_price * qty
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, product_name, quantity_label, unit_price, quantity, item_total)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            db_order_id, item.get('product_id'), item.get('product_name', 'Item'),
            item.get('quantity_label', '1 kg'), unit_price, qty, item_total
        ))

    # Customer notification
    cursor.execute('''
        INSERT INTO order_notifications (order_id, status, message)
        VALUES (?, 'Order Placed', '🔔 Your order has been placed successfully.')
    ''', (order_id,))

    conn.commit()
    conn.close()

    # Trigger admin alert notification so owner sees it live
    add_admin_order_notification(order_id, cust_name, total, payment_method)

    return jsonify({
        "order_id": order_id,
        "customer_name": cust_name,
        "mobile": mobile,
        "total": total,
        "payment_method": payment_method,
        "status": "Order Placed",
        "message": f"Order created successfully via {payment_method}. We accept orders across India!"
    }), 201

@app.route('/api/orders/track', methods=['GET'])
def track_order():
    order_id = request.args.get('order_id', '').strip()
    mobile = request.args.get('mobile', '').strip()

    if not order_id or not mobile:
        return jsonify({"error": "Order ID and Mobile number are required."}), 400

    conn = get_db()
    order_row = conn.execute(
        "SELECT * FROM orders WHERE LOWER(order_id) = LOWER(?) AND mobile LIKE ?",
        (order_id, f"%{mobile}%")
    ).fetchone()

    if not order_row:
        conn.close()
        return jsonify({"error": "Order not found. Please verify your Order ID and Mobile number."}), 404

    items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (order_row['id'],)).fetchall()
    notifications = conn.execute("SELECT * FROM order_notifications WHERE order_id = ? ORDER BY id DESC", (order_row['order_id'],)).fetchall()
    conn.close()

    res = dict(order_row)
    res['items'] = [dict(i) for i in items]
    res['notifications'] = [dict(n) for n in notifications]
    return jsonify(res)

@app.route('/api/orders/history', methods=['GET'])
def order_history():
    mobile = request.args.get('mobile', '').strip()
    if not mobile:
        return jsonify({"error": "Mobile number is required."}), 400

    conn = get_db()
    orders = conn.execute(
        "SELECT * FROM orders WHERE mobile LIKE ? ORDER BY created_at DESC",
        (f"%{mobile}%",)
    ).fetchall()

    res = []
    for o in orders:
        o_dict = dict(o)
        items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (o['id'],)).fetchall()
        o_dict['items'] = [dict(i) for i in items]
        res.append(o_dict)

    conn.close()
    return jsonify(res)

# --- ADMIN AUTHENTICATION & MANAGEMENT ENDPOINTS ---

@app.route('/api/admin/auth-status', methods=['GET'])
def admin_auth_status():
    return jsonify({
        "is_setup": is_admin_password_set()
    })

@app.route('/api/admin/setup', methods=['POST'])
def admin_setup():
    data = request.json or {}
    pwd = data.get('password', '').strip()
    if not pwd or len(pwd) < 4:
        return jsonify({"error": "Admin password must be at least 4 characters long."}), 400

    if is_admin_password_set():
        return jsonify({"error": "Admin password is already configured. Use login or change password."}), 400

    set_admin_password(pwd)
    return jsonify({"success": True, "message": "Admin password created successfully. You can now access your dashboard."}), 201

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    pwd = data.get('password', '').strip()
    if not is_admin_password_set():
        return jsonify({"error": "Admin password has not been created yet. Please create your password first.", "need_setup": True}), 400

    if not verify_admin_password(pwd):
        return jsonify({"error": "Incorrect admin password."}), 401

    return jsonify({"success": True, "message": "Authenticated successfully"})

@app.route('/api/admin/change-password', methods=['POST'])
def admin_change_password():
    data = request.json or {}
    curr_pwd = data.get('current_password', '').strip()
    new_pwd = data.get('new_password', '').strip()

    if not is_admin_password_set():
        return jsonify({"error": "Admin password has not been configured yet."}), 400

    if not verify_admin_password(curr_pwd):
        return jsonify({"error": "Current password is incorrect."}), 401

    if not new_pwd or len(new_pwd) < 4:
        return jsonify({"error": "New password must be at least 4 characters long."}), 400

    set_admin_password(new_pwd)
    return jsonify({"success": True, "message": "Admin password updated successfully."})

# Upload image for specific pickle/product
@app.route('/api/admin/upload-image', methods=['POST'])
def upload_image():
    # Verify auth
    pwd = request.headers.get('Authorization', '')
    if pwd.startswith('Bearer '):
        pwd = pwd[7:]
    if not pwd:
        pwd = request.form.get('password', '') or request.args.get('password', '')
    
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename."}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        return jsonify({"error": "Only JPG, PNG, and WEBP images are supported."}), 400

    timestamp = int(datetime.now().timestamp())
    clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', os.path.splitext(file.filename)[0])
    filename = f"prod_{clean_name}_{timestamp}{ext}"

    static_images = BASE_DIR / 'static' / 'images'
    static_images.mkdir(parents=True, exist_ok=True)
    file_path = static_images / filename
    file.save(str(file_path))

    image_url = f"/images/{filename}"

    # If product_id is provided, update product image in DB directly
    prod_id = request.form.get('product_id')
    if prod_id:
        conn = get_db()
        conn.execute("UPDATE products SET image_url = ? WHERE id = ?", (image_url, int(prod_id)))
        conn.commit()
        conn.close()

    return jsonify({
        "success": True,
        "message": "Product photo updated successfully!",
        "image_url": image_url
    })

# Admin live notifications for placed orders
@app.route('/api/admin/notifications', methods=['GET'])
def admin_notifications_route():
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    notifs = get_admin_notifications()
    unread_count = sum(1 for n in notifs if n.get('is_read') == 0)
    return jsonify({
        "notifications": notifs,
        "unread_count": unread_count
    })

@app.route('/api/admin/notifications/mark-read', methods=['POST'])
def admin_mark_notifications_read():
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    mark_admin_notifications_read()
    return jsonify({"success": True, "message": "Notifications marked as read."})

@app.route('/api/admin/orders', methods=['GET'])
def admin_orders():
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    orders = conn.execute("SELECT * FROM orders ORDER BY created_at DESC").fetchall()

    res = []
    for o in orders:
        o_dict = dict(o)
        items = conn.execute("SELECT * FROM order_items WHERE order_id = ?", (o['id'],)).fetchall()
        o_dict['items'] = [dict(i) for i in items]
        res.append(o_dict)

    conn.close()
    return jsonify(res)

@app.route('/api/admin/orders/<int:order_db_id>/status', methods=['PUT'])
def admin_update_status(order_db_id):
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({"error": "Missing status"}), 400

    conn = get_db()
    cursor = conn.cursor()
    order = cursor.execute("SELECT * FROM orders WHERE id = ?", (order_db_id,)).fetchone()
    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (new_status, order_db_id))

    msg_map = {
        'Order Placed': '🔔 Your order has been placed.',
        'Confirmed': '🔔 Your order has been confirmed by Mana Inti Ruchulu.',
        'Preparing': '🔔 Your authentic Andhra delicacies are being prepared with love!',
        'Dispatched': f'🔔 Your order has been dispatched via {order["courier"] or "courier"}.',
        'Out for Delivery': '🔔 Your order is out for delivery! Prepare to relish authentic flavors.',
        'Delivered': '🔔 Your order has been delivered! Enjoy your meal!'
    }
    msg = msg_map.get(new_status, f"🔔 Your order status is now: {new_status}")

    cursor.execute('''
        INSERT INTO order_notifications (order_id, status, message)
        VALUES (?, ?, ?)
    ''', (order['order_id'], new_status, msg))

    conn.commit()
    conn.close()
    return jsonify({"message": f"Status updated to {new_status}"})

@app.route('/api/admin/orders/<int:order_db_id>/shipment', methods=['PUT'])
def admin_update_shipment(order_db_id):
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    courier = data.get('courier', '')
    tracking_number = data.get('tracking_number', '')
    tracking_url = data.get('tracking_url', '')
    estimated_delivery = data.get('estimated_delivery', '')

    conn = get_db()
    cursor = conn.cursor()
    order = cursor.execute("SELECT * FROM orders WHERE id = ?", (order_db_id,)).fetchone()
    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    cursor.execute('''
        UPDATE orders
        SET courier = ?, tracking_number = ?, tracking_url = ?, estimated_delivery = ?
        WHERE id = ?
    ''', (courier, tracking_number, tracking_url, estimated_delivery, order_db_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Shipment info updated successfully"})

@app.route('/api/admin/analytics', methods=['GET'])
def admin_analytics():
    pwd = request.args.get('password', '')
    if is_admin_password_set() and not verify_admin_password(pwd):
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    total_products = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    pending_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE status != 'Delivered'").fetchone()[0]
    completed_orders = conn.execute("SELECT COUNT(*) FROM orders WHERE status = 'Delivered'").fetchone()[0]
    total_revenue = conn.execute("SELECT COALESCE(SUM(total), 0) FROM orders").fetchone()[0]
    avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    category_sales = conn.execute('''
        SELECT p.category, SUM(oi.item_total) as category_total, COUNT(DISTINCT o.id) as order_count
        FROM order_items oi
        JOIN products p ON oi.product_name LIKE '%' || p.name || '%' OR p.name LIKE '%' || oi.product_name || '%'
        JOIN orders o ON oi.order_id = o.id
        GROUP BY p.category
    ''').fetchall()

    top_products = conn.execute('''
        SELECT product_name, SUM(quantity) as total_qty, SUM(item_total) as total_sales
        FROM order_items
        GROUP BY product_name
        ORDER BY total_sales DESC
        LIMIT 5
    ''').fetchall()

    conn.close()

    return jsonify({
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value,
        "category_sales": [dict(r) for r in category_sales],
        "top_products": [dict(r) for r in top_products]
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message', '')
    answer = ask_ruchulu_ai(message)
    return jsonify({"answer": answer})

if __name__ == '__main__':
    print("Starting Mana Inti Ruchulu Full Stack Server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True)
