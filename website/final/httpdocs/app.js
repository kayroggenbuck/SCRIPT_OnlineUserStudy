const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});

const db = new sqlite3.Database("./study.db");

db.run(`
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    education TEXT,
    occupation TEXT,
    stimulus TEXT,
    answers TEXT,
    executionTime TEXT,
	preference TEXT,
    preferenceExplanation TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

app.get('/health', async (req, res) => {
    try {
        res.status(200).json({
            status: 'ok',
            timestamp: Date.now()
        });
    } catch (err) {
        res.status(500).json({
            status: 'error'
        });
    }
});

app.post("/submit", (req, res) => {

    const {
        userId,
        education,
        occupation,
        stimulus,
        answers,
        executionTime,
		preference,
        preferenceExplanation,
    } = req.body;

    db.run(
        `INSERT INTO participants
        (userId, education, occupation, stimulus, answers, executionTime, preference, preferenceExplanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            education,
            occupation,
			JSON.stringify(stimulus),
            JSON.stringify(answers),
            JSON.stringify(executionTime),
			preference,
            preferenceExplanation,
        ],
        function(err) {

            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }

            res.json({
                success: true,
                participantId: this.lastID
            });
        }
    );
});