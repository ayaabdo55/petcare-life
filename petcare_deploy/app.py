from flask import Flask, request, jsonify, session, render_template, send_from_directory
import pymysql
import pymysql.cursors
import bcrypt
import os
from datetime import date, datetime

app = Flask(__name__, static_folder='static', template_folder='templates')

app.secret_key = os.environ.get("SECRET_KEY", "my_secret_key_123")

DB_CONFIG = {
    'host':     os.environ.get("MYSQL_HOST",     "localhost"),
    'user':     os.environ.get("MYSQL_USER",     "root"),
    'password': os.environ.get("MYSQL_PASSWORD", "root"),
    'database': os.environ.get("MYSQL_DB",       "petcareapp_db"),
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': False,
}

def get_db():
    return pymysql.connect(**DB_CONFIG)

def rows_to_json(rows):
    if not rows:
        return rows
    if isinstance(rows, dict):
        rows = [rows]
        single_row = True
    else:
        single_row = False
    for row in rows:
        for k, v in list(row.items()):
            if isinstance(v, (date, datetime)):
                row[k] = str(v)
    return rows[0] if single_row else rows

@app.route('/style.css')
def serve_css():
    return send_from_directory('static', 'style.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('static', 'script.js')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/auth")
def auth_page():
    return render_template("auth.html")

@app.route("/bookings")
def bookings_page():
    return render_template("bookings.html")

@app.route("/clinics")
def clinics_page():
    return render_template("clinics.html")

@app.route("/stores")
def stores_page():
    return render_template("stores.html")

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not username or not email or not password:
        return jsonify({"ok": False, "error": "All fields are required."}), 400
    if len(username) < 3:
        return jsonify({"ok": False, "error": "Username must be at least 3 characters."}), 400
    if len(password) < 6:
        return jsonify({"ok": False, "error": "Password must be at least 6 characters."}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed))
            db.commit()
            user_id = cur.lastrowid
    except Exception as e:
        db.rollback()
        err = str(e)
        if "username" in err:
            return jsonify({"ok": False, "error": "Username already taken."}), 409
        if "email" in err:
            return jsonify({"ok": False, "error": "Email already registered."}), 409
        return jsonify({"ok": False, "error": "Registration failed."}), 500
    finally:
        db.close()
    session["user_id"]  = user_id
    session["username"] = username
    return jsonify({"ok": True, "username": username}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required."}), 400
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
    finally:
        db.close()
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"ok": False, "error": "Invalid email or password."}), 401
    session["user_id"]  = user["id"]
    session["username"] = user["username"]
    return jsonify({"ok": True, "username": user["username"]}), 200

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True}), 200

@app.route("/api/me")
def me():
    if "user_id" in session:
        return jsonify({"loggedIn": True, "username": session["username"]}), 200
    return jsonify({"loggedIn": False}), 200

@app.route("/api/clinics", methods=["GET"])
def get_clinics():
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("SELECT * FROM clinics ORDER BY id")
            rows = cur.fetchall()
        db.close()
        return jsonify({"ok": True, "clinics": rows_to_json(rows)}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/stores", methods=["GET"])
def get_stores():
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("SELECT * FROM stores ORDER BY id")
            rows = cur.fetchall()
        db.close()
        return jsonify({"ok": True, "stores": rows_to_json(rows)}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/bookings", methods=["GET"])
def get_bookings():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Login required."}), 401
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("SELECT id, clinic_name, pet_name, pet_type, visit_date, reason, created_at FROM bookings WHERE user_id = %s ORDER BY visit_date DESC", (session["user_id"],))
            rows = cur.fetchall()
        db.close()
        return jsonify({"ok": True, "bookings": rows_to_json(rows)}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/bookings", methods=["POST"])
def create_booking():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Login required."}), 401
    d = request.get_json()
    clinic_name = d.get("clinicName", "").strip()
    pet_name    = d.get("petName",    "").strip()
    pet_type    = d.get("petType",    "").strip()
    visit_date  = d.get("date",       "").strip()
    reason      = d.get("reason",     "").strip()
    if not all([clinic_name, pet_name, pet_type, visit_date, reason]):
        return jsonify({"ok": False, "error": "All booking fields are required."}), 400
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("INSERT INTO bookings (user_id, clinic_name, pet_name, pet_type, visit_date, reason) VALUES (%s,%s,%s,%s,%s,%s)", (session["user_id"], clinic_name, pet_name, pet_type, visit_date, reason))
            db.commit()
            new_id = cur.lastrowid
        db.close()
        return jsonify({"ok": True, "bookingId": new_id}), 201
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/bookings/<int:booking_id>", methods=["PUT"])
def update_booking(booking_id):
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Login required."}), 401
    d = request.get_json()
    pet_name   = d.get("petName",  "").strip()
    pet_type   = d.get("petType",  "").strip()
    visit_date = d.get("date",     "").strip()
    reason     = d.get("reason",   "").strip()
    if not all([pet_name, pet_type, visit_date, reason]):
        return jsonify({"ok": False, "error": "All fields are required."}), 400
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("UPDATE bookings SET pet_name=%s, pet_type=%s, visit_date=%s, reason=%s WHERE id=%s AND user_id=%s", (pet_name, pet_type, visit_date, reason, booking_id, session["user_id"]))
            db.commit()
            affected = cur.rowcount
        db.close()
        if affected == 0:
            return jsonify({"ok": False, "error": "Booking not found."}), 404
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Login required."}), 401
    try:
        db = get_db()
        with db.cursor() as cur:
            cur.execute("DELETE FROM bookings WHERE id = %s AND user_id = %s", (booking_id, session["user_id"]))
            db.commit()
            affected = cur.rowcount
        db.close()
        if affected == 0:
            return jsonify({"ok": False, "error": "Booking not found."}), 404
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
