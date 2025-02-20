let tasks = []
let filteredTasks = []

document.getElementById("csvFileInput").addEventListener("change", function(event) {
    // Import CSV via File Upload

    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function(e) {
        const csvData = e.target.result
        tasks = Papa.parse(csvData, { header: true }).data
        tasks.forEach(task => {
            task.DateCreated = parseInt(task.DateCreated)
            task.DueDate = parseInt(task.DueDate)
        })
        filteredTasks = [...tasks]
        sortTasks()
    }
    reader.readAsText(file)
})

function handleMobilePanel() {
    const mobilePanel = document.getElementById("mobile_panel")
    mobilePanel.classList.toggle("closed")
}

function renderTasks() {
    const taskList = document.getElementById("taskList")
    const noDataDiv = document.getElementById("no_data")

    taskList.innerHTML = ""

    if (filteredTasks.length === 0) {
        noDataDiv.textContent = "No tasks"
        return
    } else {
        noDataDiv.textContent = ""
    }

    filteredTasks.forEach((task, index) => {
        const taskDiv = document.createElement("div")
        taskDiv.classList.add("taskItem")

        taskDiv.innerHTML = `
            <div class="taskField">
                <label>Task:</label>
                <input type="text" value="${task.Task || ''}" onchange="updateTask(${index}, 'Task', this.value)">
            </div>

            <div class="taskField">
                <label>Status:</label>
                <select onchange="updateTask(${index}, 'Status', this.value)">
                    <option value="Pending" ${task.Status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Completed" ${task.Status === "Completed" ? "selected" : ""}>Completed</option>
                </select>
            </div>

            <div class="taskField">
                <label>Date Created:</label>
                <span class="date_created">${formatDate(task.DateCreated)}</span>
            </div>

            <div class="taskField">
                <label>Due Date:</label>
                <input type="datetime-local" value="${task.DueDate ? new Date(task.DueDate).toISOString().slice(0, 16) : ''}" onchange="updateTask(${index}, 'DueDate', new Date(this.value).getTime())">
            </div>

            <div class="taskField">
                <label>Importance:</label>
                <select onchange="updateTask(${index}, 'Importance', this.value)">
                    <option value="Low" ${task.Importance === "Low" ? "selected" : ""}>Low</option>
                    <option value="Medium" ${task.Importance === "Medium" ? "selected" : ""}>Medium</option>
                    <option value="High" ${task.Importance === "High" ? "selected" : ""}>High</option>
                </select>
            </div>

            <div class="taskField">
                <button class="delete_button" onclick="deleteTask(${index})">Delete</button>
            </div>
        `

        taskList.appendChild(taskDiv)
    })
}

function updateTask(index, key, value) {
    tasks[index][key] = value
    filteredTasks = [...tasks]
    filterByImportance()
    renderTasks()
}

function addTask() {
    tasks.push({
        Task: "",
        Status: "Pending",
        DateCreated: Date.now(),
        DueDate: null,
        Importance: "Low"
    })
    filteredTasks = [...tasks]
    filterByImportance()
    renderTasks()
}

function deleteTask(index) {
    tasks.splice(index, 1);
    filteredTasks = [...tasks]
    filterByImportance()
    renderTasks()
}

function exportCSV() {
    const csv = Papa.unparse(filteredTasks, {
        header: true,
        columns: ['Task', 'Status', 'DateCreated', 'DueDate', 'Importance']
    })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "tasks.csv"
    link.click()
}

function sortTasks() {
    const sortBy = document.getElementById("sortBy").value
    const sortOrder = document.getElementById("sortOrder").value === "asc" ? 1 : -1

    filteredTasks.sort((a, b) => {
        let comparison = 0

        switch (sortBy) {
            case "task":
                comparison = a.Task.localeCompare(b.Task)
                break
            case "dueDate":
                comparison = a.DueDate - b.DueDate
                break
            case "importance":
                const importanceOrder = { Low: 1, Medium: 2, High: 3 }
                comparison = importanceOrder[a.Importance] - importanceOrder[b.Importance]
                break
        }

        return comparison * sortOrder
    })

    renderTasks()
}

function filterByImportance() {
    const importanceFilter = document.getElementById("importanceFilter").value

    if (importanceFilter === "") {
        filteredTasks = [...tasks]
    } else {
        filteredTasks = tasks.filter(task => task.Importance === importanceFilter)
    }

    sortTasks()
}

function formatDate(date, format = 'd.m.Y H:i'){//d.m.Y H:i, d-m-Y H:i, m/d/Y H:i, d-m-Y h:i A, m/d/Y h:i A
    let d = new Date(date)
    const pad = (num) => (num < 10 ? '0' : '') + num // Helper function to pad numbers with leading zeros
  
    const yyyy = d.getFullYear()
    const MM = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const HH24 = pad(d.getHours())
    const hh12 = pad((d.getHours() % 12) || 12) // Convert to 12-hour format
    const mm = pad(d.getMinutes())
    const ss = pad(d.getSeconds())
    const ampm = d.getHours() < 12 ? 'AM' : 'PM'
  
    let formattedDate = format
      .replace('d', dd)
      .replace('m', MM)
      .replace('Y', yyyy)
      .replace('H', HH24)
      .replace('i', mm)
      .replace('s', ss)
      .replace('h', hh12)
      .replace('A', ampm)
  
    return formattedDate
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("copyright_year").textContent = new Date().getFullYear()
})