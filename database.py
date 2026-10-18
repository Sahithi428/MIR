import sqlite3
import os
from datetime import datetime
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / 'data' / 'mana_inti_ruchulu.db'
DB_PATH.parent.mkdir(exist_ok=True, parents=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            is_veg INTEGER DEFAULT 1,
            price_half REAL NOT NULL,
            price_one REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            available INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT,
            house_flat TEXT NOT NULL,
            street_area TEXT NOT NULL,
            city TEXT NOT NULL,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            full_address TEXT NOT NULL,
            notes TEXT,
            subtotal REAL NOT NULL,
            total REAL NOT NULL,
            payment_method TEXT DEFAULT 'UPI / Cash on Delivery',
            status TEXT DEFAULT 'Order Placed',
            courier TEXT,
            tracking_number TEXT,
            tracking_url TEXT,
            estimated_delivery TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            quantity_label TEXT NOT NULL,
            unit_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            item_total REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    ''')

    # Notification / Status updates table for customers
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            status TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Settings table (for owner admin password and business configs)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Admin notifications table (alerts for new placed orders)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_setting(key, default=None):
    conn = get_db()
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    conn.close()
    if row:
        return row['value']
    return default

def set_setting(key, value):
    conn = get_db()
    conn.execute('''
        INSERT INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    ''', (key, str(value)))
    conn.commit()
    conn.close()

def is_admin_password_set():
    val = get_setting('admin_password_hash')
    return bool(val and val.strip())

def set_admin_password(plain_password):
    if not plain_password or len(plain_password.strip()) < 4:
        raise ValueError("Password must be at least 4 characters long.")
    hashed = generate_password_hash(plain_password.strip())
    set_setting('admin_password_hash', hashed)
    return True

def verify_admin_password(plain_password):
    hashed = get_setting('admin_password_hash')
    if not hashed:
        return False
    return check_password_hash(hashed, plain_password.strip())

def add_admin_order_notification(order_id, customer_name, total, payment_method):
    conn = get_db()
    title = f"New Order Received: {order_id}"
    msg = f"Order {order_id} placed by {customer_name} for ₹{total:.0f} via {payment_method}."
    conn.execute('''
        INSERT INTO admin_notifications (order_id, title, message, is_read)
        VALUES (?, ?, ?, 0)
    ''', (order_id, title, msg))
    conn.commit()
    conn.close()

def get_admin_notifications(unread_only=False):
    conn = get_db()
    if unread_only:
        rows = conn.execute("SELECT * FROM admin_notifications WHERE is_read = 0 ORDER BY id DESC").fetchall()
    else:
        rows = conn.execute("SELECT * FROM admin_notifications ORDER BY id DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def mark_admin_notifications_read():
    conn = get_db()
    conn.execute("UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0")
    conn.commit()
    conn.close()

def seed_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if products already exist so we don't overwrite admin changes or custom images
    existing_count = cursor.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    if existing_count > 0:
        conn.close()
        return
    
    initial_products = [
        # Veg Pickles
        ('Mango Pickle (Avakaya)', 'Veg Pickles', 1, 400.0, 750.0, 'Traditional Andhra Avakaya prepared with tender raw mangoes, authentic cold-pressed mustard oil, Guntur red chili powder, and hand-ground spices.', '/images/mango_pickle.jpg', 1),
        ('Gongura Pickle', 'Veg Pickles', 1, 400.0, 750.0, 'Tangy & authentic sorrel leaves (Gongura) pickle infused with garlic, red chillies, and traditional tempering.', '/images/gongura_pickle.jpg', 1),
        ('Tomato Pickle', 'Veg Pickles', 1, 350.0, 650.0, 'Rich sun-dried spiced tomato pickle with authentic Andhra gravy and aromatic spices.', '/images/tomato_pickle.jpg', 1),
        ('Allam (Ginger) Pickle', 'Veg Pickles', 1, 380.0, 700.0, 'Zesty and stomach-soothing fresh ginger pickle blended with jaggery and tamarind.', '/images/allam_pickle.jpg', 1),
        ('Lemon Pickle (Nimmakaya)', 'Veg Pickles', 1, 350.0, 650.0, 'Classic tangy salted lemon pickle aged to perfection with green chilis.', '/images/lemon_pickle.jpg', 1),
        ('Cut Mango Pickle', 'Veg Pickles', 1, 380.0, 700.0, 'Crispy cut mango pieces marinated in traditional Andhra spiced brine and cold-pressed sesame oil.', '/images/cut_mango_pickle.jpg', 1),
        
        # Non-Veg Pickles
        ('Prawns Pickle (Royyala Avakaya)', 'Non-Veg Pickles', 0, 900.0, 1700.0, 'Freshly caught sea prawns marinated in rich Andhra red chili pickle gravy and slow-cooked spices.', '/images/prawns_pickle.jpg', 1),
        ('Chicken Pickle (Boneless)', 'Non-Veg Pickles', 0, 750.0, 1400.0, 'Juicy boneless chicken pieces fried and coated in authentic secret Andhra masala oil.', '/images/chicken_pickle.jpg', 1),
        ('Chicken Pickle (With Bone)', 'Non-Veg Pickles', 0, 650.0, 1200.0, 'Traditional Andhra countryside style bone-in chicken pickle loaded with rich flavors.', '/images/chicken_bone_pickle.jpg', 1),
        ('Mutton Pickle', 'Non-Veg Pickles', 0, 1100.0, 2100.0, 'Premium tender mutton pieces slow cooked with rich spices and garlic infusion.', '/images/mutton_pickle.jpg', 1),
        ('Fish Pickle', 'Non-Veg Pickles', 0, 800.0, 1500.0, 'Crispy fried river fish fillets pickled in spicy tangy Guntur masala.', '/images/fish_pickle.jpg', 1),
        
        # Podi / Powder Varieties
        ('Andhra Karam Podi', 'Podi / Powder Varieties', 1, 220.0, 400.0, 'Signature roasted lentil & red chili spice blend. Tastes magical when mixed with hot rice and ghee.', '/images/andhra_karam_podi.jpg', 1),
        ('Peanut Podi (Palli Podi)', 'Podi / Powder Varieties', 1, 200.0, 380.0, 'Crunchy roasted peanut powder with roasted garlic and cumin. Perfect for Idli, Dosa, and Rice.', '/images/peanut_podi.jpg', 1),
        ('Kandi Podi (Toor Dal Powder)', 'Podi / Powder Varieties', 1, 210.0, 400.0, 'Aromatic roasted toor dal and cumin powder, comforting traditional staple for rice.', '/images/kandi_podi.jpg', 1),
        ('Idli Karam Podi', 'Podi / Powder Varieties', 1, 200.0, 380.0, 'Coarsely ground spicy podi specially prepared for dipping hot Idlis and crisp Dosas in sesame oil.', '/images/idli_karam_podi.jpg', 1),
        ('Nalla Karam Podi', 'Podi / Powder Varieties', 1, 220.0, 420.0, 'Dark roasted spice podi infused with coriander seeds, black pepper, and garlic.', '/images/nalla_karam.jpg', 1),
        ('Curry Leaf (Karivepaku) Podi', 'Podi / Powder Varieties', 1, 230.0, 440.0, 'Iron-rich organic fresh curry leaf podi roasted with Bengal gram and spices.', '/images/curry_leaf_podi.jpg', 1),

        # Pindi Vantalu
        ('Sunnundalu (Urad Dal Jaggery Laddu)', 'Pindi Vantalu', 1, 300.0, 550.0, 'Nutritious roasted black urad dal laddus made with pure Desi Ghee and organic Jaggery.', '/images/sunnundalu_laddu.jpg', 1),
        ('Ariselu (Bellam Ariselu)', 'Pindi Vantalu', 1, 320.0, 600.0, 'Festive traditional rice flour and jaggery cakes deep fried in pure ghee with sesame seeds.', '/images/ariselu.jpg', 1),
        ('Murukku / Janthikalu', 'Pindi Vantalu', 1, 250.0, 450.0, 'Crispy golden fried rice flour spirals seasoned with ajwain and butter.', '/images/murukku.jpg', 1),
        ('Bellam Gavvalu', 'Pindi Vantalu', 1, 260.0, 480.0, 'Shell-shaped crisp sweet pastries coated in sticky organic cardamom jaggery syrup.', '/images/bellam_gavvalu.jpg', 1),
        ('Chekkalu (Pappu Chekkalu)', 'Pindi Vantalu', 1, 250.0, 450.0, 'Crisp rice crackers studded with chana dal, green chillies, and curry leaves.', '/images/chekkalu.jpg', 1),
        ('Boondhi Laddu', 'Pindi Vantalu', 1, 280.0, 520.0, 'Juicy golden chickpea flour boondhi laddus fragrant with ghee, cardamom, and cashews.', '/images/boondhi_laddu.jpg', 1),

        # Healthy Food
        ('Healthy Millet Mix', 'Healthy Food', 1, 250.0, 450.0, 'Multi-millet health drink mix with ragi, bajra, jowar, almonds, and cardamom.', '/images/millet_mix.jpg', 1),
        ('Flax Seed (Avise Ginjalu) Podi', 'Healthy Food', 1, 220.0, 400.0, 'Omega-3 rich roasted flax seed spice powder for heart health.', '/images/flax_seed_podi.jpg', 1),
        ('Dry Fruit Laddu (Sugar-free)', 'Healthy Food', 1, 450.0, 850.0, '100% natural sugar-free energy balls made with dates, figs, cashews, almonds, and pistachios.', '/images/dry_fruit_laddu.jpg', 1),
        ('Ragi Malt Health Blend', 'Healthy Food', 1, 230.0, 420.0, 'Sprouted finger millet malt powder rich in calcium and natural fiber.', '/images/ragi_malt.jpg', 1),

        # Snacks
        ('Ribbon Pakoda', 'Snacks', 1, 240.0, 450.0, 'Crispy ribbon-shaped savoury strips spiced with cumin and asafoetida.', '/images/ribbon_pakoda.jpg', 1),
        ('Corn Flakes Mixture', 'Snacks', 1, 230.0, 420.0, 'Light and crunchy corn flakes mix with fried peanuts, curry leaves, and spices.', '/images/corn_flakes_mixture.jpg', 1),
        ('Spicy Chegodilu', 'Snacks', 1, 250.0, 460.0, 'Traditional crunchy ring snacks seasoned with sesame and chili.', '/images/chegodilu.jpg', 1),
        ('Special Andhra Mixture', 'Snacks', 1, 260.0, 480.0, 'Classic tea-time mixture with fine sev, boondhi, fried lentils, and peanuts.', '/images/andhra_mixture.jpg', 1)
    ]
    
    cursor.executemany('''
        INSERT INTO products (name, category, is_veg, price_half, price_one, description, image_url, available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', initial_products)
    conn.commit()
    conn.close()

def generate_order_id():
    date_str = datetime.now().strftime('%Y%m%d')
    conn = get_db()
    cursor = conn.cursor()
    count = cursor.execute('SELECT COUNT(*) FROM orders WHERE order_id LIKE ?', (f'MIR-{date_str}-%',)).fetchone()[0] + 1
    conn.close()
    return f'MIR-{date_str}-{count:04d}'

if __name__ == '__main__':
    init_db()
    seed_db()
    print("Database initialized successfully.")
