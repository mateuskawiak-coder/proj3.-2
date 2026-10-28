
const $ = (id) => document.getElementById(id);

const initialRecords = [
    { id: "A01", sleep: 8, exercise: 4, stress: 3, mood: 8 },
    { id: "A02", sleep: 6, exercise: 2, stress: 7, mood: 5 },
    { id: "A03", sleep: 7, exercise: 3, stress: 4, mood: 7 },
    { id: "A04", sleep: 8, exercise: 5, stress: 2, mood: 9 },
    { id: "A05", sleep: 5, exercise: 1, stress: 8, mood: 4 },
    { id: "A06", sleep: 7.5, exercise: 4, stress: 3, mood: 8 },
    { id: "A07", sleep: 6, exercise: 3, stress: 6, mood: 6 },
    { id: "A08", sleep: 9, exercise: 5, stress: 2, mood: 9 },
    { id: "A09", sleep: 7, exercise: 2, stress: 5, mood: 6 },
    { id: "A10", sleep: 6.5, exercise: 4, stress: 4, mood: 7 },
    { id: "A11", sleep: 8, exercise: 3, stress: 3, mood: 8 },
    { id: "A12", sleep: 5.5, exercise: 1, stress: 9, mood: 3 },
    { id: "A13", sleep: 7, exercise: 4, stress: 4, mood: 7 },
    { id: "A14", sleep: 8.5, exercise: 6, stress: 2, mood: 9 },
    { id: "A15", sleep: 6, exercise: 2, stress: 6, mood: 5 },
    { id: "A16", sleep: 7.5, exercise: 3, stress: 4, mood: 8 },
    { id: "A17", sleep: 9, exercise: 4, stress: 2, mood: 9 },
    { id: "A18", sleep: 6.5, exercise: 1, stress: 7, mood: 5 },
    { id: "A19", sleep: 7, exercise: 5, stress: 3, mood: 8 },
    { id: "A20", sleep: 8, exercise: 3, stress: 4, mood: 7 }
];

let records = initialRecords.map(record => ({ ...record }));
let habitsChart = null;
let wellbeingChart = null;

// Modelo didático de pontuação, não validado clinicamente.
function calculateScore(record) {
    const sleepScore = 100 * Math.max(
        0,
        1 - Math.abs(record.sleep - 8) / 8
    );

    const exerciseScore = (record.exercise / 7) * 100;
    const stressScore = ((10 - record.stress) / 10) * 100;
    const moodScore = (record.mood / 10) * 100;

    const score =
        sleepScore * 0.25 +
        exerciseScore * 0.20 +
        stressScore * 0.25 +
        moodScore * 0.30;

    return Math.round(Math.max(0, Math.min(100, score)));
}

function average(values) {
    if (!values.length) return 0;

    return values.reduce((sum, value) => sum + value, 0) /
        values.length;
}

