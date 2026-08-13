import seaborn as sns
import matplotlib.pyplot as plt

import sqlite3
import pandas as pd
import ast

import statsmodels.formula.api as smf
import numpy as np

conn = sqlite3.connect("study_cleaned.db")

taskTotalCorrectAnswers = [2, 8, 8]
participantAnswersCorrect = [[2,4,8], [2,8,7], [2,8,3], [2,8,6], [2,8,6], [2,8,8], [2,8,4], [2,2,8], [2,2,7], [2,2,6], [2,4,4], [2,8,8], [2,8,5], [2,4,6], [2,8,8], [1,1,4], [2,0,4], [2,0,8], [2,4,8], [2,8,8], [2,0,8], [2,8,7], [2,1,0], [2,0,3], [2,8,4], [2,4,3], [2,8,7]]
participantAnswersTotal = [[2,4,10], [2,8,10], [2,8,4], [2,8,7], [2,8,6], [2,8,8], [2,8,4], [2,2,9], [2,2,8], [2,2,6], [2,4,4], [2,8,8], [2,8,5], [2,4,6], [2,8,8], [1,2,4], [2,20,5], [2,2,9], [2,6,8], [2,8,8], [2,0,10], [2,8,8], [2,3,2], [2,1,4], [2,8,4], [2,4,4], [2,8,10]]

correct = np.array(participantAnswersCorrect, dtype=float)
total = np.array(participantAnswersTotal, dtype=float)

precisionList = np.divide(
    correct,
    total,
    out=np.zeros_like(correct),
    where=total != 0
)

recallList = np.array(participantAnswersCorrect) / np.array(taskTotalCorrectAnswers)

numerator = 2 * precisionList * recallList
denominator = precisionList + recallList

# to catch 0/0 which is usually devined as 0
f1List = np.divide(
    numerator,
    denominator,
    out=np.zeros_like(numerator),
    where=denominator != 0
)

df = pd.read_sql("""
SELECT id,
       stimulus,
       executionTime
       FROM participants
""", conn)

df["executionTime"] = df["executionTime"].apply(ast.literal_eval)
df["stimulus"] = df["stimulus"].apply(ast.literal_eval)


participantsCS = []
participantsSC = []
comicTimes = []
screenshotTimes = []

taskDataframe = pd.DataFrame(
    columns=["participant", "task", "stimulus", "time", "f1", "precision", "recall"]
)

idx = 0
maxIndex = len(f1List)
for index, row in df.iterrows():
    taskDataframe.loc[len(taskDataframe)] = [index, "T1", row["stimulus"][0], row["executionTime"][0], f1List[idx][0], precisionList[idx][0], recallList[idx][0]]
    taskDataframe.loc[len(taskDataframe)] = [index, "T2", row["stimulus"][1], row["executionTime"][1], f1List[idx][1], precisionList[idx][1], recallList[idx][1]]
    taskDataframe.loc[len(taskDataframe)] = [index, "T3", row["stimulus"][2], row["executionTime"][2], f1List[idx][2], precisionList[idx][2], recallList[idx][2]]

    if row["stimulus"][1] == 'Comic':
        participantsCS.append([row["executionTime"][1], row["executionTime"][2]])
        comicTimes.append(row["executionTime"][1])
        screenshotTimes.append(row["executionTime"][2])
    else:
        participantsSC.append([row["executionTime"][2], row["executionTime"][1]])
        comicTimes.append(row["executionTime"][2])
        screenshotTimes.append(row["executionTime"][1])
    idx += 1
    if(idx == maxIndex):
        break

taskDataframe["log_time"] = np.log(taskDataframe["time"])

# conn1 = sqlite3.connect("study_final.db")

# taskDataframe.to_sql(
#     "participants",      # table name
#     conn1,
#     if_exists="replace", # create or replace the table
#     index=False          # don't write the DataFrame index
# )


# Convert lists to DataFrames
cs = pd.DataFrame(participantsCS, columns=["x", "y"])
sc = pd.DataFrame(participantsSC, columns=["x", "y"])


#################################################
# Time for T2 and T3
#################################################

plt.figure(figsize=(6, 6))

sns.scatterplot(
    data=cs,
    x="x",
    y="y",
    marker="X",
    s=100,
    label="Comic → Screenshots"
)

sns.scatterplot(
    data=sc,
    x="x",
    y="y",
    marker="o",
    s=100,
    label="Screenshots → Comic"
)

# x = y line
limits = [
    0,
    max(cs["x"].max(), cs["y"].max(), sc["x"].max(), sc["y"].max())
]

# print(participantsCS)

plt.plot(limits, limits, linestyle="--", label="x = y")

