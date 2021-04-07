const express = require('express')
const app = express() //luodaan express-sovellusta vastaava olio

app.use(express.json())

const morgan = require('morgan')

//app.use(morgan('tiny'))

morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//sallitaan muista origineista tulevat pyynnöt cors-middlewarella
const cors = require('cors')
app.use(cors())

let persons = [

    { 
        id: 1,
        name: "Arto Hellas",
        number: "040-123456" 
    },
    { 
        id: 2,
        name: "Ada Lovelace", 
        number: "39-44-5323523" 
    },
    { 
        id: 3,
        name: "Dan Abramov", 
        number: "12-43-234345"
    },
    { 
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122" 
    }

]

//infosivu
app.get('/info', (request, response) => {
    const date = Date().toString();
    response.send(`Phonebook has info for ${persons.length} people <p> ${date} </p>`)

})

//hakee kaikki henkilöt
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

//hakee yksittäisen henkilön
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id) 

    if(person) {
        response.json(person)

    } else {
        response.status(404).end()
    }
    
})



//funktio, joka generoi id:n henkilölle
const generateId = () => {
    return Math.floor(Math.random() * (1000 - 5) + 5)    
}

//tutkitaan onko lisättävä nimi jo nimien listalla
const findName = (newName) => {
    const names = persons.map(person => person.name)
    return names.includes(newName)
}

//lisää henkilön
app.post('/api/persons', (request, response) => {

    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if(!body.number) {
        return response.status (400).json({
            error: 'number missing'
        })
    }

    //jos lisättävä nimi löytyy jo listalta, annetaan virheilmoitus
    if(findName(body.name)){
        return response.status (400).json({
            error: 'name must be unique'
        })

    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    
    //vastaanotettu data palautetaan pyynnön vastauksessa
    response.json(person)
})

//poistaa yksittäisen henkilön
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
