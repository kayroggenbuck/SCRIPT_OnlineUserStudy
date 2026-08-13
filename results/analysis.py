import seaborn as sns
import matplotlib.pyplot as plt

import sqlite3
import pandas as pd
import ast

import statsmodels.formula.api as smf
import numpy as np

conn = sqlite3.connect("study_final.db")

taskDataframe = pd.read_sql("""
SELECT participant,
       task,
       stimulus,
       time,
       f1,
       precision,
       recall,
       log_time
       FROM participants
""", conn)

# taskDataframe["stimulus"] = taskDataframe["stimulus"].apply(ast.literal_eval)

#################################################
# Statistical analysis of participants speed
#################################################

model = smf.mixedlm(
    "log_time ~ stimulus + task",
    taskDataframe,
    groups=taskDataframe["participant"]
)

result = model.fit()

print(result.summary())

# Results:
# A linear mixed-effects model was fitted with log-transformed completion time as the dependent variable, stimulus and task as fixed effects, and participant as a random intercept. The stimulus had a significant effect on completion time (β = 0.369, SE = 0.148, z = 2.50, p = .013). Participants were estimated to take approximately 45% longer with the Iterative screenshots stimulus than with the reference stimulus (exp(0.369) = 1.45). Task also had a significant effect on completion time, indicating substantial differences in task difficulty.



#################################################
# Statistical analysis of participants results
#################################################

# Keep only T2 and T3
# taskDataframe_T23 = taskDataframe[taskDataframe["task"].isin(["T2", "T3"])]

# Statistical analysis of the participants performance
model = smf.mixedlm(
    "f1 ~ stimulus + task",
    taskDataframe,
    groups=taskDataframe["participant"]
)

result = model.fit()

print(result.summary())

# Results: (probably too little participants for the f1)

model = smf.mixedlm(
    "precision ~ stimulus + task",
    taskDataframe,
    groups=taskDataframe["participant"]
)

result = model.fit()

print(result.summary())

# Results: (probably too little participants for the f1)


model = smf.mixedlm(
    "recall ~ stimulus + task",
    taskDataframe,
    groups=taskDataframe["participant"]
)

result = model.fit()

print(result.summary())

# Results: (probably too little participants for the f1)