# makes the plot more space efficient but might distort perception
# x_max = cs["x"].max()
# y_maz = cs["y"].max()
# plt.xlim(0, x_max)
# plt.ylim(0, y_maz)

plt.xlabel("Comic execution time")
plt.ylabel("Screenshot execution time")
plt.legend()
plt.show()




#################################################
# Precision and recall per participant
#################################################
from matplotlib.gridspec import GridSpec
from matplotlib.lines import Line2D


def draw_heatmap_with_stimulus(
    ax, dataframe, metric, title,
    show_cbar=True, cbar_ax=None,
    participant_order=None
):

    # Create matrices
    value_matrix = dataframe.pivot_table(
        index="participant",
        columns="task",
        values=metric,
        aggfunc="first"
    )

    stimulus_matrix = dataframe.pivot_table(
        index="participant",
        columns="task",
        values="stimulus",
        aggfunc="first"
    )

    # Apply the same participant order to both heatmaps
    if participant_order is not None:
        value_matrix = value_matrix.reindex(participant_order)
        stimulus_matrix = stimulus_matrix.reindex(participant_order)

    # Draw normal heatmap
    sns.heatmap(
        value_matrix,
        annot=False,
        fmt=".2f",
        vmin=0,
        vmax=1,
        cmap="cividis",
        cbar=show_cbar,
        cbar_ax=cbar_ax,
        ax=ax
    )

    if show_cbar:
        ax.set_yticks([])

    # Overlay stimulus symbols
    for i, participant in enumerate(value_matrix.index):
        for j, task in enumerate(value_matrix.columns):

            stimulus = stimulus_matrix.loc[participant, task]

            if stimulus == "Iterative screenshots":
                marker_color = "black"
                edge_color = "white"
                marker = "o"
            else:
                marker_color = "white"
                edge_color = "black"
                marker = "D"

            ax.scatter(
                j + 0.5,
                i + 0.5,
                marker=marker,
                s=70,
                color=marker_color,
                edgecolors=edge_color,
                linewidths=0.8,
                zorder=10
            )

    ax.set_title(title)
    ax.set_xlabel("Task")


#################################################
# Calculate participant sorting score
#################################################

# Keep only tasks 1, 2 and 3
sorting_data = taskDataframe[
    taskDataframe["task"].isin(["T1", "T2", "T3"])
]

# Sum precision + recall across tasks 1, 2 and 3
participant_scores = (
    sorting_data
    .groupby("participant")[["precision", "recall"]]
    .sum()
    .sum(axis=1)
    .sort_values(ascending=False)
)

# Participant order from highest to lowest combined score
participant_order = participant_scores.index


#################################################
# Create plots
#################################################

fig = plt.figure(figsize=(12, 6))

gs = GridSpec(
    1, 3,
    width_ratios=[1, 1, 0.05],
    wspace=0.15
)

ax1 = fig.add_subplot(gs[0, 0])
ax2 = fig.add_subplot(gs[0, 1])
cbar_ax = fig.add_subplot(gs[0, 2])


draw_heatmap_with_stimulus(
    ax1,
    taskDataframe,
    "precision",
    "Precision",
    show_cbar=False,
    participant_order=participant_order
)

draw_heatmap_with_stimulus(
    ax2,
    taskDataframe,
    "recall",
    "Recall",
    show_cbar=True,
    cbar_ax=cbar_ax,
    participant_order=participant_order
)


ax1.set_ylabel("Participant")
ax2.set_ylabel("")

# Remove participant IDs from the rows
ax1.tick_params(axis="y", left=False, labelleft=False)
ax2.tick_params(axis="y", left=False, labelleft=False)


#################################################
# Add legend
#################################################

legend_elements = [
    Line2D(
        [0], [0],
        marker="o",
        color="white",
        markerfacecolor="black",
        markeredgecolor="black",
        markersize=8,
        label="Iterative screenshots"
    ),
    Line2D(
        [0], [0],
        marker="D",
        color="white",
        markerfacecolor="none",
        markeredgecolor="black",
        markersize=8,
        label="Comic"
    )
]

fig.legend(
    handles=legend_elements,
    loc="upper center",
    ncol=2,
    bbox_to_anchor=(0.5, 1.02)
)

plt.tight_layout()
plt.show()


# Boxplot comparisson

timeDifferences = [
    screenshot - comic
    for comic, screenshot in zip(comicTimes, screenshotTimes)
]

plt.figure(figsize=(9, 6))

plt.boxplot(
    [comicTimes, screenshotTimes, timeDifferences],
    tick_labels=["Comic", "Screenshots", "Screenshot - Comic"]
)

plt.ylabel("Execution Time")
plt.title("Execution Time by Stimulus")
plt.axhline(0, linestyle="--", linewidth=1)

plt.show()