function formatNumber(value, decimals = 1) {
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function getStats() {
    return {
        count: records.length,
        sleep: average(records.map(r => r.sleep)),
        exercise: average(records.map(r => r.exercise)),
        stress: average(records.map(r => r.stress)),
        mood: average(records.map(r => r.mood)),
        score: average(records.map(calculateScore))
    };
}

function updateMetrics() {
    const stats = getStats();

    $("totalRecords").textContent =
        `${stats.count} ${stats.count === 1 ? "registro" : "registros"}`;

    $("avgScore").textContent = Math.round(stats.score);
    $("heroScore").innerHTML =
        `${Math.round(stats.score)}<span>/100</span>`;

    $("avgSleep").textContent = formatNumber(stats.sleep);
    $("avgExercise").textContent = formatNumber(stats.exercise);
    $("avgStress").textContent = formatNumber(stats.stress);

    $("scoreProgress").style.width = `${stats.score}%`;
    $("sleepProgress").style.width =
        `${Math.min(100, stats.sleep / 12 * 100)}%`;
    $("exerciseProgress").style.width =
        `${stats.exercise / 7 * 100}%`;
    $("stressProgress").style.width =
        `${stats.stress * 10}%`;

    $("scoreDescription").textContent =
        stats.count
            ? "Média do modelo de pontuação"
            : "Sem registros para calcular";

    updateInsights(stats);
}

function updateInsights(stats) {
    const message = $("insightText");

    if (!stats.count) {
        message.textContent =
            "Adicione registros para identificar padrões nos dados.";
        return;
    }

    const sleepText = stats.sleep < 7
        ? "O sono médio está abaixo de 7 horas; vale discutir hábitos de descanso."
        : stats.sleep <= 9
            ? "O sono médio está entre 7 e 9 horas, uma faixa geralmente recomendada para adultos."
            : "O sono médio ultrapassa 9 horas; a necessidade de sono pode variar conforme a idade.";

    const stressText = stats.stress >= 7
        ? " O estresse médio está elevado na escala utilizada."
        : stats.stress >= 4
            ? " O estresse médio está em nível intermediário na escala."
            : " O estresse médio está relativamente baixo na escala.";

    const exerciseText = stats.exercise < 3
        ? " A frequência de atividade física é baixa nesta amostra."
        : " A turma registra alguma frequência de atividade física durante a semana.";

    message.textContent = sleepText + stressText + exerciseText;
}

function renderTable() {
    const table = $("recordsTable");

    if (!records.length) {
        table.innerHTML = `
            <tr>
                <td colspan="7">Nenhum registro disponível. Adicione dados para começar.</td>
            </tr>`;
        return;
    }

    table.innerHTML = records.map((record, index) => {
        const score = calculateScore(record);

        return `
            <tr>
                <td><strong>${escapeHTML(record.id)}</strong></td>
                <td>${formatNumber(record.sleep)} h</td>
                <td>${record.exercise} dias</td>
                <td>${record.stress}/10</td>
                <td>${record.mood}/10</td>
                <td><span class="score-pill">${score}</span></td>
                <td>
                    <button
                        class="delete-button"
                        type="button"
                        data-index="${index}"
                        aria-label="Excluir registro ${escapeHTML(record.id)}">
                        Excluir
                    </button>
                </td>
            </tr>`;
    }).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderCharts() {
    if (typeof Chart === "undefined") {
        $("insightText").textContent +=
            " A biblioteca de gráficos não foi carregada. Verifique sua conexão com a internet.";
        return;
    }

    const stats = getStats();

    const scores = records.map(calculateScore);

    const high = scores.filter(score => score >= 75).length;
    const moderate = scores.filter(score => score >= 50 && score < 75).length;
    const low = scores.filter(score => score < 50).length;

    if (habitsChart) habitsChart.destroy();
    if (wellbeingChart) wellbeingChart.destroy();

    habitsChart = new Chart($("habitsChart"), {
        type: "bar",
        data: {
            labels: [
                "Sono",
                "Atividade física",
                "Baixo estresse",
                "Bem-estar",
                "Índice geral"
            ],
            datasets: [{
                label: "Pontuação média normalizada",
                data: [
                    Math.max(0, 100 * (1 - Math.abs(stats.sleep - 8) / 8)),
                    stats.exercise / 7 * 100,
                    (10 - stats.stress) * 10,
                    stats.mood * 10,
                    stats.score
                ].map(value => Math.round(value)),
                backgroundColor: [
                    "#8c7cf3",
                    "#4e91e8",
                    "#26b58a",
                    "#f0b84b",
                    "#6958e8"
                ],
                borderRadius: 7,
                borderSkipped: false,
                maxBarThickness: 36
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.raw}/100`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: "#f0f0f6" },
                    ticks: {
                        stepSize: 20,
                        color: "#85899a",
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: "#646a7e",
                        font: { size: 10 }
                    }
                }
            }
        }
    });

    wellbeingChart = new Chart($("wellbeingChart"), {
        type: "doughnut",
        data: {
            labels: ["Alto", "Moderado", "Baixo"],
            datasets: [{
                data: [high, moderate, low],
                backgroundColor: ["#24b47e", "#f2bd4b", "#ee777e"],
                borderWidth: 4,
                borderColor: "#ffffff",
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context =>
                            `${context.label}: ${context.raw} registro(s)`
                    }
                }
            }
        }
    });
}

function updateDashboard() {
    updateMetrics();
    renderTable();
    renderCharts();
}

function updateRangeOutputs() {
    $("sleepOutput").textContent =
        `${$("sleepInput").value.replace(".", ",")} h`;

    $("exerciseOutput").textContent =
        `${$("exerciseInput").value} dias`;

    $("stressOutput").textContent =
        `${$("stressInput").value}/10`;

    $("moodOutput").textContent =
        `${$("moodInput").value}/10`;
}

function predictWellbeing(event) {
    if (event) event.preventDefault();

    const record = {
        sleep: Number($("sleepInput").value),
        exercise: Number($("exerciseInput").value),
        stress: Number($("stressInput").value),
        mood: Number($("moodInput").value)
    };

    const score = calculateScore(record);

    let label;
    let description;
    let color;

    if (score >= 75) {
        label = "Bem-estar estimado alto";
        description =
            "Neste cenário, a combinação de hábitos gera uma pontuação elevada no modelo didático.";
        color = "#24b47e";
    } else if (score >= 50) {
        label = "Bem-estar estimado moderado";
        description =
            "Neste cenário, alguns hábitos podem ser explorados para compreender possíveis oportunidades de melhoria.";
        color = "#e4ae37";
    } else {
        label = "Bem-estar estimado baixo";
        description =
            "Neste cenário, a pontuação é baixa. Considere os fatores separadamente, sem tirar conclusões sobre uma pessoa real.";
        color = "#e76d78";
    }

    $("predictionScore").textContent = score;
    $("predictionLabel").textContent = label;
    $("predictionDescription").textContent = description;

    $("scoreCircle").style.background =
        `conic-gradient(${color} ${score * 3.6}deg, #eae7ff ${score * 3.6}deg 360deg)`;
}

["sleepInput", "exerciseInput", "stressInput", "moodInput"]
    .forEach(id => {
        $(id).addEventListener("input", updateRangeOutputs);
    });

$("predictionForm").addEventListener("submit", predictWellbeing);

$("recordForm").addEventListener("submit", event => {
    event.preventDefault();

    const record = {
        id: $("studentId").value.trim(),
        sleep: Number($("recordSleep").value),
        exercise: Number($("recordExercise").value),
        stress: Number($("recordStress").value),
        mood: Number($("recordMood").value)
    };

    if (!record.id) {
        $("formMessage").textContent = "Informe um código anônimo.";
        return;
    }

    if (records.some(r => r.id.toLowerCase() === record.id.toLowerCase())) {
        $("formMessage").textContent =
            "Este código já existe. Escolha outro código anônimo.";
        return;
    }

    if (
        !Number.isFinite(record.sleep) ||
        record.sleep < 0 || record.sleep > 12 ||
        !Number.isInteger(record.exercise) ||
        record.exercise < 0 || record.exercise > 7 ||
        !Number.isInteger(record.stress) ||
        record.stress < 0 || record.stress > 10 ||
        !Number.isInteger(record.mood) ||
        record.mood < 0 || record.mood > 10
    ) {
        $("formMessage").textContent =
            "Confira os valores informados antes de adicionar.";
        return;
    }

    records.push(record);
    updateDashboard();

    $("formMessage").textContent =
        `Registro ${record.id} adicionado. Indicadores atualizados!`;

    $("recordForm").reset();
    $("studentId").focus();
});

$("recordsTable").addEventListener("click", event => {
    const button = event.target.closest(".delete-button");

    if (!button) return;

    const index = Number(button.dataset.index);

    if (!Number.isInteger(index) || index < 0 || index >= records.length) {
        return;
    }

    records.splice(index, 1);
    updateDashboard();
    $("formMessage").textContent = "Registro removido e análises atualizadas.";
});

$("resetButton").addEventListener("click", () => {
    records = initialRecords.map(record => ({ ...record }));
    updateDashboard();

    $("formMessage").textContent =
        "Dados demonstrativos restaurados.";
});

$("exportButton").addEventListener("click", () => {
    if (!records.length) {
        $("formMessage").textContent =
            "Adicione pelo menos um registro antes de exportar.";
        return;
    }

    const header = [
        "Codigo",
        "Sono_horas",
        "Atividade_fisica_dias",
        "Estresse",
        "Bem_estar",
        "Indice_estimado"
    ];

    const rows = records.map(record => [
        record.id,
        record.sleep,
        record.exercise,
        record.stress,
        record.mood,
        calculateScore(record)
    ]);

    const csv = [header, ...rows]
        .map(row => row.map(value => {
            const safeValue = String(value).replace(/"/g, '""');
            return `"${safeValue}"`;
        }).join(";"))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "dados_qualidade_vida_turma.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    $("formMessage").textContent = "Arquivo CSV exportado.";
});

updateRangeOutputs();
updateDashboard();
predictWellbeing();
