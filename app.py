from flask import Flask, render_template, request, jsonify
from datetime import datetime
import csv
import os
import traceback

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(BASE_DIR, "responses.csv")

FIELDNAMES = [
    "timestamp",
    "name",
    "pub_rsvp",
    "club_rsvp",
    "ticket_acknowledged",
    "guest_note"
]


def normalize_name(name):
    return " ".join(name.strip().lower().split())


def ensure_csv_exists():
    if not os.path.exists(CSV_FILE) or os.path.getsize(CSV_FILE) == 0:
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
            writer.writeheader()


def read_responses():
    ensure_csv_exists()

    with open(CSV_FILE, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)


def write_responses(rows):
    with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/submit", methods=["POST"])
def submit():
    try:
        data = request.get_json(force=True) or {}

        name = data.get("name", "").strip()
        pub_rsvp = data.get("pub_rsvp", "")
        club_rsvp = data.get("club_rsvp", "")
        ticket_acknowledged = data.get("ticket_acknowledged", "")
        guest_note = data.get("guest_note", "").strip()

        if not name:
            return jsonify({"success": False, "message": "Name is required"}), 400

        new_row = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "name": name,
            "pub_rsvp": pub_rsvp,
            "club_rsvp": club_rsvp,
            "ticket_acknowledged": ticket_acknowledged,
            "guest_note": guest_note
        }

        rows = read_responses()
        normalized_new_name = normalize_name(name)

        updated_existing = False

        for index, row in enumerate(rows):
            existing_name = normalize_name(row.get("name", ""))

            if existing_name == normalized_new_name:
                rows[index] = new_row
                updated_existing = True
                break

        if not updated_existing:
            rows.append(new_row)

        write_responses(rows)

        return jsonify({
            "success": True,
            "message": "RSVP updated" if updated_existing else "RSVP saved",
            "updated_existing": updated_existing
        })

    except Exception as error:
        print("SUBMIT ERROR:", error, flush=True)
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Server error while saving RSVP"
        }), 500


if __name__ == "__main__":
    ensure_csv_exists()
    app.run(debug=True)