interface ITask {
    id: number
    description: string
    status: Status
    createdAt: string
    // updatedAt: string
}

type Status = 'todo' | 'in-progress' | 'done'

const tasks: ITask[] = []

class Task implements ITask {
    constructor(public id: number, public description: string, public status: Status, public createdAt: string) {
    }
}

class TaskService {
    private tasks: ITask[] = []

    public addTask(description: string) {
        const id = Math.round(Math.random() * 10)
        const createdAt = new Date().toISOString()
        const newTask = new Task(id, description, 'todo', createdAt)
        this.tasks.push(newTask)
        // this.tasks.saveTasks()
        console.log(`${description} added to the list.`)
    }

    public listTasks() {
        console.log(this.tasks)
    }

    private saveTasks() {

    }
}




const service = new TaskService()

service.addTask('Wash dishes')
service.addTask('Buy bread')
service.addTask('Visit grandma')
service.listTasks()