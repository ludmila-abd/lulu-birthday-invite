from flask import Flask, render_template, request, jsonify
from datetime import datetime
import csv
import os

app = Flask(__name__)

CSV_FILE = "responses.csv"


def ensure_csv_exists():
    if not os.path.exists(CSV_FILE) or os.path.getsize(CSV_FILE) == 0:
        with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow([
                "timestamp",
                "name",
                "pub_rsvp",
                "club_rsvp",
                "ticket_acknowledged",
                "guest_note"
            ])


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()

    name = data.get("name", "").strip()
    pub_rsvp = data.get("pub_rsvp", "")
    club_rsvp = data.get("club_rsvp", "")
    ticket_acknowledged = data.get("ticket_acknowledged", "")
    guest_note = data.get("guest_note", "").strip()

    if not name:
        return jsonify({"success": False, "message": "Name is required"}), 400

    ensure_csv_exists()

    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            name,
            pub_rsvp,
            club_rsvp,
            ticket_acknowledged,
            guest_note
        ])

    return jsonify({"success": True, "message": "RSVP saved"})


if __name__ == "__main__":
    ensure_csv_exists()
    app.run(debug=True)