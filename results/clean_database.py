import sqlite3
import ast
import pandas as pd

conn = sqlite3.connect("study.db")

df = pd.read_sql("""
SELECT id,
       education,
       occupation,
       stimulus,
       answers,
       executionTime,
       preference,
       preferenceExplanation,
       submittedAt
       FROM participants
""", conn)

df["executionTime"] = df["executionTime"].apply(ast.literal_eval)
df["stimulus"] = df["stimulus"].apply(ast.literal_eval)

# remove my practice runs and duplicates
df = df[~df["id"].isin([2, 3, 26, 30])]

# Reset the DataFrame index
df = df.reset_index(drop=True)

# Create new consecutive IDs starting at 1
df["id"] = range(1, len(df) + 1)

# remove the times for the practice cases
df["executionTime"] = df["executionTime"].apply(lambda x: x[1::2])

# Convert back for storing in db
df["executionTime"] = df["executionTime"].apply(str)
df["stimulus"] = df["stimulus"].apply(str)

conn1 = sqlite3.connect("study_cleaned.db")

df.to_sql(
    "participants",      # table name
    conn1,
    if_exists="replace", # create or replace the table
    index=False          # don't write the DataFrame index
)