"""
Run once to extract plant data from lib/db.ts → plants.json
Usage: python extract_data.py
"""

import re
import json
import os


def parse_args(content: str, pos: int, count: int) -> tuple[list, int]:
    """Parse `count` comma-separated arguments starting at `pos`."""
    args = []
    while len(args) < count and pos < len(content):
        # Skip whitespace and commas
        while pos < len(content) and content[pos] in " \n\r\t,":
            pos += 1

        if pos >= len(content):
            break

        ch = content[pos]

        if ch in ('"', "'"):
            # Regular quoted string
            pos += 1
            start = pos
            while pos < len(content) and content[pos] != ch:
                if content[pos] == "\\":
                    pos += 1
                pos += 1
            args.append(content[start:pos])
            pos += 1

        elif ch == "`":
            # Template literal
            pos += 1
            start = pos
            while pos < len(content) and content[pos] != "`":
                pos += 1
            args.append(content[start:pos])
            pos += 1

        elif ch.isdigit():
            start = pos
            while pos < len(content) and content[pos].isdigit():
                pos += 1
            args.append(int(content[start:pos]))

        elif ch == ")":
            break

        else:
            pos += 1

    return args, pos


def extract_plants(content: str) -> dict:
    plants = {}
    # Match: db.runAsync(`INSERT INTO plants ...`, "id", "name_en", "name_ur", "type")
    pattern = re.compile(
        r'INSERT INTO plants[^`]+`\s*,\s*'
        r'"(\w+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"(\w+)"'
    )
    for m in pattern.finditer(content):
        pid, name_en, name_ur, ptype = m.groups()
        plants[pid] = {"name_en": name_en, "name_ur": name_ur, "type": ptype}
    return plants


def extract_sections(content: str) -> list:
    sections = []
    # Find end of each plant_sections INSERT SQL block
    sql_pattern = re.compile(
        r"INSERT INTO plant_sections\s*\([^)]+\)\s*VALUES[^;]+;`\s*,"
    )
    for match in sql_pattern.finditer(content):
        args, _ = parse_args(content, match.end(), 6)
        if len(args) == 6:
            sections.append({
                "plant_id":    args[0],
                "order_index": args[1],
                "title_en":    args[2],
                "title_ur":    args[3],
                "body_en":     args[4].strip(),
                "body_ur":     args[5].strip(),
            })
    return sections


if __name__ == "__main__":
    db_ts_path = os.path.join(os.path.dirname(__file__), "..", "lib", "db.ts")
    out_path = os.path.join(os.path.dirname(__file__), "plants.json")

    print(f"Reading {db_ts_path} ...")
    with open(db_ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    plants = extract_plants(content)
    sections = extract_sections(content)

    for s in sections:
        s["plant_name"] = plants.get(s["plant_id"], {}).get("name_en", s["plant_id"].capitalize())

    result = {"plants": plants, "sections": sections}

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Done: {len(plants)} plants, {len(sections)} sections → {out_path}")
